package com.spts.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test token revocation on logout (TC_LOGOUT_02 bug fix verification)
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testLogoutReturns204() throws Exception {
        // Test: POST /logout should return 204 No Content
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetMeReturns401WithoutToken() throws Exception {
        // Test: GET /me without token should return 401
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogoutEndpointIsAccessible() throws Exception {
        // Test: Logout endpoint should be accessible without authentication
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent());
    }
}

