package com.lawtan.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String companyName;

    private String contactPerson;

    private String phone;

    private String email;

    private String address;

    private String city;

    private String category; // FOURRAGE_ALIMENT, EMBALLAGE_PACKAGING, EQUIPEMENT_PIECES, VETERINAIRE_SANTE, AUTRE

    private String nineaNumber;

    private String paymentTerms; // Immédiat, Wave / OM, 30 jours fin de mois

    private Integer totalOrdersCount = 0;

    private Double totalSpentFcfa = 0.0;

    private Boolean bioCertified = true;

    private Boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Supplier() {}

    public Supplier(String name, String companyName, String contactPerson, String phone, String email, String address, String city, String category, String paymentTerms, Boolean bioCertified) {
        this.name = name;
        this.companyName = companyName;
        this.contactPerson = contactPerson;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.city = city;
        this.category = category;
        this.paymentTerms = paymentTerms;
        this.bioCertified = bioCertified;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
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
