package com.pos.app.services;

import com.pos.app.enums.OrderStatus;
import com.pos.app.models.Order;
import com.pos.app.repositories.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {
}
