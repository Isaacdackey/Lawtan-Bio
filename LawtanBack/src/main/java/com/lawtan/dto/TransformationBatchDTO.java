package com.lawtan.dto;

import com.lawtan.model.BatchStatus;
import com.lawtan.model.ProductType;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransformationBatchDTO {
    private Long id;
    private String batchNumber;
    private Long recipeId;
    private String recipeName;
    private String recipeCode;
    private ProductType productType;
    private String emoji;
    private BatchStatus status;
    private LocalDate productionDate;
    private Double milkLitersConsumed;
    private Double expectedQuantity;
    private Double actualQuantityProduced;
    private String unit;
    private Double yieldEfficiencyPercentage;
    private Double wasteLossQuantity;
    private LocalDate dlcExpiryDate;
    private String operatorName;
    private String qualityNotes;
    private Double phLevel;
    private Double fatPercentage;
    private String sourceTank;
}
