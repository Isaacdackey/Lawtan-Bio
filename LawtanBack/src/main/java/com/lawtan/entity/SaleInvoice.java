package com.lawtan.entity;

import com.lawtan.model.InvoiceStatus;
import com.lawtan.model.PaymentMethod;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sale_invoices")
public class SaleInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNumber; // Ex: FAC-2026-0001

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private LocalDate issueDate;

    private LocalDate dueDate;

    @Column(nullable = false)
    private Double subTotalFcfa = 0.0;

    private Double discountFcfa = 0.0;

    private Double taxFcfa = 0.0;

    @Column(nullable = false)
    private Double totalAmountFcfa = 0.0;

    private Double paidAmountFcfa = 0.0;

    private Double remainingAmountFcfa = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.ISSUED;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String paymentReference;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceItem> items = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    public SaleInvoice() {}

    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
        recalculateTotals();
    }

    public void removeItem(InvoiceItem item) {
        items.remove(item);
        item.setInvoice(null);
        recalculateTotals();
    }

    public void recalculateTotals() {
        double sub = 0.0;
        for (InvoiceItem item : items) {
            if (item.getLineTotalFcfa() != null) {
                sub += item.getLineTotalFcfa();
            }
        }
        this.subTotalFcfa = sub;
        double discount = (this.discountFcfa != null) ? this.discountFcfa : 0.0;
        this.totalAmountFcfa = Math.max(0, sub - discount);
        double paid = (this.paidAmountFcfa != null) ? this.paidAmountFcfa : 0.0;
        this.remainingAmountFcfa = Math.max(0, this.totalAmountFcfa - paid);

        if (this.status != InvoiceStatus.CANCELLED && this.status != InvoiceStatus.DRAFT) {
            if (this.remainingAmountFcfa <= 0 && this.totalAmountFcfa > 0) {
                this.status = InvoiceStatus.PAID;
            } else if (paid > 0) {
                this.status = InvoiceStatus.PARTIALLY_PAID;
            } else {
                this.status = InvoiceStatus.ISSUED;
            }
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Double getSubTotalFcfa() { return subTotalFcfa; }
    public void setSubTotalFcfa(Double subTotalFcfa) { this.subTotalFcfa = subTotalFcfa; }

    public Double getDiscountFcfa() { return discountFcfa; }
    public void setDiscountFcfa(Double discountFcfa) { this.discountFcfa = discountFcfa; }

    public Double getTaxFcfa() { return taxFcfa; }
    public void setTaxFcfa(Double taxFcfa) { this.taxFcfa = taxFcfa; }

    public Double getTotalAmountFcfa() { return totalAmountFcfa; }
    public void setTotalAmountFcfa(Double totalAmountFcfa) { this.totalAmountFcfa = totalAmountFcfa; }

    public Double getPaidAmountFcfa() { return paidAmountFcfa; }
    public void setPaidAmountFcfa(Double paidAmountFcfa) { this.paidAmountFcfa = paidAmountFcfa; }

    public Double getRemainingAmountFcfa() { return remainingAmountFcfa; }
    public void setRemainingAmountFcfa(Double remainingAmountFcfa) { this.remainingAmountFcfa = remainingAmountFcfa; }

    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<InvoiceItem> getItems() { return items; }
    public void setItems(List<InvoiceItem> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
