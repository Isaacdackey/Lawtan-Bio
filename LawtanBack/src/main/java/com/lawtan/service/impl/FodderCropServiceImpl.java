package com.lawtan.service.impl;

import com.lawtan.dto.*;
import com.lawtan.entity.FodderCrop;
import com.lawtan.entity.FodderHarvest;
import com.lawtan.exception.BusinessException;
import com.lawtan.model.FodderCropStatus;
import com.lawtan.repository.FodderCropRepository;
import com.lawtan.service.FodderCropService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FodderCropServiceImpl implements FodderCropService {

    private final FodderCropRepository fodderCropRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FodderCropDTO> getAllCrops() {
        return fodderCropRepository.findAllByOrderByPlantingDateDescIdDesc().stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FodderCropDTO getCrop(Long id) {
        return toDTO(findOrThrow(id));
    }

    @Override
    @Transactional
    public FodderCropDTO createCrop(FodderCropRequestDTO request) {
        validateDates(request.plantingDate(), request.expectedHarvestDate());
        FodderCrop crop = new FodderCrop();
        apply(crop, request);
        return toDTO(fodderCropRepository.save(crop));
    }

    @Override
    @Transactional
    public FodderCropDTO updateCrop(Long id, FodderCropRequestDTO request) {
        validateDates(request.plantingDate(), request.expectedHarvestDate());
        FodderCrop crop = findOrThrow(id);
        apply(crop, request);
        return toDTO(fodderCropRepository.save(crop));
    }

    @Override
    @Transactional
    public void deleteCrop(Long id) {
        fodderCropRepository.delete(findOrThrow(id));
    }

    @Override
    @Transactional
    public FodderCropDTO addHarvest(Long cropId, FodderHarvestRequest request) {
        FodderCrop crop = findOrThrow(cropId);
        if (crop.getStatus() == FodderCropStatus.ABANDONED) {
            throw new BusinessException("Impossible d'enregistrer une récolte sur une culture abandonnée.");
        }
        if (request.harvestDate().isAfter(LocalDate.now())) {
            throw new BusinessException("La date de récolte ne peut pas être dans le futur.");
        }
        if (crop.getPlantingDate() != null && request.harvestDate().isBefore(crop.getPlantingDate())) {
            throw new BusinessException("La date de récolte ne peut pas précéder la date de plantation.");
        }

        FodderHarvest harvest = FodderHarvest.builder()
                .crop(crop)
                .harvestDate(request.harvestDate())
                .quantityKg(request.quantityKg())
                .dryMatterPercent(request.dryMatterPercent())
                .notes(blankToNull(request.notes()))
                .build();
        crop.getHarvests().add(harvest);

        // Une première récolte fait passer la culture en phase « En récolte ».
        if (crop.getStatus() == FodderCropStatus.PLANNED || crop.getStatus() == FodderCropStatus.GROWING) {
            crop.setStatus(FodderCropStatus.HARVESTING);
        }
        return toDTO(fodderCropRepository.save(crop));
    }

    @Override
    @Transactional
    public FodderCropDTO deleteHarvest(Long cropId, Long harvestId) {
        FodderCrop crop = findOrThrow(cropId);
        boolean removed = crop.getHarvests().removeIf(h -> h.getId().equals(harvestId));
        if (!removed) {
            throw new BusinessException("Récolte introuvable pour cette culture.", HttpStatus.NOT_FOUND);
        }
        return toDTO(fodderCropRepository.save(crop));
    }

    @Override
    @Transactional(readOnly = true)
    public FodderSummaryDTO getSummary() {
        List<FodderCrop> crops = fodderCropRepository.findAll();
        double totalArea = 0;
        double totalCost = 0;
        double totalHarvested = 0;
        double areaWithHarvest = 0;
        int active = 0;

        for (FodderCrop crop : crops) {
            double harvested = harvestedKg(crop);
            totalArea += nz(crop.getAreaHectares());
            totalCost += totalCost(crop);
            totalHarvested += harvested;
            if (harvested > 0) {
                areaWithHarvest += nz(crop.getAreaHectares());
            }
            if (crop.getStatus() == FodderCropStatus.GROWING || crop.getStatus() == FodderCropStatus.HARVESTING) {
                active++;
            }
        }

        Double costPerKg = totalHarvested > 0 ? round2(totalCost / totalHarvested) : null;
        Double avgYield = (totalHarvested > 0 && areaWithHarvest > 0) ? round2(totalHarvested / areaWithHarvest) : null;
        return new FodderSummaryDTO(crops.size(), active, round2(totalArea), round2(totalHarvested),
                round2(totalCost), costPerKg, avgYield);
    }

    // --- helpers ---

    private FodderCrop findOrThrow(Long id) {
        return fodderCropRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Culture fourragère introuvable (id=" + id + ").", HttpStatus.NOT_FOUND));
    }

    private void validateDates(LocalDate planting, LocalDate expectedHarvest) {
        if (planting != null && expectedHarvest != null && expectedHarvest.isBefore(planting)) {
            throw new BusinessException("La date de récolte prévue ne peut pas précéder la date de plantation.");
        }
    }

    private void apply(FodderCrop crop, FodderCropRequestDTO r) {
        crop.setParcelName(r.parcelName().trim());
        crop.setCropType(r.cropType().trim());
        crop.setAreaHectares(r.areaHectares());
        crop.setPlantingDate(r.plantingDate());
        crop.setExpectedHarvestDate(r.expectedHarvestDate());
        crop.setStatus(r.status() != null ? r.status()
                : (crop.getStatus() != null ? crop.getStatus() : FodderCropStatus.PLANNED));
        crop.setExpectedYieldKg(r.expectedYieldKg());
        crop.setIrrigationType(blankToNull(r.irrigationType()));
        crop.setSeedCostFcfa(nz(r.seedCostFcfa()));
        crop.setFertilizerCostFcfa(nz(r.fertilizerCostFcfa()));
        crop.setLaborCostFcfa(nz(r.laborCostFcfa()));
        crop.setIrrigationCostFcfa(nz(r.irrigationCostFcfa()));
        crop.setOtherCostFcfa(nz(r.otherCostFcfa()));
        crop.setNotes(blankToNull(r.notes()));
    }

    private FodderCropDTO toDTO(FodderCrop c) {
        double harvested = harvestedKg(c);
        double cost = totalCost(c);
        Double yieldPerHa = (harvested > 0 && nz(c.getAreaHectares()) > 0)
                ? round2(harvested / c.getAreaHectares()) : null;
        Double costPerKg = harvested > 0 ? round2(cost / harvested) : null;

        List<FodderHarvestDTO> harvests = c.getHarvests().stream()
                .map(h -> new FodderHarvestDTO(h.getId(), h.getHarvestDate(), h.getQuantityKg(),
                        h.getDryMatterPercent(), h.getNotes()))
                .toList();

        return new FodderCropDTO(c.getId(), c.getParcelName(), c.getCropType(), c.getAreaHectares(),
                c.getPlantingDate(), c.getExpectedHarvestDate(), c.getStatus(),
                c.getStatus() != null ? c.getStatus().getLabel() : null,
                c.getExpectedYieldKg(), c.getIrrigationType(),
                nz(c.getSeedCostFcfa()), nz(c.getFertilizerCostFcfa()), nz(c.getLaborCostFcfa()),
                nz(c.getIrrigationCostFcfa()), nz(c.getOtherCostFcfa()),
                round2(cost), round2(harvested), yieldPerHa, costPerKg,
                c.getNotes(), harvests, c.getCreatedAt());
    }

    private double harvestedKg(FodderCrop c) {
        return c.getHarvests().stream().mapToDouble(h -> nz(h.getQuantityKg())).sum();
    }

    private double totalCost(FodderCrop c) {
        return nz(c.getSeedCostFcfa()) + nz(c.getFertilizerCostFcfa()) + nz(c.getLaborCostFcfa())
                + nz(c.getIrrigationCostFcfa()) + nz(c.getOtherCostFcfa());
    }

    private static double nz(Double v) {
        return v != null ? v : 0.0;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}