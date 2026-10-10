package com.lawtan.controller;

import com.lawtan.dto.ReproductionAlertDTO;
import com.lawtan.dto.ReproductionEventDTO;
import com.lawtan.service.ReproductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reproduction")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReproductionController {

    private final ReproductionService reproductionService;

    @GetMapping
    public ResponseEntity<List<ReproductionEventDTO>> getAllEvents() {
        return ResponseEntity.ok(reproductionService.getAllEvents());
    }

    @GetMapping("/by-animal/{animalId}")
    public ResponseEntity<List<ReproductionEventDTO>> getEventsByAnimal(@PathVariable Long animalId) {
        return ResponseEntity.ok(reproductionService.getEventsByAnimal(animalId));
    }

    @PostMapping("/record")
    public ResponseEntity<ReproductionEventDTO> recordEvent(@RequestBody ReproductionEventDTO dto) {
        return new ResponseEntity<>(reproductionService.recordEvent(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReproductionEventDTO> updateEvent(@PathVariable Long id, @RequestBody ReproductionEventDTO dto) {
        return ResponseEntity.ok(reproductionService.updateEvent(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        reproductionService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<ReproductionAlertDTO>> getReproductionAlerts() {
        return ResponseEntity.ok(reproductionService.getReproductionAlerts());
    }

    @PostMapping("/recalculate")
    public ResponseEntity<Void> recalculateReproMetrics() {
        reproductionService.recalculateReproMetrics();
        return ResponseEntity.ok().build();
    }
}
