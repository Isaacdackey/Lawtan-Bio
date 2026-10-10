package com.lawtan.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TankStatusDTO {
    private String tankName;
    private Double currentVolume; // Solde net disponible en cuve (ex: 125L)
    private Double grossVolumeCollected; // Total brut collecté aujourd'hui (ex: 155L)
    private Double transformedVolume; // Total prélevé/consommé en transformation (ex: 30L)
    private Double maxCapacity;
    private Double fillPercentage;
    private Double temperature;
    private Double phLevel;
    private String qualityStatus;
    private String targetBatch;
    private Double morningVolume;
    private Double eveningVolume;
    private LocalDate collectionDate;
    private MilkStockAllocationDTO stockAllocation;
}
