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

    @Column(name = "driver_email", nullable = false)
    private String driverEmail;

    @Column(name = "status" , nullable = false)
    private String status = "NOT_AVAILABLE"; // Default value

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


}
