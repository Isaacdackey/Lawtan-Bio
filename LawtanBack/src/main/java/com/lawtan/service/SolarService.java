package com.lawtan.service;

import com.lawtan.dto.SolarEnergyMetricDTO;

public interface SolarService {
    SolarEnergyMetricDTO getLatestSolarTelemetry();
    SolarEnergyMetricDTO recordSolarMetric(SolarEnergyMetricDTO dto);
}
