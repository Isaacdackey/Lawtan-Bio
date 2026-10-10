package com.lawtan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Ventilation journalière du lait collecté : la répartition décidée par l'exploitant
 * entre vente directe, transformation et allaitement des veaux. Une ligne par journée.
 * Seules les décisions manuelles sont stockées ; les soldes sont recalculés à la lecture.
 */
@Entity
@Table(name = "milk_stock_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkStockAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate allocationDate;

    @Builder.Default
    private Double directSaleVolume = 0.0;

    @Builder.Default
    private Double productionVolume = 0.0;

    @Builder.Default
    private Double calvesVolume = 0.0;

    /** Lait de vente directe effectivement écoulé, enregistré au fil des ventes. */
    @Builder.Default
    private Double directSaleConsumed = 0.0;

    @Column(length = 255)
    private String notes;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
