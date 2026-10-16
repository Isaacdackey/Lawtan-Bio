package com.lawtan.dto;

import java.time.LocalDate;


public record AnimalActivitySummaryDTO(
        String animalInternalId,
        String animalName,
        LocalDate latestDate,
        Integer latestSteps,
        Double baselineSteps,       // moyenne des jours précédents de la fenêtre (null si historique insuffisant)
        Double variationPercent,    // (dernier - moyenne) / moyenne * 100
        String alertType,
        String alertMessage
) {
}