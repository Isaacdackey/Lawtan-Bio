package com.lawtan.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccineScheduleDTO {
    private Long id;
    private String vaccineType;
    private String targetHerd;
    private LocalDate scheduledDate;
    private String practitioner;
    private Double estimatedCost;
    private String status;
    private String notes;
}
