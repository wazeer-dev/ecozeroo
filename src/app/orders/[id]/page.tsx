'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Loader2, ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Real-time listener for order status updates
    const docRef = doc(db, 'orders', id as string);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        setOrder(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to order status:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    
    setIsLoading(true);
    try {
      const docRef = doc(db, 'orders', id as string);
      await updateDoc(docRef, {
        status: 'Cancelled',
        updatedAt: new Date().toISOString()
      });
      // Refresh local state
      setOrder((prev: any) => ({ ...prev, status: 'Cancelled' }));
      alert("Order cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="var(--accent)" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ paddingTop: '160px', minHeight: '100vh', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Order Not Found</h2>
        <button onClick={() => router.push('/orders')} className="btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '30px' }}>Back to Orders</button>
      </div>
    );
  }

  const orderDate = new Date(order.date);
  
  const getStatusStep = (status: string) => {
    if (status === 'Processing') return 1;
    if (status === 'Shipped') return 2;
    if (status === 'Delivered') return 3;
    return 1;
  };

  const currentStep = getStatusStep(order.status);

  return (
    <div style={{ paddingTop: '120px', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => router.push('/orders')}
            style={{ background: 'var(--surface-color)', border: '1px solid rgba(136, 198, 95, 0.2)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Order Details</h1>
            <p style={{ color: 'var(--text-muted)' }}>Order ID: <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{order.id}</span></p>
          </div>
        </div>

        <div className="order-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          <div className="order-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Status Stepper - Matching User Image Aesthetic */}
            {order.status !== 'Cancelled' && (
              <div className="status-container" style={{ 
                background: 'rgb(215, 232, 188)', // Light green background from image
                border: '1px solid rgba(60, 120, 20, 0.2)', 
                borderRadius: '24px', 
                padding: '3.5rem 2rem',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
              }}>
                <div className="status-steps" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
                  
                  {/* Connecting Line */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '25px', 
                    left: '40px', 
                    right: '40px', 
                    height: '2px', 
                    background: 'rgba(60, 120, 20, 0.3)', 
                    zIndex: 0 
                  }}>
                     <div style={{ 
                       height: '100%', 
                       background: 'rgb(60, 120, 20)', 
                       width: `${(currentStep - 1) * 50}%`, 
                       transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                       boxShadow: '0 0 10px rgba(60, 120, 20, 0.3)'
                     }}></div>
                  </div>
                  
                  {[
                    { label: 'Processing', icon: Clock, step: 1 },
                    { label: 'Shipped', icon: Truck, step: 2 },
                    { label: 'Delivered', icon: CheckCircle2, step: 3 }
                  ].map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;
                    return (
                      <div key={idx} style={{ 
                        position: 'relative', 
                        zIndex: 1, 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '12px',
                        flex: 1
                      }}>
                        <div 
                          className={`status-icon-wrap ${isCurrent ? 'active-pulse' : ''}`}
                          style={{ 
                            width: '54px', 
                            height: '54px', 
                            borderRadius: '50%', 
                            background: isActive ? 'rgb(136, 198, 95)' : 'rgba(60, 120, 20, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'rgb(4, 28, 11)',
                            border: isActive ? '2px solid rgb(60, 120, 20)' : '2px solid transparent',
                            transition: 'all 0.5s ease',
                            transform: isActive ? 'scale(1.1)' : 'scale(1)',
                            boxShadow: isActive ? '0 8px 20px rgba(60, 120, 20, 0.2)' : 'none'
                          }}
                        >
                          <Icon size={26} strokeWidth={2.5} />
                        </div>
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: 800, 
                          color: isActive ? 'rgb(4, 28, 11)' : 'rgba(60, 120, 20, 0.5)',
                          transition: 'color 0.5s ease'
                        }}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid rgba(60,120,20,0.1)', paddingTop: '1.5rem' }}>
                  <p style={{ margin: 0, color: 'rgb(60, 120, 20)', fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated Roadmap Arrival</p>
                  <p style={{ margin: '8px 0 0 0', color: 'rgb(4, 28, 11)', fontSize: '1.6rem', fontWeight: 900 }}>
                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending Dispatch Data...'}
                  </p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div style={{ background: 'var(--surface-color)', border: '1px solid rgba(136, 198, 95, 0.1)', borderRadius: '24px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent)' }}>
                <Package size={24} /> Items Roadmap
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {order.items && order.items.map((item: any, idx: number) => (
                  <div key={idx} className="order-item-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' }}>
                    <div className="order-item-img" style={{ background: '#fff', padding: '8px', borderRadius: '15px', width: '90px', height: '90px', flexShrink: 0, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                      <img src={item.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=100'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{item.name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.4rem 0' }}>Eco-Conscious Unit</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--accent)', margin: 0 }}>₹{parseFloat(item.price || 0).toFixed(0)}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Quantity: 1</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Option - Only for Processing Stage */}
            {order.status === 'Processing' && (
              <div style={{ 
                background: 'rgba(255, 68, 68, 0.05)', 
                border: '1px dashed rgba(255, 68, 68, 0.2)', 
                borderRadius: '24px', 
                padding: '2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{ color: '#ff4444', margin: 0, fontSize: '1.1rem' }}>Cancellation Protocol</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '5px 0 0 0' }}>You can still cancel this order as it hasn't been shipped yet.</p>
                </div>
                <button 
                  onClick={handleCancelOrder}
                  style={{ 
                    background: '#ff4444', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '12px 24px', 
                    borderRadius: '30px', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 5px 15px rgba(255, 68, 68, 0.2)'
                  }}
                >
                  Cancel Order
                </button>
              </div>
            )}

            {/* Cancelled Alert */}
            {order.status === 'Cancelled' && (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '24px', 
                padding: '2rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.5rem',
                color: '#fff'
              }}>
                <XCircle size={32} color="#ff4444" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Order Terminated</h4>
                  <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>This transaction has been cancelled. Any payments captured will be reversed to your source account.</p>
                </div>
              </div>
            )}
          </div>

          <div className="order-side-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Order Summary Card */}
            <div style={{ background: 'var(--surface-color)', border: '1px solid rgba(136, 198, 95, 0.1)', borderRadius: '24px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>₹{(order.total || 0).toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Shipping</span>
                  <span style={{ color: 'var(--accent)' }}>Free</span>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                  <span style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent)' }}>₹{(order.total || 0).toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Customer & Info Card */}
            <div style={{ background: 'var(--surface-color)', border: '1px solid rgba(136, 198, 95, 0.1)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Calendar size={20} color="var(--accent)" />
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Date Placed</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Truck size={20} color="var(--accent)" />
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Estimated Delivery</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Calculating...'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <MapPin size={20} color="var(--accent)" />
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Delivery Address</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{order.address || '123 Eco Lane, Sustainable City'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <CreditCard size={20} color="var(--accent)" />
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Payment Method</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Visa ending in •••• 4242</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0px rgba(60, 120, 20, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(60, 120, 20, 0); }
          100% { box-shadow: 0 0 0 0px rgba(60, 120, 20, 0); }
        }
        .active-pulse {
          animation: pulse-glow 2s infinite;
        }

        @media (max-width: 992px) {
          .order-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .status-container { padding: 1.5rem !important; }
          .status-label { font-size: 0.75rem !important; }
          .status-icon-wrap { width: 44px !important; height: 44px !important; }
          .status-icon-wrap svg { width: 20px !important; height: 20px !important; }
          .order-item-card { flex-direction: column; align-items: flex-start !important; gap: 1rem !important; }
          .order-item-card > div:last-child { text-align: left !important; width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); paddingTop: 1rem; }
        }
      `}} />
    </div>
  );
}
