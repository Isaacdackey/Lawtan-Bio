package com.lawtan.dto;

import com.lawtan.model.MilkSession;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkProductionDTO {
    private Long id;
    private Long animalId;
    private String animalInternalId;
    private String animalName;
    private String animalBreed;
    private LocalDate productionDate;
    private MilkSession session;
    private String sessionLabel;
    private Double volumeLiters;
    private Double milkTemperature;
    private Double fatPercentage;
    private String destinationTank;
    private Boolean isOrganicCompliant;
}
