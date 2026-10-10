package com.lawtan.service.impl;

import com.lawtan.dto.ProductStockDTO;
import com.lawtan.dto.TransformationBatchDTO;
import com.lawtan.dto.TransformationSummaryDTO;
import com.lawtan.entity.ProductStock;
import com.lawtan.entity.Recipe;
import com.lawtan.entity.TransformationBatch;
import com.lawtan.model.BatchStatus;
import com.lawtan.repository.ProductStockRepository;
import com.lawtan.repository.RecipeRepository;
import com.lawtan.repository.TransformationBatchRepository;
import com.lawtan.service.TransformationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransformationServiceImpl implements TransformationService {

    private final TransformationBatchRepository batchRepository;
    private final RecipeRepository recipeRepository;
    private final ProductStockRepository productStockRepository;
    private final com.lawtan.service.MilkProductionService milkProductionService;

    @Override
    @Transactional(readOnly = true)
    public List<TransformationBatchDTO> getAllBatches() {
        return batchRepository.findAllByOrderByProductionDateDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TransformationBatchDTO getBatchById(Long id) {
        return batchRepository.findById(id)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransformationBatchDTO> getBatchesByStatus(BatchStatus status) {
        return batchRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TransformationBatchDTO launchBatch(TransformationBatchDTO dto) {
        if (dto.getRecipeId() == null) {
            throw new com.lawtan.exception.BusinessException("Une recette doit être sélectionnée pour lancer un lot.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        Recipe recipe = recipeRepository.findById(dto.getRecipeId())
                .orElseThrow(() -> new com.lawtan.exception.BusinessException("Recette introuvable id=" + dto.getRecipeId(), org.springframework.http.HttpStatus.NOT_FOUND));

        LocalDate date = dto.getProductionDate() != null ? dto.getProductionDate() : LocalDate.now();
        if (date.isAfter(LocalDate.now())) {
            throw new com.lawtan.exception.BusinessException("La date de production ne peut pas être dans le futur.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        double milkConsumed = (dto.getMilkLitersConsumed() != null && dto.getMilkLitersConsumed() > 0) 
                ? dto.getMilkLitersConsumed() : 10.0;

        // Contrôle stock de lait disponible pour la transformation
        double availableMilk = milkProductionService.getStockAllocation(date).getProductionAvailable();
        if (milkConsumed > availableMilk + 0.001) {
            throw new com.lawtan.exception.BusinessException(
                    "Stock de lait insuffisant en atelier : " + milkConsumed + " L demandés mais seulement "
                            + availableMilk + " L disponibles pour la transformation.",
                    org.springframework.http.HttpStatus.BAD_REQUEST
            );
        }

        // Génération numéro de lot unique si non fourni
        String batchNum = dto.getBatchNumber();
        if (batchNum == null || batchNum.trim().isEmpty()) {
            String datePart = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            long countToday = batchRepository.count() + 1;
            batchNum = String.format("LOT-TR-%s-%02d", datePart, countToday);
        }

        // Calcul de la quantité théorique attendue selon le ratio de la recette
        double ratio = (recipe.getMilkLitersPerUnit() != null && recipe.getMilkLitersPerUnit() > 0) 
                ? recipe.getMilkLitersPerUnit() : 1.0;
        double expected = Math.round((milkConsumed / ratio) * 10.0) / 10.0;

        // Calcul de la DLC prévisionnelle
        int shelfLife = recipe.getShelfLifeDays() != null ? recipe.getShelfLifeDays() : 30;
        LocalDate dlc = date.plusDays(shelfLife);
        LocalDate dlcFinal = dto.getDlcExpiryDate() != null ? dto.getDlcExpiryDate() : dlc;
        if (dlcFinal.isBefore(date) || dlcFinal.isEqual(date)) {
            throw new com.lawtan.exception.BusinessException("La Date Limite de Consommation (DLC) doit être strictement postérieure à la date de fabrication.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        BatchStatus status = dto.getStatus() != null ? dto.getStatus() : BatchStatus.IN_PROGRESS;

        TransformationBatch batch = TransformationBatch.builder()
                .batchNumber(batchNum)
                .recipe(recipe)
                .status(status)
                .productionDate(date)
                .milkLitersConsumed(milkConsumed)
                .expectedQuantity(expected)
                .actualQuantityProduced(dto.getActualQuantityProduced())
                .unit(dto.getUnit() != null ? dto.getUnit() : recipe.getTargetUnit())
                .yieldEfficiencyPercentage(dto.getYieldEfficiencyPercentage())
                .wasteLossQuantity(dto.getWasteLossQuantity())
                .dlcExpiryDate(dlcFinal)
                .operatorName(dto.getOperatorName() != null ? dto.getOperatorName() : "Maître Fromager Lawtan")
                .qualityNotes(dto.getQualityNotes())
                .phLevel(dto.getPhLevel())
                .fatPercentage(dto.getFatPercentage() != null ? dto.getFatPercentage() : 4.1)
                .sourceTank(dto.getSourceTank() != null ? dto.getSourceTank() : "Cuve Réfrigérée N°1 (Bio)")
                .build();

        TransformationBatch saved = batchRepository.save(batch);
        log.info("Nouveau lot de transformation lancé : {} (Recette: {}, Lait: {}L, Attendu: {})", 
                saved.getBatchNumber(), recipe.getName(), milkConsumed, expected);

        return toDTO(saved);
    }

    @Override
    public TransformationBatchDTO completeBatch(Long batchId, Double actualQuantityProduced, Double wasteLossQuantity, String qualityNotes, Double phLevel) {
        TransformationBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new com.lawtan.exception.BusinessException("Lot introuvable id=" + batchId, org.springframework.http.HttpStatus.NOT_FOUND));

        if (batch.getStatus() == BatchStatus.COMPLETED) {
            throw new com.lawtan.exception.BusinessException("Le lot " + batch.getBatchNumber() + " est déjà finalisé et clôturé.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        if (actualQuantityProduced != null && actualQuantityProduced < 0) {
            throw new com.lawtan.exception.BusinessException("La quantité réelle produite ne peut pas être négative.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }
        if (wasteLossQuantity != null && wasteLossQuantity < 0) {
            throw new com.lawtan.exception.BusinessException("La perte/rebut ne peut pas être négative.", org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        batch.setStatus(BatchStatus.COMPLETED);
        batch.setActualQuantityProduced(actualQuantityProduced != null ? actualQuantityProduced : batch.getExpectedQuantity());
        batch.setWasteLossQuantity(wasteLossQuantity != null ? wasteLossQuantity : 0.0);
        if (qualityNotes != null) batch.setQualityNotes(qualityNotes);
        if (phLevel != null) batch.setPhLevel(phLevel);

        // Calcul du rendement réel d'efficacité %
        if (batch.getExpectedQuantity() != null && batch.getExpectedQuantity() > 0 && batch.getActualQuantityProduced() != null) {
            double efficiency = (batch.getActualQuantityProduced() / batch.getExpectedQuantity()) * 100.0;
            batch.setYieldEfficiencyPercentage(Math.round(efficiency * 10.0) / 10.0);
        } else {
            batch.setYieldEfficiencyPercentage(100.0);
        }

        TransformationBatch savedBatch = batchRepository.save(batch);

        // Alimentation automatique ou mise à jour du ProductStock
        Recipe recipe = savedBatch.getRecipe();
        double sellingPrice = (recipe != null && recipe.getStandardSellingPriceFcfa() != null) 
                ? recipe.getStandardSellingPriceFcfa() : 1500.0;

        ProductStock stock = productStockRepository.findByBatchId(savedBatch.getId()).orElse(
                ProductStock.builder()
                        .batch(savedBatch)
                        .recipe(recipe)
                        .productName(recipe != null ? recipe.getName() : "Produit Transformé")
                        .unit(savedBatch.getUnit())
                        .unitPriceFcfa(sellingPrice)
                        .storageLocation("Chambre Froide Fromagerie (+4°C)")
                        .isOrganicCertified(true)
                        .build()
        );

        stock.setQuantityAvailable(savedBatch.getActualQuantityProduced());
        stock.setTotalValueFcfa(stock.getQuantityAvailable() * stock.getUnitPriceFcfa());
        stock.setMfgDate(savedBatch.getProductionDate());
        stock.setDlcExpiryDate(savedBatch.getDlcExpiryDate());

        productStockRepository.save(stock);
        log.info("Lot {} finalisé avec succès ! Rendement: {}%, Stock créé: {} {}", 
                savedBatch.getBatchNumber(), savedBatch.getYieldEfficiencyPercentage(), stock.getQuantityAvailable(), stock.getUnit());

        return toDTO(savedBatch);
    }

    @Override
    public TransformationBatchDTO updateBatch(Long id, TransformationBatchDTO dto) {
        return batchRepository.findById(id).map(batch -> {
            if (dto.getRecipeId() != null) {
                recipeRepository.findById(dto.getRecipeId()).ifPresent(batch::setRecipe);
            }
            if (dto.getStatus() != null) batch.setStatus(dto.getStatus());
            if (dto.getProductionDate() != null) batch.setProductionDate(dto.getProductionDate());
            if (dto.getMilkLitersConsumed() != null) batch.setMilkLitersConsumed(dto.getMilkLitersConsumed());
            if (dto.getExpectedQuantity() != null) batch.setExpectedQuantity(dto.getExpectedQuantity());
            if (dto.getActualQuantityProduced() != null) batch.setActualQuantityProduced(dto.getActualQuantityProduced());
            if (dto.getUnit() != null) batch.setUnit(dto.getUnit());
            if (dto.getYieldEfficiencyPercentage() != null) batch.setYieldEfficiencyPercentage(dto.getYieldEfficiencyPercentage());
            if (dto.getWasteLossQuantity() != null) batch.setWasteLossQuantity(dto.getWasteLossQuantity());
            if (dto.getDlcExpiryDate() != null) batch.setDlcExpiryDate(dto.getDlcExpiryDate());
            if (dto.getOperatorName() != null) batch.setOperatorName(dto.getOperatorName());
            if (dto.getQualityNotes() != null) batch.setQualityNotes(dto.getQualityNotes());
            if (dto.getPhLevel() != null) batch.setPhLevel(dto.getPhLevel());
            if (dto.getFatPercentage() != null) batch.setFatPercentage(dto.getFatPercentage());
            if (dto.getSourceTank() != null) batch.setSourceTank(dto.getSourceTank());

            return toDTO(batchRepository.save(batch));
        }).orElse(null);
    }

    @Override
    public void deleteBatch(Long id) {
        productStockRepository.findByBatchId(id).ifPresent(productStockRepository::delete);
        batchRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public TransformationSummaryDTO getTransformationSummary() {
        Double totalMilk = batchRepository.sumTotalMilkTransformed();
        Double avgYield = batchRepository.avgYieldEfficiency();
        Long activeCount = batchRepository.countByStatus(BatchStatus.IN_PROGRESS) + batchRepository.countByStatus(BatchStatus.PLANNED);
        Long totalCount = batchRepository.count();
        Double totalStockVal = productStockRepository.sumTotalStockValue();
        Long stockCount = productStockRepository.count();
        Long dlcAlerts = productStockRepository.countStocksNearDlc(LocalDate.now().plusDays(5));

        return TransformationSummaryDTO.builder()
                .totalMilkTransformedLiters(totalMilk != null ? Math.round(totalMilk * 10.0) / 10.0 : 0.0)
                .averageYieldEfficiency(avgYield != null ? Math.round(avgYield * 10.0) / 10.0 : 0.0)
                .activeBatchesCount(activeCount != null ? activeCount : 0L)
                .totalBatchesCount(totalCount != null ? totalCount : 0L)
                .totalStockValueFcfa(totalStockVal != null ? totalStockVal : 0.0)
                .productsInStockCount(stockCount != null ? stockCount : 0L)
                .dlcAlertsCount(dlcAlerts != null ? dlcAlerts : 0L)
                .build();
    }

    private TransformationBatchDTO toDTO(TransformationBatch b) {
        Recipe r = b.getRecipe();
        return TransformationBatchDTO.builder()
                .id(b.getId())
                .batchNumber(b.getBatchNumber())
                .recipeId(r != null ? r.getId() : null)
                .recipeName(r != null ? r.getName() : null)
                .recipeCode(r != null ? r.getCode() : null)
                .productType(r != null ? r.getProductType() : null)
                .emoji(r != null ? r.getEmoji() : "🥛")
                .status(b.getStatus())
                .productionDate(b.getProductionDate())
                .milkLitersConsumed(b.getMilkLitersConsumed())
                .expectedQuantity(b.getExpectedQuantity())
                .actualQuantityProduced(b.getActualQuantityProduced())
                .unit(b.getUnit())
                .yieldEfficiencyPercentage(b.getYieldEfficiencyPercentage())
                .wasteLossQuantity(b.getWasteLossQuantity())
                .dlcExpiryDate(b.getDlcExpiryDate())
                .operatorName(b.getOperatorName())
                .qualityNotes(b.getQualityNotes())
                .phLevel(b.getPhLevel())
                .fatPercentage(b.getFatPercentage())
                .sourceTank(b.getSourceTank())
                .build();
    }
}
