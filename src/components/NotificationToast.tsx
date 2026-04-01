'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Package, Tag, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';

export default function NotificationToast() {
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('ecozero_user');
    setUserEmail(email);

    // Listen to real-time updates for latest notifications
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latest = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() as any };
        
        // Check if target is 'all' or specific to this user
        if (latest.target === 'all' || (email && latest.target === email)) {
          // Check if this notification was already dismissed
          const dismissedId = localStorage.getItem('ecozero_dismissed_notif');
          
          if (dismissedId !== latest.id) {
            setActiveNotification(latest);
            // Show with a slight delay for better impact
            setTimeout(() => setIsVisible(true), 1500);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const dismissNotif = () => {
    setIsVisible(false);
    if (activeNotification) {
      localStorage.setItem('ecozero_dismissed_notif', activeNotification.id);
    }
  };

  if (!activeNotification) return null;

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package size={18} color="#3c7814" />;
      case 'offer': return <Tag size={18} color="#3c7814" />;
      default: return <Bell size={18} color="#3c7814" />;
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: isVisible ? '30px' : '-200px',
        right: '30px',
        zIndex: 10000,
        width: '340px',
        maxWidth: 'calc(100vw - 60px)',
        background: '#fff',
        border: '1.5px solid rgba(60, 120, 20, 0.2)',
        borderRadius: '24px',
        padding: '1.2rem',
        boxShadow: '0 20px 50px rgba(4, 28, 11, 0.25)',
        transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring bounce
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ 
          background: 'rgba(60, 120, 20, 0.1)', 
          padding: '6px 12px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#3c7814',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {getToastIcon(activeNotification.type)}
          <span>{activeNotification.type || 'System'} Alert</span>
        </div>
        <button 
          onClick={dismissNotif}
          style={{ background: 'none', border: 'none', color: '#7a9a60', cursor: 'pointer', display: 'flex' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div>
        <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: 800, color: 'rgb(4, 28, 11)' }}>{activeNotification.title}</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#5a7a40', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {activeNotification.desc}
        </p>
      </div>

      {/* Footer / CTA */}
      <Link 
        href="/notifications" 
        onClick={dismissNotif}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginTop: '4px',
          textDecoration: 'none',
          background: '#3c7814',
          padding: '10px 16px',
          borderRadius: '16px',
          color: '#fff',
          fontSize: '0.82rem',
          fontWeight: 700,
          transition: '0.2s'
        }}
      >
        <span>View Details</span>
        <ArrowRight size={16} strokeWidth={3} />
      </Link>
    </div>
  );
}
