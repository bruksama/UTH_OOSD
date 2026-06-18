import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';

/**
 * Kiểm tra xem API key có phải là key thật hay không.
 * Các key giả/placeholder sẽ khiến Firebase gọi server và thất bại.
 * Khi phát hiện key giả → set auth = null để dùng mock auth.
 */
const isRealFirebaseKey = (key: string): boolean => {
  if (!key || key.trim() === '') return false;
  const dummyPatterns = ['dummy', 'demo', 'test', 'fake', 'placeholder', 'your-api-key', 'demo-key'];
  const lowerKey = key.toLowerCase();
  return !dummyPatterns.some(pattern => lowerKey.includes(pattern));
};

// Firebase config - use environment variables if available
const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:demo',
};

// Initialize Firebase with fallback
let app;
let auth;
let googleProvider;

if (!isRealFirebaseKey(apiKey)) {
  // API key giả → bỏ qua Firebase, dùng mock auth
  console.warn('⚠️ Firebase API key không hợp lệ hoặc là key giả - dùng mock auth cho development');
  app = null;
  auth = null;
  googleProvider = null;
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed - using mock auth for development:', error);
    app = null;
    auth = null;
    googleProvider = null;
  }
}

export { auth, googleProvider };
export default app;
