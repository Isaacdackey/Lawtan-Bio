package com.lawtan.repository;

import com.lawtan.entity.Customer;
import com.lawtan.model.CustomerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByActiveTrueOrderByTotalSpentFcfaDesc();
    List<Customer> findByCustomerTypeAndActiveTrue(CustomerType customerType);
    
    Optional<Customer> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndIdNot(String phone, Long id);

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByNineaNumber(String nineaNumber);
    boolean existsByNineaNumberAndIdNot(String nineaNumber, Long id);
}
