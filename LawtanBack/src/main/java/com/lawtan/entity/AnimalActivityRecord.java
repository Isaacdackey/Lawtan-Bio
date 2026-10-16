package com.lawtan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "animal_activity_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {"animal_id", "record_date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnimalActivityRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private LocalDate recordDate;

    private Integer stepsCount;        // nombre de pas / jour
    private Integer activeMinutes;     // minutes d'activité
    private Integer restingMinutes;    // minutes de repos couché
    private Integer ruminationMinutes; // minutes de rumination

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String source = "MANUAL"; // MANUAL, COLLAR, RFID

    @Column(columnDefinition = "TEXT")
    private String notes;
}