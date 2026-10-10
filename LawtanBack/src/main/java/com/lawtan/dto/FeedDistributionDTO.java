package com.lawtan.dto;

import java.time.LocalDate;

public class FeedDistributionDTO {
    private Long id;
    private Long rationId;
    private String rationName;
    private LocalDate distributionDate;
    private String distributionTime;
    private String session;
    private Double quantityDistributedKg;
    private Integer animalsCountNourished;
    private String targetGroupOrRace;
    private String distributorName;
    private Double totalCostFcfa;
    private String notes;

    public FeedDistributionDTO() {}

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
