package com.lawtan.repository;

import com.lawtan.entity.MilkProduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MilkProductionRepository extends JpaRepository<MilkProduction, Long> {

    List<MilkProduction> findByProductionDate(LocalDate date);

    List<MilkProduction> findByProductionDateOrderBySessionAsc(LocalDate date);

    List<MilkProduction> findByProductionDateBetweenOrderByProductionDateAsc(LocalDate startDate, LocalDate endDate);

    List<MilkProduction> findByAnimalIdOrderByProductionDateDesc(Long animalId);

    List<MilkProduction> findAllByOrderByProductionDateDescIdDesc();

    @Query("SELECT SUM(m.volumeLiters) FROM MilkProduction m WHERE m.productionDate = :date")
    Double sumVolumeByProductionDate(LocalDate date);

    @Query("SELECT COALESCE(SUM(m.volumeLiters), 0.0) FROM MilkProduction m")
    Double sumTotalVolumeCollected();

    boolean existsByAnimalIdAndProductionDateAndSession(Long animalId, LocalDate productionDate, com.lawtan.model.MilkSession session);
}
