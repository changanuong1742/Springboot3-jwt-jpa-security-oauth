package com.pos.app.repositories;

import com.pos.app.enums.OrderStatus;
import com.pos.app.models.Order;
import com.pos.app.models.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByStatus(OrderStatus status);
    List<Order> findAllBySeat(Seat seat);
}
