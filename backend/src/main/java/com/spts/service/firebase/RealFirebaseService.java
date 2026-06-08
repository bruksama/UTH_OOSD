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
        if (firebaseAuth == null) {
            log.error("Firebase: Cannot create account for {} — FirebaseAuth not initialized", email);
            return null;
        }
        try {
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(displayName)
                .setEmailVerified(false);
            UserRecord userRecord = firebaseAuth.createUser(request);
            log.info("Firebase: Created account for {}", email);
            return userRecord.getUid();
        } catch (Exception e) {
            // Bắt Exception chung (không chỉ FirebaseAuthException)
            // → tránh NullPointerException và các lỗi không lường trước lan ra ngoài
            log.error("Firebase: Failed to create account for {}", email, e);
            // afterCommit() đã xử lý, Student vẫn được lưu trong DB
            return null;
        }
    }

    @Override
    public void deleteAccount(String uid) {
        if (firebaseAuth == null) {
            log.error("Firebase: Cannot delete account {} — FirebaseAuth not initialized", uid);
            return;
        }
        try {
            firebaseAuth.deleteUser(uid);
            log.info("Firebase: Deleted account {}", uid);
        } catch (Exception e) {
            // Bắt Exception chung để NullPointerException không lan ra
            log.error("Firebase: Failed to delete account {}", uid, e);
            // Không throw → local deletion vẫn thành công
        }
    }
}
