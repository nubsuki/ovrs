package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.model.Booking;
import com.nubsuki.ovrs.model.User;
import com.nubsuki.ovrs.repository.BookingRepository;
import com.nubsuki.ovrs.service.BookingService;
import com.nubsuki.ovrs.util.SessionManager;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

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
    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(HttpServletRequest request) {
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No session token found");
        }

        User user = SessionManager.getUser(sessionToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid session");
        }

        long orderCount = bookingRepository.countByUserEmail(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("orderCount", orderCount);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-history")
    public ResponseEntity<?> getUserBookings(HttpServletRequest request) {
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No session token found");
        }

        User user = SessionManager.getUser(sessionToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid session");
        }

        List<Booking> bookings = bookingRepository.findByUserEmailOrderByBookingDateDescPickupTimeDesc(user.getEmail());
        return ResponseEntity.ok(bookings);
    }

}
