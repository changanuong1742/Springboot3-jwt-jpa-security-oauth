package com.pos.app.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pos.app.enums.OrderStatus;
import com.pos.app.enums.PaymentStatus;
import com.pos.app.models.Image;
import com.pos.app.models.OrderLine;
import com.pos.app.models.Product;
import com.pos.app.models.Seat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class OrderResponse {
    private Integer id;
    @JsonProperty("created_at")
    private Instant createdAt;
    @JsonProperty("seat_id")
    private Integer seatId;
    @JsonProperty("order_lines")
    List<OrderLine> orderLines;
    @JsonProperty("status")
    OrderStatus orderStatus;
    @JsonProperty("payment_status")
    PaymentStatus paymentStatus;
}
