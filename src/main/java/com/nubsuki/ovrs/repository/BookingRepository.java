package com.nubsuki.ovrs.repository;

import com.nubsuki.ovrs.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByOrderId(String orderId);
    long countByUserEmail(String userEmail);
    List<Booking> findByUserEmailOrderByBookingDateDescPickupTimeDesc(String userEmail);
    List<Booking> findByStatus(String status);
    List<Booking> findByVehicleNameAndStatus(String vehicleName, String status);
}
