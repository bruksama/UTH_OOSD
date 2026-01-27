# SPTS Setup Guide

Complete setup instructions for the Student Performance Tracking System.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Database Setup](#database-setup)
4. [Frontend Setup](#frontend-setup)
5. [Backend Setup](#backend-setup)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | (included with Node.js) |
| Java | 17 | https://adoptium.net |
| Maven | 3.6+ | https://maven.apache.org |
| PostgreSQL | 15+ | https://www.postgresql.org |
| Git | Latest | https://git-scm.com |

### Verify Installation

```bash
node --version    # Should show v18+ or v20+
npm --version     # Should show 9+ or 10+
java --version    # Should show 17.x.x
mvn --version     # Should show 3.6.x or higher
psql --version    # Should show 15.x or higher
```

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `uth-oosd` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Authentication Methods

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle **"Enable"**
   - Click **"Save"**
5. Enable **Google**:
   - Click "Google"
   - Toggle **"Enable"**
   - Enter project support email
   - Click **"Save"**

### Step 3: Register Web App

1. In Firebase Console, click the gear icon → **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click the web icon (`</>`) to add a web app
4. Enter app nickname: `SPTS Frontend`
5. **Do NOT** check "Firebase Hosting"
6. Click **"Register app"**
7. **Copy the `firebaseConfig` object** - you'll need these values

### Step 4: Download Service Account Key (Backend)

1. In Firebase Console → Project Settings
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** to download JSON file
5. Save the file as `firebase-service-account.json`
6. **Keep this file secure** - it contains sensitive credentials

---

## Database Setup

### Option 1: PostgreSQL (Recommended for Production)

#### Install PostgreSQL

**Windows:**
```bash
# Download installer from https://www.postgresql.org/download/windows/
# Run installer and follow prompts
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE spts_db;
CREATE USER spts_user WITH ENCRYPTED PASSWORD 'spts_password';
GRANT ALL PRIVILEGES ON DATABASE spts_db TO spts_user;

# Exit
\q
```

#### Test Connection

```bash
psql -U spts_user -d spts_db -h localhost
# Enter password: spts_password
```

### Option 2: H2 Database (Quick Testing)

H2 is an in-memory database perfect for quick testing. **No installation required!**

To use H2, update `backend/src/main/resources/application.properties`:

```properties
# Comment out PostgreSQL
# spring.datasource.url=jdbc:postgresql://localhost:5432/spts_db
# spring.datasource.driverClassName=org.postgresql.Driver
# spring.datasource.username=spts_user
# spring.datasource.password=spts_password

# Enable H2
spring.datasource.url=jdbc:h2:mem:spts_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Change dialect
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

Access H2 Console at: http://localhost:8080/h2-console

### Option 3: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name spts-postgres \
  -e POSTGRES_DB=spts_db \
  -e POSTGRES_USER=spts_user \
  -e POSTGRES_PASSWORD=spts_password \
  -p 5432:5432 \
  postgres:15

# Verify running
docker ps | grep spts-postgres
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Create Environment File

Create `frontend/.env` (copy from `.env.example`):

```bash
cp .env.example .env
```

### Step 3: Configure Firebase

Edit `frontend/.env` with your Firebase credentials from Step 3 of Firebase Setup:

```env
VITE_API_URL=http://localhost:8080/api

# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...your-actual-key-here
VITE_FIREBASE_AUTH_DOMAIN=uth-oosd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=uth-oosd
VITE_FIREBASE_STORAGE_BUCKET=uth-oosd.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**⚠️ IMPORTANT**: Replace all placeholder values with actual Firebase config values!

### Step 4: Start Development Server

```bash
npm run dev
```

Frontend will run at: http://localhost:5173

---

## Backend Setup

### Step 1: Place Firebase Service Account

Copy the `firebase-service-account.json` file (from Firebase Setup Step 4) to:

```
backend/src/main/resources/firebase-service-account.json
```

### Step 2: Configure Application Properties

Edit `backend/src/main/resources/application.properties`:

```properties
# Application Info
spring.application.name=SPTS
server.port=8080

# Database Configuration (PostgreSQL)
spring.datasource.url=jdbc:postgresql://localhost:5432/spts_db
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=spts_user
spring.datasource.password=spts_password

# JPA / Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Firebase Configuration (use forward slashes, even on Windows!)
firebase.service-account-path=D:/path/to/backend/src/main/resources/firebase-service-account.json

# Logging
logging.level.root=INFO
logging.level.com.spts=DEBUG
```

**⚠️ IMPORTANT**:
- Use **forward slashes** (`/`) in `firebase.service-account-path`, NOT backslashes (`\`)
- Use **absolute path** or place file in `src/main/resources/`

### Step 3: Build the Project

```bash
cd backend
mvn clean install
```

### Step 4: Start Backend Server

```bash
mvn spring-boot:run
```

Backend will run at: http://localhost:8080

---

## Verification

### 1. Check Backend Health

```bash
# Test API endpoint
curl http://localhost:8080/api/auth/health

# Expected response:
"Auth service is running"
```

### 2. Check Swagger UI

Open browser: http://localhost:8080/swagger-ui.html

You should see all API endpoints documented.

### 3. Test Frontend

1. Open browser: http://localhost:5173
2. You should see the login page
3. Try registering a new account
4. Check email for verification link
5. Login with registered account

### 4. Test Firebase Authentication

**Create Test Admin User:**

1. Go to Firebase Console → Authentication
2. Click **"Add user"**
3. Enter email and password
4. Click **"Add user"**
5. Copy the **User UID**

**Add User to Database:**

```sql
-- Connect to database
psql -U spts_user -d spts_db

-- Insert admin user
INSERT INTO users (firebase_uid, email, display_name, role, created_at, last_login_at)
VALUES ('firebase-uid-from-console', 'admin@example.com', 'Admin User', 'ADMIN', NOW(), NOW());

-- Verify
SELECT * FROM users;
```

**Test Login:**

1. Go to http://localhost:5173/login
2. Login with admin@example.com
3. You should be redirected to `/admin/dashboard`

---

## Troubleshooting

### Frontend Issues

#### Error: `auth/invalid-api-key`

**Cause**: Missing or incorrect Firebase configuration in `.env`

**Fix**:
1. Verify `frontend/.env` exists
2. Check all Firebase values are correct (no empty values)
3. Restart dev server: `npm run dev`

#### Error: `Network Error` or API calls fail

**Cause**: Backend not running or wrong API URL

**Fix**:
1. Verify backend is running: `curl http://localhost:8080/api/auth/health`
2. Check `VITE_API_URL` in `.env` is `http://localhost:8080/api`
3. Check CORS configuration in backend

#### Firebase not loading

**Cause**: `.env` file not loaded

**Fix**:
```bash
# Kill dev server (Ctrl+C)
# Restart
npm run dev
```

### Backend Issues

#### Error: `Malformed \uxxxx encoding`

**Cause**: Backslashes in Windows path in `application.properties`

**Fix**: Use forward slashes:
```properties
# Wrong:
firebase.service-account-path=D:\Documents\...\firebase.json

# Correct:
firebase.service-account-path=D:/Documents/.../firebase.json
```

#### Error: `Failed to initialize Firebase`

**Cause**: Service account file not found or incorrect path

**Fix**:
1. Verify file exists at specified path
2. Use absolute path
3. Check file permissions (must be readable)

#### Error: `password authentication failed for user`

**Cause**: Wrong database credentials

**Fix**:
1. Verify PostgreSQL is running
2. Check username/password in `application.properties`
3. Test connection: `psql -U spts_user -d spts_db`

#### Port 8080 already in use

**Cause**: Another application using port 8080

**Fix**:
```bash
# Windows: Find and kill process
netstat -ano | findstr :8080
taskkill /PID <process-id> /F

# macOS/Linux: Find and kill process
lsof -ti:8080 | xargs kill -9

# Or change port in application.properties:
server.port=8081
```

### Database Issues

#### Cannot connect to PostgreSQL

**Fix**:
```bash
# Check if PostgreSQL is running
# Windows:
services.msc  # Look for "postgresql" service

# macOS:
brew services list

# Linux:
sudo systemctl status postgresql
```

#### Tables not created

**Fix**:
```properties
# In application.properties, ensure:
spring.jpa.hibernate.ddl-auto=update

# Or manually create tables:
# Tables will be auto-created on first run
```

---

## Next Steps

After successful setup:

1. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** to understand system design
2. **Read [API.md](./API.md)** for API documentation
3. **Read [CONTRIBUTING.md](./CONTRIBUTING.md)** before developing
4. **Run tests** to verify everything works:
   ```bash
   # Frontend
   cd frontend && npm run test:run

   # Backend
   cd backend && mvn test
   ```

---

## Quick Reference

### Start Everything

```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| H2 Console | http://localhost:8080/h2-console |

### Default Credentials

**For testing with H2 or after fresh setup:**

- Email: `admin@example.com`
- Password: (set in Firebase Console or during registration)

---

## Support

If you encounter issues not covered here:

1. Check [Troubleshooting](#troubleshooting) section
2. Review application logs
3. Check Firebase Console for auth errors
4. Verify all environment variables are set correctly
