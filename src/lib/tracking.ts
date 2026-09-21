import { initializeApp, getApps, getApp } from 'firebase/app';
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
  appId: "1:704739339356:web:4929907ee4501777504a99",
  measurementId: "G-4NCN5ZMS3D"
};

let db: any = null;
let isInitialized = false;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
    isInitialized = true;
  }
} catch (e) {
  console.error("Firebase init error:", e);
  console.warn("Firebase not initialized yet. Add config to tracking.ts.");
}

/**
 * Tracks a user visiting the site (adds to total visits + live presence)
 */
export function trackVisit() {
  if (!isInitialized) return;

  try {
    // 1. Log visit event (only if first time)
    const hasVisited = localStorage.getItem('kaali_visited');
    if (!hasVisited) {
      const visitsRef = ref(db, 'stats/visits');
      push(visitsRef, {
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
      });
      localStorage.setItem('kaali_visited', 'true');
    }

    // 2. Handle Live Presence (always handle this so they show as online)
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
    // Prevent spam clicking from the same browser
    const storageKey = `kaali_clicked_${eventName}`;
    if (localStorage.getItem(storageKey)) return;

    const eventsRef = ref(db, `stats/events/${eventName}`);
    push(eventsRef, {
      timestamp: serverTimestamp(),
    });
    
    localStorage.setItem(storageKey, 'true');
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
