package com.lawtan.service.impl;

import com.lawtan.dto.SolarEnergyMetricDTO;
import com.lawtan.entity.SolarEnergyMetric;
import com.lawtan.repository.SolarEnergyMetricRepository;
import com.lawtan.service.SolarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SolarServiceImpl implements SolarService {

    @Autowired
    private SolarEnergyMetricRepository solarRepository;

    @Override
    public SolarEnergyMetricDTO getLatestSolarTelemetry() {
        return solarRepository.findTopByOrderByTimestampDesc()
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public SolarEnergyMetricDTO recordSolarMetric(SolarEnergyMetricDTO dto) {
        SolarEnergyMetric entity = new SolarEnergyMetric(
                dto.getCurrentSolarPowerKw(),
                dto.getBatterySocPercent(),
                dto.getDailySolarYieldKwh(),
                dto.getTotalSolarYieldMwh(),
                dto.getGridStatus(),
                dto.getColdRoomTempCelsius(),
                dto.getSecondColdRoomTempCelsius(),
                dto.getWaterPumpFlowM3h(),
                dto.getWaterTankLevelPercent(),
                dto.getCo2SavedKg()
        );
        SolarEnergyMetric saved = solarRepository.save(entity);
        return convertToDTO(saved);
    }

    private SolarEnergyMetricDTO convertToDTO(SolarEnergyMetric entity) {
        SolarEnergyMetricDTO dto = new SolarEnergyMetricDTO();
        dto.setId(entity.getId());
        dto.setTimestamp(entity.getTimestamp());
        dto.setCurrentSolarPowerKw(entity.getCurrentSolarPowerKw());
        dto.setBatterySocPercent(entity.getBatterySocPercent());
        dto.setDailySolarYieldKwh(entity.getDailySolarYieldKwh());
        dto.setTotalSolarYieldMwh(entity.getTotalSolarYieldMwh());
        dto.setGridStatus(entity.getGridStatus());
        dto.setColdRoomTempCelsius(entity.getColdRoomTempCelsius());
        dto.setSecondColdRoomTempCelsius(entity.getSecondColdRoomTempCelsius());
        dto.setWaterPumpFlowM3h(entity.getWaterPumpFlowM3h());
        dto.setWaterTankLevelPercent(entity.getWaterTankLevelPercent());
        dto.setCo2SavedKg(entity.getCo2SavedKg());
        return dto;
    }
}
