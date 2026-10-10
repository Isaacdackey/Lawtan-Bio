package com.lawtan.controller;

import com.lawtan.dto.AnimalDTO;
import com.lawtan.model.AnimalCategory;
import com.lawtan.model.AnimalStatus;
import com.lawtan.service.AnimalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/animals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnimalController {

    private final AnimalService animalService;

    @GetMapping
    public ResponseEntity<List<AnimalDTO>> getAllAnimals(
            @RequestParam(required = false) AnimalCategory category,
            @RequestParam(required = false) AnimalStatus status) {
        if (category != null) {
            return ResponseEntity.ok(animalService.getAnimalsByCategory(category));
        }
        if (status != null) {
            return ResponseEntity.ok(animalService.getAnimalsByStatus(status));
        }
        return ResponseEntity.ok(animalService.getAllAnimals());
    }

    @GetMapping("/{internalId}")
    public ResponseEntity<AnimalDTO> getAnimalByInternalId(@PathVariable String internalId) {
        return ResponseEntity.ok(animalService.getAnimalByInternalId(internalId));
    }

    @PostMapping
    public ResponseEntity<AnimalDTO> createAnimal(@RequestBody AnimalDTO dto) {
        return new ResponseEntity<>(animalService.createAnimal(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{internalId}")
    public ResponseEntity<AnimalDTO> updateAnimal(@PathVariable String internalId, @RequestBody AnimalDTO dto) {
        return ResponseEntity.ok(animalService.updateAnimal(internalId, dto));
    }

    @DeleteMapping("/{internalId}")
    public ResponseEntity<Void> deleteAnimal(@PathVariable String internalId) {
        animalService.deleteAnimal(internalId);
        return ResponseEntity.noContent().build();
    }
}
