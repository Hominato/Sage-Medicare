"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Bell, Settings, User, LogOut, Clock, ShieldCheck, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useHMS } from '@/context/HMSContext';
import Link from 'next/link';

const SESSION_TIMEOUT_MINUTES = 30;

interface DashboardHeaderProps {
  title?: string;
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
}

interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  time: string;
  read: boolean;
}

// Nigeria WAT = UTC+1
function getWATTime() {
  return new Date().toLocaleTimeString('en-NG', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', type: 'warning', message: '3 lab results pending review', time: '5m ago', read: false },
  { id: '2', type: 'warning', message: 'Low stock: Amoxicillin (12 units)', time: '18m ago', read: false },
  { id: '3', type: 'info', message: 'Dr. Adeola Okon joined the network', time: '1h ago', read: false },
  { id: '4', type: 'success', message: 'Invoice #INV-0042 paid successfully', time: '2h ago', read: true },
  { id: '5', type: 'info', message: 'System maintenance scheduled Sunday 02:00 WAT', time: '3h ago', read: true },
];

export default function DashboardHeader({ 
  title, 
  userName = "Healthcare Professional", 
  userRole = "Staff",
  avatarUrl 
}: DashboardHeaderProps) {
  const { logout } = useHMS();
  const [sessionRemaining, setSessionRemaining] = useState(SESSION_TIMEOUT_MINUTES * 60);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [watTime, setWatTime] = useState(getWATTime());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [searchValue, setSearchValue] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // HIPAA: Session inactivity timeout
  const resetTimer = useCallback(() => setLastActivity(Date.now()), []);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    return () => events.forEach(e => window.removeEventListener(e, resetTimer));
  }, [resetTimer]);

  useEffect(() => {
    const interval = setInterval(() => {
      const idleSeconds = Math.floor((Date.now() - lastActivity) / 1000);
      const remaining = Math.max(0, SESSION_TIMEOUT_MINUTES * 60 - idleSeconds);
      setSessionRemaining(remaining);
      setWatTime(getWATTime());
      if (remaining === 0) logout();
    }, 1000);
    return () => clearInterval(interval);
  }, [lastActivity, logout]);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const isWarning = sessionRemaining < 300; // < 5 min

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismissNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center px-8 py-4 border-b border-slate-100 gap-4 md:gap-0 -mx-8 -mt-8 mb-8 shadow-sm">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {title && (
          <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-500" /> {title}
          </h2>
        )}
        <div className="relative w-full md:w-72 hidden md:block">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            className="bg-slate-50 border border-slate-100 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-200 w-full placeholder:text-slate-400 outline-none text-slate-700 transition-all focus:bg-white"
            placeholder="Search patients, records..."
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            id="header-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Nigeria WAT Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100">
          <Clock size={11} />
          <span>WAT {watTime}</span>
        </div>

        {/* HIPAA Session Timer */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
          isWarning ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-slate-50 text-slate-400 border-transparent'
        }`}>
          <ShieldCheck size={12} />
          {formatTime(sessionRemaining)}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(v => !v)}
            className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            aria-label="Open notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center">
                <h4 className="font-black text-slate-800 text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-5 py-4 group transition-colors ${n.read ? 'opacity-60' : 'bg-indigo-50/30'}`}>
                    <div className={`mt-0.5 shrink-0 ${n.type === 'warning' ? 'text-amber-500' : n.type === 'success' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                      {n.type === 'warning' ? <AlertCircle size={16} /> : n.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-slate-50">
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 w-full text-center">
                  View All Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          id="settings-btn"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          aria-label="System Settings"
        >
          <Settings size={20} />
        </Link>

        <div className="h-8 w-[1px] bg-slate-100 mx-1" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{userName}</p>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mt-1">{userRole}</p>
          </div>
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full border-2 border-indigo-100 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <User size={20} />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
        </div>

        {/* HIPAA Logout */}
        <button
          onClick={logout}
          id="logout-btn"
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all ml-1 border border-rose-100"
          title="Secure Logout (HIPAA)"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
}
