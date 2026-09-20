import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAikEBL2pRV4qNw5tolYb9I_Faj83VbiIA",
  authDomain: "kaali-dashboard.firebaseapp.com",
  databaseURL: "https://kaali-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kaali-dashboard",
  storageBucket: "kaali-dashboard.firebasestorage.app",
  messagingSenderId: "704739339356",
  appId: "1:704739339356:web:4929907ee4501777504a99"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function checkData() {
  const presenceSnap = await get(ref(db, 'presence'));
  const visitsSnap = await get(ref(db, 'stats/visits'));
  console.log('Presence keys:', presenceSnap.exists() ? Object.keys(presenceSnap.val()).length : 0);
  console.log('Visits keys:', visitsSnap.exists() ? Object.keys(visitsSnap.val()).length : 0);
  process.exit(0);
}

checkData();
