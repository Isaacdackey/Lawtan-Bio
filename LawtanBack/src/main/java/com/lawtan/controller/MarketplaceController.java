package com.lawtan.controller;

import com.lawtan.dto.MarketplaceOrderDTO;
import com.lawtan.dto.MarketplaceOrderRequest;
import com.lawtan.dto.MarketplaceProductDTO;
import com.lawtan.model.MarketplaceOrderStatus;
import com.lawtan.model.ProductType;
import com.lawtan.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {
    private final MarketplaceService marketplaceService;

    @GetMapping("/products")
    public Page<MarketplaceProductDTO> getProducts(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) ProductType category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size
    ) {
        return marketplaceService.getProducts(search, category, page, size);
    }

    @GetMapping("/categories")
    public List<ProductType> getCategories() {
        return marketplaceService.getCategories();
    }

    // COMMANDE DIRECTE EN LIGNE DESACTIVEE POUR LE MOMENT
    /*
    @PostMapping("/orders")
    public ResponseEntity<MarketplaceOrderDTO> createOrder(
        @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyHeader,
        @Valid @RequestBody MarketplaceOrderRequest request
    ) {
        MarketplaceOrderRequest effective = request;
        if ((request.idempotencyKey() == null || request.idempotencyKey().isBlank())
                && idempotencyHeader != null && !idempotencyHeader.isBlank()) {
            effective = new MarketplaceOrderRequest(idempotencyHeader.trim(), request.customerName(),
                request.customerPhone(), request.customerEmail(), request.deliveryAddress(),
                request.deliveryCity(), request.customerNote(), request.items());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(marketplaceService.createOrder(effective));
    }
    */

    @GetMapping("/orders")
    public Page<MarketplaceOrderDTO> getOrders(
        @RequestParam(required = false) MarketplaceOrderStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return marketplaceService.getOrders(status, page, size);
    }

    @GetMapping("/orders/{id}")
    public MarketplaceOrderDTO getOrder(@PathVariable Long id) {
        return marketplaceService.getOrder(id);
    }

    @PatchMapping("/orders/{id}/status")
    public MarketplaceOrderDTO updateStatus(@PathVariable Long id, @RequestParam MarketplaceOrderStatus status) {
        return marketplaceService.updateOrderStatus(id, status);
    }
}