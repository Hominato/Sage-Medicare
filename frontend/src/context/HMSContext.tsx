"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

type NotificationType = 'SUCCESS' | 'ERROR' | 'INFO';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  staffProfile?: {
    firstName: string;
    lastName: string;
    specialization?: string;
  } | null;
  patientProfile?: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    insuranceInfo?: string;
  } | null;
}

interface HMSContextType {
  notify: (type: NotificationType, message: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const HMSContext = createContext<HMSContextType | undefined>(undefined);

export function HMSProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUserState] = useState<User | null>(null);

  // Rehydrate user from localStorage on mount (fixes refresh bug)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hms_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserState(parsed);
      }
    } catch {
      localStorage.removeItem('hms_user_profile');
    }
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('hms_user_profile', JSON.stringify(u));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user_role');
    localStorage.removeItem('hms_user_id');
    localStorage.removeItem('hms_user_email');
    localStorage.removeItem('hms_user_profile');
    setUserState(null);
    window.location.href = '/login';
  }, []);

  const notify = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  return (
    <HMSContext.Provider value={{ notify, user, setUser, logout }}>
      {children}
      <div className="fixed top-8 right-8 z-[9999] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`flex items-center gap-4 p-5 rounded-[2rem] border min-w-[320px] shadow-2xl backdrop-blur-3xl ${
                n.type === 'SUCCESS' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-900 shadow-emerald-100/50' :
                n.type === 'ERROR' ? 'bg-rose-50/90 border-rose-100 text-rose-900 shadow-rose-100/50' :
                'bg-indigo-50/90 border-indigo-100 text-indigo-900 shadow-indigo-100/50'
              }`}>
                <div className={`p-3 rounded-2xl ${
                  n.type === 'SUCCESS' ? 'bg-emerald-500 text-white' :
                  n.type === 'ERROR' ? 'bg-rose-500 text-white' :
                  'bg-indigo-500 text-white'
                }`}>
                  {n.type === 'SUCCESS' && <CheckCircle2 size={24} />}
                  {n.type === 'ERROR' && <AlertCircle size={24} />}
                  {n.type === 'INFO' && <Info size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-widest opacity-40 mb-1">{n.type}</h4>
                  <p className="font-bold text-sm tracking-tight">{n.message}</p>
                </div>
                <button 
                  onClick={() => setNotifications((prev) => prev.filter((notif) => notif.id !== n.id))}
                  className="opacity-20 hover:opacity-100 transition-opacity p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </HMSContext.Provider>
  );
}

export function useHMS() {
  const context = useContext(HMSContext);
  if (!context) throw new Error('useHMS must be used within HMSProvider');
  return context;
}
