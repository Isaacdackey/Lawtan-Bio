package com.lawtan.repository;

import com.lawtan.entity.Animal;
import com.lawtan.model.AnimalCategory;
import com.lawtan.model.AnimalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    Optional<Animal> findByInternalId(String internalId);

    Optional<Animal> findByEarTagNumber(String earTagNumber);

    List<Animal> findByCategory(AnimalCategory category);

    List<Animal> findByStatus(AnimalStatus status);

    @Query("SELECT a FROM Animal a LEFT JOIN FETCH a.pedigree WHERE a.internalId = :internalId")
    Optional<Animal> findByInternalIdWithPedigree(String internalId);

    @Query("SELECT a FROM Animal a LEFT JOIN FETCH a.pedigree ORDER BY a.id ASC")
    List<Animal> findAllWithPedigree();

    boolean existsByEarTagNumber(String earTagNumber);
    boolean existsByEarTagNumberAndInternalIdNot(String earTagNumber, String internalId);

    boolean existsByRfidCode(String rfidCode);
    boolean existsByRfidCodeAndInternalIdNot(String rfidCode, String internalId);
}
