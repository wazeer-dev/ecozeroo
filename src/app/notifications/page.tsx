'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Package, Tag, Clock } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const userEmail = localStorage.getItem('ecozero_user');
        
        // Fetch all recent notifications (we'll filter 'all' vs specific locally for simplicity in this proto)
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(15));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as any
        }));
        
        // Filter: Show only if target is 'all' OR target matches current user email
        const filtered = data.filter(n => n.target === 'all' || n.target === userEmail);
        
        setNotifications(filtered);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
      setLoading(false);
    };
    fetchNotifs();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package size={22} color="#3c7814" />;
      case 'offer': return <Tag size={22} color="#3c7814" />;
      default: return <Bell size={22} color="#3c7814" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page-main-wrapper">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'rgb(4, 28, 11)' }}>
              Recent <span style={{ color: '#3c7814' }}>Updates</span>
            </h1>
            <p style={{ color: '#5a7a40', fontSize: '0.95rem', marginTop: '6px' }}>Stay informed about your orders and offers</p>
          </div>
          <button style={{
            background: '#fff', border: '1.5px solid rgba(60,120,20,0.3)',
            color: '#3c7814', padding: '9px 20px', borderRadius: '30px',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: '0.2s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(60,120,20,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            Mark all as read
          </button>
        </div>

        {/* Notification Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {notifications.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '20px' }}>
              <Bell size={40} color="#3c7814" style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ color: '#5a7a40', fontWeight: 600 }}>No new updates at the moment.</p>
            </div>
          )}
          {notifications.map((notif) => (
            <div key={notif.id} style={{
              background: '#fff', border: '1.5px solid rgba(60,120,20,0.12)',
              borderRadius: '18px', padding: '1.3rem 1.5rem',
              display: 'flex', gap: '1.2rem', alignItems: 'flex-start',
              transition: '0.2s', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(60,120,20,0.06)',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3c7814'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(60,120,20,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(60,120,20,0.12)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(60,120,20,0.06)'; }}
            >
              {/* Icon */}
              <div style={{
                width: '46px', height: '46px', borderRadius: '14px',
                background: 'rgba(60,120,20,0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {getIcon(notif.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'rgb(4, 28, 11)' }}>{notif.title}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#7a9a60', whiteSpace: 'nowrap', flexShrink: 0 }}>{getTimeAgo(notif.createdAt)}</span>
                </div>
                <p style={{ color: '#5a7a40', margin: 0, lineHeight: 1.5, fontSize: '0.9rem' }}>{notif.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button style={{
            background: '#fff', color: '#5a7a40', border: '1.5px solid rgba(60,120,20,0.2)',
            padding: '10px 28px', borderRadius: '30px', fontWeight: 600, cursor: 'pointer',
            fontSize: '0.9rem', transition: '0.2s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(60,120,20,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            Load older notifications
          </button>
        </div>
      </div>
    </div>
  );
}

