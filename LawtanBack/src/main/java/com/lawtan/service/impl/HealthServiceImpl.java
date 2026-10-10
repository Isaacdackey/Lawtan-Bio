package com.lawtan.service.impl;

import com.lawtan.dto.HealthRecordDTO;
import com.lawtan.dto.VaccineScheduleDTO;
import com.lawtan.entity.Animal;
import com.lawtan.entity.HealthRecord;
import com.lawtan.entity.VaccineSchedule;
import com.lawtan.model.AnimalStatus;
import com.lawtan.repository.AnimalRepository;
import com.lawtan.repository.HealthRecordRepository;
import com.lawtan.repository.VaccineScheduleRepository;
import com.lawtan.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthServiceImpl implements HealthService {

    private final HealthRecordRepository healthRecordRepository;
    private final VaccineScheduleRepository vaccineScheduleRepository;
    private final AnimalRepository animalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HealthRecordDTO> getAllHealthRecords() {
        return healthRecordRepository.findAllByOrderByRecordDateDesc().stream()
                .map(this::mapRecordToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthRecordDTO> getHealthRecordsByAnimal(String internalId) {
        return healthRecordRepository.findByAnimalInternalIdOrderByRecordDateDesc(internalId).stream()
                .map(this::mapRecordToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HealthRecordDTO createHealthRecord(HealthRecordDTO dto) {
        Animal animal = animalRepository.findByInternalId(dto.getAnimalInternalId())
                .orElseThrow(() -> new RuntimeException("Animal non trouvé: " + dto.getAnimalInternalId()));

        HealthRecord record = HealthRecord.builder()
                .animal(animal)
                .recordDate(dto.getRecordDate() != null ? dto.getRecordDate() : LocalDate.now())
                .actType(dto.getActType())
                .diagnosis(dto.getDiagnosis())
                .treatmentPrescription(dto.getTreatmentPrescription())
                .practitionerName(dto.getPractitionerName() != null ? dto.getPractitionerName() : "Dr. Fall")
                .costFcfa(dto.getCostFcfa() != null ? dto.getCostFcfa() : 0.0)
                .status(dto.getStatus() != null ? dto.getStatus() : "En cours")
                .milkWithdrawalDays(dto.getMilkWithdrawalDays() != null ? dto.getMilkWithdrawalDays() : 0)
                .build();

        // Update animal status if fever or pathology
        if (dto.getActType() != null && dto.getActType().toLowerCase().contains("fièvre")
                || (dto.getDiagnosis() != null && dto.getDiagnosis().toLowerCase().contains("fièvre"))) {
            animal.setStatus(AnimalStatus.FEVER_TREATMENT);
            animalRepository.save(animal);
        }

        HealthRecord saved = healthRecordRepository.save(record);
        return mapRecordToDTO(saved);
    }

    @Override
    @Transactional
    public HealthRecordDTO updateHealthRecord(Long id, HealthRecordDTO dto) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Acte de santé introuvable avec l'ID: " + id));

        if (dto.getActType() != null) record.setActType(dto.getActType());
        if (dto.getDiagnosis() != null) record.setDiagnosis(dto.getDiagnosis());
        if (dto.getTreatmentPrescription() != null) record.setTreatmentPrescription(dto.getTreatmentPrescription());
        if (dto.getPractitionerName() != null) record.setPractitionerName(dto.getPractitionerName());
        if (dto.getCostFcfa() != null) record.setCostFcfa(dto.getCostFcfa());
        if (dto.getStatus() != null) record.setStatus(dto.getStatus());
        if (dto.getMilkWithdrawalDays() != null) record.setMilkWithdrawalDays(dto.getMilkWithdrawalDays());
        if (dto.getRecordDate() != null) record.setRecordDate(dto.getRecordDate());

        HealthRecord saved = healthRecordRepository.save(record);
        return mapRecordToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteHealthRecord(Long id) {
        healthRecordRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineScheduleDTO> getAllVaccineSchedules() {
        return vaccineScheduleRepository.findAllByOrderByScheduledDateAsc().stream()
                .map(this::mapVaccineToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VaccineScheduleDTO createVaccineSchedule(VaccineScheduleDTO dto) {
        VaccineSchedule schedule = VaccineSchedule.builder()
                .vaccineType(dto.getVaccineType())
                .targetHerd(dto.getTargetHerd())
                .scheduledDate(dto.getScheduledDate())
                .practitioner(dto.getPractitioner() != null ? dto.getPractitioner() : "Dr. Fall")
                .estimatedCost(dto.getEstimatedCost() != null ? dto.getEstimatedCost() : 0.0)
                .status(dto.getStatus() != null ? dto.getStatus() : "Planifié")
                .notes(dto.getNotes())
                .build();

        VaccineSchedule saved = vaccineScheduleRepository.save(schedule);
        return mapVaccineToDTO(saved);
    }

    private HealthRecordDTO mapRecordToDTO(HealthRecord r) {
        return HealthRecordDTO.builder()
                .id(r.getId())
                .animalId(r.getAnimal() != null ? r.getAnimal().getId() : null)
                .animalInternalId(r.getAnimal() != null ? r.getAnimal().getInternalId() : null)
                .animalName(r.getAnimal() != null ? r.getAnimal().getName() : null)
                .recordDate(r.getRecordDate())
                .actType(r.getActType())
                .diagnosis(r.getDiagnosis())
                .treatmentPrescription(r.getTreatmentPrescription())
                .practitionerName(r.getPractitionerName())
                .costFcfa(r.getCostFcfa())
                .status(r.getStatus())
                .milkWithdrawalDays(r.getMilkWithdrawalDays())
                .build();
    }

    private VaccineScheduleDTO mapVaccineToDTO(VaccineSchedule v) {
        return VaccineScheduleDTO.builder()
                .id(v.getId())
                .vaccineType(v.getVaccineType())
                .targetHerd(v.getTargetHerd())
                .scheduledDate(v.getScheduledDate())
                .practitioner(v.getPractitioner())
                .estimatedCost(v.getEstimatedCost())
                .status(v.getStatus())
                .notes(v.getNotes())
                .build();
    }
}
