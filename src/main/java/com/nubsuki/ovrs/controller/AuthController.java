package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.model.User;
import com.nubsuki.ovrs.repository.UserRepository;
import com.nubsuki.ovrs.service.UserService;
import com.nubsuki.ovrs.util.SessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@CrossOrigin(origins = "http://localhost:63342")
@RestController
@RequestMapping("/api/auth")

public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> registerRequest) {
        String username = registerRequest.get("username");
        String email = registerRequest.get("email");
        String password = registerRequest.get("password");

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Username already exists"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email already exists"));
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String usernameOrEmail = loginRequest.get("username");
        String password = loginRequest.get("password");

        User authenticatedUser = userService.authenticate(usernameOrEmail, password);

        if (authenticatedUser != null) {
            // Create a session for the authenticated user
            String sessionToken = SessionManager.createSession(authenticatedUser);

            return ResponseEntity.ok(Map.of(
                    "message", "Login Successful",
                    "username", authenticatedUser.getUsername(),
                    "email", authenticatedUser.getEmail(),
                    "role", authenticatedUser.getRole(),
                    "sessionToken", sessionToken
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestBody Map<String, String> logoutRequest) {
        String sessionToken = logoutRequest.get("sessionToken");

        if (sessionToken == null || sessionToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Session token is required"));
        }

        // End the session
        SessionManager.endSession(sessionToken);

        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @GetMapping("/validate-session")
    public ResponseEntity<Map<String, Object>> validateSession(@RequestParam String sessionToken) {
        User user = SessionManager.getUser(sessionToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid session"));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Session valid",
                "username", user.getUsername(),
                "role", user.getRole()
        ));
    }
}
