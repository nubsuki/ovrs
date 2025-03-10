package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.model.User;
import com.nubsuki.ovrs.repository.UserRepository;
import com.nubsuki.ovrs.service.UserService;
import com.nubsuki.ovrs.util.SessionManager;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest, HttpServletResponse response) {
        String usernameOrEmail = loginRequest.get("username");
        String password = loginRequest.get("password");

        User authenticatedUser = userService.authenticate(usernameOrEmail, password);

        if (authenticatedUser != null) {
            // Create a session for the user
            String sessionToken = SessionManager.createSession(authenticatedUser);

            // Set a cookie with the session token
            Cookie cookie = new Cookie("sessionToken", sessionToken);
            cookie.setHttpOnly(true); // Prevent client-side JavaScript from accessing the cookie
            cookie.setMaxAge(7 * 24 * 60 * 60); // Set cookie to expire in 7 days
            cookie.setPath("/"); // Make the cookie available across the entire application
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of(
                    "message", "Login Successful",
                    "username", authenticatedUser.getUsername(),
                    "email", authenticatedUser.getEmail(),
                    "role", authenticatedUser.getRole()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletResponse response) {
        // Clear the session cookie
        Cookie cookie = new Cookie("sessionToken", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // Set cookie to expire immediately
        cookie.setPath("/");
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @GetMapping("/validate-session")
    public ResponseEntity<Map<String, Object>> validateSession(HttpServletRequest request) {
        // Get the session token from the cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("sessionToken")) {
                    String sessionToken = cookie.getValue();
                    User user = SessionManager.getUser(sessionToken);
                    if (user != null) {
                        return ResponseEntity.ok(Map.of(
                                "message", "Session valid",
                                "username", user.getUsername(),
                                "email", user.getEmail(),
                                "role", user.getRole()
                        ));
                    }
                }
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid session"));
    }
}
