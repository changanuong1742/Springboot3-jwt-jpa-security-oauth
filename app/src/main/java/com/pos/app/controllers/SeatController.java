package com.pos.app.controllers;

import com.pos.app.dto.request.SeatRequest;
import com.pos.app.models.Seat;
import com.pos.app.services.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seat")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService seatService;

    @PreAuthorize("hasAuthority('Create seat')")
    @PostMapping
    public ResponseEntity<?> save(@RequestBody SeatRequest seatRequest) {
        return ResponseEntity.ok(seatService.saveSeat(seatRequest));
    }

    @PreAuthorize("hasAuthority('Update seat')")
    @PutMapping
    public ResponseEntity<?> update(@RequestBody SeatRequest request) {
        return ResponseEntity.ok(seatService.updateSeat(request));
    }

    @PreAuthorize("hasAuthority('View seat')")
    @GetMapping
    public ResponseEntity<Page<Seat>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Page<Seat> productsPage = seatService.list(keyword, page, size);
        return ResponseEntity.ok(productsPage);
    }

    @PreAuthorize("hasAuthority('View seat')")
    @GetMapping("{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return ResponseEntity.ok(seatService.get(id));
    }

    @PreAuthorize("hasAuthority('Delete seat')")
    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(seatService.delete(id));
    }
}
