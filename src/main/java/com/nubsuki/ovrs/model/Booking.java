package com.nubsuki.ovrs.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private LocalTime pickupTime;

    @Column(nullable = false)
    private String pickupLocation;

    @Column(nullable = false)
    private String vehicleName;

    @Column(nullable = false)
    private double distance; // In kilometers

    @Column(nullable = false)
    private double time; // In hours

    @Column(nullable = false)
    private double totalCost;

    @Column(nullable = false, unique = true)
    private String orderId; // Unique 4-digit order ID

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private double distancePrice; // Price per kilometer

    @Column(nullable = false)
    private double timePrice; // Price per hour
}
