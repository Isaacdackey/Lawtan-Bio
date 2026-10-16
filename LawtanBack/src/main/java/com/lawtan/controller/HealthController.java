package com.lawtan.controller;

import com.lawtan.dto.HealthRecordDTO;
import com.lawtan.dto.VaccineScheduleDTO;
import com.lawtan.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping("/records")
    public ResponseEntity<List<HealthRecordDTO>> getAllHealthRecords(
            @RequestParam(required = false) String animalId) {
        if (animalId != null && !animalId.isBlank()) {
            return ResponseEntity.ok(healthService.getHealthRecordsByAnimal(animalId));
        }
        return ResponseEntity.ok(healthService.getAllHealthRecords());
    }

    @PostMapping("/records")
    public ResponseEntity<HealthRecordDTO> createHealthRecord(@RequestBody HealthRecordDTO dto) {
        return new ResponseEntity<>(healthService.createHealthRecord(dto), HttpStatus.CREATED);
    }

    @PutMapping("/records/{id}")
    public ResponseEntity<HealthRecordDTO> updateHealthRecord(@PathVariable Long id, @RequestBody HealthRecordDTO dto) {
        return ResponseEntity.ok(healthService.updateHealthRecord(id, dto));
    }

    @DeleteMapping("/records/{id}")
    public ResponseEntity<Void> deleteHealthRecord(@PathVariable Long id) {
        healthService.deleteHealthRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vaccines")
    public ResponseEntity<List<VaccineScheduleDTO>> getAllVaccines() {
        return ResponseEntity.ok(healthService.getAllVaccineSchedules());
    }

    @PostMapping("/vaccines")
    public ResponseEntity<VaccineScheduleDTO> createVaccine(@RequestBody VaccineScheduleDTO dto) {
        return new ResponseEntity<>(healthService.createVaccineSchedule(dto), HttpStatus.CREATED);
    }
}