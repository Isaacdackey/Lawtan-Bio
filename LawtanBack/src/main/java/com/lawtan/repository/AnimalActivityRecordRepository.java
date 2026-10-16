package com.lawtan.repository;

import com.lawtan.entity.AnimalActivityRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalActivityRecordRepository extends JpaRepository<AnimalActivityRecord, Long> {

    Optional<AnimalActivityRecord> findByAnimalIdAndRecordDate(Long animalId, LocalDate recordDate);

    List<AnimalActivityRecord> findByAnimalIdAndRecordDateBetweenOrderByRecordDateDesc(
            Long animalId, LocalDate from, LocalDate to);

    @Query("SELECT r FROM AnimalActivityRecord r JOIN FETCH r.animal "
            + "WHERE r.recordDate BETWEEN :from AND :to ORDER BY r.recordDate DESC")
    List<AnimalActivityRecord> findAllBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}