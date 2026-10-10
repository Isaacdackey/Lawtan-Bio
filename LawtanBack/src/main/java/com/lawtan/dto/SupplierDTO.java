package com.lawtan.dto;

import java.time.LocalDateTime;

public class SupplierDTO {

    private Long id;
    private String name;
    private String companyName;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String category;
    private String nineaNumber;
    private String paymentTerms;
    private Integer totalOrdersCount;
    private Double totalSpentFcfa;
    private Boolean bioCertified;
    private Boolean active;
    private String notes;
    private LocalDateTime createdAt;

    public SupplierDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getNineaNumber() { return nineaNumber; }
    public void setNineaNumber(String nineaNumber) { this.nineaNumber = nineaNumber; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public Integer getTotalOrdersCount() { return totalOrdersCount; }
    public void setTotalOrdersCount(Integer totalOrdersCount) { this.totalOrdersCount = totalOrdersCount; }

    public Double getTotalSpentFcfa() { return totalSpentFcfa; }
    public void setTotalSpentFcfa(Double totalSpentFcfa) { this.totalSpentFcfa = totalSpentFcfa; }

    public Boolean getBioCertified() { return bioCertified; }
    public void setBioCertified(Boolean bioCertified) { this.bioCertified = bioCertified; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
