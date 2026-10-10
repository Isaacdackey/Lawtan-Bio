package com.lawtan.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "feed_rations")
public class FeedRation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String rationName;

    private String targetCategory; // Vaches Haute Lactation, Début/Milieu Lactation, Vaches Taries, Génisses

    private Double dailyDryMatterKg;

    @Column(columnDefinition = "TEXT")
    private String compositionDescription;

    private Double dailyCostFcfa;

    private Double energyUfl;

    private Double proteinPdiGrams;

    public FeedRation() {}

    public FeedRation(String rationName, String targetCategory, Double dailyDryMatterKg, String compositionDescription, Double dailyCostFcfa, Double energyUfl, Double proteinPdiGrams) {
        this.rationName = rationName;
        this.targetCategory = targetCategory;
        this.dailyDryMatterKg = dailyDryMatterKg;
        this.compositionDescription = compositionDescription;
        this.dailyCostFcfa = dailyCostFcfa;
        this.energyUfl = energyUfl;
        this.proteinPdiGrams = proteinPdiGrams;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRationName() { return rationName; }
    public void setRationName(String rationName) { this.rationName = rationName; }

    public String getTargetCategory() { return targetCategory; }
    public void setTargetCategory(String targetCategory) { this.targetCategory = targetCategory; }

    public Double getDailyDryMatterKg() { return dailyDryMatterKg; }
    public void setDailyDryMatterKg(Double dailyDryMatterKg) { this.dailyDryMatterKg = dailyDryMatterKg; }

    public String getCompositionDescription() { return compositionDescription; }
    public void setCompositionDescription(String compositionDescription) { this.compositionDescription = compositionDescription; }

    public Double getDailyCostFcfa() { return dailyCostFcfa; }
    public void setDailyCostFcfa(Double dailyCostFcfa) { this.dailyCostFcfa = dailyCostFcfa; }

    public Double getEnergyUfl() { return energyUfl; }
    public void setEnergyUfl(Double energyUfl) { this.energyUfl = energyUfl; }

    public Double getProteinPdiGrams() { return proteinPdiGrams; }
    public void setProteinPdiGrams(Double proteinPdiGrams) { this.proteinPdiGrams = proteinPdiGrams; }
}
