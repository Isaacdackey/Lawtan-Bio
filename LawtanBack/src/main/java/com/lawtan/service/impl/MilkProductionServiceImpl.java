package com.lawtan.service.impl;

import com.lawtan.dto.MilkHistoryDTO;
import com.lawtan.dto.MilkProductionDTO;
import com.lawtan.dto.MilkPricingDTO;
import com.lawtan.dto.MilkStockAllocationDTO;
import com.lawtan.dto.TankStatusDTO;
import com.lawtan.entity.Animal;
import com.lawtan.entity.MilkProduction;
import com.lawtan.entity.MilkPricing;
import com.lawtan.entity.MilkStockAllocation;
import com.lawtan.model.AnimalStatus;
import com.lawtan.model.MilkSession;
import com.lawtan.repository.AnimalRepository;
import com.lawtan.repository.MilkProductionRepository;
import com.lawtan.repository.MilkPricingRepository;
import com.lawtan.repository.MilkStockAllocationRepository;
import com.lawtan.service.MilkProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MilkProductionServiceImpl implements MilkProductionService {

    private final MilkProductionRepository milkProductionRepository;
    private final AnimalRepository animalRepository;
    private final com.lawtan.repository.TransformationBatchRepository transformationBatchRepository;
    private final MilkStockAllocationRepository milkStockAllocationRepository;
    private final MilkPricingRepository milkPricingRepository;
    private final com.lawtan.repository.HealthRecordRepository healthRecordRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MilkProductionDTO> getAllMilkProductions() {
        return milkProductionRepository.findAllByOrderByProductionDateDescIdDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilkProductionDTO> getProductionsByDate(LocalDate date) {
        return milkProductionRepository.findByProductionDateOrderBySessionAsc(date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilkProductionDTO> getProductionsByAnimal(Long animalId) {
        return milkProductionRepository.findByAnimalIdOrderByProductionDateDesc(animalId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MilkProductionDTO recordMilkProduction(MilkProductionDTO dto) {
        if (dto.getAnimalInternalId() == null || dto.getAnimalInternalId().trim().isEmpty()) {
            throw new com.lawtan.exception.BusinessException("Le matricule de l'animal est obligatoire pour enregistrer une traite.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        Animal animal = animalRepository.findByInternalId(dto.getAnimalInternalId().trim())
                .orElseThrow(() -> new com.lawtan.exception.BusinessException("Animal non trouvé: " + dto.getAnimalInternalId(), org.springframework.http.HttpStatus.NOT_FOUND));

        // 1. Contrôle statut vivant
        if (animal.getStatus() == AnimalStatus.MORT || animal.getStatus() == AnimalStatus.MORT_NE || animal.getStatus() == AnimalStatus.VENDU) {
            throw new com.lawtan.exception.BusinessException(
                    "Impossible d'enregistrer une traite pour l'animal " + animal.getInternalId() + " (statut: " + animal.getStatus().getLabel() + ").",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }

        // 2. Contrôle de sexe
        boolean isMale = "MALE".equalsIgnoreCase(animal.getGender()) 
                || animal.getCategory() == com.lawtan.model.AnimalCategory.MALE_BULL 
                || animal.getCategory() == com.lawtan.model.AnimalCategory.TAUREAU 
                || animal.getCategory() == com.lawtan.model.AnimalCategory.JEUNE_MALE;
        if (isMale) {
            throw new com.lawtan.exception.BusinessException(
                    "Incohérence biologique : l'animal " + animal.getInternalId() + " est un mâle (" + animal.getGender() + ") et ne peut pas être trait.",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }

        // 3. Contrôle des dates
        LocalDate prodDate = dto.getProductionDate() != null ? dto.getProductionDate() : LocalDate.now();
        if (prodDate.isAfter(LocalDate.now())) {
            throw new com.lawtan.exception.BusinessException("La date de production (" + prodDate + ") ne peut pas être dans le futur.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        // 4. Contrôle du volume
        Double volume = dto.getVolumeLiters();
        if (volume == null || volume <= 0) {
            throw new com.lawtan.exception.BusinessException("Le volume de lait trait doit être strictement supérieur à 0 L.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        if (volume > 45.0) {
            throw new com.lawtan.exception.BusinessException("Volume de traite anormalement élevé (" + volume + " L sur une seule traite). Veuillez vérifier votre saisie.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        // 5. Contrôle d'unicité de la session journalière (Animal + Date + Session)
        MilkSession session = dto.getSession() != null ? dto.getSession() : MilkSession.MORNING;
        if (milkProductionRepository.existsByAnimalIdAndProductionDateAndSession(animal.getId(), prodDate, session)) {
            String sessLabel = session == MilkSession.MORNING ? "du matin" : "du soir";
            throw new com.lawtan.exception.BusinessException(
                    "La traite " + sessLabel + " du " + prodDate + " a déjà été enregistrée pour " + animal.getName() + " (" + animal.getInternalId() + ").",
                    org.springframework.http.HttpStatus.CONFLICT
            );
        }

        // 6. Détection automatique du délai de retrait antibiotique / sanitaire
        List<com.lawtan.entity.HealthRecord> treatments = healthRecordRepository.findTreatmentsWithWithdrawal(animal.getId());
        boolean isUnderWithdrawal = false;
        String withdrawalReason = null;
        for (com.lawtan.entity.HealthRecord hr : treatments) {
            if (hr.getRecordDate() != null && hr.getMilkWithdrawalDays() != null && hr.getMilkWithdrawalDays() > 0) {
                LocalDate endWithdrawal = hr.getRecordDate().plusDays(hr.getMilkWithdrawalDays());
                if (!prodDate.isBefore(hr.getRecordDate()) && !prodDate.isAfter(endWithdrawal)) {
                    isUnderWithdrawal = true;
                    long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(prodDate, endWithdrawal);
                    withdrawalReason = hr.getDiagnosis() + " (" + hr.getTreatmentPrescription() + ") - encore " + daysLeft + " jour(s) de retrait";
                    break;
                }
            }
        }

        boolean isUnderTreatment = (animal.getStatus() == AnimalStatus.FEVER_TREATMENT) || isUnderWithdrawal;
        boolean isCompliant = !isUnderTreatment && (dto.getIsOrganicCompliant() != null ? dto.getIsOrganicCompliant() : true);
        
        // Si sous traitement ou délai d'attente, verrouiller sur la cuve d'isolement
        String destinationTank;
        if (!isCompliant || isUnderTreatment) {
            destinationTank = "Cuve d'Isolement / Lait Écarté (Sous traitement)";
            isCompliant = false;
        } else {
            destinationTank = dto.getDestinationTank() != null ? dto.getDestinationTank() : "Cuve Réfrigérée N°1 (Bio)";
        }

        MilkProduction prod = MilkProduction.builder()
                .animal(animal)
                .productionDate(prodDate)
                .session(session)
                .volumeLiters(volume)
                .milkTemperature(dto.getMilkTemperature() != null ? dto.getMilkTemperature() : 34.2)
                .fatPercentage(dto.getFatPercentage() != null ? dto.getFatPercentage() : 4.1)
                .destinationTank(destinationTank)
                .isOrganicCompliant(isCompliant)
                .build();

        // Mettre à jour les statistiques de lactation de l'animal
        if (animal.getTotalLactationMilk() == null) animal.setTotalLactationMilk(0.0);
        animal.setTotalLactationMilk(animal.getTotalLactationMilk() + volume);
        animal.setDailyMilkYield(volume);
        
        if (animal.getDaysInMilk() == null || animal.getDaysInMilk() == 0) {
            animal.setDaysInMilk(1);
        }
        animalRepository.save(animal);

        MilkProduction saved = milkProductionRepository.save(prod);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TankStatusDTO getTankStatus() {
        LocalDate today = LocalDate.now();
        List<MilkProduction> todayProds = milkProductionRepository.findByProductionDateOrderBySessionAsc(today);

        double morningVol = todayProds.stream()
                .filter(p -> p.getSession() == MilkSession.MORNING && Boolean.TRUE.equals(p.getIsOrganicCompliant()))
                .mapToDouble(MilkProduction::getVolumeLiters)
                .sum();

        double eveningVol = todayProds.stream()
                .filter(p -> p.getSession() == MilkSession.EVENING && Boolean.TRUE.equals(p.getIsOrganicCompliant()))
                .mapToDouble(MilkProduction::getVolumeLiters)
                .sum();

        double grossTotalVol = morningVol + eveningVol;
        Double consumedToday = transformationBatchRepository.sumMilkConsumedByDate(today);
        if (consumedToday == null) consumedToday = 0.0;

        // Contenu reel de la cuve : lait non ventile + soldes vente et transformation,
        // reports des jours precedents inclus.
        double totalCollectedAll = milkProductionRepository.sumTotalVolumeCollected() != null
                ? milkProductionRepository.sumTotalVolumeCollected() : 0.0;
        double directAllocatedAll = milkStockAllocationRepository.sumDirectSaleAllocated() != null
                ? milkStockAllocationRepository.sumDirectSaleAllocated() : 0.0;
        double prodAllocatedAll = milkStockAllocationRepository.sumProductionAllocated() != null
                ? milkStockAllocationRepository.sumProductionAllocated() : 0.0;
        double calvesAllocatedAll = milkStockAllocationRepository.sumCalvesAllocated() != null
                ? milkStockAllocationRepository.sumCalvesAllocated() : 0.0;
        double directConsumedAll = milkStockAllocationRepository.sumDirectSaleConsumed() != null
                ? milkStockAllocationRepository.sumDirectSaleConsumed() : 0.0;
        Double prodConsumedAllRaw = transformationBatchRepository.sumTotalMilkConsumed();
        double prodConsumedAll = prodConsumedAllRaw != null ? prodConsumedAllRaw : 0.0;

        double unallocatedAll = Math.max(0.0,
                totalCollectedAll - (directAllocatedAll + prodAllocatedAll + calvesAllocatedAll));
        double netAvailableVol = Math.max(0.0, unallocatedAll
                + Math.max(0.0, directAllocatedAll - directConsumedAll)
                + Math.max(0.0, prodAllocatedAll - prodConsumedAll));

        // Temperature moyenne reellement relevee a la traite du jour (null si aucune saisie)
        Double avgTemperature = todayProds.stream()
                .map(MilkProduction::getMilkTemperature)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.averagingDouble(Double::doubleValue));
        boolean hasTemperature = todayProds.stream().anyMatch(p -> p.getMilkTemperature() != null);
        avgTemperature = hasTemperature ? Math.round(avgTemperature * 10.0) / 10.0 : null;

        boolean allOrganic = !todayProds.isEmpty()
                && todayProds.stream().allMatch(p -> Boolean.TRUE.equals(p.getIsOrganicCompliant()));
        String qualityLabel = todayProds.isEmpty()
                ? "EN ATTENTE COLLECTE"
                : (allOrganic ? "COLLECTE CONFORME BIO" : "CONFORMITE BIO A VERIFIER");
        double maxCap = 500.0; // Cuve Principale 500L
        double fillPercent = Math.min(100.0, (netAvailableVol / maxCap) * 100.0);

        return TankStatusDTO.builder()
                .tankName("Cuve Réfrigérée N°1 (Bio)")
                .currentVolume(Math.round(netAvailableVol * 10.0) / 10.0)
                .grossVolumeCollected(Math.round(grossTotalVol * 10.0) / 10.0)
                .transformedVolume(Math.round(consumedToday * 10.0) / 10.0)
                .maxCapacity(maxCap)
                .fillPercentage(Math.round(fillPercent * 10.0) / 10.0)
                .temperature(avgTemperature)   // Moyenne reelle des temperatures relevees a la traite
                .phLevel(null)                 // Aucun pH-metre raccorde : valeur non mesuree
                .qualityStatus(qualityLabel)
                .targetBatch("LOT-TR-" + today.toString().replace("-", "") + "-01")
                .morningVolume(Math.round(morningVol * 10.0) / 10.0)
                .eveningVolume(Math.round(eveningVol * 10.0) / 10.0)
                .collectionDate(today)
                // Ventilation embarquee : le client obtient l'etat complet en un appel
                .stockAllocation(getStockAllocation(today))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilkHistoryDTO> getMilkHistory(int days) {
        List<MilkHistoryDTO> history = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            List<MilkProduction> prods = milkProductionRepository.findByProductionDateOrderBySessionAsc(d);

            double mVol = prods.stream().filter(p -> p.getSession() == MilkSession.MORNING).mapToDouble(MilkProduction::getVolumeLiters).sum();
            double eVol = prods.stream().filter(p -> p.getSession() == MilkSession.EVENING).mapToDouble(MilkProduction::getVolumeLiters).sum();
            double tot = mVol + eVol;

            history.add(MilkHistoryDTO.builder()
                    .date(d)
                    .morningVolume(Math.round(mVol * 10.0) / 10.0)
                    .eveningVolume(Math.round(eVol * 10.0) / 10.0)
                    .totalVolume(Math.round(tot * 10.0) / 10.0)
                    .avgTemperature(tot > 0 ? 34.2 : 0.0)
                    .cowsMilkedCount((int) prods.stream().map(p -> p.getAnimal().getId()).distinct().count())
                    .build());
        }

        return history;
    }

    private MilkProductionDTO mapToDTO(MilkProduction m) {
        return MilkProductionDTO.builder()
                .id(m.getId())
                .animalId(m.getAnimal() != null ? m.getAnimal().getId() : null)
                .animalInternalId(m.getAnimal() != null ? m.getAnimal().getInternalId() : null)
                .animalName(m.getAnimal() != null ? m.getAnimal().getName() : null)
                .animalBreed(m.getAnimal() != null ? m.getAnimal().getBreed() : null)
                .productionDate(m.getProductionDate())
                .session(m.getSession())
                .sessionLabel(m.getSession() != null ? m.getSession().getLabel() : null)
                .volumeLiters(m.getVolumeLiters())
                .milkTemperature(m.getMilkTemperature())
                .fatPercentage(m.getFatPercentage())
                .destinationTank(m.getDestinationTank())
                .isOrganicCompliant(m.getIsOrganicCompliant())
                .build();
    }

    // ==========================================================
    // Ventilation journaliere du lait collecte
    // ==========================================================

    @Override
    @Transactional(readOnly = true)
    public MilkStockAllocationDTO getStockAllocation(LocalDate date) {
        LocalDate day = date != null ? date : LocalDate.now();
        MilkStockAllocation stored = milkStockAllocationRepository.findByAllocationDate(day).orElse(null);
        return buildAllocationDTO(day, stored);
    }

    @Override
    @Transactional
    public MilkStockAllocationDTO saveStockAllocation(MilkStockAllocationDTO dto) {
        LocalDate day = (dto != null && dto.getAllocationDate() != null && !dto.getAllocationDate().isBlank())
                ? LocalDate.parse(dto.getAllocationDate())
                : LocalDate.now();

        MilkStockAllocation entity = milkStockAllocationRepository.findByAllocationDate(day)
                .orElseGet(() -> MilkStockAllocation.builder().allocationDate(day).build());

        double newDirect = nz(dto != null ? dto.getDirectSaleVolume() : null);
        double newProd = nz(dto != null ? dto.getProductionVolume() : null);
        double newCalves = nz(dto != null ? dto.getCalvesVolume() : null);

        // Le pot commun ventilable : le lait jamais reparti, plus ce que cette meme
        // journee avait deja reparti puisque cette saisie le remplace.
        double totalCollected = nz(milkProductionRepository.sumTotalVolumeCollected());
        double alreadyAllocated = nz(milkStockAllocationRepository.sumDirectSaleAllocated())
                + nz(milkStockAllocationRepository.sumProductionAllocated())
                + nz(milkStockAllocationRepository.sumCalvesAllocated());
        double previousForDay = nz(entity.getDirectSaleVolume())
                + nz(entity.getProductionVolume())
                + nz(entity.getCalvesVolume());
        double ventilable = round(totalCollected - alreadyAllocated + previousForDay);
        double requested = round(newDirect + newProd + newCalves);

        if (requested > ventilable + 0.001) {
            throw new IllegalArgumentException(
                    "Ventilation impossible : " + requested + " L demandes pour seulement "
                            + ventilable + " L de lait disponible.");
        }

        entity.setDirectSaleVolume(newDirect);
        entity.setProductionVolume(newProd);
        entity.setCalvesVolume(newCalves);
        if (dto != null && dto.getDirectSaleConsumed() != null) {
            entity.setDirectSaleConsumed(dto.getDirectSaleConsumed());
        }
        if (entity.getDirectSaleConsumed() == null) {
            entity.setDirectSaleConsumed(0.0);
        }
        entity.setNotes(dto != null ? dto.getNotes() : null);
        entity.setUpdatedAt(java.time.LocalDateTime.now());

        return buildAllocationDTO(day, milkStockAllocationRepository.save(entity));
    }

    @Override
    @Transactional
    public MilkStockAllocationDTO recordDirectSaleConsumption(LocalDate date, Double liters) {
        LocalDate day = date != null ? date : LocalDate.now();
        MilkStockAllocation entity = milkStockAllocationRepository.findByAllocationDate(day)
                .orElseGet(() -> MilkStockAllocation.builder().allocationDate(day).build());
        entity.setDirectSaleConsumed(round(nz(entity.getDirectSaleConsumed()) + nz(liters)));
        entity.setUpdatedAt(java.time.LocalDateTime.now());
        return buildAllocationDTO(day, milkStockAllocationRepository.save(entity));
    }

    /**
     * Assemble l'etat des stocks de lait.
     *
     * Les soldes sont cumules sur toute l'historique : le lait non ventile hier
     * est toujours en attente aujourd'hui, et le lait reserve a la vente ou a la
     * transformation reste en stock tant qu'il n'a pas ete reellement consomme.
     * Seules les valeurs "du jour" sont bornees a la journee, pour l'affichage de
     * la collecte et le pre-remplissage du formulaire de ventilation.
     */
    private MilkStockAllocationDTO buildAllocationDTO(LocalDate day, MilkStockAllocation stored) {
        // --- Journee en cours ---
        double collectedToday = round(
                milkProductionRepository.findByProductionDateOrderBySessionAsc(day).stream()
                        .mapToDouble(p -> p.getVolumeLiters() != null ? p.getVolumeLiters() : 0.0)
                        .sum());

        double directToday = stored != null ? nz(stored.getDirectSaleVolume()) : 0.0;
        double prodToday = stored != null ? nz(stored.getProductionVolume()) : 0.0;
        double calvesToday = stored != null ? nz(stored.getCalvesVolume()) : 0.0;

        // --- Cumuls depuis l'origine ---
        double totalCollected = round(nz(milkProductionRepository.sumTotalVolumeCollected()));

        double directAllocated = round(nz(milkStockAllocationRepository.sumDirectSaleAllocated()));
        double prodAllocated = round(nz(milkStockAllocationRepository.sumProductionAllocated()));
        double calvesAllocated = round(nz(milkStockAllocationRepository.sumCalvesAllocated()));
        double directConsumed = round(nz(milkStockAllocationRepository.sumDirectSaleConsumed()));

        // Le lait preleve par les ordres de fabrication est la verite : on le relit des lots
        double prodConsumed = round(nz(transformationBatchRepository.sumTotalMilkConsumed()));

        double directAvailable = round(Math.max(0.0, directAllocated - directConsumed));
        double prodAvailable = round(Math.max(0.0, prodAllocated - prodConsumed));
        double unallocated = round(Math.max(0.0,
                totalCollected - (directAllocated + prodAllocated + calvesAllocated)));

        // Lait physiquement encore en cuve : le lait des veaux est bu, il n'y est plus
        double milkInTank = round(unallocated + directAvailable + prodAvailable);

        return MilkStockAllocationDTO.builder()
                .allocationDate(day.toString())
                .collectedToday(collectedToday)
                .directSaleAllocatedToday(round(directToday))
                .productionAllocatedToday(round(prodToday))
                .calvesAllocatedToday(round(calvesToday))
                .grossVolumeCollected(totalCollected)
                .directSaleVolume(directAllocated)
                .directSaleConsumed(directConsumed)
                .directSaleAvailable(directAvailable)
                .productionVolume(prodAllocated)
                .productionConsumed(prodConsumed)
                .productionAvailable(prodAvailable)
                .calvesVolume(calvesAllocated)
                .unallocatedVolume(unallocated)
                .milkInTank(milkInTank)
                .notes(stored != null ? stored.getNotes() : null)
                .build();
    }

    private static double nz(Double v) {
        return v != null ? v : 0.0;
    }

    private static double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    // ==========================================================
    // Tarif du lait cru
    // ==========================================================

    @Override
    @Transactional(readOnly = true)
    public MilkPricingDTO getMilkPricing() {
        return milkPricingRepository.findTopByOrderByIdAsc()
                .map(this::toPricingDTO)
                .orElseGet(() -> MilkPricingDTO.builder().build());
    }

    @Override
    @Transactional
    public MilkPricingDTO updateMilkPricing(MilkPricingDTO dto) {
        Double price = dto != null ? dto.getDirectSalePricePerLiterFcfa() : null;
        if (price == null || price < 0) {
            throw new IllegalArgumentException("Le prix au litre doit etre un montant positif.");
        }

        MilkPricing entity = milkPricingRepository.findTopByOrderByIdAsc()
                .orElseGet(MilkPricing::new);
        entity.setDirectSalePricePerLiterFcfa(Math.round(price * 100.0) / 100.0);
        entity.setNotes(dto.getNotes());
        entity.setUpdatedBy(dto.getUpdatedBy());
        entity.setUpdatedAt(java.time.LocalDateTime.now());

        return toPricingDTO(milkPricingRepository.save(entity));
    }

    private MilkPricingDTO toPricingDTO(MilkPricing e) {
        return MilkPricingDTO.builder()
                .directSalePricePerLiterFcfa(e.getDirectSalePricePerLiterFcfa())
                .notes(e.getNotes())
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .updatedBy(e.getUpdatedBy())
                .build();
    }
}
