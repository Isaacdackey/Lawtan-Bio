package com.lawtan.dto;

import com.lawtan.model.ProductType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeDTO {
    private Long id;
    private String code;
    private String name;
    private ProductType productType;
    private String targetUnit;
    private Double milkLitersPerUnit;
    private String ingredientsList;
    private Integer shelfLifeDays;
    private String processInstructions;
    private String emoji;
    private Double standardSellingPriceFcfa;
}
