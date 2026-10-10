package com.lawtan.dto;

import com.lawtan.model.ReproEventType;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReproductionEventDTO {
    private Long id;
    private Long animalId;
    private String animalInternalId;
    private String animalName;
    private ReproEventType eventType;
    private String eventTypeLabel;
    private LocalDate eventDate;
    private String eventTime;
    private String cowMasterTypeOriginal;
    private String bullOrSemenUsed;
    private String method;
    private String result;
    private String pathology;
    private String treatment;
    private String operatorName;
    private LocalDate expectedDryOffDate;
    private LocalDate expectedCalvingDate;
    private String observations;
    private Boolean isConfirmed;
}

