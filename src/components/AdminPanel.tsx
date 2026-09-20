import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Activity, Eye, LogOut, ArrowLeft, DiscIcon as Discord, Camera, Bell } from 'lucide-react';
import { getDbRef } from '../lib/tracking';
import { onValue } from 'firebase/database';

// Hardcoded password for basic protection
const ADMIN_PASSWORD = "bat"; // Simple for testing, user can change later

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Dashboard State
  const [liveUsers, setLiveUsers] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [clicks, setClicks] = useState({
    subscribe: 0,
    discord: 0,
    instagram: 0
  });
  
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Fetch Firebase Data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const presenceRef = getDbRef('presence');
    const visitsRef = getDbRef('stats/visits');
    const eventsRef = getDbRef('stats/events');
    
    if (!presenceRef || !visitsRef || !eventsRef) return; // Firebase not initialized

    const unsubscribePresence = onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        // Count keys in presence object (each key is an active session)
        setLiveUsers(Object.keys(snapshot.val()).length);
      } else {
        setLiveUsers(0);
      }
    });

    const unsubscribeVisits = onValue(visitsRef, (snapshot) => {
      if (snapshot.exists()) setTotalVisits(Object.keys(snapshot.val()).length);
    });

    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setClicks({
          subscribe: data.subscribe ? Object.keys(data.subscribe).length : 0,
          discord: data.discord ? Object.keys(data.discord).length : 0,
          instagram: data.instagram ? Object.keys(data.instagram).length : 0,
        });
      }
    });

    return () => {
      unsubscribePresence();
      unsubscribeVisits();
      unsubscribeEvents();
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password!");
      setPasswordInput('');
    }
  };

  return (
    <motion.div 
      className="admin-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', padding: '1rem'
      }}
    >
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div 
            key="login"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="admin-login-box"
            style={{
              background: '#18181b', padding: '2.5rem', borderRadius: '12px',
              border: '1px solid #27272a', width: '100%', maxWidth: '400px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <Shield size={28} color="#a3e635" />
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'Rubik, sans-serif' }}>Admin Access</h2>
            </div>
            
            <p style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '0.9rem' }}>
              This area is strictly for KaaliChamkadad. Enter the passkey to access live telemetry.
            </p>
            
            <form onSubmit={handleLogin}>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '6px',
                  background: '#09090b', border: '1px solid #3f3f46', color: '#fff',
                  marginBottom: '1rem', outline: 'none'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="button button-lime" style={{ flex: 1 }}>Authenticate</button>
                <button type="button" className="button button-outline" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="admin-dashboard"
            style={{
              width: '100%', maxWidth: '900px', height: '80vh',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity color="#a3e635" /> Live Telemetry
                </h1>
                <p style={{ color: '#a1a1aa', margin: '0.5rem 0 0 0' }}>KaaliChamkadad Command Center</p>
              </div>
              <button 
                onClick={onClose}
                className="icon-button"
                style={{ background: '#27272a', padding: '0.75rem', borderRadius: '50%' }}
              >
                <LogOut size={18} />
              </button>
            </header>

            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1.5rem', marginBottom: '2rem' 
            }}>
              {/* Stat Card: Live Users */}
              <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a3e635', marginBottom: '1rem' }}>
                  <Users size={20} /> <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Online Now</span>
                </div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{liveUsers}</div>
              </div>

              {/* Stat Card: Total Visits */}
              <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', marginBottom: '1rem' }}>
                  <Eye size={20} /> <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Total Visits</span>
                </div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{totalVisits}</div>
              </div>
            </div>

            <h3 style={{ borderBottom: '1px solid #27272a', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Action Tracking</h3>
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div style={{ background: '#18181b', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={16} /> Subscribes</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{clicks.subscribe}</div>
              </div>
              
              <div style={{ background: '#18181b', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #5865F2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Discord size={16} /> Discord Joins</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{clicks.discord}</div>
              </div>

              <div style={{ background: '#18181b', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #e1306c' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={16} /> Instagram</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{clicks.instagram}</div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(163, 230, 53, 0.1)', padding: '1rem', borderRadius: '8px', color: '#a3e635', fontSize: '0.85rem' }}>
              <strong>Note:</strong> Data is currently pulling from Firebase Realtime Database. If numbers are 0 and you have traffic, ensure Firebase config is correctly added in <code>src/lib/tracking.ts</code>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
