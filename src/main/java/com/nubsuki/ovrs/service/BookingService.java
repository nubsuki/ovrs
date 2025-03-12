package com.nubsuki.ovrs.service;

import com.nubsuki.ovrs.model.Booking;
import com.nubsuki.ovrs.model.User;
import com.nubsuki.ovrs.repository.BookingRepository;
import com.nubsuki.ovrs.util.SessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Random;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(Booking booking, String sessionToken) {

        // Fetch the logged-in user from the session
        User user = SessionManager.getUser(sessionToken);
        if (user == null) {
            throw new RuntimeException("Invalid session token");
        }

        // Set the user's email in the booking
        System.out.println("Setting user email: " + user.getEmail());
        booking.setUserEmail(user.getEmail());

        // Generate a unique 4-digit order ID
        booking.setOrderId(generateOrderId());

        // Calculate total cost based on the selected car's prices
        double totalCost = booking.getDistance() > 0 ?
                booking.getDistance() * booking.getDistancePrice() :
                booking.getTime() * booking.getTimePrice();
        booking.setTotalCost(totalCost);

        // Save the booking
        return bookingRepository.save(booking);
    }

    private String generateOrderId() {
        Random random = new Random();
        int orderId = 1000 + random.nextInt(90000); // Generates a number
        return String.valueOf(orderId);
    }

}
