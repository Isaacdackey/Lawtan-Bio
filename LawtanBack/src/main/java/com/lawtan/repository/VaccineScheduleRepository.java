package com.lawtan.repository;

import com.lawtan.entity.VaccineSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccineScheduleRepository extends JpaRepository<VaccineSchedule, Long> {
    List<VaccineSchedule> findAllByOrderByScheduledDateAsc();
}
