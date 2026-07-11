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
    public String createAccount(String uid, String email, String displayName, String password) {
        if (firebaseAuth == null) {
            log.error("Firebase: Cannot create account for {} — FirebaseAuth not initialized", email);
            throw new RuntimeException("FirebaseAuth not initialized");
        }
        try {
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setUid(uid)            // QUAN TRỌNG: dùng UID từ DB, không để Firebase tự sinh
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(displayName)
                .setEmailVerified(false);
            UserRecord userRecord = firebaseAuth.createUser(request);
            log.info("Firebase: Created account for {} with uid {}", email, uid);
            return userRecord.getUid();
        } catch (FirebaseAuthException e) {
            log.error("Firebase: Auth error creating account for {} - errorCode: {}", email, e.getErrorCode(), e);
            throw new RuntimeException("Firebase account creation failed [" + e.getErrorCode() + "]: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Firebase: Unexpected error creating account for {}", email, e);
            throw new RuntimeException("Firebase account creation failed for " + email, e);
        }
    }

    @Override
    public void deleteAccount(String uid) {
        if (firebaseAuth == null) {
            log.error("Firebase: Cannot delete account {} — FirebaseAuth not initialized", uid);
            throw new RuntimeException("FirebaseAuth not initialized");
        }
        try {
            firebaseAuth.deleteUser(uid);
            log.info("Firebase: Deleted account {}", uid);
        } catch (FirebaseAuthException e) {
            if ("user-not-found".equals(e.getErrorCode())) {
                log.warn("Firebase: Account {} already deleted or not found", uid);
            } else {
                log.error("Firebase: Auth error deleting account {}", uid, e);
                throw new RuntimeException("Firebase account deletion failed for " + uid, e);
            }
        } catch (Exception e) {
            log.error("Firebase: Unexpected error deleting account {}", uid, e);
            throw new RuntimeException("Firebase account deletion failed for " + uid, e);
        }
    }
}
