package com.lawtan.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record AnimalActivityRequest(
        LocalDate recordDate, 

        @PositiveOrZero(message = "Le nombre de pas ne peut pas être négatif")
        @Max(value = 100000, message = "Nombre de pas irréaliste")
        Integer stepsCount,

        @Min(value = 0, message = "Les minutes d'activité ne peuvent pas être négatives")
        @Max(value = 1440, message = "Une journée compte 1440 minutes au maximum")
        Integer activeMinutes,

        @Min(value = 0, message = "Les minutes de repos ne peuvent pas être négatives")
        @Max(value = 1440, message = "Une journée compte 1440 minutes au maximum")
        Integer restingMinutes,

        @Min(value = 0, message = "Les minutes de rumination ne peuvent pas être négatives")
        @Max(value = 1440, message = "Une journée compte 1440 minutes au maximum")
        Integer ruminationMinutes,

        @Pattern(regexp = "MANUAL|COLLAR|RFID", message = "Source invalide (MANUAL, COLLAR ou RFID)")
        String source,

        @Size(max = 2000, message = "Notes trop longues (2000 caractères max)")
        String notes
) {
}