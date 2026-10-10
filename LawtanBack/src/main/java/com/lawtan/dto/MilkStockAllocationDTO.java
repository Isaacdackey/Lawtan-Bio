package com.lawtan.dto;

import lombok.*;

/**
 * Etat des stocks de lait.
 *
 * Les soldes sont CUMULES et non journaliers : le lait collecte et non ventile,
 * comme le lait ventile et non encore vendu ou transforme, reste en stock tant
 * qu'il n'a pas ete consomme. Seuls les champs suffixes "Today" sont journaliers.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkStockAllocationDTO {

    private String allocationDate;        // Journee de reference

    // --- Journee en cours ---------------------------------------------------
    private Double collectedToday;             // Traites enregistrees aujourd'hui
    private Double directSaleAllocatedToday;   // Ventile aujourd'hui vers la vente directe
    private Double productionAllocatedToday;   // Ventile aujourd'hui vers la transformation
    private Double calvesAllocatedToday;       // Ventile aujourd'hui vers les veaux

    // --- Soldes cumules (stock reel) ----------------------------------------
    private Double grossVolumeCollected;  // Total collecte depuis l'origine

    private Double directSaleVolume;      // Total alloue a la vente directe
    private Double directSaleConsumed;    // Total deja ecoule
    private Double directSaleAvailable;   // Solde disponible a la vente

    private Double productionVolume;      // Total alloue a la transformation
    private Double productionConsumed;    // Total preleve par les ordres de fabrication
    private Double productionAvailable;   // Solde disponible pour fabriquer

    private Double calvesVolume;          // Total alloue a l'allaitement des veaux

    private Double unallocatedVolume;     // Lait collecte jamais ventile, report inclus

    /** Lait physiquement encore en cuve : non ventile + soldes vente et transformation. */
    private Double milkInTank;

    private String notes;
}
