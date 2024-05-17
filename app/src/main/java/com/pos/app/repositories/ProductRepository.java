package com.pos.app.repositories;

import com.pos.app.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    Optional<Product> findByName(String name);
    Optional<Product> findById(Integer id);
    Page<Product> findByNameContaining(String name, Pageable pageable);
}
