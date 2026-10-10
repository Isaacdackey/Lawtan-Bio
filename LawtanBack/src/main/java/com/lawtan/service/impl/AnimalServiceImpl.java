package com.lawtan.service.impl;

import com.lawtan.dto.AnimalDTO;
import com.lawtan.dto.PedigreeDTO;
import com.lawtan.entity.Animal;
import com.lawtan.entity.Pedigree;
import com.lawtan.model.AnimalCategory;
import com.lawtan.model.AnimalStatus;
import com.lawtan.repository.AnimalRepository;
import com.lawtan.repository.PedigreeRepository;
import com.lawtan.service.AnimalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnimalServiceImpl implements AnimalService {

    private final AnimalRepository animalRepository;
    private final PedigreeRepository pedigreeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AnimalDTO> getAllAnimals() {
        return animalRepository.findAllWithPedigree().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnimalDTO> getAnimalsByCategory(AnimalCategory category) {
        return animalRepository.findByCategory(category).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnimalDTO> getAnimalsByStatus(AnimalStatus status) {
        return animalRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AnimalDTO getAnimalByInternalId(String internalId) {
        Animal animal = animalRepository.findByInternalIdWithPedigree(internalId)
                .orElseThrow(() -> new RuntimeException("Animal non trouvé avec l'identifiant: " + internalId));
        return mapToDTO(animal);
    }

    @Override
    @Transactional
    public AnimalDTO createAnimal(AnimalDTO dto) {
        String intId = dto.getInternalId();
        if (intId == null || intId.trim().isEmpty()) {
            long count = animalRepository.count() + 1;
            intId = String.format("FL-%03d", count);
            while (animalRepository.findByInternalId(intId).isPresent()) {
                count++;
                intId = String.format("FL-%03d", count);
            }
        } else {
            intId = intId.trim();
            if (animalRepository.findByInternalId(intId).isPresent()) {
                throw new com.lawtan.exception.BusinessException(
                        "L'identifiant matricule '" + intId + "' est déjà attribué à un animal.",
                        org.springframework.http.HttpStatus.CONFLICT
                );
            }
        }

        validateAnimalData(dto, null);

        String name = dto.getName();
        if (name == null || name.trim().isEmpty()) {
            name = "Animal " + intId;
        }

        String breed = dto.getBreed();
        if (breed == null || breed.trim().isEmpty()) {
            breed = "Holstein Pure";
        }

        String earTag = dto.getEarTagNumber();
        if (earTag == null || earTag.trim().isEmpty()) {
            earTag = String.format("SN-%s-%04d", intId, System.currentTimeMillis() % 10000);
        }

        Animal animal = Animal.builder()
                .internalId(intId)
                .name(name.trim())
                .earTagNumber(earTag.trim())
                .rfidCode(cleanString(dto.getRfidCode()))
                .breed(breed.trim())
                .birthDate(dto.getBirthDate() != null ? dto.getBirthDate() : java.time.LocalDate.now())
                .gender(dto.getGender() != null ? dto.getGender() : "FEMALE")
                .category(dto.getCategory() != null ? dto.getCategory() : AnimalCategory.MILKING_COW)
                .status(dto.getStatus() != null ? dto.getStatus() : AnimalStatus.HEALTHY)
                .weight(dto.getWeight() != null ? dto.getWeight() : 450.0)
                .temperature(dto.getTemperature() != null ? dto.getTemperature() : 38.5)
                .dailyMilkYield(dto.getDailyMilkYield() != null ? dto.getDailyMilkYield() : 0.0)
                .lactationNumber(dto.getLactationNumber())
                .daysInMilk(dto.getDaysInMilk())
                .totalLactationMilk(dto.getTotalLactationMilk())
                .reproStatus(dto.getReproStatus())
                .daysOpen(dto.getDaysOpen())
                .motherId(cleanString(dto.getMotherId()))
                .fatherId(cleanString(dto.getFatherId()))
                .fatherDescription(dto.getFatherDescription())
                .lactationStatus(dto.getLactationStatus())
                .reproStatusDetailed(dto.getReproStatusDetailed())
                .gestationDays(dto.getGestationDays())
                .expectedCalvingDate(dto.getExpectedCalvingDate())
                .expectedDryOffDate(dto.getExpectedDryOffDate())
                .lastInseminationDate(dto.getLastInseminationDate())
                .arrivalDate(dto.getArrivalDate())
                .deathDate(dto.getDeathDate())
                .originLot(dto.getOriginLot())
                .descendantsCount(dto.getDescendantsCount() != null ? dto.getDescendantsCount() : 0)
                .cullingRecommended(dto.getCullingRecommended() != null ? dto.getCullingRecommended() : false)
                .cowMasterAlert(dto.getCowMasterAlert())
                .sourceRecord(dto.getSourceRecord())
                .avatarEmoji(dto.getAvatarEmoji() != null ? dto.getAvatarEmoji() : "🐄")
                .imageUrl(dto.getImageUrl())
                .origin(dto.getOrigin())
                .notes(dto.getNotes())
                .build();

        if (dto.getPedigree() != null) {
            PedigreeDTO pDto = dto.getPedigree();
            Pedigree pedigree = Pedigree.builder()
                    .animal(animal)
                    .subjectNote(pDto.getSubjectNote())
                    .fatherName(pDto.getFatherName())
                    .fatherEarTag(pDto.getFatherEarTag())
                    .fatherBreed(pDto.getFatherBreed())
                    .fatherNote(pDto.getFatherNote())
                    .motherName(pDto.getMotherName())
                    .motherEarTag(pDto.getMotherEarTag())
                    .motherBreed(pDto.getMotherBreed())
                    .motherNote(pDto.getMotherNote())
                    .grandFatherPaternal(pDto.getGrandFatherPaternal())
                    .grandMotherPaternal(pDto.getGrandMotherPaternal())
                    .grandFatherMaternal(pDto.getGrandFatherMaternal())
                    .grandMotherMaternal(pDto.getGrandMotherMaternal())
                    .semenMobilityPercentage(pDto.getSemenMobilityPercentage())
                    .semenConcentration(pDto.getSemenConcentration())
                    .semenMorphologyOkPercentage(pDto.getSemenMorphologyOkPercentage())
                    .semenDosesAvailable(pDto.getSemenDosesAvailable())
                    .build();
            animal.setPedigree(pedigree);
        }

        Animal saved = animalRepository.save(animal);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public AnimalDTO updateAnimal(String internalId, AnimalDTO dto) {
        Animal animal = animalRepository.findByInternalIdWithPedigree(internalId)
                .orElseThrow(() -> new com.lawtan.exception.BusinessException("Animal non trouvé avec l'identifiant: " + internalId, org.springframework.http.HttpStatus.NOT_FOUND));

        validateAnimalData(dto, internalId);

        if (dto.getName() != null) animal.setName(dto.getName().trim());
        if (dto.getEarTagNumber() != null) animal.setEarTagNumber(dto.getEarTagNumber());
        if (dto.getRfidCode() != null) animal.setRfidCode(dto.getRfidCode());
        if (dto.getBreed() != null) animal.setBreed(dto.getBreed());
        if (dto.getBirthDate() != null) animal.setBirthDate(dto.getBirthDate());
        if (dto.getGender() != null) animal.setGender(dto.getGender());
        if (dto.getCategory() != null) animal.setCategory(dto.getCategory());
        if (dto.getStatus() != null) animal.setStatus(dto.getStatus());
        if (dto.getWeight() != null) animal.setWeight(dto.getWeight());
        if (dto.getTemperature() != null) animal.setTemperature(dto.getTemperature());
        if (dto.getDailyMilkYield() != null) animal.setDailyMilkYield(dto.getDailyMilkYield());
        if (dto.getLactationNumber() != null) animal.setLactationNumber(dto.getLactationNumber());
        if (dto.getDaysInMilk() != null) animal.setDaysInMilk(dto.getDaysInMilk());
        if (dto.getTotalLactationMilk() != null) animal.setTotalLactationMilk(dto.getTotalLactationMilk());
        if (dto.getReproStatus() != null) animal.setReproStatus(dto.getReproStatus());
        if (dto.getDaysOpen() != null) animal.setDaysOpen(dto.getDaysOpen());
        if (dto.getMotherId() != null) animal.setMotherId(dto.getMotherId());
        if (dto.getFatherId() != null) animal.setFatherId(dto.getFatherId());
        if (dto.getFatherDescription() != null) animal.setFatherDescription(dto.getFatherDescription());
        if (dto.getLactationStatus() != null) animal.setLactationStatus(dto.getLactationStatus());
        if (dto.getReproStatusDetailed() != null) animal.setReproStatusDetailed(dto.getReproStatusDetailed());
        if (dto.getGestationDays() != null) animal.setGestationDays(dto.getGestationDays());
        if (dto.getExpectedCalvingDate() != null) animal.setExpectedCalvingDate(dto.getExpectedCalvingDate());
        if (dto.getExpectedDryOffDate() != null) animal.setExpectedDryOffDate(dto.getExpectedDryOffDate());
        if (dto.getLastInseminationDate() != null) animal.setLastInseminationDate(dto.getLastInseminationDate());
        if (dto.getArrivalDate() != null) animal.setArrivalDate(dto.getArrivalDate());
        if (dto.getDeathDate() != null) animal.setDeathDate(dto.getDeathDate());
        if (dto.getOriginLot() != null) animal.setOriginLot(dto.getOriginLot());
        if (dto.getDescendantsCount() != null) animal.setDescendantsCount(dto.getDescendantsCount());
        if (dto.getCullingRecommended() != null) animal.setCullingRecommended(dto.getCullingRecommended());
        if (dto.getCowMasterAlert() != null) animal.setCowMasterAlert(dto.getCowMasterAlert());
        if (dto.getSourceRecord() != null) animal.setSourceRecord(dto.getSourceRecord());
        if (dto.getAvatarEmoji() != null) animal.setAvatarEmoji(dto.getAvatarEmoji());
        if (dto.getImageUrl() != null) animal.setImageUrl(dto.getImageUrl());
        if (dto.getOrigin() != null) animal.setOrigin(dto.getOrigin());
        if (dto.getNotes() != null) animal.setNotes(dto.getNotes());

        if (dto.getPedigree() != null) {
            PedigreeDTO pDto = dto.getPedigree();
            Pedigree pedigree = animal.getPedigree();
            if (pedigree == null) {
                pedigree = new Pedigree();
                pedigree.setAnimal(animal);
                animal.setPedigree(pedigree);
            }
            pedigree.setSubjectNote(pDto.getSubjectNote());
            pedigree.setFatherName(pDto.getFatherName());
            pedigree.setFatherEarTag(pDto.getFatherEarTag());
            pedigree.setFatherBreed(pDto.getFatherBreed());
            pedigree.setFatherNote(pDto.getFatherNote());
            pedigree.setMotherName(pDto.getMotherName());
            pedigree.setMotherEarTag(pDto.getMotherEarTag());
            pedigree.setMotherBreed(pDto.getMotherBreed());
            pedigree.setMotherNote(pDto.getMotherNote());
            pedigree.setGrandFatherPaternal(pDto.getGrandFatherPaternal());
            pedigree.setGrandMotherPaternal(pDto.getGrandMotherPaternal());
            pedigree.setGrandFatherMaternal(pDto.getGrandFatherMaternal());
            pedigree.setGrandMotherMaternal(pDto.getGrandMotherMaternal());
            pedigree.setSemenMobilityPercentage(pDto.getSemenMobilityPercentage());
            pedigree.setSemenConcentration(pDto.getSemenConcentration());
            pedigree.setSemenMorphologyOkPercentage(pDto.getSemenMorphologyOkPercentage());
            pedigree.setSemenDosesAvailable(pDto.getSemenDosesAvailable());
        }

        Animal saved = animalRepository.save(animal);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteAnimal(String internalId) {
        Animal animal = animalRepository.findByInternalId(internalId)
                .orElseThrow(() -> new RuntimeException("Animal non trouvé avec l'identifiant: " + internalId));
        animalRepository.delete(animal);
    }

    public AnimalDTO mapToDTO(Animal animal) {
        PedigreeDTO pDto = null;
        if (animal.getPedigree() != null) {
            Pedigree p = animal.getPedigree();
            pDto = PedigreeDTO.builder()
                    .id(p.getId())
                    .animalId(animal.getId())
                    .animalInternalId(animal.getInternalId())
                    .animalName(animal.getName())
                    .subjectNote(p.getSubjectNote())
                    .fatherName(p.getFatherName())
                    .fatherEarTag(p.getFatherEarTag())
                    .fatherBreed(p.getFatherBreed())
                    .fatherNote(p.getFatherNote())
                    .motherName(p.getMotherName())
                    .motherEarTag(p.getMotherEarTag())
                    .motherBreed(p.getMotherBreed())
                    .motherNote(p.getMotherNote())
                    .grandFatherPaternal(p.getGrandFatherPaternal())
                    .grandMotherPaternal(p.getGrandMotherPaternal())
                    .grandFatherMaternal(p.getGrandFatherMaternal())
                    .grandMotherMaternal(p.getGrandMotherMaternal())
                    .semenMobilityPercentage(p.getSemenMobilityPercentage())
                    .semenConcentration(p.getSemenConcentration())
                    .semenMorphologyOkPercentage(p.getSemenMorphologyOkPercentage())
                    .semenDosesAvailable(p.getSemenDosesAvailable())
                    .build();
        }

        String gLabel = "Femelle";
        if ("MALE".equalsIgnoreCase(animal.getGender()) 
                || animal.getCategory() == AnimalCategory.MALE_BULL
                || animal.getCategory() == AnimalCategory.TAUREAU
                || animal.getCategory() == AnimalCategory.JEUNE_MALE
                || animal.getCategory() == AnimalCategory.VEAU) {
            gLabel = "Mâle";
        }

        Double ageYears = null;
        if (animal.getBirthDate() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(animal.getBirthDate(), java.time.LocalDate.now());
            ageYears = Math.round((days / 365.25) * 10.0) / 10.0;
        }

        return AnimalDTO.builder()
                .id(animal.getId())
                .internalId(animal.getInternalId())
                .name(animal.getName())
                .earTagNumber(animal.getEarTagNumber())
                .rfidCode(animal.getRfidCode())
                .breed(animal.getBreed())
                .birthDate(animal.getBirthDate())
                .ageYears(ageYears)
                .gender(animal.getGender() != null ? animal.getGender() : ("MALE".equals(gLabel) ? "MALE" : "FEMALE"))
                .genderLabel(gLabel)
                .category(animal.getCategory())
                .categoryLabel(animal.getCategory() != null ? animal.getCategory().getLabel() : null)
                .status(animal.getStatus())
                .statusLabel(animal.getStatus() != null ? animal.getStatus().getLabel() : null)
                .weight(animal.getWeight())
                .temperature(animal.getTemperature())
                .dailyMilkYield(animal.getDailyMilkYield())
                .lactationNumber(animal.getLactationNumber())
                .daysInMilk(animal.getDaysInMilk())
                .totalLactationMilk(animal.getTotalLactationMilk())
                .reproStatus(animal.getReproStatus())
                .daysOpen(animal.getDaysOpen())
                .motherId(animal.getMotherId())
                .fatherId(animal.getFatherId())
                .fatherDescription(animal.getFatherDescription())
                .lactationStatus(animal.getLactationStatus())
                .reproStatusDetailed(animal.getReproStatusDetailed())
                .gestationDays(animal.getGestationDays())
                .expectedCalvingDate(animal.getExpectedCalvingDate())
                .expectedDryOffDate(animal.getExpectedDryOffDate())
                .lastInseminationDate(animal.getLastInseminationDate())
                .arrivalDate(animal.getArrivalDate())
                .deathDate(animal.getDeathDate())
                .originLot(animal.getOriginLot())
                .descendantsCount(animal.getDescendantsCount())
                .cullingRecommended(animal.getCullingRecommended())
                .cowMasterAlert(animal.getCowMasterAlert())
                .sourceRecord(animal.getSourceRecord())
                .avatarEmoji(animal.getAvatarEmoji())
                .imageUrl(animal.getImageUrl())
                .origin(animal.getOrigin())
                .notes(animal.getNotes())
                .pedigree(pDto)
                .build();
    }

    private void validateAnimalData(AnimalDTO dto, String currentInternalId) {
        if (dto.getBirthDate() != null && dto.getBirthDate().isAfter(java.time.LocalDate.now())) {
            throw new com.lawtan.exception.BusinessException(
                    "La date de naissance (" + dto.getBirthDate() + ") ne peut pas être dans le futur.",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }
        if (dto.getDeathDate() != null && dto.getBirthDate() != null && dto.getDeathDate().isBefore(dto.getBirthDate())) {
            throw new com.lawtan.exception.BusinessException(
                    "La date de décès (" + dto.getDeathDate() + ") ne peut pas être antérieure à la date de naissance (" + dto.getBirthDate() + ").",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }
        if (dto.getWeight() != null && dto.getWeight() <= 0) {
            throw new com.lawtan.exception.BusinessException("Le poids de l'animal doit être strictement supérieur à 0 kg.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        if (dto.getTemperature() != null && (dto.getTemperature() < 34.0 || dto.getTemperature() > 44.0)) {
            throw new com.lawtan.exception.BusinessException(
                    "La température corporelle (" + dto.getTemperature() + "°C) est hors des limites physiologiques bovines (34°C - 44°C).",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }

        // Contrôle de cohérence de sexe
        boolean isMale = "MALE".equalsIgnoreCase(dto.getGender())
                || dto.getCategory() == AnimalCategory.MALE_BULL
                || dto.getCategory() == AnimalCategory.TAUREAU
                || dto.getCategory() == AnimalCategory.JEUNE_MALE;

        if (isMale) {
            if (dto.getCategory() == AnimalCategory.MILKING_COW || dto.getCategory() == AnimalCategory.VACHE) {
                throw new com.lawtan.exception.BusinessException("Incohérence biologique : un mâle ne peut pas être classé comme vache ou vache laitière.", org.springframework.http.HttpStatus.BAD_REQUEST);
            }
            if (dto.getDailyMilkYield() != null && dto.getDailyMilkYield() > 0) {
                throw new com.lawtan.exception.BusinessException("Incohérence biologique : un mâle ne peut pas avoir une production de lait.", org.springframework.http.HttpStatus.BAD_REQUEST);
            }
            if (dto.getLactationNumber() != null && dto.getLactationNumber() > 0) {
                throw new com.lawtan.exception.BusinessException("Incohérence biologique : un mâle ne peut pas avoir de numéro de lactation.", org.springframework.http.HttpStatus.BAD_REQUEST);
            }
        }

        // Unicité Boucle d'identification (EarTag)
        String earTag = dto.getEarTagNumber();
        if (earTag != null && !earTag.trim().isEmpty()) {
            earTag = earTag.trim();
            boolean exists = (currentInternalId == null)
                    ? animalRepository.existsByEarTagNumber(earTag)
                    : animalRepository.existsByEarTagNumberAndInternalIdNot(earTag, currentInternalId);
            if (exists) {
                throw new com.lawtan.exception.BusinessException(
                        "Le numéro de boucle auriculaire '" + earTag + "' est déjà attribué à un autre animal du cheptel.",
                        org.springframework.http.HttpStatus.CONFLICT
                );
            }
        }

        // Unicité RFID
        String rfid = dto.getRfidCode();
        if (rfid != null && !rfid.trim().isEmpty()) {
            rfid = rfid.trim();
            boolean exists = (currentInternalId == null)
                    ? animalRepository.existsByRfidCode(rfid)
                    : animalRepository.existsByRfidCodeAndInternalIdNot(rfid, currentInternalId);
            if (exists) {
                throw new com.lawtan.exception.BusinessException(
                        "Le code de puce RFID '" + rfid + "' est déjà associé à un autre animal.",
                        org.springframework.http.HttpStatus.CONFLICT
                );
            }
        }

        // Généalogie
        if (currentInternalId != null) {
            if (currentInternalId.equalsIgnoreCase(dto.getMotherId())) {
                throw new com.lawtan.exception.BusinessException("Incohérence généalogique : l'animal ne peut pas être sa propre mère.", org.springframework.http.HttpStatus.BAD_REQUEST);
            }
            if (currentInternalId.equalsIgnoreCase(dto.getFatherId())) {
                throw new com.lawtan.exception.BusinessException("Incohérence généalogique : l'animal ne peut pas être son propre père.", org.springframework.http.HttpStatus.BAD_REQUEST);
            }
        }
        if (dto.getMotherId() != null && !dto.getMotherId().isBlank()
                && dto.getMotherId().equalsIgnoreCase(dto.getFatherId())) {
            throw new com.lawtan.exception.BusinessException("Incohérence généalogique : le père et la mère ne peuvent pas être le même animal.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }

    private String cleanString(String s) {
        if (s == null || s.trim().isEmpty()) return null;
        return s.trim();
    }
}
