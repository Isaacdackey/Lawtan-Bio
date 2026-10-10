package com.lawtan.service.impl;

import com.lawtan.dto.FeedDistributionDTO;
import com.lawtan.dto.FeedRationDTO;
import com.lawtan.dto.FeedStockDTO;
import com.lawtan.entity.FeedDistribution;
import com.lawtan.entity.FeedRation;
import com.lawtan.entity.FeedStock;
import com.lawtan.repository.FeedDistributionRepository;
import com.lawtan.repository.FeedRationRepository;
import com.lawtan.repository.FeedStockRepository;
import com.lawtan.service.FeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FeedServiceImpl implements FeedService {

    @Autowired
    private FeedStockRepository feedStockRepository;

    @Autowired
    private FeedRationRepository feedRationRepository;

    @Autowired
    private FeedDistributionRepository feedDistributionRepository;

    @Override
    public List<FeedStockDTO> getAllFeedStocks() {
        return feedStockRepository.findAll().stream().map(this::convertStockToDTO).collect(Collectors.toList());
    }

    @Override
    public FeedStockDTO getFeedStockById(Long id) {
        FeedStock stock = feedStockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock d'aliment introuvable avec l'ID: " + id));
        return convertStockToDTO(stock);
    }

    @Override
    public FeedStockDTO updateFeedStockQuantity(Long id, Double newQuantityKg) {
        FeedStock stock = feedStockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock d'aliment introuvable avec l'ID: " + id));
        stock.setCurrentStockKg(newQuantityKg != null ? newQuantityKg : 0.0);
        FeedStock saved = feedStockRepository.save(stock);
        return convertStockToDTO(saved);
    }

    @Override
    public FeedStockDTO createFeedStock(FeedStockDTO dto) {
        FeedStock stock = new FeedStock(
                dto.getName() != null ? dto.getName() : "Aliment",
                dto.getCategory() != null ? dto.getCategory() : "CONCENTRATE",
                dto.getCurrentStockKg() != null ? dto.getCurrentStockKg() : 0.0,
                dto.getAlertThresholdKg() != null ? dto.getAlertThresholdKg() : 50.0,
                dto.getUnitPricePerKgFcfa() != null ? dto.getUnitPricePerKgFcfa() : 0.0,
                dto.getSupplierName() != null ? dto.getSupplierName() : "Ferme Lawtan",
                dto.getStorageLocation() != null ? dto.getStorageLocation() : "Magasin",
                dto.getNotes() != null ? dto.getNotes() : ""
        );
        FeedStock saved = feedStockRepository.save(stock);
        return convertStockToDTO(saved);
    }

    @Override
    public void deleteFeedStock(Long id) {
        feedStockRepository.deleteById(id);
    }

    @Override
    public List<FeedRationDTO> getAllRations() {
        return feedRationRepository.findAll().stream().map(this::convertRationToDTO).collect(Collectors.toList());
    }

    @Override
    public FeedRationDTO getRationById(Long id) {
        FeedRation ration = feedRationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ration introuvable avec l'ID: " + id));
        return convertRationToDTO(ration);
    }

    @Override
    public FeedRationDTO createRation(FeedRationDTO dto) {
        FeedRation ration = new FeedRation(
                dto.getRationName() != null ? dto.getRationName() : "Ration Personnalisée",
                dto.getTargetCategory() != null ? dto.getTargetCategory() : "Vaches Haute Lactation",
                dto.getDailyDryMatterKg() != null ? dto.getDailyDryMatterKg() : 15.0,
                dto.getCompositionDescription() != null ? dto.getCompositionDescription() : "Composition standard",
                dto.getDailyCostFcfa() != null ? dto.getDailyCostFcfa() : 2000.0,
                dto.getEnergyUfl() != null ? dto.getEnergyUfl() : 12.0,
                dto.getProteinPdiGrams() != null ? dto.getProteinPdiGrams() : 1000.0
        );
        FeedRation saved = feedRationRepository.save(ration);
        return convertRationToDTO(saved);
    }

    @Override
    public FeedRationDTO updateRation(Long id, FeedRationDTO dto) {
        FeedRation ration = feedRationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ration introuvable avec l'ID: " + id));
        ration.setRationName(dto.getRationName());
        ration.setTargetCategory(dto.getTargetCategory());
        ration.setDailyDryMatterKg(dto.getDailyDryMatterKg());
        ration.setCompositionDescription(dto.getCompositionDescription());
        ration.setDailyCostFcfa(dto.getDailyCostFcfa());
        ration.setEnergyUfl(dto.getEnergyUfl());
        ration.setProteinPdiGrams(dto.getProteinPdiGrams());
        FeedRation saved = feedRationRepository.save(ration);
        return convertRationToDTO(saved);
    }

    @Override
    public void deleteRation(Long id) {
        feedRationRepository.deleteById(id);
    }

    private FeedStockDTO convertStockToDTO(FeedStock entity) {
        FeedStockDTO dto = new FeedStockDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCategory(entity.getCategory());
        dto.setCurrentStockKg(entity.getCurrentStockKg());
        dto.setAlertThresholdKg(entity.getAlertThresholdKg());
        dto.setUnitPricePerKgFcfa(entity.getUnitPricePerKgFcfa());
        dto.setSupplierName(entity.getSupplierName());
        dto.setStorageLocation(entity.getStorageLocation());
        dto.setNotes(entity.getNotes());
        dto.setIsLowStock(entity.getCurrentStockKg() != null && entity.getAlertThresholdKg() != null && entity.getCurrentStockKg() <= entity.getAlertThresholdKg());
        return dto;
    }

    private FeedRationDTO convertRationToDTO(FeedRation entity) {
        FeedRationDTO dto = new FeedRationDTO();
        dto.setId(entity.getId());
        dto.setRationName(entity.getRationName());
        dto.setTargetCategory(entity.getTargetCategory());
        dto.setDailyDryMatterKg(entity.getDailyDryMatterKg());
        dto.setCompositionDescription(entity.getCompositionDescription());
        dto.setDailyCostFcfa(entity.getDailyCostFcfa());
        dto.setEnergyUfl(entity.getEnergyUfl());
        dto.setProteinPdiGrams(entity.getProteinPdiGrams());
        return dto;
    }

    @Override
    public List<FeedDistributionDTO> getAllDistributions() {
        return feedDistributionRepository.findAllByOrderByDistributionDateDescIdDesc()
                .stream()
                .map(this::convertDistributionToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FeedDistributionDTO recordDistribution(FeedDistributionDTO dto) {
        if (dto.getQuantityDistributedKg() == null || dto.getQuantityDistributedKg() <= 0) {
            throw new com.lawtan.exception.BusinessException("La quantité d'aliment distribuée doit être strictement supérieure à 0 kg.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        if (dto.getAnimalsCountNourished() != null && dto.getAnimalsCountNourished() <= 0) {
            throw new com.lawtan.exception.BusinessException("Le nombre d'animaux nourris doit être au moins de 1.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        // Décrémentation automatique du stock d'aliment correspondant
        List<FeedStock> stocks = feedStockRepository.findAll();
        if (!stocks.isEmpty()) {
            FeedStock stockToDebit = stocks.stream()
                    .filter(s -> dto.getRationName() != null && s.getName().toLowerCase().contains(dto.getRationName().toLowerCase()))
                    .findFirst()
                    .orElse(stocks.get(0));
            double current = stockToDebit.getCurrentStockKg() != null ? stockToDebit.getCurrentStockKg() : 0.0;
            double remaining = Math.max(0.0, current - dto.getQuantityDistributedKg());
            stockToDebit.setCurrentStockKg(remaining);
            feedStockRepository.save(stockToDebit);
        }

        FeedDistribution dist = new FeedDistribution(
                dto.getRationId(),
                dto.getRationName() != null ? dto.getRationName() : "Ration Servie",
                dto.getDistributionDate() != null ? dto.getDistributionDate() : LocalDate.now(),
                dto.getDistributionTime() != null ? dto.getDistributionTime() : "07:30",
                dto.getSession() != null ? dto.getSession() : "MATIN",
                dto.getQuantityDistributedKg(),
                dto.getAnimalsCountNourished() != null ? dto.getAnimalsCountNourished() : 1,
                dto.getTargetGroupOrRace() != null ? dto.getTargetGroupOrRace() : "Troupeau",
                dto.getDistributorName() != null ? dto.getDistributorName() : "Soigneur",
                dto.getTotalCostFcfa() != null ? dto.getTotalCostFcfa() : 0.0,
                dto.getNotes() != null ? dto.getNotes() : ""
        );
        FeedDistribution saved = feedDistributionRepository.save(dist);
        return convertDistributionToDTO(saved);
    }

    @Override
    public void deleteDistribution(Long id) {
        feedDistributionRepository.deleteById(id);
    }

    @Override
    public void clearAllDistributions() {
        feedDistributionRepository.deleteAll();
    }

    private FeedDistributionDTO convertDistributionToDTO(FeedDistribution entity) {
        FeedDistributionDTO dto = new FeedDistributionDTO();
        dto.setId(entity.getId());
        dto.setRationId(entity.getRationId());
        dto.setRationName(entity.getRationName());
        dto.setDistributionDate(entity.getDistributionDate());
        dto.setDistributionTime(entity.getDistributionTime());
        dto.setSession(entity.getSession());
        dto.setQuantityDistributedKg(entity.getQuantityDistributedKg());
        dto.setAnimalsCountNourished(entity.getAnimalsCountNourished());
        dto.setTargetGroupOrRace(entity.getTargetGroupOrRace());
        dto.setDistributorName(entity.getDistributorName());
        dto.setTotalCostFcfa(entity.getTotalCostFcfa());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
