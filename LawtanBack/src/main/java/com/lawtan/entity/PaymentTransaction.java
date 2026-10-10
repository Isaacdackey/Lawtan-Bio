package com.lawtan.entity;

import com.lawtan.model.PaymentMethod;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    private SaleInvoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Column(nullable = false)
    private Double amountPaidFcfa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    private String transactionReference;

    private String receiptNumber; // Ex: REC-2026-0001

    private String receivedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public PaymentTransaction() {}

    public PaymentTransaction(SaleInvoice invoice, Customer customer, Double amountPaidFcfa, PaymentMethod paymentMethod, String transactionReference, String receiptNumber, String receivedBy, String notes) {
        this.invoice = invoice;
        this.customer = customer;
        this.amountPaidFcfa = amountPaidFcfa;
        this.paymentMethod = paymentMethod;
        this.transactionReference = transactionReference;
        this.receiptNumber = receiptNumber;
        this.receivedBy = receivedBy;
        this.notes = notes;
        this.paymentDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SaleInvoice getInvoice() { return invoice; }
    public void setInvoice(SaleInvoice invoice) { this.invoice = invoice; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public Double getAmountPaidFcfa() { return amountPaidFcfa; }
    public void setAmountPaidFcfa(Double amountPaidFcfa) { this.amountPaidFcfa = amountPaidFcfa; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
