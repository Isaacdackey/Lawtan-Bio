package com.lawtan.service;

import com.lawtan.dto.MilkHistoryDTO;
import com.lawtan.dto.MilkProductionDTO;
import com.lawtan.dto.MilkPricingDTO;
import com.lawtan.dto.MilkStockAllocationDTO;
import com.lawtan.dto.TankStatusDTO;

import java.time.LocalDate;
import java.util.List;

public interface MilkProductionService {
    List<MilkProductionDTO> getAllMilkProductions();
    List<MilkProductionDTO> getProductionsByDate(LocalDate date);
    List<MilkProductionDTO> getProductionsByAnimal(Long animalId);
    MilkProductionDTO recordMilkProduction(MilkProductionDTO dto);
    TankStatusDTO getTankStatus();

    /** Ventilation du lait pour une journee (celle du jour si la date est nulle). */
    MilkStockAllocationDTO getStockAllocation(LocalDate date);

    /** Enregistre la repartition decidee par l'exploitant. */
    MilkStockAllocationDTO saveStockAllocation(MilkStockAllocationDTO dto);

    /** Ajoute des litres ecoules en vente directe sur la journee. */
    MilkStockAllocationDTO recordDirectSaleConsumption(LocalDate date, Double liters);

    /** Tarif de vente du litre de lait cru. Prix nul tant qu'aucun tarif n'est fixe. */
    MilkPricingDTO getMilkPricing();

    /** Enregistre un nouveau tarif au litre. */
    MilkPricingDTO updateMilkPricing(MilkPricingDTO dto);
    List<MilkHistoryDTO> getMilkHistory(int days);
}
