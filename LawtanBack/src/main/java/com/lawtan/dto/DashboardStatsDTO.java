package com.lawtan.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private Double dailyMilkTotal; // e.g. 124.0 L
    private Double morningMilkTotal; // e.g. 68.0 L
    private Double eveningMilkTotal; // e.g. 56.0 L
    private Integer milkingCowsCount; // e.g. 7
    private Integer totalFemalesCount; // e.g. 9
    private Integer totalBullsCount; // e.g. 4
    private Integer totalHerdCount; // e.g. 13
    private Double averageMilkPerCow; // e.g. 17.7 L/j
    private Integer healthAlertsCount; // e.g. 1
    private Double monthlyRevenueFcfa; // e.g. 1240000.0
    private Double feedConversionRatio; // e.g. 1.42 kg/L
    private Double solarAutonomyPercentage; // e.g. 94.0
    private List<AnimalDTO> milkingCowsToday;
    private List<Map<String, Object>> weeklyProductionChart;
    private List<Map<String, Object>> revenueDistributionChart;
}
