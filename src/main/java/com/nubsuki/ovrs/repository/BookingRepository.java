package com.nubsuki.ovrs.repository;

import com.nubsuki.ovrs.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Custom query to find a booking by order ID
    Optional<Booking> findByOrderId(String orderId);
}
