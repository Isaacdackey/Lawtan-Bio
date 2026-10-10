package com.lawtan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "vaccine_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccineSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String vaccineType; // e.g. Rappel Fièvre Aphteuse, PPCB, Déparasitage

    @Column(nullable = false, length = 100)
    private String targetHerd; // e.g. Tout le troupeau (13 animaux), Vaches en lactation (7 têtes)

    private LocalDate scheduledDate;

    @Column(length = 100)
    private String practitioner; // e.g. Dr. Fall

    private Double estimatedCost; // in FCFA

    @Column(length = 50)
    private String status; // e.g. Dans 2 jours, Planifié, Effectué

    @Column(length = 500)
    private String notes;
}
