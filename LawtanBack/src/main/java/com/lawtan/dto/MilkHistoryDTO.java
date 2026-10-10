package com.lawtan.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkHistoryDTO {
    private LocalDate date;
    private Double morningVolume;
    private Double eveningVolume;
    private Double totalVolume;
    private Double avgTemperature;
    private Integer cowsMilkedCount;
}
