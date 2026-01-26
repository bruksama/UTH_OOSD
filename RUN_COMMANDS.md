# SPTS - Frontend & Backend Run Commands

## Frontend Setup & Run

### Terminal 1: Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```

**Frontend will run on:** http://localhost:5173

---

## Backend Setup & Run

### Terminal 2: Backend Development Server
```bash
cd backend
mvn spring-boot:run -Dspring.profiles.active=dev
```

**Backend will run on:** http://localhost:8080

---

## Quick Start (Both Terminals)

**Terminal 1 - Backend:**
```bash
cd backend && mvn spring-boot:run -Dspring.profiles.active=dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

**Then open browser:** http://localhost:5173

---

## Environment Variables

Frontend uses `.env` file (already configured):
```
VITE_API_URL=http://localhost:8080/api
```

Backend uses `application-dev.properties` with:
- Database configuration
- CORS settings for port 5173

---

## Verify Everything Works

1. ✅ Frontend loads: http://localhost:5173
2. ✅ Check Network tab in DevTools
3. ✅ API calls go to: http://localhost:8080/api
4. ✅ Student data loads from real API
5. ✅ No console errors about CORS

---

## Troubleshooting

**If API calls fail:**
- Ensure backend is running on 8080
- Check `.env` has correct `VITE_API_URL`
- Clear browser cache (Ctrl+Shift+Delete)
- Check Network tab for 404 or 500 errors

**If npm install fails:**
```bash
npm install axios
```

**If port 5173 is busy:**
```bash
npm run dev -- --port 5174
```
