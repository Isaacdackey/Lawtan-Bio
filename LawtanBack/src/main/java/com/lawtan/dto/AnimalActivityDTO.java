package com.lawtan.dto;

import java.time.LocalDate;

public record AnimalActivityDTO(
        Long id,
        String animalInternalId,
        String animalName,
        LocalDate recordDate,
        Integer stepsCount,
        Integer activeMinutes,
        Integer restingMinutes,
        Integer ruminationMinutes,
        String source,
        String notes
) {
}