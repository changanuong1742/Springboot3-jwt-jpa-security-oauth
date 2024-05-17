package com.pos.app.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderLineRequest {
    private Integer id;
    @NotNull(message = "Product cannot null")
    @JsonProperty("product_id")
    private Integer productId;
    private Float quantity;

    @NotNull(message = "Order cannot null")
    @JsonProperty("order_id")
    private Integer orderId;
}
