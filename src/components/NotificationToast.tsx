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
          // Check if this specific notification was ever dismissed/used
          const usedRegistry = JSON.parse(localStorage.getItem('ecozero_used_notifs') || '[]');
          
          if (!usedRegistry.includes(latest.id)) {
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
      const usedRegistry = JSON.parse(localStorage.getItem('ecozero_used_notifs') || '[]');
      if (!usedRegistry.includes(activeNotification.id)) {
        usedRegistry.push(activeNotification.id);
        localStorage.setItem('ecozero_used_notifs', JSON.stringify(usedRegistry));
      }
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
      className="notif-toast"
      style={{
        position: 'fixed',
        bottom: isVisible ? '30px' : '-200px',
        right: '30px',
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        zIndex: 10000,
        width: '360px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(60, 120, 20, 0.15)',
        borderRadius: '20px',
        padding: '1rem',
        boxShadow: '0 15px 35px rgba(4, 28, 11, 0.15)',
        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .notif-toast {
            padding: 0.8rem !important;
            border-radius: 18px !important;
            bottom: ${isVisible ? '110px' : '-200px'} !important;
            right: 15px !important;
          }
          .notif-toast h4 { font-size: 0.9rem !important; }
          .notif-toast p { font-size: 0.75rem !important; }
          .notif-badge { padding: 4px 8px !important; font-size: 0.65rem !important; gap: 4px !important; }
          .cta-btn { padding: 8px 12px !important; font-size: 0.75rem !important; border-radius: 12px !important; }
        }
      `}} />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="notif-badge" style={{ 
          background: 'rgba(136, 198, 95, 0.1)', 
          padding: '6px 12px', 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#146845',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '5px' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'rgb(4, 28, 11)' }}>{activeNotification.title}</h4>
          {activeNotification.offerValue && (
            <span style={{ 
              background: '#146845', color: '#fff', padding: '4px 8px', borderRadius: '8px', 
              fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap'
            }}>
              {activeNotification.offerValue}
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#5a7a40', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {activeNotification.desc}
        </p>
      </div>

      {/* Footer / CTA */}
      <Link 
        href={activeNotification.linkedProductId ? `/product/${activeNotification.linkedProductId}` : '/notifications'} 
        onClick={dismissNotif}
        className="cta-btn"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginTop: '2px',
          textDecoration: 'none',
          background: '#146845',
          padding: '10px 16px',
          borderRadius: '14px',
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: 800,
          transition: '0.2s',
          boxShadow: '0 4px 12px rgba(20, 104, 69, 0.15)'
        }}
      >
        <span>{activeNotification.linkedProductId ? `Redeem Offer` : 'View Details'}</span>
        <ArrowRight size={16} strokeWidth={3} />
      </Link>
    </div>
  );
}
