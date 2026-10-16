package com.lawtan.dto;

import com.lawtan.model.ProductType;
import java.time.LocalDate;

public record MarketplaceProductDTO(
    Long id,
    String name,
    String description,
    ProductType category,
    String categoryLabel,
    Double priceFcfa,
    String unit,
    Double quantityAvailable,
    String image,
    boolean available,
    LocalDate dlcExpiryDate,
    Boolean organicCertified,
    String emoji
) {}