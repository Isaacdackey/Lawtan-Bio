package com.lawtan.repository;

import com.lawtan.entity.FeedRation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedRationRepository extends JpaRepository<FeedRation, Long> {
}
