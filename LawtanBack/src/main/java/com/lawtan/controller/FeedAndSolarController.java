package com.lawtan.controller;

import com.lawtan.dto.FeedRationDTO;
import com.lawtan.dto.FeedStockDTO;
import com.lawtan.dto.SolarEnergyMetricDTO;
import com.lawtan.service.FeedService;
import com.lawtan.service.SolarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FeedAndSolarController {

    @Autowired
    private FeedService feedService;

    @Autowired
    private SolarService solarService;

    // --- Feed Stocks ---
    @GetMapping("/feed/stocks")
    public ResponseEntity<List<FeedStockDTO>> getAllFeedStocks() {
        return ResponseEntity.ok(feedService.getAllFeedStocks());
    }

    @GetMapping("/feed/stocks/{id}")
    public ResponseEntity<FeedStockDTO> getFeedStockById(@PathVariable Long id) {
        return ResponseEntity.ok(feedService.getFeedStockById(id));
    }

    @PostMapping("/feed/stocks")
    public ResponseEntity<FeedStockDTO> createFeedStock(@RequestBody FeedStockDTO dto) {
        return ResponseEntity.ok(feedService.createFeedStock(dto));
    }

    @PatchMapping("/feed/stocks/{id}/quantity")
    public ResponseEntity<FeedStockDTO> updateFeedStockQuantity(@PathVariable Long id, @RequestBody Map<String, Double> payload) {
        Double qty = payload.get("currentStockKg");
        return ResponseEntity.ok(feedService.updateFeedStockQuantity(id, qty));
    }

    @DeleteMapping("/feed/stocks/{id}")
    public ResponseEntity<Void> deleteFeedStock(@PathVariable Long id) {
        feedService.deleteFeedStock(id);
        return ResponseEntity.noContent().build();
    }

    // --- Feed Rations ---
    @GetMapping("/feed/rations")
    public ResponseEntity<List<FeedRationDTO>> getAllRations() {
        return ResponseEntity.ok(feedService.getAllRations());
    }

    @GetMapping("/feed/rations/{id}")
    public ResponseEntity<FeedRationDTO> getRationById(@PathVariable Long id) {
        return ResponseEntity.ok(feedService.getRationById(id));
    }

    @PostMapping("/feed/rations")
    public ResponseEntity<FeedRationDTO> createRation(@RequestBody FeedRationDTO dto) {
        return ResponseEntity.ok(feedService.createRation(dto));
    }

    @PutMapping("/feed/rations/{id}")
    public ResponseEntity<FeedRationDTO> updateRation(@PathVariable Long id, @RequestBody FeedRationDTO dto) {
        return ResponseEntity.ok(feedService.updateRation(id, dto));
    }

    @DeleteMapping("/feed/rations/{id}")
    public ResponseEntity<Void> deleteRation(@PathVariable Long id) {
        feedService.deleteRation(id);
        return ResponseEntity.noContent().build();
    }

    // --- Feed Distributions ---
    @GetMapping("/feed/distributions")
    public ResponseEntity<List<com.lawtan.dto.FeedDistributionDTO>> getAllDistributions() {
        return ResponseEntity.ok(feedService.getAllDistributions());
    }

    @PostMapping("/feed/distributions")
    public ResponseEntity<com.lawtan.dto.FeedDistributionDTO> recordDistribution(@RequestBody com.lawtan.dto.FeedDistributionDTO dto) {
        return ResponseEntity.ok(feedService.recordDistribution(dto));
    }

    @DeleteMapping("/feed/distributions/{id}")
    public ResponseEntity<Void> deleteDistribution(@PathVariable Long id) {
        feedService.deleteDistribution(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/feed/distributions")
    public ResponseEntity<Void> clearAllDistributions() {
        feedService.clearAllDistributions();
        return ResponseEntity.noContent().build();
    }

    // --- Solar Telemetry ---
    @GetMapping("/solar/telemetry")
    public ResponseEntity<SolarEnergyMetricDTO> getLatestSolarTelemetry() {
        return ResponseEntity.ok(solarService.getLatestSolarTelemetry());
    }

    @PostMapping("/solar/telemetry")
    public ResponseEntity<SolarEnergyMetricDTO> recordSolarMetric(@RequestBody SolarEnergyMetricDTO dto) {
        return ResponseEntity.ok(solarService.recordSolarMetric(dto));
    }
}