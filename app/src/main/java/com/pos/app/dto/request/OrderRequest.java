package com.pos.app.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pos.app.enums.OrderStatus;
import com.pos.app.enums.PaymentStatus;
import com.pos.app.models.OrderLine;
import com.pos.app.models.Product;
import com.pos.app.models.Seat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {
    private Integer id;
    @NotNull(message = "Seat cannot null")
    @JsonProperty("seat_id")
    private Integer seatId;

    @JsonProperty("order_lines")
    List<OrderLineRequest> orderLines;

    @JsonProperty("status")
    OrderStatus orderStatus;

    @JsonProperty("payment_status")
    PaymentStatus paymentStatus;
}

