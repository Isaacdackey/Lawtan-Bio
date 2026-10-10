package com.lawtan.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedigreeDTO {
    private Long id;
    private Long animalId;
    private String animalInternalId;
    private String animalName;
    private String subjectNote;

    // Father
    private String fatherName;
    private String fatherEarTag;
    private String fatherBreed;
    private String fatherNote;

    // Mother
    private String motherName;
    private String motherEarTag;
    private String motherBreed;
    private String motherNote;

    // Grandparents
    private String grandFatherPaternal;
    private String grandMotherPaternal;
    private String grandFatherMaternal;
    private String grandMotherMaternal;

    // Semen
    private Double semenMobilityPercentage;
    private Double semenConcentration;
    private Double semenMorphologyOkPercentage;
    private Integer semenDosesAvailable;
}
