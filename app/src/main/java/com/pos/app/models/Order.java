package com.pos.app.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pos.app.enums.OrderStatus;
import com.pos.app.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders") // Change the table name here
public class Order {
    @Id
    @GeneratedValue
    private Integer id;
    private Instant createdAt;
    @Column(columnDefinition = "varchar(20) default 'PENDING'")
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @JsonProperty("payment_status")
    @Column(columnDefinition = "varchar(20) default 'HOLD'")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    private Seat seat;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    List<OrderLine> orderLines;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
