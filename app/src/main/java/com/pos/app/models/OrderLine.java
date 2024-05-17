package com.pos.app.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_lines")
public class OrderLine {
    @Id
    @GeneratedValue
    private Integer id;
    @JsonProperty("created_at")
    private Instant createdAt;
    private Float quantity;
    @JsonProperty("order_id")
    @Column(name = "order_id")
    private Integer orderId;
    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    private Product product;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
