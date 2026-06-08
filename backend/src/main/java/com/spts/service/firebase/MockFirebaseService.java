package com.spts.service.firebase;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Profile("!prod")
public class MockFirebaseService implements FirebaseService {

    private static final Logger log = LoggerFactory.getLogger(MockFirebaseService.class);

    @Override
    public String createAccount(String email, String displayName, String password) {
        String mockUid = "mock-uid-" + UUID.randomUUID().toString().substring(0, 8);
        log.info("[MOCK] Firebase: Created account for {} with uid {}", email, mockUid);
        return mockUid;
    }

    @Override
    public void deleteAccount(String uid) {
        log.info("[MOCK] Firebase: Deleted account {}", uid);
    }
}
