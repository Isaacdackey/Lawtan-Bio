package com.lawtan.dto;

import lombok.*;

/** Tarif du lait cru au litre. Le prix est nul tant qu'aucun tarif n'a ete fixe. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkPricingDTO {
    private Double directSalePricePerLiterFcfa;
    private String notes;
    private String updatedAt;
    private String updatedBy;
}
