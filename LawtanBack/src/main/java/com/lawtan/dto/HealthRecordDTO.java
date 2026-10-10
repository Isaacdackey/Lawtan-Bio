package com.lawtan.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecordDTO {
    private Long id;
    private Long animalId;
    private String animalInternalId;
    private String animalName;
    private LocalDate recordDate;
    private String actType;
    private String diagnosis;
    private String treatmentPrescription;
    private String practitionerName;
    private Double costFcfa;
    private String status;
    private Integer milkWithdrawalDays;
}
