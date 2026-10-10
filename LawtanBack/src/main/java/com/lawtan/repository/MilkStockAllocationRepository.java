package com.lawtan.repository;

import com.lawtan.entity.MilkStockAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface MilkStockAllocationRepository extends JpaRepository<MilkStockAllocation, Long> {

    Optional<MilkStockAllocation> findByAllocationDate(LocalDate allocationDate);

    // --- Cumuls toutes journees confondues : le lait ventile hier reste en stock aujourd'hui ---

    @Query("SELECT COALESCE(SUM(a.directSaleVolume), 0.0) FROM MilkStockAllocation a")
    Double sumDirectSaleAllocated();

    @Query("SELECT COALESCE(SUM(a.productionVolume), 0.0) FROM MilkStockAllocation a")
    Double sumProductionAllocated();

    @Query("SELECT COALESCE(SUM(a.calvesVolume), 0.0) FROM MilkStockAllocation a")
    Double sumCalvesAllocated();

    @Query("SELECT COALESCE(SUM(a.directSaleConsumed), 0.0) FROM MilkStockAllocation a")
    Double sumDirectSaleConsumed();
}
