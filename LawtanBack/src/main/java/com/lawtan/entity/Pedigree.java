package com.lawtan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pedigrees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedigree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false, unique = true)
    @JsonIgnore
    private Animal animal;

    // Subject note
    @Column(length = 255)
    private String subjectNote;

    // Father (Paternal tier)
    @Column(length = 100)
    private String fatherName; // e.g. SULTAN (USA-42891)

    @Column(length = 50)
    private String fatherEarTag; // Marque auriculaire du père

    @Column(length = 100)
    private String fatherBreed; // e.g. Holstein Champion USA

    @Column(length = 255)
    private String fatherNote; // e.g. Semence Importée A+

    // Mother (Maternal tier)
    @Column(length = 100)
    private String motherName; // e.g. NAFI (SN-0129)

    @Column(length = 50)
    private String motherEarTag; // Marque auriculaire de la mère

    @Column(length = 100)
    private String motherBreed; // e.g. Montbéliarde x Gobra

    @Column(length = 255)
    private String motherNote; // e.g. Record : 24 L/j

    // Grand-Parents (Tier 3)
    @Column(length = 100)
    private String grandFatherPaternal; // e.g. KING (CAN-8821)

    @Column(length = 100)
    private String grandMotherPaternal; // e.g. BELLA (USA-3341)

    @Column(length = 100)
    private String grandFatherMaternal; // e.g. MOUSSA (SN-0045)

    @Column(length = 100)
    private String grandMotherMaternal; // e.g. DIOUMA (SN-0048)

    // For breeder bulls
    private Double semenMobilityPercentage; // e.g. 85.0
    private Double semenConcentration; // e.g. 1.2
    private Double semenMorphologyOkPercentage; // e.g. 90.0
    private Integer semenDosesAvailable; // e.g. 12
}
