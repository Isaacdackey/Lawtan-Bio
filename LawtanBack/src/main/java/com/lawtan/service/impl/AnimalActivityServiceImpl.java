package com.lawtan.service.impl;

import com.lawtan.dto.AnimalActivityDTO;
import com.lawtan.dto.AnimalActivityRequest;
import com.lawtan.dto.AnimalActivitySummaryDTO;
import com.lawtan.entity.Animal;
import com.lawtan.entity.AnimalActivityRecord;
import com.lawtan.exception.BusinessException;
import com.lawtan.model.AnimalStatus;
import com.lawtan.repository.AnimalActivityRecordRepository;
import com.lawtan.repository.AnimalRepository;
import com.lawtan.service.AnimalActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnimalActivityServiceImpl implements AnimalActivityService {

    /** Fenêtre (jours) servant de référence pour la moyenne « normale » de l'animal. */
    private static final int BASELINE_WINDOW_DAYS = 7;
    /** Nombre minimum de jours précédents pour que la comparaison soit fiable. */
    private static final int MIN_BASELINE_DAYS = 3;
    /** Baisse d'activité à partir de laquelle une alerte est levée (30 %). */
    private static final double DROP_ALERT_PERCENT = -30.0;
    /** Hausse d'activité évoquant des chaleurs (+50 %). */
    private static final double SURGE_ALERT_PERCENT = 50.0;

    private final AnimalActivityRecordRepository activityRepository;
    private final AnimalRepository animalRepository;

    @Override
    @Transactional
    public AnimalActivityDTO record(String animalInternalId, AnimalActivityRequest request) {
        Animal animal = findAnimal(animalInternalId);
        LocalDate date = request.recordDate() != null ? request.recordDate() : LocalDate.now();
        if (date.isAfter(LocalDate.now())) {
            throw new BusinessException("La date de relevé ne peut pas être dans le futur.");
        }
        if (request.stepsCount() == null && request.activeMinutes() == null
                && request.restingMinutes() == null && request.ruminationMinutes() == null) {
            throw new BusinessException("Renseignez au moins une mesure (pas, activité, repos ou rumination).");
        }
        if (animal.getStatus() == AnimalStatus.MORT || animal.getStatus() == AnimalStatus.MORT_NE) {
            throw new BusinessException("Impossible d'enregistrer une activité pour un animal décédé.");
        }

        // Un seul relevé par animal et par jour : un nouvel envoi remplace le précédent.
        AnimalActivityRecord record = activityRepository.findByAnimalIdAndRecordDate(animal.getId(), date)
                .orElseGet(() -> AnimalActivityRecord.builder().animal(animal).recordDate(date).build());
        record.setStepsCount(request.stepsCount());
        record.setActiveMinutes(request.activeMinutes());
        record.setRestingMinutes(request.restingMinutes());
        record.setRuminationMinutes(request.ruminationMinutes());
        record.setSource(request.source() != null ? request.source() : "MANUAL");
        record.setNotes(request.notes() == null || request.notes().isBlank() ? null : request.notes().trim());

        return toDTO(activityRepository.save(record), animal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnimalActivityDTO> getHistory(String animalInternalId, int days) {
        Animal animal = findAnimal(animalInternalId);
        int window = Math.min(Math.max(days, 1), 365);
        LocalDate today = LocalDate.now();
        return activityRepository
                .findByAnimalIdAndRecordDateBetweenOrderByRecordDateDesc(animal.getId(), today.minusDays(window - 1L), today)
                .stream().map(r -> toDTO(r, animal)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AnimalActivitySummaryDTO getSummary(String animalInternalId) {
        Animal animal = findAnimal(animalInternalId);
        LocalDate today = LocalDate.now();
        List<AnimalActivityRecord> records = activityRepository
                .findByAnimalIdAndRecordDateBetweenOrderByRecordDateDesc(
                        animal.getId(), today.minusDays(BASELINE_WINDOW_DAYS), today);
        return buildSummary(animal, records);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnimalActivitySummaryDTO> getHerdAlerts() {
        LocalDate today = LocalDate.now();
        // Une seule requête pour tout le troupeau, regroupée par animal en mémoire.
        Map<Long, List<AnimalActivityRecord>> byAnimal = activityRepository
                .findAllBetween(today.minusDays(BASELINE_WINDOW_DAYS), today).stream()
                .collect(Collectors.groupingBy(r -> r.getAnimal().getId()));

        List<AnimalActivitySummaryDTO> alerts = new ArrayList<>();
        for (List<AnimalActivityRecord> records : byAnimal.values()) {
            Animal animal = records.get(0).getAnimal();
            if (animal.getStatus() == AnimalStatus.MORT || animal.getStatus() == AnimalStatus.MORT_NE
                    || animal.getStatus() == AnimalStatus.VENDU) {
                continue;
            }
            AnimalActivitySummaryDTO summary = buildSummary(animal, records);
            if (!"NONE".equals(summary.alertType())) {
                alerts.add(summary);
            }
        }
        alerts.sort(Comparator.comparing(
                (AnimalActivitySummaryDTO s) -> s.variationPercent() == null ? 0.0 : Math.abs(s.variationPercent()))
                .reversed());
        return alerts;
    }

    // --- logique d'alerte ---

    /** records : relevés de la fenêtre, triés du plus récent au plus ancien. */
    private AnimalActivitySummaryDTO buildSummary(Animal animal, List<AnimalActivityRecord> records) {
        List<AnimalActivityRecord> withSteps = records.stream()
                .filter(r -> r.getStepsCount() != null)
                .sorted(Comparator.comparing(AnimalActivityRecord::getRecordDate).reversed())
                .toList();

        if (withSteps.isEmpty()) {
            return new AnimalActivitySummaryDTO(animal.getInternalId(), animal.getName(), null, null, null, null,
                    "NONE", "Aucun relevé d'activité enregistré.");
        }

        AnimalActivityRecord latest = withSteps.get(0);
        List<AnimalActivityRecord> previous = withSteps.subList(1, withSteps.size());

        if (previous.size() < MIN_BASELINE_DAYS) {
            return new AnimalActivitySummaryDTO(animal.getInternalId(), animal.getName(), latest.getRecordDate(),
                    latest.getStepsCount(), null, null, "NONE",
                    "Historique insuffisant (" + MIN_BASELINE_DAYS + " jours précédents minimum) pour comparer.");
        }

        double baseline = previous.stream().mapToInt(AnimalActivityRecord::getStepsCount).average().orElse(0);
        if (baseline <= 0) {
            return new AnimalActivitySummaryDTO(animal.getInternalId(), animal.getName(), latest.getRecordDate(),
                    latest.getStepsCount(), 0.0, null, "NONE", "Moyenne de référence nulle : comparaison impossible.");
        }

        double variation = (latest.getStepsCount() - baseline) / baseline * 100.0;
        String alertType = "NONE";
        String message = "Activité dans la normale.";
        if (variation <= DROP_ALERT_PERCENT) {
            alertType = "ACTIVITY_DROP";
            message = String.format(Locale.FRENCH,
                    "Baisse d'activité de %.0f %% par rapport à la moyenne récente : contrôler l'animal "
                            + "(boiterie, mammite, fièvre, trouble digestif).", Math.abs(variation));
        } else if (variation >= SURGE_ALERT_PERCENT) {
            alertType = "ACTIVITY_SURGE";
            message = String.format(Locale.FRENCH,
                    "Hausse d'activité de %.0f %% par rapport à la moyenne récente : chaleurs possibles, "
                            + "à vérifier pour la planification de l'insémination.", variation);
        }

        return new AnimalActivitySummaryDTO(animal.getInternalId(), animal.getName(), latest.getRecordDate(),
                latest.getStepsCount(), round1(baseline), round1(variation), alertType, message);
    }

    private Animal findAnimal(String internalId) {
        return animalRepository.findByInternalId(internalId)
                .orElseThrow(() -> new BusinessException("Animal introuvable : " + internalId, HttpStatus.NOT_FOUND));
    }

    private AnimalActivityDTO toDTO(AnimalActivityRecord r, Animal animal) {
        return new AnimalActivityDTO(r.getId(), animal.getInternalId(), animal.getName(), r.getRecordDate(),
                r.getStepsCount(), r.getActiveMinutes(), r.getRestingMinutes(), r.getRuminationMinutes(),
                r.getSource(), r.getNotes());
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}