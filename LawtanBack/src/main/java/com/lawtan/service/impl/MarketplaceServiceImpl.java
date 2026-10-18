package com.lawtan.service.impl;

import com.lawtan.dto.MarketplaceOrderDTO;
import com.lawtan.dto.MarketplaceOrderRequest;
import com.lawtan.dto.MarketplaceProductDTO;
import com.lawtan.entity.MarketplaceOrder;
import com.lawtan.entity.MarketplaceOrderItem;
import com.lawtan.entity.ProductStock;
import com.lawtan.exception.BusinessException;
import com.lawtan.model.MarketplaceOrderStatus;
import com.lawtan.model.ProductType;
import com.lawtan.repository.MarketplaceOrderRepository;
import com.lawtan.repository.ProductStockRepository;
import com.lawtan.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceServiceImpl implements MarketplaceService {

    private static final String REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final Map<ProductType, String> CATEGORY_LABELS = Map.of(
            ProductType.CHEESE, "Fromages",
            ProductType.YOGURT, "Yaourts",
            ProductType.CURDLED_MILK, "Lait caillé",
            ProductType.BUTTER, "Beurre",
            ProductType.CREAM, "Crème fraîche",
            ProductType.PASTEURIZED_MILK, "Lait pasteurisé",
            ProductType.RAW_MILK, "Lait cru");

    private final ProductStockRepository productStockRepository;
    private final MarketplaceOrderRepository orderRepository;

    // ------------------------------------------------------------------ Catalogue

    @Override
    @Transactional(readOnly = true)
    public Page<MarketplaceProductDTO> getProducts(String search, ProductType category, int page, int size) {
        LocalDate today = LocalDate.now();
        String needle = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);

        // Volume faible (catalogue d'une ferme) : filtrage en mémoire, pagination manuelle.
        List<MarketplaceProductDTO> all = productStockRepository.findByQuantityAvailableGreaterThan(0.0).stream()
                .filter(s -> s.getDlcExpiryDate() == null || !s.getDlcExpiryDate().isBefore(today))
                .filter(s -> s.getUnitPriceFcfa() != null && s.getUnitPriceFcfa() > 0)
                .filter(s -> category == null || categoryOf(s) == category)
                .filter(s -> needle.isEmpty() || s.getProductName().toLowerCase(Locale.ROOT).contains(needle))
                .sorted(Comparator.comparing(ProductStock::getProductName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toProductDTO)
                .collect(Collectors.toList());

        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, safeSize);
        int from = (int) Math.min((long) safePage * safeSize, all.size());
        int to = Math.min(from + safeSize, all.size());
        return new PageImpl<>(all.subList(from, to), pageable, all.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductType> getCategories() {
        LocalDate today = LocalDate.now();
        return productStockRepository.findByQuantityAvailableGreaterThan(0.0).stream()
                .filter(s -> s.getDlcExpiryDate() == null || !s.getDlcExpiryDate().isBefore(today))
                .map(s -> categoryOf(s))
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------ Commandes

    @Override
    @Transactional
    public MarketplaceOrderDTO createOrder(MarketplaceOrderRequest request) {
        // Idempotence : un double clic ou un retry réseau (4G instable) ne crée pas deux commandes.
        String key = request.idempotencyKey() == null || request.idempotencyKey().isBlank()
                ? null : request.idempotencyKey().trim();
        if (key != null) {
            Optional<MarketplaceOrder> existing = orderRepository.findByIdempotencyKey(key);
            if (existing.isPresent()) {
                return toOrderDTO(existing.get());
            }
        }

        // Fusionne les lignes qui visent le même produit.
        Map<Long, Double> requested = new TreeMap<>(); // TreeMap : verrouillage dans l'ordre des ids (anti deadlock)
        for (MarketplaceOrderRequest.Item item : request.items()) {
            requested.merge(item.productId(), item.quantity(), Double::sum);
        }

        LocalDate today = LocalDate.now();
        MarketplaceOrder order = MarketplaceOrder.builder()
                .reference(generateReference())
                .idempotencyKey(key)
                .customerName(request.customerName().trim())
                .customerPhone(request.customerPhone().trim())
                .customerEmail(blankToNull(request.customerEmail()))
                .deliveryAddress(request.deliveryAddress().trim())
                .deliveryCity(request.deliveryCity().trim())
                .customerNote(blankToNull(request.customerNote()))
                .status(MarketplaceOrderStatus.PENDING)
                .build();

        double total = 0.0;
        for (Map.Entry<Long, Double> entry : requested.entrySet()) {
            ProductStock stock = productStockRepository.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new BusinessException(
                            "Produit introuvable (id " + entry.getKey() + ").", HttpStatus.NOT_FOUND));
            double qty = entry.getValue();

            if (stock.getDlcExpiryDate() != null && stock.getDlcExpiryDate().isBefore(today)) {
                throw new BusinessException("Le produit '" + stock.getProductName()
                        + "' n'est plus disponible (date limite de consommation dépassée).");
            }
            if (stock.getUnitPriceFcfa() == null || stock.getUnitPriceFcfa() <= 0) {
                throw new BusinessException("Le produit '" + stock.getProductName() + "' n'est pas à la vente.");
            }
            double available = stock.getQuantityAvailable() == null ? 0.0 : stock.getQuantityAvailable();
            if (qty > available) {
                throw new BusinessException("Stock insuffisant pour '" + stock.getProductName()
                        + "' : " + trim(available) + " disponible(s), " + trim(qty) + " demandé(s).", HttpStatus.CONFLICT);
            }

            // Réservation immédiate du stock (restitué si la commande est annulée).
            double remaining = available - qty;
            stock.setQuantityAvailable(remaining);
            stock.setTotalValueFcfa(remaining * stock.getUnitPriceFcfa());
            productStockRepository.save(stock);

            double lineTotal = Math.round(qty * stock.getUnitPriceFcfa() * 100.0) / 100.0;
            total += lineTotal;
            order.addItem(MarketplaceOrderItem.builder()
                    .productStockId(stock.getId())
                    .productName(stock.getProductName())
                    .quantity(qty)
                    .unit(stock.getUnit() != null ? stock.getUnit() : "unité")
                    .unitPriceFcfa(stock.getUnitPriceFcfa())
                    .lineTotalFcfa(lineTotal)
                    .build());
        }
        order.setTotalAmountFcfa(Math.round(total * 100.0) / 100.0);

        try {
            return toOrderDTO(orderRepository.saveAndFlush(order));
        } catch (DataIntegrityViolationException e) {
            // Deux requêtes simultanées avec la même clé d'idempotence : on renvoie la commande gagnante.
            if (key != null) {
                Optional<MarketplaceOrder> existing = orderRepository.findByIdempotencyKey(key);
                if (existing.isPresent()) {
                    return toOrderDTO(existing.get());
                }
            }
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MarketplaceOrderDTO> getOrders(MarketplaceOrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        Page<MarketplaceOrder> result = status == null
                ? orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                : orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return result.map(this::toOrderDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceOrderDTO getOrder(Long id) {
        return toOrderDTO(findOrder(id));
    }

    @Override
    @Transactional
    public MarketplaceOrderDTO updateOrderStatus(Long id, MarketplaceOrderStatus newStatus) {
        MarketplaceOrder order = findOrder(id);
        MarketplaceOrderStatus current = order.getStatus();
        if (current == newStatus) {
            return toOrderDTO(order);
        }
        if (!isTransitionAllowed(current, newStatus)) {
            throw new BusinessException("Transition de statut interdite : " + current + " → " + newStatus + ".");
        }

        // Annulation : le stock réservé est restitué.
        if (newStatus == MarketplaceOrderStatus.CANCELLED) {
            for (MarketplaceOrderItem item : order.getItems()) {
                productStockRepository.findByIdForUpdate(item.getProductStockId()).ifPresent(stock -> {
                    double restored = (stock.getQuantityAvailable() == null ? 0.0 : stock.getQuantityAvailable()) + item.getQuantity();
                    stock.setQuantityAvailable(restored);
                    stock.setTotalValueFcfa(restored * (stock.getUnitPriceFcfa() == null ? 0.0 : stock.getUnitPriceFcfa()));
                    productStockRepository.save(stock);
                });
            }
        }
        order.setStatus(newStatus);
        return toOrderDTO(orderRepository.save(order));
    }

    // ------------------------------------------------------------------ Helpers

    /** PENDING → CONFIRMED → PREPARING → READY_FOR_DELIVERY → DELIVERED ; annulation possible tant que non livrée. */
    private boolean isTransitionAllowed(MarketplaceOrderStatus from, MarketplaceOrderStatus to) {
        if (from == MarketplaceOrderStatus.DELIVERED || from == MarketplaceOrderStatus.CANCELLED) {
            return false;
        }
        if (to == MarketplaceOrderStatus.CANCELLED) {
            return true;
        }
        return to.ordinal() == from.ordinal() + 1;
    }

    private MarketplaceOrder findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Commande introuvable (id " + id + ").", HttpStatus.NOT_FOUND));
    }

    private ProductType categoryOf(ProductStock s) {
        return s.getRecipe() != null ? s.getRecipe().getProductType() : null;
    }

    private MarketplaceProductDTO toProductDTO(ProductStock s) {
        ProductType category = categoryOf(s);
        String description = s.getRecipe() != null && s.getRecipe().getIngredientsList() != null
                ? "Ingrédients : " + s.getRecipe().getIngredientsList() : null;
        double qty = s.getQuantityAvailable() == null ? 0.0 : s.getQuantityAvailable();
        return new MarketplaceProductDTO(
                s.getId(),
                s.getProductName(),
                description,
                category,
                category != null ? CATEGORY_LABELS.get(category) : "Autres",
                s.getUnitPriceFcfa(),
                s.getUnit(),
                qty,
                s.getImageUrl(), // photo personnalisée du produit stockée en base
                qty > 0,
                s.getDlcExpiryDate(),
                s.getIsOrganicCertified(),
                s.getRecipe() != null && s.getRecipe().getEmoji() != null && !s.getRecipe().getEmoji().isBlank()
                        ? s.getRecipe().getEmoji() : "📦");
    }

    private MarketplaceOrderDTO toOrderDTO(MarketplaceOrder o) {
        List<MarketplaceOrderDTO.Item> items = o.getItems().stream()
                .map(i -> new MarketplaceOrderDTO.Item(i.getProductStockId(), i.getProductName(),
                        i.getQuantity(), i.getUnit(), i.getUnitPriceFcfa(), i.getLineTotalFcfa()))
                .collect(Collectors.toList());
        return new MarketplaceOrderDTO(o.getId(), o.getReference(), o.getCustomerName(), o.getCustomerPhone(),
                o.getCustomerEmail(), o.getDeliveryAddress(), o.getDeliveryCity(), o.getCustomerNote(),
                o.getTotalAmountFcfa(), o.getStatus(), items, o.getCreatedAt(), o.getUpdatedAt());
    }

    private String generateReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("MKT-").append(datePart).append('-');
            for (int i = 0; i < 6; i++) {
                sb.append(REF_ALPHABET.charAt(RANDOM.nextInt(REF_ALPHABET.length())));
            }
            String ref = sb.toString();
            if (orderRepository.findByReference(ref).isEmpty()) {
                return ref;
            }
        }
        throw new BusinessException("Impossible de générer une référence de commande, réessayez.",
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static String trim(double v) {
        return v == Math.floor(v) ? String.valueOf((long) v) : String.valueOf(v);
    }
}