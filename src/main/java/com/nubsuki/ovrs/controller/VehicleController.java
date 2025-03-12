package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.model.Role;
import com.nubsuki.ovrs.model.User;
import com.nubsuki.ovrs.model.Vehicle;
import com.nubsuki.ovrs.repository.UserRepository;
import com.nubsuki.ovrs.repository.VehicleRepository;
import com.nubsuki.ovrs.util.SessionManager;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/by-type")
    public ResponseEntity<List<Vehicle>> getVehiclesByType(@RequestParam String type) {
        List<Vehicle> vehicles = vehicleRepository.findByType(type).stream()
                .filter(vehicle -> "AVAILABLE".equals(vehicle.getStatus()))
                .toList();
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        Optional<Vehicle> vehicle = vehicleRepository.findById(id);
        return vehicle.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/types")
    public ResponseEntity<Map<String, Object>> getVehicleTypes() {
        List<String> distinctTypes = vehicleRepository.findDistinctTypes();
        return ResponseEntity.ok(Map.of("types", distinctTypes));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("vehicles", vehicles);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> addVehicle(@RequestBody Vehicle vehicle, HttpServletRequest request) {
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

        // Validate driver exists and has DRIVER role
        if (vehicle.getDriverEmail() != null) {
            Optional<User> driverOptional = userRepository.findByEmail(vehicle.getDriverEmail());
            if (driverOptional.isEmpty() || !driverOptional.get().getRole().equals(Role.DRIVER)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid driver email or user is not a driver"));
            }
        }
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(savedVehicle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id, HttpServletRequest request) {
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

        if (!vehicleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        vehicleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Vehicle deleted successfully"));
    }

    @GetMapping("/driver-availability")
    public ResponseEntity<Map<String, Boolean>> checkDriverAvailability(HttpServletRequest request) {
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

        User driver = SessionManager.getUser(sessionToken);
        if (driver == null || !driver.getRole().equals(Role.DRIVER)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("available", false)); 
        }

        Vehicle vehicle = vehicleRepository.findByDriverEmail(driver.getEmail());
        boolean isAvailable = vehicle != null && "AVAILABLE".equals(vehicle.getStatus());

        return ResponseEntity.ok(Map.of("available", isAvailable));
    }

    @PostMapping("/toggle-availability")
    public ResponseEntity<Map<String, Boolean>> toggleAvailability(HttpServletRequest request) {
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

        User driver = SessionManager.getUser(sessionToken);
        if (driver == null || !driver.getRole().equals(Role.DRIVER)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", false));
        }

        Vehicle vehicle = vehicleRepository.findByDriverEmail(driver.getEmail());
        if (vehicle == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", false));
        }

        boolean newAvailability = !"AVAILABLE".equals(vehicle.getStatus());
        vehicle.setStatus(newAvailability ? "AVAILABLE" : "NOT_AVAILABLE");
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(Map.of("available", newAvailability));
    }
}