package com.lawtan.service;

import com.lawtan.dto.AnimalActivityDTO;
import com.lawtan.dto.AnimalActivityRequest;
import com.lawtan.dto.AnimalActivitySummaryDTO;

import java.util.List;

public interface AnimalActivityService {
    AnimalActivityDTO record(String animalInternalId, AnimalActivityRequest request);
    List<AnimalActivityDTO> getHistory(String animalInternalId, int days);
    AnimalActivitySummaryDTO getSummary(String animalInternalId);
    List<AnimalActivitySummaryDTO> getHerdAlerts();
}