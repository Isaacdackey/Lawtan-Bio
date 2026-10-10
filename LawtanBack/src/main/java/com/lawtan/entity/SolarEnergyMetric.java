package com.lawtan.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solar_energy_metrics")
public class SolarEnergyMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp = LocalDateTime.now();

    private Double currentSolarPowerKw;

    private Double batterySocPercent;

    private Double dailySolarYieldKwh;

    private Double totalSolarYieldMwh;

    private String gridStatus; // SOLAR_OPTIMAL, BATTERY_BACKUP, GENERATOR_STANDBY

    private Double coldRoomTempCelsius;

    private Double secondColdRoomTempCelsius;

    private Double waterPumpFlowM3h;

    private Double waterTankLevelPercent;

    private Double co2SavedKg;

    public SolarEnergyMetric() {}

    public SolarEnergyMetric(Double currentSolarPowerKw, Double batterySocPercent, Double dailySolarYieldKwh, Double totalSolarYieldMwh, String gridStatus, Double coldRoomTempCelsius, Double secondColdRoomTempCelsius, Double waterPumpFlowM3h, Double waterTankLevelPercent, Double co2SavedKg) {
        this.timestamp = LocalDateTime.now();
        this.currentSolarPowerKw = currentSolarPowerKw;
        this.batterySocPercent = batterySocPercent;
        this.dailySolarYieldKwh = dailySolarYieldKwh;
        this.totalSolarYieldMwh = totalSolarYieldMwh;
        this.gridStatus = gridStatus;
        this.coldRoomTempCelsius = coldRoomTempCelsius;
        this.secondColdRoomTempCelsius = secondColdRoomTempCelsius;
        this.waterPumpFlowM3h = waterPumpFlowM3h;
        this.waterTankLevelPercent = waterTankLevelPercent;
        this.co2SavedKg = co2SavedKg;
    }

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
