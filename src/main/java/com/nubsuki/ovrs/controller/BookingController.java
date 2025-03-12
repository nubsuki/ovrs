package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.model.Booking;
import com.nubsuki.ovrs.model.CancelledBooking;
import com.nubsuki.ovrs.model.Role;
import com.nubsuki.ovrs.model.User;
import com.nubsuki.ovrs.repository.BookingRepository;
import com.nubsuki.ovrs.repository.CancelledBookingRepository;
import com.nubsuki.ovrs.service.BookingService;
import com.nubsuki.ovrs.util.SessionManager;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CancelledBookingRepository cancelledBookingRepository;

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

    @PostMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelBooking(@PathVariable String orderId, HttpServletRequest request) {
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

        Optional<Booking> bookingOpt = bookingRepository.findByOrderId(orderId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Check if user owns this booking
        if (!booking.getUserEmail().equals(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized to cancel this booking");
        }

        // Check if cancellation is allowed (1 hour before pickup time)
        LocalDateTime pickupDateTime = LocalDateTime.of(booking.getBookingDate(), booking.getPickupTime());
        if (LocalDateTime.now().plusHours(1).isAfter(pickupDateTime)) {
            return ResponseEntity.badRequest().body("Cannot cancel booking less than 1 hour before pickup time");
        }

        // Create cancelled booking record
        CancelledBooking cancelledBooking = new CancelledBooking();
        cancelledBooking.setOrderId(booking.getOrderId());
        cancelledBooking.setUserEmail(booking.getUserEmail());
        cancelledBooking.setBookingDate(booking.getBookingDate());
        cancelledBooking.setCustomerName(booking.getCustomerName());
        cancelledBooking.setPhoneNumber(booking.getPhoneNumber());
        cancelledBooking.setPickupLocation(booking.getPickupLocation());
        cancelledBooking.setPickupTime(booking.getPickupTime());
        cancelledBooking.setTotalCost(booking.getTotalCost());
        cancelledBooking.setVehicleName(booking.getVehicleName());
        cancelledBooking.setDistance(booking.getDistance());
        cancelledBooking.setTime(booking.getTime());
        cancelledBooking.setCancelledAt(LocalDateTime.now());
        cancelledBooking.setReason("User cancelled");
        cancelledBookingRepository.save(cancelledBooking);

        // Delete the original booking
        bookingRepository.delete(booking);

        return ResponseEntity.ok().body("Booking cancelled successfully");
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllBookings(HttpServletRequest request) {
        // Validate admin session
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

        User adminUser = SessionManager.getUser(sessionToken);
        if (adminUser == null || !adminUser.getRole().equals(Role.ADMIN)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized access"));
        }

        List<Booking> bookings = bookingRepository.findAll();
        return ResponseEntity.ok(Map.of("bookings", bookings));
    }

    @PostMapping("/admin/cancel/{orderId}")
    public ResponseEntity<?> adminCancelBooking(@PathVariable String orderId, HttpServletRequest request) {
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

        User adminUser = SessionManager.getUser(sessionToken);
        if (adminUser == null || !adminUser.getRole().equals(Role.ADMIN)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access: Admin rights required");
        }

        Optional<Booking> bookingOpt = bookingRepository.findByOrderId(orderId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Create cancelled booking record
        CancelledBooking cancelledBooking = new CancelledBooking();
        cancelledBooking.setOrderId(booking.getOrderId());
        cancelledBooking.setUserEmail(booking.getUserEmail());
        cancelledBooking.setBookingDate(booking.getBookingDate());
        cancelledBooking.setCustomerName(booking.getCustomerName());
        cancelledBooking.setPhoneNumber(booking.getPhoneNumber());
        cancelledBooking.setPickupLocation(booking.getPickupLocation());
        cancelledBooking.setPickupTime(booking.getPickupTime());
        cancelledBooking.setTotalCost(booking.getTotalCost());
        cancelledBooking.setVehicleName(booking.getVehicleName());
        cancelledBooking.setDistance(booking.getDistance());
        cancelledBooking.setTime(booking.getTime());
        cancelledBooking.setCancelledAt(LocalDateTime.now());
        cancelledBooking.setReason("Cancelled by admin: " + adminUser.getEmail());
        cancelledBookingRepository.save(cancelledBooking);

        // Delete the original booking
        bookingRepository.delete(booking);

        return ResponseEntity.ok().body("Booking cancelled successfully by admin");
    }

    @GetMapping("/cancelled")
    public ResponseEntity<Map<String, Object>> getCancelledBookings(HttpServletRequest request) {
        // Validate admin session
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

        User adminUser = SessionManager.getUser(sessionToken);
        if (adminUser == null || !adminUser.getRole().equals(Role.ADMIN)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized access"));
        }

        List<CancelledBooking> bookings = cancelledBookingRepository.findAll();
        return ResponseEntity.ok(Map.of("bookings", bookings));
    }

}
