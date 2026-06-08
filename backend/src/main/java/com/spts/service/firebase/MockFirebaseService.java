package com.spts.service.firebase;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;


@Service
@Profile("!prod")
public class MockFirebaseService implements FirebaseService {

    private static final Logger log = LoggerFactory.getLogger(MockFirebaseService.class);

    @Override
    public String createAccount(String uid, String email, String displayName, String password) {
        // Trả về đúng uid từ DB — không sinh random để tránh mất đồng bộ DB vs Firebase
        log.info("[MOCK] Firebase: Created account for {} with uid {}", email, uid);
        return uid;
    }

    @Override
    public void deleteAccount(String uid) {
        log.info("[MOCK] Firebase: Deleted account {}", uid);
    }
}
