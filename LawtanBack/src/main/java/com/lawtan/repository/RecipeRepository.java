package com.lawtan.repository;

import com.lawtan.entity.Recipe;
import com.lawtan.model.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    Optional<Recipe> findByCode(String code);
    List<Recipe> findByProductType(ProductType productType);
}
