package com.lawtan.controller;

import com.lawtan.dto.MilkHistoryDTO;
import com.lawtan.dto.MilkProductionDTO;
import com.lawtan.dto.MilkPricingDTO;
import com.lawtan.dto.MilkStockAllocationDTO;
import com.lawtan.dto.TankStatusDTO;
import com.lawtan.service.MilkProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/milk")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MilkProductionController {

    private final MilkProductionService milkProductionService;

    @GetMapping
    public ResponseEntity<List<MilkProductionDTO>> getAllMilkProductions() {
        return ResponseEntity.ok(milkProductionService.getAllMilkProductions());
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<MilkProductionDTO>> getProductionsByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(milkProductionService.getProductionsByDate(targetDate));
    }

    @GetMapping("/by-animal/{animalId}")
    public ResponseEntity<List<MilkProductionDTO>> getProductionsByAnimal(@PathVariable Long animalId) {
        return ResponseEntity.ok(milkProductionService.getProductionsByAnimal(animalId));
    }

    @PostMapping("/record")
    public ResponseEntity<MilkProductionDTO> recordMilkProduction(@RequestBody MilkProductionDTO dto) {
        return new ResponseEntity<>(milkProductionService.recordMilkProduction(dto), HttpStatus.CREATED);
    }

    @GetMapping("/tank-status")
    public ResponseEntity<TankStatusDTO> getTankStatus() {
        return ResponseEntity.ok(milkProductionService.getTankStatus());
    }

    @GetMapping("/history")
    public ResponseEntity<List<MilkHistoryDTO>> getMilkHistory(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(milkProductionService.getMilkHistory(days));
    }

    // --- Ventilation journaliere du lait collecte ---

    @GetMapping("/allocation")
    public ResponseEntity<MilkStockAllocationDTO> getStockAllocation(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(milkProductionService.getStockAllocation(date));
    }

    @PutMapping("/allocation")
    public ResponseEntity<?> saveStockAllocation(@RequestBody MilkStockAllocationDTO dto) {
        try {
            return ResponseEntity.ok(milkProductionService.saveStockAllocation(dto));
        } catch (IllegalArgumentException e) {
            // Ventilation superieure au lait reellement disponible : refus explicite
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/allocation/direct-sale-consumption")
    public ResponseEntity<MilkStockAllocationDTO> recordDirectSaleConsumption(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody Map<String, Double> payload) {
        return ResponseEntity.ok(
                milkProductionService.recordDirectSaleConsumption(date, payload.get("liters")));
    }

    // --- Tarif de vente du lait cru au litre ---

    @GetMapping("/price")
    public ResponseEntity<MilkPricingDTO> getMilkPricing() {
        return ResponseEntity.ok(milkProductionService.getMilkPricing());
    }

    @PutMapping("/price")
    public ResponseEntity<?> updateMilkPricing(@RequestBody MilkPricingDTO dto) {
        try {
            return ResponseEntity.ok(milkProductionService.updateMilkPricing(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
