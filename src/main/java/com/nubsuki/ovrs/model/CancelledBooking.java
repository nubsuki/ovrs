package com.nubsuki.ovrs.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "cancelled_bookings")
@Data
public class CancelledBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String pickupLocation;

    @Column(nullable = false)
    private LocalTime pickupTime;

    @Column(nullable = false)
    private Double totalCost;

    @Column(nullable = false)
    private String vehicleName;

    @Column(nullable = false)
    private Double distance;

    @Column(nullable = false)
    private double time;

    @Column(nullable = false)
    private LocalDateTime cancelledAt;

    @Column(nullable = false)
    private String reason;
}
