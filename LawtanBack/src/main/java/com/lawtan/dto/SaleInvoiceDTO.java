package com.lawtan.dto;

import com.lawtan.model.InvoiceStatus;
import com.lawtan.model.PaymentMethod;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class SaleInvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAddress;
    private String customerNinea;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private Double subTotalFcfa;
    private Double discountFcfa;
    private Double taxFcfa;
    private Double totalAmountFcfa;
    private Double paidAmountFcfa;
    private Double remainingAmountFcfa;
    private InvoiceStatus status;
    private PaymentMethod paymentMethod;
    private String paymentReference;
    private String notes;
    private List<InvoiceItemDTO> items;
    private LocalDateTime createdAt;

    public SaleInvoiceDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public String getCustomerNinea() { return customerNinea; }
    public void setCustomerNinea(String customerNinea) { this.customerNinea = customerNinea; }

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

    public List<InvoiceItemDTO> getItems() { return items; }
    public void setItems(List<InvoiceItemDTO> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
