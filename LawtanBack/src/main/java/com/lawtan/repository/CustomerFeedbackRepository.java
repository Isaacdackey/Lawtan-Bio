package com.lawtan.repository;

import com.lawtan.entity.CustomerFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerFeedbackRepository extends JpaRepository<CustomerFeedback, Long> {

    Page<CustomerFeedback> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<CustomerFeedback> findByRatingOrderByCreatedAtDesc(Integer rating, Pageable pageable);

    @Query("SELECT AVG(f.rating) FROM CustomerFeedback f")
    Double averageRating();

    @Query("SELECT AVG(f.rating) FROM CustomerFeedback f WHERE f.createdAt >= :since")
    Double averageRatingSince(@Param("since") LocalDateTime since);

    @Query("SELECT f.rating, COUNT(f) FROM CustomerFeedback f GROUP BY f.rating")
    List<Object[]> countByRating();

    @Query("SELECT f.category, AVG(f.rating), COUNT(f) FROM CustomerFeedback f GROUP BY f.category")
    List<Object[]> statsByCategory();
}