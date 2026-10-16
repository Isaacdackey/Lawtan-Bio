package com.lawtan.dto;

import com.lawtan.model.FodderCropStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record FodderCropRequestDTO(
        @NotBlank(message = "Le nom de la parcelle est obligatoire")
        @Size(max = 100, message = "Nom de parcelle trop long (100 caractères max)")
        String parcelName,

        @NotBlank(message = "Le type de culture est obligatoire")
        @Size(max = 100, message = "Type de culture trop long (100 caractères max)")
        String cropType,

        @NotNull(message = "La superficie (hectares) est obligatoire")
        @Positive(message = "La superficie doit être supérieure à 0")
        Double areaHectares,

        LocalDate plantingDate,
        LocalDate expectedHarvestDate,
        FodderCropStatus status,

        @PositiveOrZero(message = "Le rendement attendu ne peut pas être négatif")
        Double expectedYieldKg,

        @Size(max = 30, message = "Type d'irrigation trop long (30 caractères max)")
        String irrigationType,

        @PositiveOrZero(message = "Le coût des semences ne peut pas être négatif") Double seedCostFcfa,
        @PositiveOrZero(message = "Le coût des engrais ne peut pas être négatif") Double fertilizerCostFcfa,
        @PositiveOrZero(message = "Le coût de main-d'œuvre ne peut pas être négatif") Double laborCostFcfa,
        @PositiveOrZero(message = "Le coût d'irrigation ne peut pas être négatif") Double irrigationCostFcfa,
        @PositiveOrZero(message = "Les autres coûts ne peuvent pas être négatifs") Double otherCostFcfa,

        @Size(max = 2000, message = "Notes trop longues (2000 caractères max)")
        String notes
) {
}