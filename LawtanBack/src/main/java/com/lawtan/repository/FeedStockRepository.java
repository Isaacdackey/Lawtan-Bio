package com.lawtan.repository;

import com.lawtan.entity.FeedStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedStockRepository extends JpaRepository<FeedStock, Long> {
    List<FeedStock> findByCategory(String category);
}
