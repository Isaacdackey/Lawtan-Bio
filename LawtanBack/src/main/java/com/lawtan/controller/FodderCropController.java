package com.lawtan.controller;

import com.lawtan.dto.FodderCropDTO;
import com.lawtan.dto.FodderCropRequestDTO;
import com.lawtan.dto.FodderHarvestRequest;
import com.lawtan.dto.FodderSummaryDTO;
import com.lawtan.service.FodderCropService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fodder-crops")
@RequiredArgsConstructor
@Tag(name = "Cultures fourragères", description = "Parcelles, campagnes, récoltes et coût de production du fourrage")
public class FodderCropController {

    private final FodderCropService fodderCropService;

    @GetMapping
    @Operation(summary = "Lister les cultures fourragères")
    public ResponseEntity<List<FodderCropDTO>> getAll() {
        return ResponseEntity.ok(fodderCropService.getAllCrops());
    }

    @GetMapping("/summary")
    @Operation(summary = "Synthèse : surfaces, tonnage récolté, coût de production par kg")
    public ResponseEntity<FodderSummaryDTO> getSummary() {
        return ResponseEntity.ok(fodderCropService.getSummary());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une culture avec ses récoltes")
    public ResponseEntity<FodderCropDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(fodderCropService.getCrop(id));
    }

    @PostMapping
    @Operation(summary = "Enregistrer une nouvelle culture fourragère")
    public ResponseEntity<FodderCropDTO> create(@Valid @RequestBody FodderCropRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fodderCropService.createCrop(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une culture fourragère")
    public ResponseEntity<FodderCropDTO> update(@PathVariable Long id, @Valid @RequestBody FodderCropRequestDTO request) {
        return ResponseEntity.ok(fodderCropService.updateCrop(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une culture (et ses récoltes)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fodderCropService.deleteCrop(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/harvests")
    @Operation(summary = "Enregistrer une récolte")
    public ResponseEntity<FodderCropDTO> addHarvest(@PathVariable Long id, @Valid @RequestBody FodderHarvestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fodderCropService.addHarvest(id, request));
    }

    @DeleteMapping("/{id}/harvests/{harvestId}")
    @Operation(summary = "Supprimer une récolte saisie par erreur")
    public ResponseEntity<FodderCropDTO> deleteHarvest(@PathVariable Long id, @PathVariable Long harvestId) {
        return ResponseEntity.ok(fodderCropService.deleteHarvest(id, harvestId));
    }
}