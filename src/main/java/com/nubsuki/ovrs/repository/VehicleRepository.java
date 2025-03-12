package com.nubsuki.ovrs.repository;

import com.nubsuki.ovrs.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByType(String type); // Fetch vehicles by type
    @Query("SELECT DISTINCT v.type FROM Vehicle v")
    List<String> findDistinctTypes();
    List<Vehicle> findByTypeAndAvailable(String type, boolean available);
    Vehicle findByDriverEmail(String driverEmail);

}
