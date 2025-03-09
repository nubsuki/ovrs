package com.nubsuki.ovrs.service;

import com.nubsuki.ovrs.model.User;
import com.nubsuki.ovrs.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User authenticate(String usernameOrEmail, String password) {
        System.out.println("🔍 Checking user: " + usernameOrEmail);

        Optional<User> user = userRepository.findByUsername(usernameOrEmail);

        if (user.isEmpty()) {
            user = userRepository.findByEmail(usernameOrEmail);
        }

        if (user.isEmpty()) {
            System.out.println("User not found for: " + usernameOrEmail);
            return null;
        }

        if (!user.get().getPassword().equals(password)) {
            System.out.println("Incorrect password for: " + usernameOrEmail);
            return null;
        }

        System.out.println("User authenticated: " + user.get().getUsername());
        return user.get();
    }
}
