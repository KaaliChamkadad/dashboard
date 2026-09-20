import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onDisconnect,
  set,
  serverTimestamp,
  push,
} from 'firebase/database';

// ==========================================
// TO MAKE THIS WORK, YOU NEED TO REPLACE THIS
// WITH YOUR FREE FIREBASE PROJECT CONFIG
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAikEBL2pRV4qNw5tolYb9I_Faj83VbiIA",
  authDomain: "kaali-dashboard.firebaseapp.com",
  databaseURL: "https://kaali-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kaali-dashboard",
  storageBucket: "kaali-dashboard.firebasestorage.app",
  messagingSenderId: "704739339356",
  appId: "1:704739339356:web:4929907ee4501777504a99"
};

let db: any = null;
let isInitialized = false;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    isInitialized = true;
  }
} catch (e) {
  console.warn("Firebase not initialized yet. Add config to tracking.ts.");
}

/**
 * Tracks a user visiting the site (adds to total visits + live presence)
 */
export function trackVisit() {
  if (!isInitialized) return;

  try {
    // 1. Log visit event
    const visitsRef = ref(db, 'stats/visits');
    push(visitsRef, {
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    });

    // 2. Handle Live Presence
    const sessionId = Math.random().toString(36).substring(2, 15);
    const presenceRef = ref(db, `presence/${sessionId}`);
    
    // Set user as online
    set(presenceRef, {
      online: true,
      joinedAt: serverTimestamp()
    });

    // Remove user when they close the tab
    onDisconnect(presenceRef).remove();
  } catch (e) {
    console.error("Tracking error:", e);
  }
}

/**
 * Tracks specific button clicks (e.g., 'subscribe', 'discord', 'instagram')
 */
export function trackEvent(eventName: string) {
  if (!isInitialized) return;
  
  try {
    const eventsRef = ref(db, `stats/events/${eventName}`);
    push(eventsRef, {
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Event tracking error:", e);
  }
}

/**
 * Gets reference for the admin panel to read data.
 */
export function getDbRef(path: string) {
  if (!isInitialized) return null;
  return ref(db, path);
}
