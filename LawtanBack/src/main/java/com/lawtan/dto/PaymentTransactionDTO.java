package com.lawtan.dto;

import com.lawtan.model.PaymentMethod;
import java.time.LocalDateTime;

public class PaymentTransactionDTO {
    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private LocalDateTime paymentDate;
    private Double amountPaidFcfa;
    private PaymentMethod paymentMethod;
    private String transactionReference;
    private String receiptNumber;
    private String receivedBy;
    private String notes;

    public PaymentTransactionDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

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
