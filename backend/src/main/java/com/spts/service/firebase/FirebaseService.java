package com.spts.service.firebase;

public interface FirebaseService {
    String createAccount(String uid, String email, String displayName, String password);
    void deleteAccount(String uid);
}
