import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

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

const testRef = ref(db, 'test');
set(testRef, { time: Date.now() })
  .then(() => {
    console.log('SUCCESS: Written to database');
    process.exit(0);
  })
  .catch((err) => {
    console.error('ERROR: Failed to write to database', err.message);
    process.exit(1);
  });
