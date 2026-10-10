package com.lawtan.repository;

import com.lawtan.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByAnimalIdOrderByRecordDateDesc(Long animalId);
    List<HealthRecord> findByAnimalInternalIdOrderByRecordDateDesc(String internalId);
    List<HealthRecord> findAllByOrderByRecordDateDesc();

    @org.springframework.data.jpa.repository.Query("SELECT h FROM HealthRecord h WHERE h.animal.id = :animalId AND h.milkWithdrawalDays > 0 ORDER BY h.recordDate DESC")
    List<HealthRecord> findTreatmentsWithWithdrawal(Long animalId);
}
