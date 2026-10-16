package com.lawtan.service;

import com.lawtan.dto.FodderCropDTO;
import com.lawtan.dto.FodderCropRequestDTO;
import com.lawtan.dto.FodderHarvestRequest;
import com.lawtan.dto.FodderSummaryDTO;

import java.util.List;

public interface FodderCropService {
    List<FodderCropDTO> getAllCrops();
    FodderCropDTO getCrop(Long id);
    FodderCropDTO createCrop(FodderCropRequestDTO request);
    FodderCropDTO updateCrop(Long id, FodderCropRequestDTO request);
    void deleteCrop(Long id);
    FodderCropDTO addHarvest(Long cropId, FodderHarvestRequest request);
    FodderCropDTO deleteHarvest(Long cropId, Long harvestId);
    FodderSummaryDTO getSummary();
}