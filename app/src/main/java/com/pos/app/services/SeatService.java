package com.pos.app.services;

import com.pos.app.dto.request.SeatRequest;
import com.pos.app.dto.response.ResponseData;
import com.pos.app.models.Order;
import com.pos.app.models.Seat;
import com.pos.app.repositories.OrderRepository;
import com.pos.app.repositories.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepository;
    private final OrderRepository orderRepository;
    public ResponseEntity<?> saveSeat(SeatRequest seatRequest) {
        ResponseData responseData = new ResponseData();
        Optional<Seat> optionalSeat = seatRepository.findByName(seatRequest.getName());
        if (optionalSeat.isPresent()) {
            responseData.setMessage("Create fail");
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("name", "The name already exists");
            responseData.setErrors(errorMap);
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }
        responseData.setMessage("Create success");
        var seat = Seat.builder().name(seatRequest.getName()).build();
        seatRepository.save(seat);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    public ResponseEntity<?> updateSeat(SeatRequest seatRequest) {
        ResponseData responseData = new ResponseData();
        if (seatRequest.getId() == null) {
            responseData.setMessage("Id null");
            return new ResponseEntity<>("responseData", HttpStatus.BAD_REQUEST);
        }
        Optional<Seat> optionalSeat = seatRepository.findById(Math.toIntExact(seatRequest.getId()));
        if (optionalSeat.isPresent()) {
            Seat seat = optionalSeat.get();

            // Kiểm tra nếu tên mới không trùng với tên hiện tại của seat hoặc trùng nhưng với chính nó
            if (!seat.getName().equals(seatRequest.getName()) || seat.getId().equals(seatRequest.getId())) {
                // Kiểm tra nếu tên mới trùng với tên của một seat khác
                Optional<Seat> seatWithName = seatRepository.findByName(seatRequest.getName());
                if (seatWithName.isPresent() && !seatWithName.get().getId().equals(seat.getId())) {
                    Map<String, Object> errorMap = new HashMap<>();
                    responseData.setMessage("The name already exists");
                    errorMap.put("name", "The name already exists");
                    return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
                }
            }
            seat.setName(seatRequest.getName());
            seatRepository.save(seat);
            responseData.setMessage("Success");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        }

        responseData.setMessage("Fail");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    public Page<Seat> list(String keyword, int page, int size) {
        return seatRepository.findByKeywordContainingIgnoreCase(keyword, PageRequest.of(page, size));
    }

    public ResponseEntity<?> get(Integer id) {
        ResponseData responseData = new ResponseData();
        Optional<Seat> optionalSeat = seatRepository.findById(id);

        if (optionalSeat.isPresent()) {
            var seat = optionalSeat.get();
            return new ResponseEntity<>(seat, HttpStatus.OK);
        }
        responseData.setMessage("Seat not found");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> delete(Integer id) {
        ResponseData responseData = new ResponseData();
        Optional<Seat> optionalSeat = seatRepository.findById(id);

        if (optionalSeat.isPresent()) {
            Seat seat = optionalSeat.get();
            List<Order> orders = orderRepository.findAllBySeat(seat);

            for (Order order : orders) {
                order.setSeat(null);
            }
            seatRepository.deleteById(id);
            responseData.setMessage("Deleted");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        }
        responseData.setMessage("Seat not found");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

}