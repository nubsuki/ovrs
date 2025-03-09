package com.nubsuki.ovrs.util;

import com.nubsuki.ovrs.model.User;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class SessionManager {
    private static final Map<String, User> activeSessions = new HashMap<>();

    // Create a new session for the user
    public static String createSession(User user) {
        String sessionToken = UUID.randomUUID().toString();
        activeSessions.put(sessionToken, user);
        return sessionToken;
    }

    // Get the user associated with a session token
    public static User getUser(String sessionToken) {
        return activeSessions.get(sessionToken);
    }

    // End a session
    public static void endSession(String sessionToken) {
        activeSessions.remove(sessionToken);
    }
}
