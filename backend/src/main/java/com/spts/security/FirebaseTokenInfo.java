package com.spts.security;

import java.util.Map;

/**
 * DTO chứa thông tin token Firebase đã được giải mã.
 * Thay thế FirebaseToken (SDK class) để tránh dùng Reflection.
 */
public class FirebaseTokenInfo {
    private final String uid;
    private final String email;
    private final String name;
    private final long authTime;
    private final Map<String, Object> claims;

    public FirebaseTokenInfo(String uid, String email, String name, long authTime) {
        this.uid = java.util.Objects.requireNonNull(uid, "uid must not be null");
        this.email = email;
        this.name = name;
        this.authTime = authTime;
        this.claims = Map.of(
            "sub", this.uid,
            "user_id", this.uid,
            "email", email != null ? email : "",
            "name", name != null ? name : "",
            "auth_time", authTime
        );
    }

    public String getUid()   { return uid; }
    public String getEmail() { return email; }
    public String getName()  { return name; }
    public long getAuthTime() { return authTime; }
    public Map<String, Object> getClaims() { return claims; }
}
