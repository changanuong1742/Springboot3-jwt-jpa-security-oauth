package com.pos.app.controllers;

import com.pos.app.dto.response.OrderResponse;
import com.pos.app.enums.OrderStatus;
import com.pos.app.models.Image;
import com.pos.app.models.Order;
import com.pos.app.services.NotificationService;
import com.pos.app.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {
    private final OrderService orderService;

    @MessageMapping("/home")
    @SendTo("/pos")
    public ResponseEntity<?> getOrderNewSocket() {
        List<Order> ordersData = orderService.getOrderByStatus(OrderStatus.PENDING);
        Map<String, Object> dataMap = new HashMap<>();
        List<OrderResponse> orderResponses = new ArrayList<>();
        for (Order order : ordersData) {
            orderResponses.add(mapToOrderResponse(order));
        }
        dataMap.put("content", orderResponses);

        return new ResponseEntity<>(dataMap, HttpStatus.OK);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setId(order.getId());
        orderResponse.setSeatId(order.getSeat().getId());
        orderResponse.setCreatedAt(order.getCreatedAt());
        orderResponse.setOrderStatus(order.getStatus());

        return orderResponse;
    }

    @GetMapping()
    public ResponseEntity<?> getOrder(){
        List<Order> ordersData = orderService.getOrderByStatus(OrderStatus.PENDING);
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("content", ordersData);
        return new ResponseEntity<>(dataMap, HttpStatus.OK);
    }

}
