package com.lawtan.service;

import com.lawtan.dto.TransformationBatchDTO;
import com.lawtan.dto.TransformationSummaryDTO;
import com.lawtan.model.BatchStatus;

import java.util.List;

public interface TransformationService {
    List<TransformationBatchDTO> getAllBatches();
    TransformationBatchDTO getBatchById(Long id);
    List<TransformationBatchDTO> getBatchesByStatus(BatchStatus status);
    TransformationBatchDTO launchBatch(TransformationBatchDTO dto);
    TransformationBatchDTO completeBatch(Long batchId, Double actualQuantityProduced, Double wasteLossQuantity, String qualityNotes, Double phLevel);
    TransformationBatchDTO updateBatch(Long id, TransformationBatchDTO dto);
    void deleteBatch(Long id);
    TransformationSummaryDTO getTransformationSummary();
}
