package com.lawtan.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record MarketplaceOrderRequest(
    @Size(max = 80) 
    String idempotencyKey,
    @NotBlank 
    @Size(max = 120) 
    String customerName,
    @NotBlank 
    @Pattern(regexp = "^[+0-9() .-]{7,40}$", message = "Numéro de téléphone invalide") String customerPhone,
    @Email 
    @Size(max = 160) String customerEmail,
    @NotBlank 
    @Size(max = 255) String deliveryAddress,
    @NotBlank 
    @Size(max = 100) String deliveryCity,
    @Size(max = 2000) String customerNote,
    @NotEmpty @Size(max = 50) List<@Valid Item> items
) {
    public record Item(
        @NotNull @Positive 
        Long productId,
        @NotNull @DecimalMin
        (value = "0.001") 
        @DecimalMax(value = "10000")
        Double quantity
    ) {}
}
