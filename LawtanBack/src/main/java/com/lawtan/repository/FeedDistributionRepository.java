package com.lawtan.repository;

import com.lawtan.entity.FeedDistribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedDistributionRepository extends JpaRepository<FeedDistribution, Long> {
    List<FeedDistribution> findAllByOrderByDistributionDateDescIdDesc();
}
