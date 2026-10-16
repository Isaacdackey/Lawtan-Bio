package com.lawtan.dto;

import com.lawtan.model.MarketplaceOrderStatus;
import java.time.LocalDateTime;
import java.util.List;

public record MarketplaceOrderDTO(
        Long id,
        String reference,
        String customerName,
        String customerPhone,
        String customerEmail,
        String deliveryAddress,
        String deliveryCity,
        String customerNote,
        Double totalAmountFcfa,
        MarketplaceOrderStatus status,
        List<Item> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
            
    public record Item(
            Long productId,
            String productName,
            Double quantity,
            String unit,
            Double unitPriceFcfa,
            Double lineTotalFcfa) {
    }
}
