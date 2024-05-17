package com.pos.app.controllers;

import com.pos.app.dto.request.OrderLineRequest;
import com.pos.app.services.OrderLineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/order-line")
@RequiredArgsConstructor
public class OrderLineController {
    private final OrderLineService orderLineService;

    @PreAuthorize("hasAuthority('Create order')")
    @PostMapping
    public ResponseEntity<?> save(@RequestBody @Valid OrderLineRequest orderLineRequest){
        return ResponseEntity.ok(orderLineService.save(orderLineRequest));
    }
}
