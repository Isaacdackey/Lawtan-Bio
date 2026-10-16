package com.lawtan.dto;

import com.lawtan.model.FodderCropStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record FodderCropDTO(
        Long id,
        String parcelName,
        String cropType,
        Double areaHectares,
        LocalDate plantingDate,
        LocalDate expectedHarvestDate,
        FodderCropStatus status,
        String statusLabel,
        Double expectedYieldKg,
        String irrigationType,
        Double seedCostFcfa,
        Double fertilizerCostFcfa,
        Double laborCostFcfa,
        Double irrigationCostFcfa,
        Double otherCostFcfa,
        Double totalCostFcfa,
        Double totalHarvestedKg,
        Double yieldKgPerHectare,
        Double costPerKgFcfa, // null tant qu'aucune récolte n'est enregistrée
        String notes,
        List<FodderHarvestDTO> harvests,
        LocalDateTime createdAt
) {
}