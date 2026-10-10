package com.lawtan.service;

import com.lawtan.dto.AnimalDTO;
import com.lawtan.model.AnimalCategory;
import com.lawtan.model.AnimalStatus;

import java.util.List;

public interface AnimalService {
    List<AnimalDTO> getAllAnimals();
    List<AnimalDTO> getAnimalsByCategory(AnimalCategory category);
    List<AnimalDTO> getAnimalsByStatus(AnimalStatus status);
    AnimalDTO getAnimalByInternalId(String internalId);
    AnimalDTO createAnimal(AnimalDTO dto);
    AnimalDTO updateAnimal(String internalId, AnimalDTO dto);
    void deleteAnimal(String internalId);
}
