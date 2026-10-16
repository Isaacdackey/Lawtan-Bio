package com.lawtan.entity;

import com.lawtan.model.FodderCropStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Culture fourragère (parcelle / campagne) — objectif « Gestion des cultures fourragères » du cadrage.
 * Les coûts saisis + les récoltes permettent de calculer le coût de production du fourrage (KPI du cadrage).
 */
@Entity
@Table(name = "fodder_crops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FodderCrop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String parcelName; // ex: Parcelle Nord

    @Column(nullable = false, length = 100)
    private String cropType; // ex: Sorgho fourrager, Panicum maximum, Niébé fourrager

    @Column(nullable = false)
    private Double areaHectares;

    private LocalDate plantingDate;

    private LocalDate expectedHarvestDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FodderCropStatus status = FodderCropStatus.PLANNED;

    private Double expectedYieldKg;

    @Column(length = 30)
    private String irrigationType; // ex: PLUVIAL, GOUTTE_A_GOUTTE, ASPERSION

    @Column(nullable = false)
    @Builder.Default
    private Double seedCostFcfa = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double fertilizerCostFcfa = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double laborCostFcfa = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double irrigationCostFcfa = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double otherCostFcfa = 0.0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "crop", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("harvestDate DESC, id DESC")
    @Builder.Default
    private List<FodderHarvest> harvests = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}