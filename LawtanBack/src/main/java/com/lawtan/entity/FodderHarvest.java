package com.lawtan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "fodder_harvests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FodderHarvest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "crop_id", nullable = false)
    private FodderCrop crop;

    @Column(nullable = false)
    private LocalDate harvestDate;

    @Column(nullable = false)
    private Double quantityKg;

    private Double dryMatterPercent; 

    @Column(columnDefinition = "TEXT")
    private String notes;
}