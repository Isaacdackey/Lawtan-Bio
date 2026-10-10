package com.lawtan.service;

import com.lawtan.dto.ReproductionAlertDTO;
import com.lawtan.dto.ReproductionEventDTO;

import java.util.List;

public interface ReproductionService {
    List<ReproductionEventDTO> getAllEvents();
    List<ReproductionEventDTO> getEventsByAnimal(Long animalId);
    ReproductionEventDTO recordEvent(ReproductionEventDTO dto);
    ReproductionEventDTO updateEvent(Long id, ReproductionEventDTO dto);
    void deleteEvent(Long id);
    List<ReproductionAlertDTO> getReproductionAlerts();
    void recalculateReproMetrics();
}
