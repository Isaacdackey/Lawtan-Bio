package com.lawtan.service;

import com.lawtan.dto.HealthRecordDTO;
import com.lawtan.dto.VaccineScheduleDTO;

import java.util.List;

public interface HealthService {
    List<HealthRecordDTO> getAllHealthRecords();
    List<HealthRecordDTO> getHealthRecordsByAnimal(String internalId);
    HealthRecordDTO createHealthRecord(HealthRecordDTO dto);
    HealthRecordDTO updateHealthRecord(Long id, HealthRecordDTO dto);
    void deleteHealthRecord(Long id);
    
    List<VaccineScheduleDTO> getAllVaccineSchedules();
    VaccineScheduleDTO createVaccineSchedule(VaccineScheduleDTO dto);
}
