package com.pos.app.repositories;

import com.pos.app.models.Seat;
import com.pos.app.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Integer> {
    Optional<Seat> findByName(String name);
    Optional<Seat> findById(Integer id);

    @Query("SELECT s FROM Seat s WHERE LOWER(s.name) LIKE %:keyword%")
    Page<Seat> findByKeywordContainingIgnoreCase(String keyword, Pageable pageable);
}
