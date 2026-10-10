package com.lawtan.repository;

import com.lawtan.entity.TransformationBatch;
import com.lawtan.model.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransformationBatchRepository extends JpaRepository<TransformationBatch, Long> {
    Optional<TransformationBatch> findByBatchNumber(String batchNumber);
    List<TransformationBatch> findByStatus(BatchStatus status);
    List<TransformationBatch> findAllByOrderByProductionDateDesc();

    @Query("SELECT COALESCE(SUM(b.milkLitersConsumed), 0.0) FROM TransformationBatch b WHERE b.productionDate = :date AND (b.status = com.lawtan.model.BatchStatus.IN_PROGRESS OR b.status = com.lawtan.model.BatchStatus.COMPLETED)")
    Double sumMilkConsumedByDate(LocalDate date);

    @Query("SELECT COALESCE(SUM(b.milkLitersConsumed), 0.0) FROM TransformationBatch b WHERE b.status = com.lawtan.model.BatchStatus.IN_PROGRESS OR b.status = com.lawtan.model.BatchStatus.COMPLETED")
    Double sumTotalMilkConsumed();

    @Query("SELECT SUM(b.milkLitersConsumed) FROM TransformationBatch b WHERE b.status = com.lawtan.model.BatchStatus.COMPLETED")
    Double sumTotalMilkTransformed();

    @Query("SELECT AVG(b.yieldEfficiencyPercentage) FROM TransformationBatch b WHERE b.status = com.lawtan.model.BatchStatus.COMPLETED AND b.yieldEfficiencyPercentage IS NOT NULL")
    Double avgYieldEfficiency();

    Long countByStatus(BatchStatus status);
}
