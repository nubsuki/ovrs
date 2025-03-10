package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.model.Booking;
import com.nubsuki.ovrs.service.BookingService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking, HttpServletRequest request) {
        // Get session token from cookie
        String sessionToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("sessionToken")) {
                    sessionToken = cookie.getValue();
                    break;
                }
            }
        }

        if (sessionToken == null) {
            throw new RuntimeException("No session token found");
        }

        Booking savedBooking = bookingService.createBooking(booking, sessionToken);
        return ResponseEntity.ok(savedBooking);
    }
}
