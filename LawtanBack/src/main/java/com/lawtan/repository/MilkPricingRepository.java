package com.lawtan.repository;

import com.lawtan.entity.MilkPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MilkPricingRepository extends JpaRepository<MilkPricing, Long> {
    Optional<MilkPricing> findTopByOrderByIdAsc();
}
