package com.lawtan.service.impl;

import com.lawtan.dto.RecipeDTO;
import com.lawtan.entity.Recipe;
import com.lawtan.model.ProductType;
import com.lawtan.repository.RecipeRepository;
import com.lawtan.service.RecipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RecipeDTO> getAllRecipes() {
        return recipeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeDTO getRecipeById(Long id) {
        return recipeRepository.findById(id)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeDTO> getRecipesByType(ProductType type) {
        return recipeRepository.findByProductType(type).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RecipeDTO createRecipe(RecipeDTO dto) {
        Recipe recipe = Recipe.builder()
                .code(dto.getCode() != null ? dto.getCode() : "REC-" + System.currentTimeMillis())
                .name(dto.getName())
                .productType(dto.getProductType() != null ? dto.getProductType() : ProductType.CHEESE)
                .targetUnit(dto.getTargetUnit())
                .milkLitersPerUnit(dto.getMilkLitersPerUnit() != null ? dto.getMilkLitersPerUnit() : 1.0)
                .ingredientsList(dto.getIngredientsList())
                .shelfLifeDays(dto.getShelfLifeDays() != null ? dto.getShelfLifeDays() : 30)
                .processInstructions(dto.getProcessInstructions())
                .emoji(dto.getEmoji() != null ? dto.getEmoji() : "🥛")
                .standardSellingPriceFcfa(dto.getStandardSellingPriceFcfa())
                .build();

        Recipe saved = recipeRepository.save(recipe);
        log.info("Nouvelle recette créée : {} ({})", saved.getName(), saved.getCode());
        return toDTO(saved);
    }

    @Override
    public RecipeDTO updateRecipe(Long id, RecipeDTO dto) {
        return recipeRepository.findById(id).map(recipe -> {
            recipe.setName(dto.getName());
            if (dto.getCode() != null) recipe.setCode(dto.getCode());
            if (dto.getProductType() != null) recipe.setProductType(dto.getProductType());
            recipe.setTargetUnit(dto.getTargetUnit());
            recipe.setMilkLitersPerUnit(dto.getMilkLitersPerUnit());
            recipe.setIngredientsList(dto.getIngredientsList());
            recipe.setShelfLifeDays(dto.getShelfLifeDays());
            recipe.setProcessInstructions(dto.getProcessInstructions());
            if (dto.getEmoji() != null) recipe.setEmoji(dto.getEmoji());
            recipe.setStandardSellingPriceFcfa(dto.getStandardSellingPriceFcfa());
            return toDTO(recipeRepository.save(recipe));
        }).orElse(null);
    }

    @Override
    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }

    private RecipeDTO toDTO(Recipe r) {
        return RecipeDTO.builder()
                .id(r.getId())
                .code(r.getCode())
                .name(r.getName())
                .productType(r.getProductType())
                .targetUnit(r.getTargetUnit())
                .milkLitersPerUnit(r.getMilkLitersPerUnit())
                .ingredientsList(r.getIngredientsList())
                .shelfLifeDays(r.getShelfLifeDays())
                .processInstructions(r.getProcessInstructions())
                .emoji(r.getEmoji())
                .standardSellingPriceFcfa(r.getStandardSellingPriceFcfa())
                .build();
    }
}
