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

  const getStatusStyle = (status: string) => {
    if (status === 'Shipped') return { bg: 'rgba(0,150,199,0.1)', color: '#0076a3', border: '1px solid rgba(0,150,199,0.3)' };
    if (status === 'Delivered') return { bg: 'rgba(60,120,20,0.1)', color: '#3c7814', border: '1px solid rgba(60,120,20,0.3)' };
    return { bg: 'rgba(224,123,0,0.1)', color: '#b35f00', border: '1px solid rgba(224,123,0,0.3)' };
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgb(215,232,188)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="#3c7814" />
      </div>
    );
  }

  return (
    <div className="page-main-wrapper">
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: '#fff', border: '1.5px solid rgba(60,120,20,0.2)',
              width: '42px', height: '42px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#3c7814', transition: '0.2s', flexShrink: 0,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(60,120,20,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'rgb(4, 28, 11)' }}>My Orders</h1>
            <p style={{ margin: '4px 0 0', color: '#5a7a40', fontSize: '0.95rem' }}>
              Track your active shipments in real-time.
            </p>
          </div>
        </div>

        {/* No Login */}
        {!userEmail ? (
          <div style={{
            background: '#fff', padding: '4rem 2rem', borderRadius: '20px',
            textAlign: 'center', boxShadow: '0 2px 12px rgba(60,120,20,0.08)',
          }}>
            <AlertCircle size={48} color="#5a7a40" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'rgb(4, 28, 11)' }}>No Account Detected</h3>
            <p style={{ color: '#5a7a40', marginBottom: '2rem' }}>Please sign in to view your order history.</p>
            <Link href="/login" style={{
              padding: '0.8rem 2rem', borderRadius: '30px', textDecoration: 'none',
              display: 'inline-block', background: '#3c7814', color: '#fff', fontWeight: 700,
            }}>Sign In</Link>
          </div>

        ) : orders.length === 0 ? (
          /* Empty Orders */
          <div style={{
            background: '#fff', padding: '5rem 2rem', borderRadius: '20px',
            textAlign: 'center', boxShadow: '0 2px 12px rgba(60,120,20,0.08)',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(60,120,20,0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
            }}>
              <PackageSearch size={36} color="#5a7a40" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'rgb(4, 28, 11)' }}>No orders placed yet</h3>
            <p style={{ color: '#5a7a40', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
              Looks like you haven't shopped with us yet. Discover our eco-friendly products today!
            </p>
            <Link href="/menu" style={{
              padding: '0.9rem 2.5rem', fontSize: '1.05rem', borderRadius: '30px',
              textDecoration: 'none', display: 'inline-block',
              background: '#3c7814', color: '#fff', fontWeight: 700,
            }}>Visit Catalog</Link>
          </div>

        ) : (
          /* Orders List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {orders.map((order) => {
              const orderDate = new Date(order.date);
              const statusStyle = getStatusStyle(order.status);

              return (
                <Link
                  href={`/orders/${order.id}`}
                  key={order.id}
                  style={{
                    background: '#fff', borderRadius: '20px',
                    border: '1.5px solid rgba(60,120,20,0.12)',
                    padding: '1.8rem', display: 'flex', flexDirection: 'column',
                    gap: '1.2rem', textDecoration: 'none', color: 'inherit',
                    transition: 'all 0.2s', cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(60,120,20,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(60,120,20,0.15)';
                    e.currentTarget.style.borderColor = '#3c7814';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(60,120,20,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(60,120,20,0.12)';
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', paddingBottom: '1.2rem',
                    borderBottom: '1px solid rgba(60,120,20,0.08)',
                    flexWrap: 'wrap', gap: '1rem',
                  }}>
                    <div>
                      <p style={{ color: '#5a7a40', fontSize: '0.85rem', marginBottom: '3px' }}>
                        Order ID: <span style={{ fontFamily: 'monospace', color: 'rgb(4, 28, 11)', fontWeight: 600 }}>{order.id.slice(0, 16)}...</span>
                      </p>
                      <p style={{ color: '#5a7a40', fontSize: '0.85rem', marginBottom: '3px' }}>
                        Placed on: <span style={{ color: 'rgb(4, 28, 11)', fontWeight: 600 }}>{orderDate.toLocaleDateString()}</span>
                      </p>
                      {order.deliveryDate && (
                        <p style={{ color: '#3c7814', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                          <Truck size={16} /> Estimated Delivery: {new Date(order.deliveryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3c7814', marginBottom: '6px' }}>
                        ₹{(order.total || 0).toFixed(0)}
                      </p>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: statusStyle.bg, color: statusStyle.color,
                        border: statusStyle.border,
                        padding: '5px 12px', borderRadius: '20px',
                        fontSize: '0.85rem', fontWeight: 700,
                      }}>
                        <StatusIcon status={order.status} /> {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.8rem' }}>
                    {order.items && order.items.map((item: any, idx: number) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        background: 'rgba(60,120,20,0.05)', padding: '0.8rem 1rem',
                        borderRadius: '12px', border: '1px solid rgba(60,120,20,0.1)',
                      }}>
                        <div style={{ background: '#fff', padding: '4px', borderRadius: '10px', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=100'}
                            alt={item.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                          />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'rgb(4, 28, 11)', marginBottom: '2px' }}>{item.name}</p>
                          <p style={{ color: '#5a7a40', fontSize: '0.82rem' }}>Qty: {item.qty || 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}

