package com.lawtan.service.impl;

import com.lawtan.dto.CommercialSummaryDTO;
import com.lawtan.dto.InvoiceItemDTO;
import com.lawtan.dto.PaymentTransactionDTO;
import com.lawtan.dto.SaleInvoiceDTO;
import com.lawtan.entity.Customer;
import com.lawtan.entity.InvoiceItem;
import com.lawtan.entity.PaymentTransaction;
import com.lawtan.entity.ProductStock;
import com.lawtan.entity.SaleInvoice;
import com.lawtan.model.InvoiceStatus;
import com.lawtan.model.ProductType;
import com.lawtan.model.PaymentMethod;
import com.lawtan.repository.CustomerRepository;
import com.lawtan.repository.PaymentTransactionRepository;
import com.lawtan.repository.ProductStockRepository;
import com.lawtan.repository.SaleInvoiceRepository;
import com.lawtan.service.SaleInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SaleInvoiceServiceImpl implements SaleInvoiceService {

    @Autowired
    private SaleInvoiceRepository saleInvoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private ProductStockRepository productStockRepository;

    @Autowired
    private com.lawtan.service.MilkProductionService milkProductionService;

    @Override
    public List<SaleInvoiceDTO> getAllInvoices() {
        return saleInvoiceRepository.findAllByOrderByIssueDateDesc()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SaleInvoiceDTO> getInvoicesByStatus(InvoiceStatus status) {
        return saleInvoiceRepository.findByStatus(status)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SaleInvoiceDTO> getInvoicesByCustomerId(Long customerId) {
        return saleInvoiceRepository.findByCustomerIdOrderByIssueDateDesc(customerId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public SaleInvoiceDTO getInvoiceById(Long id) {
        SaleInvoice invoice = saleInvoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture introuvable avec l'ID: " + id));
        return convertToDTO(invoice);
    }

    @Override
    public SaleInvoiceDTO createInvoice(SaleInvoiceDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Client introuvable avec l'ID: " + dto.getCustomerId()));

        // Le lait cru vendu sort du stock dedie a la vente directe : on verifie d'abord
        // qu'il y en a assez, pour ne pas facturer un lait qui n'existe pas.
        double rawMilkSold = 0.0;
        if (dto.getItems() != null) {
            for (InvoiceItemDTO it : dto.getItems()) {
                if (it.getProductType() == ProductType.RAW_MILK) {
                    rawMilkSold += it.getQuantity() != null ? it.getQuantity() : 0.0;
                }
            }
        }
        if (rawMilkSold > 0) {
            LocalDate saleDay = dto.getIssueDate() != null ? dto.getIssueDate() : LocalDate.now();
            double available = milkProductionService.getStockAllocation(saleDay).getDirectSaleAvailable();
            if (rawMilkSold > available + 0.001) {
                throw new IllegalArgumentException(
                        "Stock de lait insuffisant : " + rawMilkSold + " L factures pour seulement "
                                + available + " L disponibles en vente directe.");
            }
        }

        SaleInvoice invoice = new SaleInvoice();
        
        long count = saleInvoiceRepository.count() + 1;
        String invNumber = dto.getInvoiceNumber() != null && !dto.getInvoiceNumber().isEmpty()
                ? dto.getInvoiceNumber()
                : String.format("FAC-%d-%04d", LocalDate.now().getYear(), count);

        LocalDate issue = dto.getIssueDate() != null ? dto.getIssueDate() : LocalDate.now();
        LocalDate due = dto.getDueDate() != null ? dto.getDueDate() : issue.plusDays(15);
        if (due.isBefore(issue)) {
            throw new com.lawtan.exception.BusinessException("La date d'échéance (" + due + ") ne peut pas être antérieure à la date d'émission (" + issue + ").", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        double discount = dto.getDiscountFcfa() != null ? dto.getDiscountFcfa() : 0.0;
        double tax = dto.getTaxFcfa() != null ? dto.getTaxFcfa() : 0.0;
        if (discount < 0) throw new com.lawtan.exception.BusinessException("La remise ne peut pas être négative.", org.springframework.http.HttpStatus.BAD_REQUEST);
        if (tax < 0) throw new com.lawtan.exception.BusinessException("La taxe ne peut pas être négative.", org.springframework.http.HttpStatus.BAD_REQUEST);

        invoice.setInvoiceNumber(invNumber);
        invoice.setCustomer(customer);
        invoice.setIssueDate(issue);
        invoice.setDueDate(due);
        invoice.setDiscountFcfa(discount);
        invoice.setTaxFcfa(tax);
        invoice.setPaymentMethod(dto.getPaymentMethod());
        invoice.setPaymentReference(dto.getPaymentReference());
        invoice.setNotes(dto.getNotes());
        invoice.setStatus(dto.getStatus() != null ? dto.getStatus() : InvoiceStatus.ISSUED);
        invoice.setPaidAmountFcfa(dto.getPaidAmountFcfa() != null ? dto.getPaidAmountFcfa() : 0.0);
        invoice.setCreatedAt(LocalDateTime.now());

        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (InvoiceItemDTO itemDTO : dto.getItems()) {
                if (itemDTO.getQuantity() == null || itemDTO.getQuantity() <= 0) {
                    throw new com.lawtan.exception.BusinessException("La quantité commandée doit être strictement supérieure à 0.", org.springframework.http.HttpStatus.BAD_REQUEST);
                }
                if (itemDTO.getUnitPriceFcfa() == null || itemDTO.getUnitPriceFcfa() < 0) {
                    throw new com.lawtan.exception.BusinessException("Le prix unitaire doit être positif ou nul.", org.springframework.http.HttpStatus.BAD_REQUEST);
                }

                InvoiceItem item = new InvoiceItem();
                item.setProductId(itemDTO.getProductId());
                item.setProductName(itemDTO.getProductName());
                item.setProductType(itemDTO.getProductType());
                item.setQuantity(itemDTO.getQuantity());
                item.setUnit(itemDTO.getUnit());
                item.setUnitPriceFcfa(itemDTO.getUnitPriceFcfa());
                item.setLineTotalFcfa(itemDTO.getQuantity() * itemDTO.getUnitPriceFcfa());
                invoice.addItem(item);

                // Décrémentation et contrôle du stock de produits finis
                if (itemDTO.getProductId() != null) {
                    Optional<ProductStock> stockOpt = productStockRepository.findById(itemDTO.getProductId());
                    if (stockOpt.isPresent()) {
                        ProductStock stock = stockOpt.get();

                        // Contrôle DLC
                        if (stock.getDlcExpiryDate() != null && stock.getDlcExpiryDate().isBefore(issue)) {
                            throw new com.lawtan.exception.BusinessException(
                                    "Alerte sanitaire DLC : le produit '" + stock.getProductName() + "' a expiré le " + stock.getDlcExpiryDate() + " et ne peut plus être vendu.",
                                    org.springframework.http.HttpStatus.BAD_REQUEST
                            );
                        }

                        // Décrémentation (avec support vente en flux tendu / reliquat)
                        double remainingStock = Math.max(0, stock.getQuantityAvailable() - itemDTO.getQuantity());
                        stock.setQuantityAvailable(remainingStock);
                        stock.setTotalValueFcfa(remainingStock * stock.getUnitPriceFcfa());
                        productStockRepository.save(stock);
                    }
                }
            }
        }

        invoice.recalculateTotals();

        // Contrôle remise max
        if (invoice.getDiscountFcfa() != null && invoice.getSubTotalFcfa() != null && invoice.getDiscountFcfa() > invoice.getSubTotalFcfa()) {
            throw new com.lawtan.exception.BusinessException("La remise (" + invoice.getDiscountFcfa() + " FCFA) ne peut pas dépasser le sous-total de la facture (" + invoice.getSubTotalFcfa() + " FCFA).", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        // Sortie de stock du lait cru vendu, enregistree dans la ventilation du jour
        if (rawMilkSold > 0) {
            milkProductionService.recordDirectSaleConsumption(invoice.getIssueDate(), rawMilkSold);
        }

        // Mise à jour de la fiche client
        customer.setTotalOrdersCount(customer.getTotalOrdersCount() + 1);
        customer.setTotalSpentFcfa(customer.getTotalSpentFcfa() + invoice.getTotalAmountFcfa());
        customer.setBalanceDueFcfa(customer.getBalanceDueFcfa() + invoice.getRemainingAmountFcfa());
        customerRepository.save(customer);

        SaleInvoice saved = saleInvoiceRepository.save(invoice);

        // Si un acompte ou paiement total a été versé dès la création
        if (invoice.getPaidAmountFcfa() > 0) {
            String receiptNum = String.format("REC-%d-%04d", LocalDate.now().getYear(), paymentTransactionRepository.count() + 1);
            PaymentTransaction transaction = new PaymentTransaction(
                    saved,
                    customer,
                    invoice.getPaidAmountFcfa(),
                    invoice.getPaymentMethod() != null ? invoice.getPaymentMethod() : PaymentMethod.CASH,
                    invoice.getPaymentReference() != null ? invoice.getPaymentReference() : "PAIEMENT-INIT",
                    receiptNum,
                    "Caisse Ferme LAWTAN",
                    "Règlement initial à la commande"
            );
            paymentTransactionRepository.save(transaction);
        }

        return convertToDTO(saved);
    }

    @Override
    public SaleInvoiceDTO recordPayment(Long invoiceId, PaymentTransactionDTO paymentDTO) {
        SaleInvoice invoice = saleInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new com.lawtan.exception.BusinessException("Facture introuvable avec l'ID: " + invoiceId, org.springframework.http.HttpStatus.NOT_FOUND));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new com.lawtan.exception.BusinessException("La facture " + invoice.getInvoiceNumber() + " est déjà intégralement payée.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new com.lawtan.exception.BusinessException("Impossible d'enregistrer un paiement sur une facture annulée.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        double amount = paymentDTO.getAmountPaidFcfa() != null ? paymentDTO.getAmountPaidFcfa() : 0.0;
        if (amount <= 0) {
            throw new com.lawtan.exception.BusinessException("Le montant du règlement doit être supérieur à 0 FCFA", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        double remaining = invoice.getRemainingAmountFcfa() != null ? invoice.getRemainingAmountFcfa() : 0.0;
        if (amount > remaining + 0.01) {
            throw new com.lawtan.exception.BusinessException(
                    "Paiement excédentaire : le montant saisi (" + amount + " FCFA) est supérieur au reste à payer (" + remaining + " FCFA).",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }

        double currentPaid = invoice.getPaidAmountFcfa() != null ? invoice.getPaidAmountFcfa() : 0.0;
        double newPaid = currentPaid + amount;
        invoice.setPaidAmountFcfa(newPaid);
        invoice.setPaymentMethod(paymentDTO.getPaymentMethod());
        invoice.setPaymentReference(paymentDTO.getTransactionReference());
        invoice.recalculateTotals();

        // Enregistrement de la transaction
        String receiptNum = String.format("REC-%d-%04d", LocalDate.now().getYear(), paymentTransactionRepository.count() + 1);
        PaymentTransaction transaction = new PaymentTransaction(
                invoice,
                invoice.getCustomer(),
                amount,
                paymentDTO.getPaymentMethod() != null ? paymentDTO.getPaymentMethod() : PaymentMethod.WAVE,
                paymentDTO.getTransactionReference() != null ? paymentDTO.getTransactionReference() : "WAVE-DIRECT",
                receiptNum,
                paymentDTO.getReceivedBy() != null ? paymentDTO.getReceivedBy() : "Comptabilité LAWTAN",
                paymentDTO.getNotes()
        );
        paymentTransactionRepository.save(transaction);

        // Ajustement de la créance client
        Customer customer = invoice.getCustomer();
        customer.setBalanceDueFcfa(Math.max(0, customer.getBalanceDueFcfa() - amount));
        customerRepository.save(customer);

        SaleInvoice saved = saleInvoiceRepository.save(invoice);
        return convertToDTO(saved);
    }

    @Override
    public SaleInvoiceDTO updateInvoiceStatus(Long id, InvoiceStatus status) {
        SaleInvoice invoice = saleInvoiceRepository.findById(id)
                .orElseThrow(() -> new com.lawtan.exception.BusinessException("Facture introuvable avec l'ID: " + id, org.springframework.http.HttpStatus.NOT_FOUND));
        invoice.setStatus(status);
        SaleInvoice saved = saleInvoiceRepository.save(invoice);
        return convertToDTO(saved);
    }

    @Override
    public CommercialSummaryDTO getCommercialSummary() {
        Double totalRev = saleInvoiceRepository.sumTotalRevenue();
        Double totalCol = saleInvoiceRepository.sumTotalCollected();
        Double totalOut = saleInvoiceRepository.sumTotalOutstanding();

        long totalInv = saleInvoiceRepository.count();
        Long paidInv = saleInvoiceRepository.countByStatus(InvoiceStatus.PAID);
        Long pendingInv = saleInvoiceRepository.countByStatus(InvoiceStatus.ISSUED) + saleInvoiceRepository.countByStatus(InvoiceStatus.PARTIALLY_PAID);
        long totalCust = customerRepository.count();

        double avgOrder = (totalInv > 0 && totalRev != null) ? totalRev / totalInv : 0.0;

        return new CommercialSummaryDTO(
                totalRev != null ? totalRev : 0.0,
                totalCol != null ? totalCol : 0.0,
                totalOut != null ? totalOut : 0.0,
                totalInv,
                paidInv != null ? paidInv : 0L,
                pendingInv != null ? pendingInv : 0L,
                totalCust,
                avgOrder
        );
    }

    @Override
    public void deleteInvoice(Long id) {
        SaleInvoice invoice = saleInvoiceRepository.findById(id)
                .orElseThrow(() -> new com.lawtan.exception.BusinessException("Facture introuvable avec l'ID: " + id, org.springframework.http.HttpStatus.NOT_FOUND));

        // Rétablir les métriques du client
        Customer customer = invoice.getCustomer();
        if (customer != null) {
            customer.setTotalOrdersCount(Math.max(0, customer.getTotalOrdersCount() - 1));
            customer.setTotalSpentFcfa(Math.max(0.0, customer.getTotalSpentFcfa() - (invoice.getTotalAmountFcfa() != null ? invoice.getTotalAmountFcfa() : 0.0)));
            customer.setBalanceDueFcfa(Math.max(0.0, customer.getBalanceDueFcfa() - (invoice.getRemainingAmountFcfa() != null ? invoice.getRemainingAmountFcfa() : 0.0)));
            customerRepository.save(customer);
        }

        // Recréditer les stocks de produits finis
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getProductId() != null && item.getQuantity() != null) {
                    productStockRepository.findById(item.getProductId()).ifPresent(stock -> {
                        double restored = stock.getQuantityAvailable() + item.getQuantity();
                        stock.setQuantityAvailable(restored);
                        stock.setTotalValueFcfa(restored * stock.getUnitPriceFcfa());
                        productStockRepository.save(stock);
                    });
                }
            }
        }

        saleInvoiceRepository.delete(invoice);
    }

    private SaleInvoiceDTO convertToDTO(SaleInvoice entity) {
        SaleInvoiceDTO dto = new SaleInvoiceDTO();
        dto.setId(entity.getId());
        dto.setInvoiceNumber(entity.getInvoiceNumber());
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
            dto.setCustomerName(entity.getCustomer().getName());
            dto.setCustomerPhone(entity.getCustomer().getPhone());
            dto.setCustomerEmail(entity.getCustomer().getEmail());
            dto.setCustomerAddress(entity.getCustomer().getAddress() + ", " + entity.getCustomer().getCity());
            dto.setCustomerNinea(entity.getCustomer().getNineaNumber());
        }
        dto.setIssueDate(entity.getIssueDate());
        dto.setDueDate(entity.getDueDate());
        dto.setSubTotalFcfa(entity.getSubTotalFcfa());
        dto.setDiscountFcfa(entity.getDiscountFcfa());
        dto.setTaxFcfa(entity.getTaxFcfa());
        dto.setTotalAmountFcfa(entity.getTotalAmountFcfa());
        dto.setPaidAmountFcfa(entity.getPaidAmountFcfa());
        dto.setRemainingAmountFcfa(entity.getRemainingAmountFcfa());
        dto.setStatus(entity.getStatus());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setPaymentReference(entity.getPaymentReference());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream().map(item -> {
                InvoiceItemDTO iDto = new InvoiceItemDTO();
                iDto.setId(item.getId());
                iDto.setProductId(item.getProductId());
                iDto.setProductName(item.getProductName());
                iDto.setProductType(item.getProductType());
                iDto.setQuantity(item.getQuantity());
                iDto.setUnit(item.getUnit());
                iDto.setUnitPriceFcfa(item.getUnitPriceFcfa());
                iDto.setLineTotalFcfa(item.getLineTotalFcfa());
                return iDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
