package com.lawtan.controller;

import com.lawtan.dto.AnimalActivityDTO;
import com.lawtan.dto.AnimalActivityRequest;
import com.lawtan.dto.AnimalActivitySummaryDTO;
import com.lawtan.service.AnimalActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Activité physique des animaux", description = "Relevés d'activité et alertes de santé / chaleurs")
public class AnimalActivityController {

    private final AnimalActivityService activityService;

    @PostMapping("/animals/{internalId}/activity")
    @Operation(summary = "Enregistrer (ou remplacer) le relevé d'activité d'un animal pour un jour")
    public ResponseEntity<AnimalActivityDTO> record(@PathVariable String internalId,
                                                    @Valid @RequestBody AnimalActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(activityService.record(internalId, request));
    }

    @GetMapping("/animals/{internalId}/activity")
    @Operation(summary = "Historique d'activité d'un animal (par défaut 30 jours)")
    public ResponseEntity<List<AnimalActivityDTO>> history(@PathVariable String internalId,
                                                           @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(activityService.getHistory(internalId, days));
    }

    @GetMapping("/animals/{internalId}/activity/summary")
    @Operation(summary = "Dernier relevé comparé à la moyenne récente, avec alerte éventuelle")
    public ResponseEntity<AnimalActivitySummaryDTO> summary(@PathVariable String internalId) {
        return ResponseEntity.ok(activityService.getSummary(internalId));
    }

    @GetMapping("/activity/alerts")
    @Operation(summary = "Animaux du troupeau présentant une variation d'activité anormale")
    public ResponseEntity<List<AnimalActivitySummaryDTO>> herdAlerts() {
        return ResponseEntity.ok(activityService.getHerdAlerts());
    }
}