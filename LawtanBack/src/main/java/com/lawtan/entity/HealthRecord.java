package com.lawtan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "health_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    @JsonIgnore
    private Animal animal;

    private LocalDate recordDate;

    @Column(nullable = false, length = 100)
    private String actType; // e.g. Traitement Pathologie, Vaccination, Bilan pré-insémination

    @Column(length = 500)
    private String diagnosis; // e.g. Fièvre 39.8°C / Traitement antibiotique

    @Column(length = 500)
    private String treatmentPrescription;

    @Column(length = 100)
    private String practitionerName; // e.g. Dr. Fall

    private Double costFcfa; // e.g. 12500.0

    @Column(length = 50)
    private String status; // e.g. En cours, Terminé, Apte IA

    private Integer milkWithdrawalDays; // Délai d'attente lait en jours
}
