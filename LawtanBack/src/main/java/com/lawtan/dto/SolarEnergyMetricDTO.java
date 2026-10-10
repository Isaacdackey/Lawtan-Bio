package com.lawtan.dto;

import java.time.LocalDateTime;

public class SolarEnergyMetricDTO {
    private Long id;
    private LocalDateTime timestamp;
    private Double currentSolarPowerKw;
    private Double batterySocPercent;
    private Double dailySolarYieldKwh;
    private Double totalSolarYieldMwh;
    private String gridStatus;
    private Double coldRoomTempCelsius;
    private Double secondColdRoomTempCelsius;
    private Double waterPumpFlowM3h;
    private Double waterTankLevelPercent;
    private Double co2SavedKg;

    public SolarEnergyMetricDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Double getCurrentSolarPowerKw() { return currentSolarPowerKw; }
    public void setCurrentSolarPowerKw(Double currentSolarPowerKw) { this.currentSolarPowerKw = currentSolarPowerKw; }

    public Double getBatterySocPercent() { return batterySocPercent; }
    public void setBatterySocPercent(Double batterySocPercent) { this.batterySocPercent = batterySocPercent; }

    public Double getDailySolarYieldKwh() { return dailySolarYieldKwh; }
    public void setDailySolarYieldKwh(Double dailySolarYieldKwh) { this.dailySolarYieldKwh = dailySolarYieldKwh; }

    public Double getTotalSolarYieldMwh() { return totalSolarYieldMwh; }
    public void setTotalSolarYieldMwh(Double totalSolarYieldMwh) { this.totalSolarYieldMwh = totalSolarYieldMwh; }

    public String getGridStatus() { return gridStatus; }
    public void setGridStatus(String gridStatus) { this.gridStatus = gridStatus; }

    public Double getColdRoomTempCelsius() { return coldRoomTempCelsius; }
    public void setColdRoomTempCelsius(Double coldRoomTempCelsius) { this.coldRoomTempCelsius = coldRoomTempCelsius; }

    public Double getSecondColdRoomTempCelsius() { return secondColdRoomTempCelsius; }
    public void setSecondColdRoomTempCelsius(Double secondColdRoomTempCelsius) { this.secondColdRoomTempCelsius = secondColdRoomTempCelsius; }

    public Double getWaterPumpFlowM3h() { return waterPumpFlowM3h; }
    public void setWaterPumpFlowM3h(Double waterPumpFlowM3h) { this.waterPumpFlowM3h = waterPumpFlowM3h; }

    public Double getWaterTankLevelPercent() { return waterTankLevelPercent; }
    public void setWaterTankLevelPercent(Double waterTankLevelPercent) { this.waterTankLevelPercent = waterTankLevelPercent; }

    public Double getCo2SavedKg() { return co2SavedKg; }
    public void setCo2SavedKg(Double co2SavedKg) { this.co2SavedKg = co2SavedKg; }
}
