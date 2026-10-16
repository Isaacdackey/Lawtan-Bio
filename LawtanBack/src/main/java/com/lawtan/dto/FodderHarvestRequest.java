package com.lawtan.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record FodderHarvestRequest(
        @NotNull(message = "La date de récolte est obligatoire")
        LocalDate harvestDate,

        @NotNull(message = "La quantité récoltée (kg) est obligatoire")
        @Positive(message = "La quantité récoltée doit être supérieure à 0")
        Double quantityKg,

        @DecimalMin(value = "0", message = "La matière sèche doit être comprise entre 0 et 100 %")
        @DecimalMax(value = "100", message = "La matière sèche doit être comprise entre 0 et 100 %")
        Double dryMatterPercent,

        @Size(max = 2000, message = "Notes trop longues (2000 caractères max)")
        String notes
) {
}