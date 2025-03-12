package com.nubsuki.ovrs.repository;

import com.nubsuki.ovrs.model.CancelledBooking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CancelledBookingRepository extends JpaRepository<CancelledBooking, Long> {
}
