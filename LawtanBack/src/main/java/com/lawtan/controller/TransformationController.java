package com.lawtan.controller;

import com.lawtan.dto.ProductStockDTO;
import com.lawtan.dto.RecipeDTO;
import com.lawtan.dto.TransformationBatchDTO;
import com.lawtan.dto.TransformationSummaryDTO;
import com.lawtan.model.BatchStatus;
import com.lawtan.model.ProductType;
import com.lawtan.service.ProductStockService;
import com.lawtan.service.RecipeService;
import com.lawtan.service.TransformationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransformationController {

    private final RecipeService recipeService;
    private final TransformationService transformationService;
    private final ProductStockService productStockService;

    // ==========================================
    // 1. RECIPES ENDPOINTS (/api/recipes)
    // ==========================================
    @GetMapping("/recipes")
    public ResponseEntity<List<RecipeDTO>> getAllRecipes(@RequestParam(required = false) ProductType type) {
        if (type != null) {
            return ResponseEntity.ok(recipeService.getRecipesByType(type));
        }
        return ResponseEntity.ok(recipeService.getAllRecipes());
    }

    @GetMapping("/recipes/{id}")
    public ResponseEntity<RecipeDTO> getRecipeById(@PathVariable Long id) {
        RecipeDTO dto = recipeService.getRecipeById(id);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/recipes")
    public ResponseEntity<RecipeDTO> createRecipe(@RequestBody RecipeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recipeService.createRecipe(dto));
    }

    @PutMapping("/recipes/{id}")
    public ResponseEntity<RecipeDTO> updateRecipe(@PathVariable Long id, @RequestBody RecipeDTO dto) {
        RecipeDTO updated = recipeService.updateRecipe(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 2. TRANSFORMATION BATCHES (/api/transformations)
    // ==========================================
    @GetMapping("/transformations/batches")
    public ResponseEntity<List<TransformationBatchDTO>> getAllBatches(@RequestParam(required = false) BatchStatus status) {
        if (status != null) {
            return ResponseEntity.ok(transformationService.getBatchesByStatus(status));
        }
        return ResponseEntity.ok(transformationService.getAllBatches());
    }

    @GetMapping("/transformations/batches/{id}")
    public ResponseEntity<TransformationBatchDTO> getBatchById(@PathVariable Long id) {
        TransformationBatchDTO dto = transformationService.getBatchById(id);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/transformations/batches")
    public ResponseEntity<TransformationBatchDTO> launchBatch(@RequestBody TransformationBatchDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transformationService.launchBatch(dto));
    }

    @PostMapping("/transformations/batches/{id}/complete")
    public ResponseEntity<TransformationBatchDTO> completeBatch(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {

        Double actualQty = payload.get("actualQuantityProduced") != null ? Double.valueOf(payload.get("actualQuantityProduced").toString()) : null;
        Double wasteLoss = payload.get("wasteLossQuantity") != null ? Double.valueOf(payload.get("wasteLossQuantity").toString()) : null;
        String qualityNotes = payload.get("qualityNotes") != null ? payload.get("qualityNotes").toString() : null;
        Double ph = payload.get("phLevel") != null ? Double.valueOf(payload.get("phLevel").toString()) : null;

        TransformationBatchDTO completed = transformationService.completeBatch(id, actualQty, wasteLoss, qualityNotes, ph);
        return ResponseEntity.ok(completed);
    }

    @PutMapping("/transformations/batches/{id}")
    public ResponseEntity<TransformationBatchDTO> updateBatch(@PathVariable Long id, @RequestBody TransformationBatchDTO dto) {
        TransformationBatchDTO updated = transformationService.updateBatch(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/transformations/batches/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Long id) {
        transformationService.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/transformations/summary")
    public ResponseEntity<TransformationSummaryDTO> getSummary() {
        return ResponseEntity.ok(transformationService.getTransformationSummary());
    }

    // ==========================================
    // 3. PRODUCT STOCKS (/api/stocks)
    // ==========================================
    @GetMapping("/stocks")
    public ResponseEntity<List<ProductStockDTO>> getAllStocks() {
        return ResponseEntity.ok(productStockService.getAllAvailableStocks());
    }

    @GetMapping("/stocks/{id}")
    public ResponseEntity<ProductStockDTO> getStockById(@PathVariable Long id) {
        ProductStockDTO dto = productStockService.getStockById(id);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/stocks")
    public ResponseEntity<ProductStockDTO> createOrUpdateStock(@RequestBody ProductStockDTO dto) {
        return ResponseEntity.ok(productStockService.createOrUpdateStock(dto));
    }

    @DeleteMapping("/stocks/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        productStockService.deleteStock(id);
        return ResponseEntity.noContent().build();
    }
}
