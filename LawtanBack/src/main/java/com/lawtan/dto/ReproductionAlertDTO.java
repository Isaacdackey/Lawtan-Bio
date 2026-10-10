package com.lawtan.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReproductionAlertDTO {
    private String alertType; // CALVING_IMMINENT, DRY_OFF_DUE, HEAT_ACTIVE, PREG_CHECK, CULLING_ALERT
    private String animalInternalId;
    private String animalName;
    private LocalDate targetDate;
    private Long daysRemaining;
    private String message;
    private String severity; // DANGER, WARNING, INFO
    private Integer daysOpen;
    private Long daysSinceIA;
    private String actionLabel;
}
