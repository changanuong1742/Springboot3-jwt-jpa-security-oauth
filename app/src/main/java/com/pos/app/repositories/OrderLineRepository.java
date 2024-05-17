package com.pos.app.repositories;

import com.pos.app.models.OrderLine;
import com.pos.app.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderLineRepository extends JpaRepository<OrderLine, Integer> {
    Integer deleteAllByOrderId(Integer orderId);
    List<OrderLine> findAllByProduct(Product product);
}
