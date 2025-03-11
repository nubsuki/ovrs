package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.dto.Statistics;
import com.nubsuki.ovrs.repository.BookingRepository;
import com.nubsuki.ovrs.repository.UserRepository;
import com.nubsuki.ovrs.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping
    public Statistics getStatistics() {
        long userCount = userRepository.count();
        long orderCount = bookingRepository.count();
        long vehicleCount = vehicleRepository.count();

        return new Statistics(userCount, orderCount, vehicleCount);
    }

}
