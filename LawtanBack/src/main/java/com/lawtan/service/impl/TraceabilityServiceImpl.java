package com.lawtan.service.impl;

import com.lawtan.dto.TraceabilityLotDTO;
import com.lawtan.entity.ProductStock;
import com.lawtan.entity.TransformationBatch;
import com.lawtan.model.BatchStatus;
import com.lawtan.repository.ProductStockRepository;
import com.lawtan.repository.TransformationBatchRepository;
import com.lawtan.service.TraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TraceabilityServiceImpl implements TraceabilityService {

    private final TransformationBatchRepository batchRepository;
    private final ProductStockRepository productStockRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TraceabilityLotDTO> getAllLots() {
        return batchRepository.findAllByOrderByProductionDateDesc().stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TraceabilityLotDTO getLotByNumber(String lotNumber) {
        return batchRepository.findByBatchNumber(lotNumber)
                .map(this::toDTO)
                .orElse(null);
    }

    private TraceabilityLotDTO toDTO(TransformationBatch b) {
        Integer daysRemaining = null;
        if (b.getDlcExpiryDate() != null) {
            daysRemaining = (int) ChronoUnit.DAYS.between(LocalDate.now(), b.getDlcExpiryDate());
        }

        Boolean organic = productStockRepository.findByBatchId(b.getId())
                .map(ProductStock::getIsOrganicCertified)
                .orElse(null);

        return TraceabilityLotDTO.builder()
                .batchId(b.getId())
                .lotNumber(b.getBatchNumber())
                .productName(b.getRecipe() != null ? b.getRecipe().getName() : null)
                .productType(b.getRecipe() != null && b.getRecipe().getProductType() != null
                        ? b.getRecipe().getProductType().name() : null)
                .productionDate(b.getProductionDate() != null ? b.getProductionDate().toString() : null)
                .dlcExpiryDate(b.getDlcExpiryDate() != null ? b.getDlcExpiryDate().toString() : null)
                .milkLitersConsumed(b.getMilkLitersConsumed())
                .quantityProduced(b.getActualQuantityProduced())
                .unit(b.getUnit())
                .yieldEfficiencyPercentage(b.getYieldEfficiencyPercentage())
                .wasteLossQuantity(b.getWasteLossQuantity())
                .phLevel(b.getPhLevel())
                .fatPercentage(b.getFatPercentage())
                .sourceTank(b.getSourceTank())
                .operatorName(b.getOperatorName())
                .qualityNotes(b.getQualityNotes())
                .status(b.getStatus() != null ? b.getStatus().name() : null)
                .qualityStatus(qualityStatus(b.getStatus(), daysRemaining))
                .daysRemainingDlc(daysRemaining)
                .organicCertified(organic)
                .build();
    }

    /** Libellé qualité déduit du statut réel du lot et de sa DLC — jamais d'affirmation par défaut. */
    private String qualityStatus(BatchStatus status, Integer daysRemaining) {
        if (status == BatchStatus.CANCELLED) return "Lot rejeté";
        if (status == BatchStatus.PLANNED) return "Fabrication planifiée";
        if (status == BatchStatus.IN_PROGRESS) return "Transformation en cours";
        if (daysRemaining != null && daysRemaining < 0) return "DLC dépassée";
        if (daysRemaining != null && daysRemaining <= 5) return "DLC proche (" + daysRemaining + " j)";
        return "Lot conforme";
    }
}
