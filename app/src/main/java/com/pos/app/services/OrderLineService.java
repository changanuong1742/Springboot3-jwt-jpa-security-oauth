package com.pos.app.services;

import com.pos.app.dto.request.OrderLineRequest;
import com.pos.app.dto.request.OrderRequest;
import com.pos.app.dto.response.ResponseData;
import com.pos.app.models.Order;
import com.pos.app.models.OrderLine;
import com.pos.app.models.Product;
import com.pos.app.models.Seat;
import com.pos.app.repositories.OrderLineRepository;
import com.pos.app.repositories.OrderRepository;
import com.pos.app.repositories.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderLineService {
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;

    public ResponseEntity<?> save(OrderLineRequest request) {
        ResponseData responseData = new ResponseData();
        Product product = productRepository.findById(request.getProductId()).orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + request.getProductId()));
        Order order = orderRepository.findById(Long.valueOf(request.getOrderId())).orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + request.getOrderId()));

        responseData.setMessage("Create success");
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
