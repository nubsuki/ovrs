package com.nubsuki.ovrs.controller;

import com.nubsuki.ovrs.model.Role;
import com.nubsuki.ovrs.model.User;
import com.nubsuki.ovrs.util.SessionManager;
import org.mockito.MockedStatic;
import static org.mockito.Mockito.mockStatic;
import com.nubsuki.ovrs.service.UserService;
import com.nubsuki.ovrs.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AuthControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest httpRequest;

    @InjectMocks
    private AuthController authController;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
        testUser.setRole(Role.ADMIN);
    
        // Mock cookies for authentication
        Cookie[] cookies = new Cookie[]{new Cookie("sessionToken", "test-token")};
        when(httpRequest.getCookies()).thenReturn(cookies);
        
        // Mock SessionManager to return the admin user
        try (MockedStatic<SessionManager> mockedStatic = mockStatic(SessionManager.class)) {
            mockedStatic.when(() -> SessionManager.getUser("test-token")).thenReturn(testUser);
        }
    }

    @Test
    void testSearchUsers() {
        // Create request body
        Map<String, String> request = Map.of("searchTerm", "test");
        
        // Mock repository method
        when(userRepository.findByEmailContainingIgnoreCase("test"))
            .thenReturn(java.util.Arrays.asList(testUser));
        
        // Mock SessionManager within the test method
        try (MockedStatic<SessionManager> mockedStatic = mockStatic(SessionManager.class)) {
            mockedStatic.when(() -> SessionManager.getUser("test-token")).thenReturn(testUser);
            
            ResponseEntity<?> response = authController.searchEmails(request, httpRequest);
            
            assertTrue(response.getStatusCode().is2xxSuccessful());
            assertNotNull(response.getBody());
            
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            assertNotNull(responseBody.get("users"));
        }
    }

    @Test
    void testUpdateUserRole() {
        // Mock repository findByEmail
        when(userRepository.findByEmail(anyString())).thenReturn(java.util.Optional.of(testUser));
        
        Map<String, String> request = Map.of(
            "email", "test@example.com",
            "role", "ADMIN"
        );
        
        // Mock SessionManager within the test method
        try (MockedStatic<SessionManager> mockedStatic = mockStatic(SessionManager.class)) {
            mockedStatic.when(() -> SessionManager.getUser("test-token")).thenReturn(testUser);
            
            ResponseEntity<?> response = authController.updateUserRole(request, httpRequest);
            
            assertTrue(response.getStatusCode().is2xxSuccessful());
            assertNotNull(response.getBody());
            
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            assertEquals("Role updated successfully", responseBody.get("message"));
        }
    }
}