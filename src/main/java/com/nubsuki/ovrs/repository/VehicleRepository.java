package com.nubsuki.ovrs.repository;

import com.nubsuki.ovrs.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByType(String type); // Fetch vehicles by type
}
