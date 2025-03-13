package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.model.Vehicle;
import com.nubsuki.ovrs.repository.VehicleRepository;
import com.nubsuki.ovrs.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class VehicleControllerTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VehicleController vehicleController;

    private Vehicle testVehicle;

    @BeforeEach
    void setUp() {
        testVehicle = new Vehicle();
        testVehicle.setType("SUV");
        testVehicle.setStatus("AVAILABLE");
        testVehicle.setName("Test SUV");
        testVehicle.setDriverEmail("driver@example.com");
        testVehicle.setDistancePrice(2.5);
        testVehicle.setTimePrice(50.0);
    }

    @Test
    void testGetVehicleTypes() {
        when(vehicleRepository.findDistinctTypes()).thenReturn(Arrays.asList("SUV", "Sedan"));
        
        ResponseEntity<Map<String, Object>> response = vehicleController.getVehicleTypes();
        
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        @SuppressWarnings("unchecked")
        List<String> types = (List<String>) response.getBody().get("types");
        assertTrue(types.contains("SUV"));
        assertTrue(types.contains("Sedan"));
    }

    @Test
    void testGetVehiclesByType() {
        // Mock the repository method
        when(vehicleRepository.findByType("SUV")).thenReturn(Arrays.asList(testVehicle));
        
        // Call the controller method with the type string directly
        ResponseEntity<List<Vehicle>> response = vehicleController.getVehiclesByType("SUV");
        
        // Verify the mock was called
        verify(vehicleRepository).findByType("SUV");
        
        // Verify the response
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        
        List<Vehicle> vehicles = response.getBody();
        assertNotNull(vehicles, "Vehicles list should not be null");
        assertEquals(1, vehicles.size(), "Expected one vehicle in the response");
        assertEquals("SUV", vehicles.get(0).getType());
        assertEquals("Test SUV", vehicles.get(0).getName());
        assertEquals("AVAILABLE", vehicles.get(0).getStatus());
    }

    @Test
    void testGetAllVehicles() {
        when(vehicleRepository.findAll()).thenReturn(Arrays.asList(testVehicle));
        
        ResponseEntity<Map<String, Object>> response = vehicleController.getAllVehicles();
        
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        @SuppressWarnings("unchecked")
        List<Vehicle> vehicles = (List<Vehicle>) response.getBody().get("vehicles");
        assertEquals(1, vehicles.size());
    }

    @Test
    void testGetVehicleById() {
        when(vehicleRepository.findById(1L)).thenReturn(java.util.Optional.of(testVehicle));
        
        ResponseEntity<Vehicle> response = vehicleController.getVehicleById(1L);
        
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        assertEquals("SUV", response.getBody().getType());
    }
}