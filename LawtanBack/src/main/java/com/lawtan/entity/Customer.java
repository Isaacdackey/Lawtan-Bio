package com.lawtan.entity;

import com.lawtan.model.CustomerType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerType customerType;

    private String phone;

    private String email;

    private String address;

    private String city;

    private String nineaNumber;

    private Integer totalOrdersCount = 0;

    private Double totalSpentFcfa = 0.0;

    private Double balanceDueFcfa = 0.0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Customer() {}

    public Customer(String name, String companyName, CustomerType customerType, String phone, String email, String address, String city, String nineaNumber) {
        this.name = name;
        this.companyName = companyName;
        this.customerType = customerType;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.city = city;
        this.nineaNumber = nineaNumber;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public CustomerType getCustomerType() { return customerType; }
    public void setCustomerType(CustomerType customerType) { this.customerType = customerType; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getNineaNumber() { return nineaNumber; }
    public void setNineaNumber(String nineaNumber) { this.nineaNumber = nineaNumber; }

    public Integer getTotalOrdersCount() { return totalOrdersCount; }
    public void setTotalOrdersCount(Integer totalOrdersCount) { this.totalOrdersCount = totalOrdersCount; }

    public Double getTotalSpentFcfa() { return totalSpentFcfa; }
    public void setTotalSpentFcfa(Double totalSpentFcfa) { this.totalSpentFcfa = totalSpentFcfa; }

    public Double getBalanceDueFcfa() { return balanceDueFcfa; }
    public void setBalanceDueFcfa(Double balanceDueFcfa) { this.balanceDueFcfa = balanceDueFcfa; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
