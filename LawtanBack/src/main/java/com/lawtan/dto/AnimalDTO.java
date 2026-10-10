package com.lawtan.dto;

import com.lawtan.model.AnimalCategory;
import com.lawtan.model.AnimalStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnimalDTO {
    private Long id;
    private String internalId;
    private String name;
    private String earTagNumber;
    private String rfidCode;
    private String breed;
    private LocalDate birthDate;
    private Double ageYears;
    private String gender; // FEMALE / MALE
    private String genderLabel;
    private AnimalCategory category;
    private String categoryLabel;
    private AnimalStatus status;
    private String statusLabel;
    private Double weight;
    private Double temperature;
    private Double dailyMilkYield;
    private Integer lactationNumber;
    private Integer daysInMilk;
    private Double totalLactationMilk;
    private String reproStatus;
    private String avatarEmoji;
    private String imageUrl;
    private String origin;
    private String notes;
    private PedigreeDTO pedigree;

    // Champs spécifiques CowMaster
    private Integer daysOpen;
    private String motherId;
    private String fatherId;
    private String fatherDescription;
    private String lactationStatus;
    private String reproStatusDetailed;
    private Integer gestationDays;
    private LocalDate expectedCalvingDate;
    private LocalDate expectedDryOffDate;
    private LocalDate lastInseminationDate;
    private LocalDate arrivalDate;
    private LocalDate deathDate;
    private String originLot;
    private Integer descendantsCount;
    private Boolean cullingRecommended;
    private String cowMasterAlert;
    private String sourceRecord;
}

