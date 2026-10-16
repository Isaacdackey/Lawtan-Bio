package com.lawtan.repository;

import com.lawtan.entity.FodderCrop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FodderCropRepository extends JpaRepository<FodderCrop, Long> {
    List<FodderCrop> findAllByOrderByPlantingDateDescIdDesc();
}