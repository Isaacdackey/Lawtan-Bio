package com.lawtan.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "feed_distributions")
public class FeedDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long rationId;

    @Column(nullable = false)
    private String rationName;

    private LocalDate distributionDate;

    private String distributionTime;

    private String session; // MATIN, MIDI, SOIR

    private Double quantityDistributedKg;

    private Integer animalsCountNourished;

    private String targetGroupOrRace;

    private String distributorName;

    private Double totalCostFcfa;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public FeedDistribution() {}

    public FeedDistribution(Long rationId, String rationName, LocalDate distributionDate, String distributionTime, String session, Double quantityDistributedKg, Integer animalsCountNourished, String targetGroupOrRace, String distributorName, Double totalCostFcfa, String notes) {
        this.rationId = rationId;
        this.rationName = rationName;
        this.distributionDate = distributionDate;
        this.distributionTime = distributionTime;
        this.session = session;
        this.quantityDistributedKg = quantityDistributedKg;
        this.animalsCountNourished = animalsCountNourished;
        this.targetGroupOrRace = targetGroupOrRace;
        this.distributorName = distributorName;
        this.totalCostFcfa = totalCostFcfa;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRationId() { return rationId; }
    public void setRationId(Long rationId) { this.rationId = rationId; }

    public String getRationName() { return rationName; }
    public void setRationName(String rationName) { this.rationName = rationName; }

    public LocalDate getDistributionDate() { return distributionDate; }
    public void setDistributionDate(LocalDate distributionDate) { this.distributionDate = distributionDate; }

    public String getDistributionTime() { return distributionTime; }
    public void setDistributionTime(String distributionTime) { this.distributionTime = distributionTime; }

    public String getSession() { return session; }
    public void setSession(String session) { this.session = session; }

    public Double getQuantityDistributedKg() { return quantityDistributedKg; }
    public void setQuantityDistributedKg(Double quantityDistributedKg) { this.quantityDistributedKg = quantityDistributedKg; }

    public Integer getAnimalsCountNourished() { return animalsCountNourished; }
    public void setAnimalsCountNourished(Integer animalsCountNourished) { this.animalsCountNourished = animalsCountNourished; }

    public String getTargetGroupOrRace() { return targetGroupOrRace; }
    public void setTargetGroupOrRace(String targetGroupOrRace) { this.targetGroupOrRace = targetGroupOrRace; }

    public String getDistributorName() { return distributorName; }
    public void setDistributorName(String distributorName) { this.distributorName = distributorName; }

    public Double getTotalCostFcfa() { return totalCostFcfa; }
    public void setTotalCostFcfa(Double totalCostFcfa) { this.totalCostFcfa = totalCostFcfa; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
