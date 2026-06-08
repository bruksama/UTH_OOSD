package com.spts.service.firebase;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("prod")
public class RealFirebaseService implements FirebaseService {

    private static final Logger log = LoggerFactory.getLogger(RealFirebaseService.class);
    private final FirebaseAuth firebaseAuth;

    public RealFirebaseService(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Override
    public String createAccount(String email, String displayName, String password) {
        try {
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(displayName)
                .setEmailVerified(false);
            UserRecord userRecord = firebaseAuth.createUser(request);
            log.info("Firebase: Created account for {}", email);
            return userRecord.getUid();
        } catch (FirebaseAuthException e) {
            log.error("Firebase: Failed to create account for {}", email, e);
            throw new RuntimeException("Firebase account creation failed", e);
        }
    }

    @Override
    public void deleteAccount(String uid) {
        try {
            firebaseAuth.deleteUser(uid);
            log.info("Firebase: Deleted account {}", uid);
        } catch (FirebaseAuthException e) {
            log.error("Firebase: Failed to delete account {}", uid, e);
            // Not throwing to allow local deletion to succeed even if firebase fails
        }
    }
}
