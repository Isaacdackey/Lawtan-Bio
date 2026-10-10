package com.lawtan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lawtan.model.MilkSession;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "milk_productions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkProduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    @JsonIgnore
    private Animal animal;

    private LocalDate productionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MilkSession session; // MORNING, EVENING

    @Column(nullable = false)
    private Double volumeLiters;

    private Double milkTemperature; // e.g. 34.2 °C

    private Double fatPercentage; // e.g. 3.9 % MG

    @Column(length = 100)
    private String destinationTank; // e.g. Cuve Réfrigérée N°1 (Bio)

    @Builder.Default
    private Boolean isOrganicCompliant = true;
}
