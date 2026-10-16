package com.lawtan.service.impl;

import com.lawtan.dto.ProductStockDTO;
import com.lawtan.entity.ProductStock;
import com.lawtan.repository.ProductStockRepository;
import com.lawtan.repository.RecipeRepository;
import com.lawtan.repository.TransformationBatchRepository;
import com.lawtan.service.ProductStockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductStockServiceImpl implements ProductStockService {

    private final ProductStockRepository productStockRepository;
    private final RecipeRepository recipeRepository;
    private final TransformationBatchRepository batchRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductStockDTO> getAllAvailableStocks() {
        return productStockRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductStockDTO getStockById(Long id) {
        return productStockRepository.findById(id)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public ProductStockDTO createOrUpdateStock(ProductStockDTO dto) {
        ProductStock stock;
        if (dto.getId() != null) {
            stock = productStockRepository.findById(dto.getId()).orElse(new ProductStock());
        } else {
            stock = new ProductStock();
        }

        if (dto.getRecipeId() != null) {
            recipeRepository.findById(dto.getRecipeId()).ifPresent(stock::setRecipe);
        }
        if (dto.getBatchId() != null) {
            batchRepository.findById(dto.getBatchId()).ifPresent(stock::setBatch);
        }

        stock.setProductName(dto.getProductName());
        stock.setQuantityAvailable(dto.getQuantityAvailable() != null ? dto.getQuantityAvailable() : 0.0);
        stock.setUnit(dto.getUnit());
        stock.setUnitPriceFcfa(dto.getUnitPriceFcfa() != null ? dto.getUnitPriceFcfa() : 0.0);
        stock.setTotalValueFcfa(stock.getQuantityAvailable() * stock.getUnitPriceFcfa());
        stock.setMfgDate(dto.getMfgDate() != null ? dto.getMfgDate() : LocalDate.now());
        stock.setDlcExpiryDate(dto.getDlcExpiryDate());
        stock.setStorageLocation(dto.getStorageLocation());
        stock.setIsOrganicCertified(dto.getIsOrganicCertified() != null ? dto.getIsOrganicCertified() : true);
        stock.setImageUrl(dto.getImageUrl());

        ProductStock saved = productStockRepository.save(stock);
        return toDTO(saved);
    }

    @Override
    public void deleteStock(Long id) {
        productStockRepository.deleteById(id);
    }

    public ProductStockDTO toDTO(ProductStock s) {
        Long daysRemaining = null;
        if (s.getDlcExpiryDate() != null) {
            daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), s.getDlcExpiryDate());
        }

        return ProductStockDTO.builder()
                .id(s.getId())
                .recipeId(s.getRecipe() != null ? s.getRecipe().getId() : null)
                .recipeName(s.getRecipe() != null ? s.getRecipe().getName() : null)
                .productType(s.getRecipe() != null ? s.getRecipe().getProductType() : null)
                .emoji(s.getRecipe() != null ? s.getRecipe().getEmoji() : "📦")
                .batchId(s.getBatch() != null ? s.getBatch().getId() : null)
                .batchNumber(s.getBatch() != null ? s.getBatch().getBatchNumber() : null)
                .productName(s.getProductName())
                .quantityAvailable(s.getQuantityAvailable())
                .unit(s.getUnit())
                .unitPriceFcfa(s.getUnitPriceFcfa())
                .totalValueFcfa(s.getTotalValueFcfa() != null ? s.getTotalValueFcfa() : ((s.getQuantityAvailable() != null ? s.getQuantityAvailable() : 0.0) * (s.getUnitPriceFcfa() != null ? s.getUnitPriceFcfa() : 0.0)))
                .mfgDate(s.getMfgDate())
                .dlcExpiryDate(s.getDlcExpiryDate())
                .storageLocation(s.getStorageLocation())
                .isOrganicCertified(s.getIsOrganicCertified())
                .daysRemainingDlc(daysRemaining)
                .imageUrl(s.getImageUrl())
                .build();
    }
}
