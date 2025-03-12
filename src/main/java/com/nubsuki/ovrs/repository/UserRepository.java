package com.nubsuki.ovrs.repository;

import com.nubsuki.ovrs.model.Role;
import com.nubsuki.ovrs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByEmailContainingIgnoreCase(String searchTerm);
    List<User> findByRole(Role role);
    List<User> findByEmailContainingIgnoreCaseAndRole(String email, Role role);

}
