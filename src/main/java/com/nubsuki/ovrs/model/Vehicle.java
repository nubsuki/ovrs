package com.nubsuki.ovrs.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "vehicles")
@Data
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // Sedan, SUV, Luxury

    @Column(nullable = false)
    private String name; // Car name (e.g., Toyota Camry, BMW X5)

    @Column(nullable = false)
    private double distancePrice; // Price per kilometer

    @Column(nullable = false)
    private double timePrice; // Price per hour
}
