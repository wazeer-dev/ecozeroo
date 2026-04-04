'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageSearch, Loader2, ArrowLeft, Truck, PackageCheck, AlertCircle, ChevronRight, History } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  const colors = {
    bg: '#fcf7de',
    accent: 'rgb(20, 104, 69)',
    text: '#041c0b',
    border: 'rgba(20, 104, 69, 0.08)',
    textMuted: 'rgba(4, 28, 11, 0.5)'
  };

  useEffect(() => {
    const email = localStorage.getItem('ecozero_user');
    setUserEmail(email);
    if (email) {
      const q = query(collection(db, 'orders'), where('userEmail', '==', email));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() as any }))
          .filter(order => order.status !== 'Cancelled');
        ordersData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(ordersData);
        setIsLoading(false);
      }, (error) => {
        console.error('Error listening to user orders:', error);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Delivered': return { bg: '#e7f5ec', color: colors.accent, label: 'DELIVERED', icon: <PackageCheck size={12} /> };
      case 'Shipped': return { bg: '#e6f4f1', color: '#006d77', label: 'SHIPPED', icon: <Truck size={12} /> };
      default: return { bg: '#fff4e6', color: '#e07b00', label: 'PROCESSING', icon: <Loader2 size={12} className="animate-spin" /> };
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color={colors.accent} />
      </div>
    );
  }

  return (
    <div className="orders-page" style={{ minHeight: '100vh', background: colors.bg, paddingBottom: '100px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;900&display=swap');
        .orders-container, .orders-header { padding-top: 140px; }
        @media (max-width: 768px) {
          .orders-container, .orders-header { padding-top: 1.5rem !important; }
        }
        .order-card-refined:hover { border-color: ${colors.accent}; box-shadow: 0 10px 30px rgba(20, 104, 69, 0.05); }
      `}} />

      <div className="orders-container" style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px' }}>

        {/* HEADER */}
        <div className="orders-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
           <button onClick={() => router.push('/menu')} style={{ background: '#fff', border: `1px solid ${colors.border}`, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.accent }}>
              <ArrowLeft size={16} />
           </button>
           <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
             My <span style={{ color: colors.accent }}>Orders</span>
           </h1>
        </div>

        {/* LIST */}
        {!userEmail ? (
          <div style={{ background: '#fff', padding: '4rem 2rem', borderRadius: '30px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', fontFamily: 'Oswald, sans-serif' }}>Please Log In</h3>
            <Link href="/login" style={{ padding: '0.8rem 2rem', borderRadius: '30px', background: colors.accent, color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem' }}>LOG IN NOW</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {orders.map((order) => {
              const cfg = getStatusConfig(order.status);
              const itemsCount = (order.items || []).length;
              
              return (
                <Link 
                  href={`/orders/${order.id}`}
                  key={order.id}
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '20px', 
                    padding: '1rem', 
                    border: `1px solid ${colors.border}`, 
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: '0.3s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="order-card-refined"
                >
                  {/* Status Indicator Bar */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: cfg.color }}></div>

                  {/* MULTI IMAGE PREVIEW */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    paddingLeft: '5px',
                    minWidth: itemsCount > 1 ? (48 + (Math.min(itemsCount, 4) - 1) * 15) + 'px' : '56px' 
                  }}>
                    {order.items && order.items.length > 0 ? (
                       order.items.slice(0, 4).map((item: any, idx: number) => (
                         <div 
                           key={idx} 
                           style={{ 
                              width: '48px', 
                              height: '48px', 
                              flexShrink: 0, 
                              background: '#fff', 
                              borderRadius: '12px', 
                              overflow: 'hidden', 
                              border: '2px solid #fff',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                              marginLeft: idx > 0 ? '-18px' : '0',
                              zIndex: 10 - idx,
                              position: 'relative'
                           }}
                         >
                            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {idx === 3 && itemsCount > 4 && (
                              <div style={{ 
                                position: 'absolute', inset: 0, 
                                background: 'rgba(0,0,0,0.5)', 
                                color: '#fff', fontSize: '0.7rem', 
                                fontWeight: 900, display: 'flex', 
                                alignItems: 'center', justifyContent: 'center' 
                              }}>
                                +{itemsCount - 3}
                              </div>
                            )}
                         </div>
                       ))
                    ) : (
                       <div style={{ width: '48px', height: '48px', background: '#f8f8f8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, border: '1px solid #eee' }}>
                         <PackageSearch size={22} />
                       </div>
                    )}
                  </div>
 
                  {/* INFO CENTRAL */}
                  <div style={{ flex: 1, minWidth: 0, marginLeft: '5px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: colors.textMuted, letterSpacing: '0.5px' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                        <div style={{ background: cfg.bg, color: cfg.color, padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                           {cfg.icon} {cfg.label}
                        </div>
                     </div>
                     <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: colors.text, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.items && order.items[0] ? order.items[0].name : 'MANIFEST ENTRY'}
                        {itemsCount > 1 && <span style={{ color: colors.accent, marginLeft: '6px', fontSize: '0.75rem', background: 'rgba(20, 104, 69, 0.05)', padding: '1px 6px', borderRadius: '4px' }}>{itemsCount} ITEMS</span>}
                     </h4>
                     <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted }}>
                        Ordered on {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                     </p>
                  </div>

                  {/* PRICE BLOCK */}
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '1rem', borderLeft: '1px dashed #eee' }}>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 950, color: colors.text, fontVariantNumeric: 'tabular-nums' }}>₹{(order.total || 0).toFixed(0)}</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: colors.accent, letterSpacing: '0.5px' }}>DETAILS</span>
                     </div>
                     <ChevronRight size={16} color={colors.textMuted} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
