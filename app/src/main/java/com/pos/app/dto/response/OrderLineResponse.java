package com.pos.app.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pos.app.models.OrderLine;
import com.pos.app.models.Product;
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
public class OrderLineResponse {
    private Integer id;
    @JsonProperty("order_id")
    private Integer orderId;
    @JsonProperty("product_id")
    private Integer productId;
    private Float quantity;
}
