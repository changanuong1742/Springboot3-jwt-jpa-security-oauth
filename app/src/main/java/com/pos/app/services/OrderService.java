package com.pos.app.services;

import com.pos.app.dto.request.OrderLineRequest;
import com.pos.app.dto.request.OrderRequest;
import com.pos.app.dto.response.OrderResponse;
import com.pos.app.dto.response.ProductResponse;
import com.pos.app.dto.response.ResponseData;
import com.pos.app.enums.OrderStatus;
import com.pos.app.models.*;
import com.pos.app.repositories.OrderLineRepository;
import com.pos.app.repositories.OrderRepository;
import com.pos.app.repositories.ProductRepository;
import com.pos.app.repositories.SeatRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.aspectj.weaver.ast.Or;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private final OrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;
    private final ProductRepository productRepository;
    private final SeatRepository seatRepository;
    ModelMapper modelMapper = new ModelMapper();

    public ResponseEntity<?> save(OrderRequest request) {
        ResponseData responseData = new ResponseData();

        Seat seat = seatRepository.findById(request.getSeatId()).orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + request.getSeatId()));

        var order = Order.builder().seat(seat).status(request.getOrderStatus()).build();
        orderRepository.save(order);

        Long orderId = Long.valueOf(order.getId());
        responseData.setMessage("Create success");

        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("new_order", orderId);
        responseData.setData(dataMap);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    public ResponseEntity<?> update(OrderRequest request) {
        ResponseData responseData = new ResponseData();

        Optional<Order> optionalOrder = orderRepository.findById(Long.valueOf(request.getId()));
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            Seat seat = seatRepository.findById(request.getSeatId()).orElseThrow(() -> new IllegalArgumentException("Seat not found with id: " + request.getSeatId()));
            order.setSeat(seat);

            if (request.getOrderStatus() != null) {
                order.setStatus(request.getOrderStatus());
            }

            if (request.getPaymentStatus() != null) {
                order.setPaymentStatus(request.getPaymentStatus());
            }

            if (request.getOrderLines() != null) {
                order.getOrderLines().clear();
                orderLineRepository.deleteAllByOrderId(order.getId());
                for (OrderLineRequest orderLineRequest : request.getOrderLines()) {
                    Optional<Product> optionalProduct = productRepository.findById(orderLineRequest.getProductId());
                    if (optionalProduct.isPresent()) {
                        var product = optionalProduct.get();
                        var orderLine = OrderLine.builder().product(product).orderId(order.getId()).quantity(orderLineRequest.getQuantity()).build();
                        orderLineRepository.save(orderLine);
                        order.getOrderLines().add(orderLine);
                    }
                }
            }

            orderRepository.save(order);
            responseData.setMessage("Update success");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        }

        responseData.setMessage("Update fail");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> get(Integer id) {
        ResponseData responseData = new ResponseData();
        Optional<Order> optionalOrder = orderRepository.findById(Long.valueOf(id));
        Map<String, Object> dataMap = new HashMap<>();
        if (optionalOrder.isPresent()) {
            var order = optionalOrder.get();
            OrderResponse orderResponse = modelMapper.map(order, OrderResponse.class);
            dataMap.put("data", orderResponse);
            return new ResponseEntity<>(dataMap, HttpStatus.OK);
        }
        responseData.setMessage("Order not found");
        return ResponseEntity.badRequest().body(responseData);
    }

    public Page<Order> list(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size));
    }

    public List<Order> getOrderByStatus(OrderStatus orderStatus) {
        return orderRepository.findAllByStatus(orderStatus);
    }

    public List<Order> getOrderBySeat(Integer id) {
        Optional<Seat> optionalSeat = seatRepository.findById(id);
        if (optionalSeat.isPresent()) {
            Seat seat = optionalSeat.get();
            return orderRepository.findAllBySeat(seat);
        }
        return null;
    }
}
