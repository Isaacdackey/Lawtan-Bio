package com.lawtan.dto;

import com.lawtan.model.ProductType;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockDTO {
    private Long id;
    private Long recipeId;
    private String recipeName;
    private ProductType productType;
    private String emoji;
    private Long batchId;
    private String batchNumber;
    private String productName;
    private Double quantityAvailable;
    private String unit;
    private Double unitPriceFcfa;
    private Double totalValueFcfa;
    private LocalDate mfgDate;
    private LocalDate dlcExpiryDate;
    private String storageLocation;
    private Boolean isOrganicCertified;
    private Long daysRemainingDlc; // Jours restants avant expiration DLC
}
