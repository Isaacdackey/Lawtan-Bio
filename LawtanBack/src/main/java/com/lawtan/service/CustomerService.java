package com.lawtan.service;

import com.lawtan.dto.CustomerDTO;
import com.lawtan.model.CustomerType;
import java.util.List;

public interface CustomerService {
    List<CustomerDTO> getAllCustomers();
    List<CustomerDTO> getCustomersByType(CustomerType customerType);
    CustomerDTO getCustomerById(Long id);
    CustomerDTO createCustomer(CustomerDTO customerDTO);
    CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO);
    void deleteCustomer(Long id);
}
