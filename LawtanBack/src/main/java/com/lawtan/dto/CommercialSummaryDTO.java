package com.lawtan.dto;

public class CommercialSummaryDTO {
    private Double totalRevenueFcfa;
    private Double totalCollectedFcfa;
    private Double totalOutstandingFcfa;
    private Long totalInvoicesCount;
    private Long paidInvoicesCount;
    private Long pendingInvoicesCount;
    private Long totalCustomersCount;
    private Double averageOrderValueFcfa;

    public CommercialSummaryDTO() {}

    public CommercialSummaryDTO(Double totalRevenueFcfa, Double totalCollectedFcfa, Double totalOutstandingFcfa, Long totalInvoicesCount, Long paidInvoicesCount, Long pendingInvoicesCount, Long totalCustomersCount, Double averageOrderValueFcfa) {
        this.totalRevenueFcfa = totalRevenueFcfa;
        this.totalCollectedFcfa = totalCollectedFcfa;
        this.totalOutstandingFcfa = totalOutstandingFcfa;
        this.totalInvoicesCount = totalInvoicesCount;
        this.paidInvoicesCount = paidInvoicesCount;
        this.pendingInvoicesCount = pendingInvoicesCount;
        this.totalCustomersCount = totalCustomersCount;
        this.averageOrderValueFcfa = averageOrderValueFcfa;
    }

    // Getters and Setters
    public Double getTotalRevenueFcfa() { return totalRevenueFcfa; }
    public void setTotalRevenueFcfa(Double totalRevenueFcfa) { this.totalRevenueFcfa = totalRevenueFcfa; }

    public Double getTotalCollectedFcfa() { return totalCollectedFcfa; }
    public void setTotalCollectedFcfa(Double totalCollectedFcfa) { this.totalCollectedFcfa = totalCollectedFcfa; }

    public Double getTotalOutstandingFcfa() { return totalOutstandingFcfa; }
    public void setTotalOutstandingFcfa(Double totalOutstandingFcfa) { this.totalOutstandingFcfa = totalOutstandingFcfa; }

    public Long getTotalInvoicesCount() { return totalInvoicesCount; }
    public void setTotalInvoicesCount(Long totalInvoicesCount) { this.totalInvoicesCount = totalInvoicesCount; }

    public Long getPaidInvoicesCount() { return paidInvoicesCount; }
    public void setPaidInvoicesCount(Long paidInvoicesCount) { this.paidInvoicesCount = paidInvoicesCount; }

    public Long getPendingInvoicesCount() { return pendingInvoicesCount; }
    public void setPendingInvoicesCount(Long pendingInvoicesCount) { this.pendingInvoicesCount = pendingInvoicesCount; }

    public Long getTotalCustomersCount() { return totalCustomersCount; }
    public void setTotalCustomersCount(Long totalCustomersCount) { this.totalCustomersCount = totalCustomersCount; }

    public Double getAverageOrderValueFcfa() { return averageOrderValueFcfa; }
    public void setAverageOrderValueFcfa(Double averageOrderValueFcfa) { this.averageOrderValueFcfa = averageOrderValueFcfa; }
}
