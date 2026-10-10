package com.lawtan.dto;

import com.lawtan.model.CustomerType;
import java.time.LocalDateTime;

public class CustomerDTO {
    private Long id;
    private String name;
    private String companyName;
    private CustomerType customerType;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String nineaNumber;
    private Integer totalOrdersCount;
    private Double totalSpentFcfa;
    private Double balanceDueFcfa;
    private String notes;
    private Boolean active = true;
    private LocalDateTime createdAt;

    public CustomerDTO() {}

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
