package com.lawtan.dto;

import java.time.LocalDate;

public record FodderHarvestDTO(
        Long id,
        LocalDate harvestDate,
        Double quantityKg,
        Double dryMatterPercent,
        String notes
) {
}