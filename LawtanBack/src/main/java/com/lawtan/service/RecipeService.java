package com.lawtan.service;

import com.lawtan.dto.RecipeDTO;
import com.lawtan.model.ProductType;

import java.util.List;

public interface RecipeService {
    List<RecipeDTO> getAllRecipes();
    RecipeDTO getRecipeById(Long id);
    List<RecipeDTO> getRecipesByType(ProductType type);
    RecipeDTO createRecipe(RecipeDTO dto);
    RecipeDTO updateRecipe(Long id, RecipeDTO dto);
    void deleteRecipe(Long id);
}
