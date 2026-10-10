package com.lawtan.service.impl;

import com.lawtan.dto.ReproductionAlertDTO;
import com.lawtan.dto.ReproductionEventDTO;
import com.lawtan.entity.Animal;
import com.lawtan.entity.ReproductionEvent;
import com.lawtan.model.AnimalCategory;
import com.lawtan.model.AnimalStatus;
import com.lawtan.model.ReproEventType;
import com.lawtan.repository.AnimalRepository;
import com.lawtan.repository.ReproductionEventRepository;
import com.lawtan.service.ReproductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReproductionServiceImpl implements ReproductionService {

    private final ReproductionEventRepository reproductionEventRepository;
    private final AnimalRepository animalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReproductionEventDTO> getAllEvents() {
        return reproductionEventRepository.findAllByOrderByEventDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReproductionEventDTO> getEventsByAnimal(Long animalId) {
        return reproductionEventRepository.findByAnimalIdOrderByEventDateDesc(animalId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReproductionEventDTO recordEvent(ReproductionEventDTO dto) {
        Animal animal;
        if (dto.getAnimalId() != null) {
            animal = animalRepository.findById(dto.getAnimalId())
                    .orElseThrow(() -> new RuntimeException("Animal non trouvé avec ID: " + dto.getAnimalId()));
        } else if (dto.getAnimalInternalId() != null) {
            animal = animalRepository.findByInternalId(dto.getAnimalInternalId())
                    .orElseThrow(() -> new RuntimeException("Animal non trouvé avec matricule: " + dto.getAnimalInternalId()));
        } else {
            throw new IllegalArgumentException("Identifiant animal requis.");
        }

        LocalDate eventDate = dto.getEventDate() != null ? dto.getEventDate() : LocalDate.now();
        if (eventDate.isAfter(LocalDate.now())) {
            throw new com.lawtan.exception.BusinessException("La date de l'acte de reproduction (" + eventDate + ") ne peut pas être dans le futur.");
        }

        // 1. Contrôle statut vivant
        if (animal.getStatus() == AnimalStatus.MORT || animal.getStatus() == AnimalStatus.MORT_NE || animal.getStatus() == AnimalStatus.VENDU) {
            throw new com.lawtan.exception.BusinessException(
                    "Impossible d'enregistrer un acte de reproduction sur un animal inactif (" + animal.getStatus().getLabel() + ").",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }

        // 2. Contrôle de sexe
        boolean isMale = "MALE".equalsIgnoreCase(animal.getGender()) 
                || animal.getCategory() == AnimalCategory.MALE_BULL 
                || animal.getCategory() == AnimalCategory.TAUREAU 
                || animal.getCategory() == AnimalCategory.JEUNE_MALE;

        if (isMale && (dto.getEventType() == ReproEventType.ARTIFICIAL_INSEMINATION 
                || dto.getEventType() == ReproEventType.NATURAL_MATING 
                || dto.getEventType() == ReproEventType.INSEMINATION
                || dto.getEventType() == ReproEventType.PREGNANCY_DIAGNOSIS 
                || dto.getEventType() == ReproEventType.PREG_CHECK
                || dto.getEventType() == ReproEventType.CALVING 
                || dto.getEventType() == ReproEventType.DRY_OFF)) {
            throw new com.lawtan.exception.BusinessException(
                    "Incohérence biologique : l'animal " + animal.getInternalId() + " est un mâle (" + animal.getGender() + ") et ne peut pas être inséminé, diagnostiqué gestant ou vêler.",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }

        // 3. Maturité sexuelle à l'insémination (min 12 mois)
        if ((dto.getEventType() == ReproEventType.ARTIFICIAL_INSEMINATION 
                || dto.getEventType() == ReproEventType.NATURAL_MATING 
                || dto.getEventType() == ReproEventType.INSEMINATION) && animal.getBirthDate() != null) {
            long months = ChronoUnit.MONTHS.between(animal.getBirthDate(), eventDate);
            if (months < 12) {
                throw new com.lawtan.exception.BusinessException(
                        "L'animal n'a pas encore atteint l'âge minimal pour la reproduction (" + months + " mois observés, 12 mois minimum requis).",
                        org.springframework.http.HttpStatus.BAD_REQUEST
                );
            }
        }

        // 4. Intervalle minimal entre deux vêlages (min 270 jours)
        if (dto.getEventType() == ReproEventType.CALVING) {
            List<ReproductionEvent> pastEvents = reproductionEventRepository.findByAnimalIdOrderByEventDateDesc(animal.getId());
            Optional<ReproductionEvent> lastCalving = pastEvents.stream()
                    .filter(e -> e.getEventType() == ReproEventType.CALVING && e.getEventDate() != null && !e.getEventDate().isAfter(eventDate))
                    .findFirst();
            if (lastCalving.isPresent()) {
                long days = ChronoUnit.DAYS.between(lastCalving.get().getEventDate(), eventDate);
                if (days < 270) {
                    throw new com.lawtan.exception.BusinessException(
                            "Incohérence biologique : l'intervalle entre deux vêlages est de " + days + " jours (minimum biologique requis : 270 jours / ~9 mois).",
                            org.springframework.http.HttpStatus.BAD_REQUEST
                    );
                }
            }
        }

        LocalDate expectedCalving = dto.getExpectedCalvingDate();
        LocalDate expectedDryOff = dto.getExpectedDryOffDate();

        // Calculs automatiques selon le type d'acte (Standards CowMaster)
        if (dto.getEventType() == ReproEventType.ARTIFICIAL_INSEMINATION 
                || dto.getEventType() == ReproEventType.NATURAL_MATING 
                || dto.getEventType() == ReproEventType.INSEMINATION) {
            if (expectedCalving == null) {
                expectedCalving = eventDate.plusDays(282); // Gestation moyenne bovine (282j standard CowMaster)
            }
            if (expectedDryOff == null) {
                expectedDryOff = expectedCalving.minusDays(60); // Tarissement J-60 avant vêlage
            }
            animal.setLastInseminationDate(eventDate);
            animal.setExpectedCalvingDate(expectedCalving);
            animal.setExpectedDryOffDate(expectedDryOff);
            animal.setReproStatusDetailed("Inséminée le " + eventDate + " (Contrôle DG J+45/50)");
            animal.setReproStatus("Inséminée le " + eventDate + " (" + (dto.getBullOrSemenUsed() != null ? dto.getBullOrSemenUsed() : "Semence") + ")");
        } else if (dto.getEventType() == ReproEventType.PREGNANCY_DIAGNOSIS || dto.getEventType() == ReproEventType.PREG_CHECK) {
            boolean isPositive = dto.getIsConfirmed() != null && dto.getIsConfirmed();
            if (isPositive) {
                animal.setStatus(AnimalStatus.PREGNANT);
                animal.setReproStatusDetailed("Gestante confirmée — Vêlage prévu: " + (expectedCalving != null ? expectedCalving : "en cours"));
                animal.setReproStatus("Gestation confirmée — Vêlage prévu: " + (expectedCalving != null ? expectedCalving : "en cours"));
                animal.setCullingRecommended(false);
            } else {
                animal.setStatus(AnimalStatus.HEALTHY);
                animal.setReproStatusDetailed("Diagnostic négatif (Non gestante)");
                animal.setReproStatus("Non gestante (Vide)");
                if (animal.getDaysOpen() != null && animal.getDaysOpen() >= 250) {
                    animal.setCullingRecommended(true);
                    animal.setCowMasterAlert("Réforme recommandée (" + animal.getDaysOpen() + " j ouverts)");
                }
            }
        } else if (dto.getEventType() == ReproEventType.DRY_OFF) {
            animal.setLactationStatus("Tarie");
            animal.setReproStatus("Tarie — Repos pré-vêlage");
            animal.setReproStatusDetailed("Tarie");
        } else if (dto.getEventType() == ReproEventType.CALVING) {
            animal.setStatus(AnimalStatus.EXCELLENT);
            animal.setCategory(AnimalCategory.VACHE);
            animal.setLactationStatus("En lactation");
            animal.setLactationNumber((animal.getLactationNumber() != null ? animal.getLactationNumber() : 0) + 1);
            animal.setDaysInMilk(0);
            animal.setDaysOpen(0);
            animal.setCullingRecommended(false);
            animal.setExpectedCalvingDate(null);
            animal.setExpectedDryOffDate(null);
            animal.setReproStatus("Vêlage réussi le " + eventDate + " — Nouvelle lactation (" + animal.getLactationNumber() + "e)");
            animal.setReproStatusDetailed("En lactation (" + animal.getLactationNumber() + "e)");
        } else if (dto.getEventType() == ReproEventType.HEAT_DETECTION) {
            animal.setStatus(AnimalStatus.IN_HEAT);
            animal.setReproStatus("Chaleurs observées le " + eventDate + " — IA recommandée sous 12-18h");
            animal.setReproStatusDetailed("Chaleurs actives");
        } else if (dto.getEventType() == ReproEventType.ILLNESS_TREATMENT) {
            animal.setStatus(AnimalStatus.FEVER_TREATMENT);
            animal.setReproStatusDetailed("Traitement: " + (dto.getPathology() != null ? dto.getPathology() : "Clinique"));
        }

        animalRepository.save(animal);

        ReproductionEvent event = ReproductionEvent.builder()
                .animal(animal)
                .eventType(dto.getEventType())
                .eventDate(eventDate)
                .eventTime(dto.getEventTime())
                .cowMasterTypeOriginal(dto.getCowMasterTypeOriginal())
                .bullOrSemenUsed(dto.getBullOrSemenUsed())
                .method(dto.getMethod())
                .result(dto.getResult())
                .pathology(dto.getPathology())
                .treatment(dto.getTreatment())
                .operatorName(dto.getOperatorName() != null ? dto.getOperatorName() : "Dr. Fall")
                .expectedDryOffDate(expectedDryOff)
                .expectedCalvingDate(expectedCalving)
                .observations(dto.getObservations())
                .isConfirmed(dto.getIsConfirmed() != null ? dto.getIsConfirmed() : true)
                .build();

        ReproductionEvent saved = reproductionEventRepository.save(event);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public ReproductionEventDTO updateEvent(Long id, ReproductionEventDTO dto) {
        ReproductionEvent event = reproductionEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement reproduction non trouvé: " + id));

        if (dto.getEventType() != null) event.setEventType(dto.getEventType());
        if (dto.getEventDate() != null) event.setEventDate(dto.getEventDate());
        if (dto.getEventTime() != null) event.setEventTime(dto.getEventTime());
        if (dto.getCowMasterTypeOriginal() != null) event.setCowMasterTypeOriginal(dto.getCowMasterTypeOriginal());
        if (dto.getBullOrSemenUsed() != null) event.setBullOrSemenUsed(dto.getBullOrSemenUsed());
        if (dto.getMethod() != null) event.setMethod(dto.getMethod());
        if (dto.getResult() != null) event.setResult(dto.getResult());
        if (dto.getPathology() != null) event.setPathology(dto.getPathology());
        if (dto.getTreatment() != null) event.setTreatment(dto.getTreatment());
        if (dto.getOperatorName() != null) event.setOperatorName(dto.getOperatorName());
        if (dto.getExpectedDryOffDate() != null) event.setExpectedDryOffDate(dto.getExpectedDryOffDate());
        if (dto.getExpectedCalvingDate() != null) event.setExpectedCalvingDate(dto.getExpectedCalvingDate());
        if (dto.getObservations() != null) event.setObservations(dto.getObservations());
        if (dto.getIsConfirmed() != null) event.setIsConfirmed(dto.getIsConfirmed());

        ReproductionEvent updated = reproductionEventRepository.save(event);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        reproductionEventRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReproductionAlertDTO> getReproductionAlerts() {
        List<ReproductionAlertDTO> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        List<Animal> animals = animalRepository.findAll();

        for (Animal a : animals) {
            // Ignorer les animaux inactifs ou morts
            if (a.getStatus() == AnimalStatus.MORT || a.getStatus() == AnimalStatus.MORT_NE || a.getStatus() == AnimalStatus.VENDU) {
                continue;
            }

            // 1. Alerte Réforme Recommandée (Excessive Days Open ou Culling Flag)
            boolean isCulling = Boolean.TRUE.equals(a.getCullingRecommended()) 
                    || (a.getDaysOpen() != null && a.getDaysOpen() >= 200);
            if (isCulling) {
                int dOpen = a.getDaysOpen() != null ? a.getDaysOpen() : 417;
                String severity = dOpen >= 300 ? "DANGER" : "WARNING";
                alerts.add(ReproductionAlertDTO.builder()
                        .alertType("CULLING_ALERT")
                        .animalInternalId(a.getInternalId())
                        .animalName(a.getName())
                        .targetDate(today)
                        .daysRemaining(0L)
                        .daysOpen(dOpen)
                        .actionLabel("Bilan Fertilité / Réforme")
                        .message("Alerte Réforme CowMaster : " + a.getName() + " (" + a.getInternalId() + ") cumule " + dOpen + " jours ouverts sans fécondation (Seuil critique dépassé)")
                        .severity(severity)
                        .build());
            }

            List<ReproductionEvent> animalEvents = reproductionEventRepository.findByAnimalIdOrderByEventDateDesc(a.getId());
            if (animalEvents.isEmpty()) continue;

            // 2. Alerte Diagnostic de Gestation J+45 / J+50 post-IA
            Optional<ReproductionEvent> latestIAOpt = animalEvents.stream()
                    .filter(e -> (e.getEventType() == ReproEventType.ARTIFICIAL_INSEMINATION 
                               || e.getEventType() == ReproEventType.NATURAL_MATING 
                               || e.getEventType() == ReproEventType.INSEMINATION)
                               && e.getEventDate() != null)
                    .findFirst();

            if (latestIAOpt.isPresent()) {
                ReproductionEvent latestIA = latestIAOpt.get();
                LocalDate iaDate = latestIA.getEventDate();

                // Vérifier s'il y a eu un diagnostic ou vêlage postérieur
                boolean hasSubsequentDiag = animalEvents.stream()
                        .anyMatch(e -> (e.getEventType() == ReproEventType.PREGNANCY_DIAGNOSIS || e.getEventType() == ReproEventType.PREG_CHECK)
                                && e.getEventDate() != null && !e.getEventDate().isBefore(iaDate));
                boolean hasSubsequentCalving = animalEvents.stream()
                        .anyMatch(e -> e.getEventType() == ReproEventType.CALVING
                                && e.getEventDate() != null && !e.getEventDate().isBefore(iaDate));

                if (!hasSubsequentDiag && !hasSubsequentCalving) {
                    long daysSinceIA = ChronoUnit.DAYS.between(iaDate, today);
                    if (daysSinceIA >= 35 && daysSinceIA <= 150) {
                        LocalDate targetDgDate = iaDate.plusDays(45);
                        long daysRemaining = ChronoUnit.DAYS.between(today, targetDgDate);
                        String severity = daysSinceIA >= 45 ? "DANGER" : (daysSinceIA >= 40 ? "WARNING" : "INFO");
                        alerts.add(ReproductionAlertDTO.builder()
                                .alertType("PREG_CHECK")
                                .animalInternalId(a.getInternalId())
                                .animalName(a.getName())
                                .targetDate(targetDgDate)
                                .daysRemaining(Math.max(0L, daysRemaining))
                                .daysSinceIA(daysSinceIA)
                                .actionLabel("Confirmer Échographie DG")
                                .message("Contrôle gestation (DG) à confirmer pour " + a.getName() + " (" + a.getInternalId() + ") — IA du " + iaDate + " (J+" + daysSinceIA + " atteints, prévu à J+45)")
                                .severity(severity)
                                .build());
                    }
                }
            }

            boolean hasRecentCalving = animalEvents.stream()
                    .anyMatch(e -> e.getEventType() == ReproEventType.CALVING && e.getEventDate() != null && !e.getEventDate().isBefore(today.minusDays(60)));
            boolean hasRecentDryOff = animalEvents.stream()
                    .anyMatch(e -> e.getEventType() == ReproEventType.DRY_OFF && e.getEventDate() != null && !e.getEventDate().isBefore(today.minusDays(30)));
            boolean hasRecentIA = animalEvents.stream()
                    .anyMatch(e -> (e.getEventType() == ReproEventType.ARTIFICIAL_INSEMINATION || e.getEventType() == ReproEventType.NATURAL_MATING || e.getEventType() == ReproEventType.INSEMINATION) 
                            && e.getEventDate() != null && !e.getEventDate().isBefore(today.minusDays(7)));

            // 3. Alerte Vêlage Imminent
            LocalDate expectedCalving = a.getExpectedCalvingDate();
            if (expectedCalving == null) {
                expectedCalving = animalEvents.stream()
                        .map(ReproductionEvent::getExpectedCalvingDate)
                        .filter(d -> d != null && !d.isBefore(today.minusDays(10)))
                        .findFirst().orElse(null);
            }
            if (expectedCalving != null && !hasRecentCalving && (a.getStatus() == AnimalStatus.PREGNANT || a.getStatus() == AnimalStatus.HEALTHY || a.getStatus() == AnimalStatus.EXCELLENT)) {
                long daysToCalving = ChronoUnit.DAYS.between(today, expectedCalving);
                if (daysToCalving >= -5 && daysToCalving <= 30) {
                    String severity = daysToCalving <= 7 ? "DANGER" : (daysToCalving <= 15 ? "WARNING" : "INFO");
                    alerts.add(ReproductionAlertDTO.builder()
                            .alertType("CALVING_IMMINENT")
                            .animalInternalId(a.getInternalId())
                            .animalName(a.getName())
                            .targetDate(expectedCalving)
                            .daysRemaining(daysToCalving)
                            .actionLabel("Préparer Box Vêlage")
                            .message("Vêlage prévu pour " + a.getName() + " (" + a.getInternalId() + ") dans " + daysToCalving + " jours (" + expectedCalving + ")")
                            .severity(severity)
                            .build());
                }
            }

            // 4. Alerte Tarissement à effectuer
            LocalDate expectedDryOff = a.getExpectedDryOffDate();
            if (expectedDryOff == null) {
                expectedDryOff = animalEvents.stream()
                        .map(ReproductionEvent::getExpectedDryOffDate)
                        .filter(d -> d != null && !d.isBefore(today.minusDays(10)))
                        .findFirst().orElse(null);
            }
            if (expectedDryOff != null && !hasRecentDryOff && !hasRecentCalving && !"Tarie".equalsIgnoreCase(a.getLactationStatus())) {
                long daysToDryOff = ChronoUnit.DAYS.between(today, expectedDryOff);
                if (daysToDryOff >= -5 && daysToDryOff <= 20) {
                    String severity = daysToDryOff <= 5 ? "WARNING" : "INFO";
                    alerts.add(ReproductionAlertDTO.builder()
                            .alertType("DRY_OFF_DUE")
                            .animalInternalId(a.getInternalId())
                            .animalName(a.getName())
                            .targetDate(expectedDryOff)
                            .daysRemaining(daysToDryOff)
                            .actionLabel("Isoler & Tarir")
                            .message("Tarissement à programmer pour " + a.getName() + " (" + a.getInternalId() + ") — J-" + daysToDryOff + " avant repos")
                            .severity(severity)
                            .build());
                }
            }

            // 5. Alerte Chaleurs pour animaux IN_HEAT
            if (a.getStatus() == AnimalStatus.IN_HEAT && !hasRecentIA) {
                alerts.add(ReproductionAlertDTO.builder()
                        .alertType("HEAT_ACTIVE")
                        .animalInternalId(a.getInternalId())
                        .animalName(a.getName())
                        .targetDate(today)
                        .daysRemaining(0L)
                        .actionLabel("Inséminer")
                        .message("Chaleurs actives pour " + a.getName() + " (" + a.getInternalId() + ") — IA recommandée aujourd'hui")
                        .severity("DANGER")
                        .build());
            }
        }

        return alerts;
    }

    @Override
    @Transactional
    public void recalculateReproMetrics() {
        LocalDate today = LocalDate.now();
        List<Animal> animals = animalRepository.findAll();

        for (Animal a : animals) {
            if (a.getStatus() == AnimalStatus.MORT || a.getStatus() == AnimalStatus.MORT_NE) {
                a.setLactationStatus("Inactif");
                continue;
            }

            List<ReproductionEvent> events = reproductionEventRepository.findByAnimalIdOrderByEventDateDesc(a.getId());

            // Recherche du dernier vêlage
            Optional<ReproductionEvent> latestCalving = events.stream()
                    .filter(e -> e.getEventType() == ReproEventType.CALVING && e.getEventDate() != null)
                    .findFirst();

            if (latestCalving.isPresent()) {
                LocalDate calvingDate = latestCalving.get().getEventDate();

                // Vérifier si gestation confirmée après ce vêlage
                boolean isPregnantAfterCalving = events.stream()
                        .anyMatch(e -> (e.getEventType() == ReproEventType.PREGNANCY_DIAGNOSIS || e.getEventType() == ReproEventType.PREG_CHECK)
                                && Boolean.TRUE.equals(e.getIsConfirmed())
                                && e.getEventDate() != null && !e.getEventDate().isBefore(calvingDate));

                if (isPregnantAfterCalving) {
                    a.setStatus(AnimalStatus.PREGNANT);
                    a.setCullingRecommended(false);
                    a.setReproStatusDetailed("Gestante confirmée");
                } else {
                    long doCount = ChronoUnit.DAYS.between(calvingDate, today);
                    a.setDaysOpen((int) doCount);
                    if (doCount >= 250) {
                        a.setCullingRecommended(true);
                        a.setCowMasterAlert("Réforme recommandée (" + doCount + " j ouverts)");
                        a.setReproStatusDetailed("Réforme recommandée (" + doCount + " j ouverts)");
                    } else {
                        a.setReproStatusDetailed("Jours ouverts : " + doCount + "j");
                    }
                }
            }

            // Statut de lactation
            if (a.getDailyMilkYield() != null && a.getDailyMilkYield() > 0) {
                a.setLactationStatus("En lactation");
            } else if (events.stream().anyMatch(e -> e.getEventType() == ReproEventType.DRY_OFF && !e.getEventDate().isBefore(today.minusDays(90)))) {
                a.setLactationStatus("Tarie");
            }

            animalRepository.save(a);
        }
    }

    private ReproductionEventDTO mapToDTO(ReproductionEvent e) {
        return ReproductionEventDTO.builder()
                .id(e.getId())
                .animalId(e.getAnimal() != null ? e.getAnimal().getId() : null)
                .animalInternalId(e.getAnimal() != null ? e.getAnimal().getInternalId() : null)
                .animalName(e.getAnimal() != null ? e.getAnimal().getName() : null)
                .eventType(e.getEventType())
                .eventTypeLabel(e.getEventType() != null ? e.getEventType().getLabel() : null)
                .eventDate(e.getEventDate())
                .eventTime(e.getEventTime())
                .cowMasterTypeOriginal(e.getCowMasterTypeOriginal())
                .bullOrSemenUsed(e.getBullOrSemenUsed())
                .method(e.getMethod())
                .result(e.getResult())
                .pathology(e.getPathology())
                .treatment(e.getTreatment())
                .operatorName(e.getOperatorName())
                .expectedDryOffDate(e.getExpectedDryOffDate())
                .expectedCalvingDate(e.getExpectedCalvingDate())
                .observations(e.getObservations())
                .isConfirmed(e.getIsConfirmed())
                .build();
    }
}
