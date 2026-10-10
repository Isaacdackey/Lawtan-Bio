package com.lawtan.repository;

import com.lawtan.entity.SolarEnergyMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SolarEnergyMetricRepository extends JpaRepository<SolarEnergyMetric, Long> {
    Optional<SolarEnergyMetric> findTopByOrderByTimestampDesc();
}
