package com.pos.app.controllers;

import com.pos.app.dto.request.OrderRequest;
import com.pos.app.enums.OrderStatus;
import com.pos.app.models.Order;
import com.pos.app.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.aspectj.weaver.ast.Or;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PreAuthorize("hasAuthority('Create order')")
    @PostMapping
    public ResponseEntity<?> save(@RequestBody @Valid OrderRequest orderRequest) {
        return ResponseEntity.ok(orderService.save(orderRequest));
    }

    @PreAuthorize("hasAuthority('Update order')")
    @PutMapping
    public ResponseEntity<?> update(@RequestBody @Valid OrderRequest orderRequest) {
        return ResponseEntity.ok(orderService.update(orderRequest));
    }

    @PreAuthorize("hasAuthority('View order')")
    @GetMapping("{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.get(id));
    }

    @PreAuthorize("hasAuthority('View order')")
    @GetMapping
    public ResponseEntity<Page<Order>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Page<Order> ordersPage = orderService.list(page, size);
        return ResponseEntity.ok(ordersPage);
    }

    @PreAuthorize("hasAuthority('View order')")
    @GetMapping("/all/seat/{id}")
    public ResponseEntity<?> listAllBySeat(@PathVariable Integer id) {
        List<Order> orders = orderService.getOrderBySeat(id);
        return  ResponseEntity.ok(orders);
    }
}
