package com.nubsuki.ovrs.repository;

import com.nubsuki.ovrs.model.Vehicle;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import static org.junit.jupiter.api.Assertions.*;
import java.util.List;

@SpringBootTest
public class VehicleRepositoryTest {

    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private EntityManager entityManager;

    @Test
    void testFindByType() {
        List<Vehicle> vehicles = vehicleRepository.findByType("SUV");
        assertNotNull(vehicles);
    }

    @Test
    @Transactional
    void testFindDistinctTypes() {
        // Create and save a test vehicle first
        Vehicle testVehicle = new Vehicle();
        testVehicle.setType("Suv");
        testVehicle.setStatus("AVAILABLE");
        testVehicle.setName("Test SUV");
        testVehicle.setDriverEmail("driver@example.com");
        testVehicle.setDistancePrice(2.5);
        testVehicle.setTimePrice(50.0);
        vehicleRepository.save(testVehicle);
        
        // Flush and clear the persistence context to ensure changes are synchronized
        vehicleRepository.flush();
        entityManager.clear();

        // test the distinct types
        List<String> types = vehicleRepository.findDistinctTypes();
        assertNotNull(types);
        
        // Print the types for debugging
        System.out.println("Found types: " + types);
        
        assertTrue(types.stream()
                       .anyMatch(type -> type.equalsIgnoreCase("Suv")), 
                 "Expected to find Suv (case insensitive) in the list of vehicle types");
        
        // Clean up
        vehicleRepository.delete(testVehicle);
    }

    @Test
    void testFindByTypeAndStatus() {
        List<Vehicle> vehicles = vehicleRepository.findByTypeAndStatus("SUV", "Available");
        assertNotNull(vehicles);
    }

    @Test
    void testFindByDriverEmail() {
        Vehicle vehicle = vehicleRepository.findByDriverEmail("driver@example.com");
        assertNotNull(vehicle);
    }
}