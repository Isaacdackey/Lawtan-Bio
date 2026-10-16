package com.lawtan.dto;


public record FodderSummaryDTO(
        int cropsCount,
        int activeCropsCount,
        double totalAreaHectares,
        double totalHarvestedKg,
        double totalCostFcfa,
        Double costPerKgFcfa,          
        Double averageYieldKgPerHectare 
) {
}