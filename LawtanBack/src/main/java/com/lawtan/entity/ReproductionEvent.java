package com.lawtan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lawtan.model.ReproEventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "reproduction_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReproductionEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    @JsonIgnore
    private Animal animal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReproEventType eventType;

    private LocalDate eventDate;

    @Column(length = 20)
    private String eventTime; // Heure (ex: 12:29, 10:30)

    @Column(length = 100)
    private String cowMasterTypeOriginal; // Gives Birth, Preg Check, Inseminated, etc.

    @Column(length = 100)
    private String bullOrSemenUsed; // e.g. KADER (FL-010) - Semence A+, SULTAN (USA)

    @Column(length = 100)
    private String method; // Semence sexee / Saillie directe / Transfert d'embryon

    @Column(length = 100)
    private String result; // Positif / Negatif / Confirme / Difficile

    @Column(length = 100)
    private String pathology; // Mammite, Tripanosomose...

    @Column(length = 255)
    private String treatment; // Tridex, Deparasitant sanguin...

    @Column(length = 100)
    private String operatorName; // e.g. Dr. Fall, Technicien

    private LocalDate expectedDryOffDate; // Calculated Dry-off date

    private LocalDate expectedCalvingDate; // ~282 days after AI

    @Column(length = 1000)
    private String observations;

    @Builder.Default
    private Boolean isConfirmed = false;
}
