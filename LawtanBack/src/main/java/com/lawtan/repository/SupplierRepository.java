package com.lawtan.repository;

import com.lawtan.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByActiveTrueOrderByNameAsc();
    List<Supplier> findByCategoryIgnoreCaseAndActiveTrue(String category);
    List<Supplier> findByNameContainingIgnoreCaseOrCompanyNameContainingIgnoreCaseOrContactPersonContainingIgnoreCase(
            String name, String companyName, String contactPerson
    );

    boolean existsByPhoneAndActiveTrue(String phone);
    boolean existsByPhoneAndActiveTrueAndIdNot(String phone, Long id);

    boolean existsByEmailIgnoreCaseAndActiveTrue(String email);
    boolean existsByEmailIgnoreCaseAndActiveTrueAndIdNot(String email, Long id);

    boolean existsByNineaNumberAndActiveTrue(String nineaNumber);
    boolean existsByNineaNumberAndActiveTrueAndIdNot(String nineaNumber, Long id);
}
