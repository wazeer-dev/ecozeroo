'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageSearch, Loader2, ArrowLeft, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('ecozero_user');
    setUserEmail(email);
    
    if (email) {
      // Real-time listener for user's order history
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

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Delivered') return <PackageCheck size={18} color="#3c7814" />;
    if (status === 'Shipped') return <Truck size={18} color="#0096c7" />;
    return <Loader2 className="animate-spin" size={18} color="#e07b00" />;
  };

  const getStatusConfig = (status: string) => {
    if (status === 'Shipped') return { color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.08)', icon: <Truck size={14} />, label: 'IN TRANSIT' };
    if (status === 'Delivered') return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', icon: <PackageCheck size={14} />, label: 'PROTOCOL COMPLETE' };
    return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', icon: <Loader2 size={14} className="animate-spin" />, label: 'PROCESSING' };
  };



  const getStatusStyles = (status: string|undefined) => {
    switch (status) {
      case 'Shipped': return { color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', label: 'IN TRANSIT' };
      case 'Delivered': return { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', label: 'DELIVERED' };
      default: return { color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7', label: 'PROCESSING' };
    }
  };

  const colors = {
    forest: 'rgb(20, 104, 69)',
    deep: '#041c0b',
    border: 'rgba(20, 104, 69, 0.12)',
    glass: 'rgba(255, 255, 255, 0.9)'
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fcf7de', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color={colors.forest} />
      </div>
    );
  }

  return (
    <div className="orders-protocol-ledger" style={{ background: '#fcf7de', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* TOP BACK PROTOCOL */}
        <button 
           onClick={() => window.history.back()}
           style={{
             display: 'flex', alignItems: 'center', gap: '10px',
             background: 'white', border: `1px solid ${colors.border}`,
             padding: '12px 24px', borderRadius: '40px',
             fontSize: '0.8rem', fontWeight: 900, color: colors.forest,
             cursor: 'pointer', transition: 'all 0.3s ease',
             marginBottom: '2.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
             fontFamily: 'Oswald, sans-serif', letterSpacing: '1px'
           }}
           onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-5px)'; e.currentTarget.style.background = colors.forest; e.currentTarget.style.color = 'white'; }}
           onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'white'; e.currentTarget.style.color = colors.forest; }}
        >
          <ArrowLeft size={16} /> BACK TO MENU
        </button>

        {/* Header Section */}
        <div style={{ marginBottom: '4rem' }}>
           <h1 style={{ 
              fontSize: 'clamp(3rem, 12vw, 5rem)', 
              fontWeight: 900, 
              color: colors.deep, 
              fontFamily: 'Oswald, sans-serif',
              margin: '0 0 10px',
              textTransform: 'uppercase',
              lineHeight: 0.9,
              letterSpacing: '-2px'
           }}>
             ORDER <span style={{ color: colors.forest }}>HISTORY</span>
           </h1>
           <p style={{ color: colors.deep, opacity: 0.5, fontWeight: 600, fontSize: '1.2rem' }}>
             Tracking your ecological footprint in real-time.
           </p>
        </div>

        {!userEmail ? (
          <div style={{ background: 'white', padding: '5rem 2rem', borderRadius: '40px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
             <AlertCircle size={48} color={colors.forest} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
             <h3 style={{ fontSize: '2rem', fontWeight: 800, color: colors.deep, fontFamily: 'Oswald, sans-serif' }}>IDENTITY REQUIRED</h3>
             <p style={{ marginBottom: '3rem', opacity: 0.6 }}>Synchronize your account to decrypt your logistics manifestations.</p>
             <Link href="/login" style={{ background: colors.forest, padding: '1rem 3rem', color: 'white', borderRadius: '40px', fontWeight: 800, textDecoration: 'none' }}>LOGIN TO PORTAL</Link>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
             <PackageSearch size={40} color={colors.forest} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
             <h3 style={{ fontSize: '2rem', fontWeight: 800, color: colors.deep, fontFamily: 'Oswald, sans-serif' }}>NO MANIFESTS FOUND</h3>
             <Link href="/menu" style={{ color: colors.forest, fontWeight: 900, textDecoration: 'underline', marginTop: '1rem', display: 'block' }}>START SHOPPING &rarr;</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => {
              const status = getStatusStyles(order.status);
              const orderDate = new Date(order.date);

              return (
                <div 
                  key={order.id}
                  style={{
                    background: 'white', borderRadius: '35px',
                    border: `1px solid ${colors.border}`,
                    padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {/* Status Strip */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0, padding: '8px 24px',
                    background: status.bg, color: status.color, borderBottomLeftRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif',
                    letterSpacing: '1px', borderLeft: `1px solid ${status.border}`, borderBottom: `1px solid ${status.border}`
                  }}>
                    {status.label}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 900, color: colors.forest, opacity: 0.4, marginBottom: '8px' }}>MANIFEST ID: {order.id.slice(0, 12).toUpperCase()}</p>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: colors.deep, marginBottom: '4px' }}>
                        {orderDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: colors.deep, opacity: 0.6 }}>Registered on {orderDate.getFullYear()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '2.4rem', fontWeight: 900, color: colors.deep, margin: 0, letterSpacing: '-2px', fontFamily: 'Inter, sans-serif' }}>
                        ₹{(order.total || 0).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '2rem', flexWrap: 'wrap' }}>
                    {order.items && order.items.map((item: any, idx: number) => (
                      <div key={idx} style={{ 
                        background: '#f8faf2', padding: '8px 16px', borderRadius: '20px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        border: '1px solid rgba(20, 104, 69, 0.05)'
                      }}>
                        <img src={item.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: colors.deep }}>{item.qty}x {item.name}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '2rem', borderTop: `1px dashed ${colors.border}`, paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                     <Link href={`/orders/${order.id}`} style={{
                       textDecoration: 'none', color: colors.forest, fontWeight: 900,
                       fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
                       letterSpacing: '0.5px'
                     }}>
                        FULL MANIFEST DATA <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                     </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;900&family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        .orders-protocol-ledger {
          padding: 140px 0 100px;
        }

        @media (max-width: 1024px) {
           .orders-protocol-ledger {
              padding: 40px 0 100px !important;
           }
        }
      `}} />
    </div>
  );
}
