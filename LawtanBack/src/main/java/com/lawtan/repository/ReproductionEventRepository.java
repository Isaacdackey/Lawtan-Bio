package com.lawtan.repository;

import com.lawtan.entity.ReproductionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReproductionEventRepository extends JpaRepository<ReproductionEvent, Long> {
    List<ReproductionEvent> findByAnimalIdOrderByEventDateDesc(Long animalId);
    List<ReproductionEvent> findAllByOrderByEventDateDesc();
}
