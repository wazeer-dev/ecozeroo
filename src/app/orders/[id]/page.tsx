'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Loader2, ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle2, Clock, XCircle, ChevronRight, History } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const colors = {
    bg: '#fcf7de',
    accent: 'rgb(20, 104, 69)',
    text: '#041c0b',
    border: 'rgba(20, 104, 69, 0.1)',
    textMuted: 'rgba(4, 28, 11, 0.5)'
  };

  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
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

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color={colors.accent} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ paddingTop: '160px', minHeight: '100vh', background: colors.bg, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif' }}>ORDER NOT FOUND</h2>
        <button onClick={() => router.push('/orders')} style={{ padding: '1rem 2.5rem', background: colors.accent, color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 900, cursor: 'pointer' }}>BACK TO ORDERS</button>
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

  const handleCancelOrder = async () => {
    if (!id || !confirm("Are you sure you want to trigger the Cancellation Protocol? This action is permanent.")) return;
    
    setIsCancelling(true);
    try {
      const docRef = doc(db, 'orders', id as string);
      await updateDoc(docRef, { 
        status: 'Cancelled',
        cancelledAt: new Date().toISOString()
      });
      alert("Order Cancellation Successful. The protocol has been updated.");
    } catch (err) {
      console.error("Cancellation error:", err);
      alert("Error triggering cancellation protocol. Access denied.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, paddingBottom: '100px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;900&display=swap');
        .order-details-container { padding-top: 100px; }
        @media (max-width: 768px) {
           .order-details-container { padding-top: 5rem !important; }
           .order-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
        @media (max-width: 480px) {
           .order-details-container { padding: 0 15px !important; padding-top: 4rem !important; }
           .tracking-card { padding: 1.5rem !important; border-radius: 24px !important; }
           .card-generic { padding: 1.2rem !important; border-radius: 24px !important; }
           .order-info-h1 { font-size: 1.8rem !important; }
           .protocol-id-text { font-size: 0.65rem !important; }
           .step-label { font-size: 0.55rem !important; }
           .arrival-h4 { font-size: 1.1rem !important; }
           .summary-card-inner { padding: 1.5rem !important; }
        }
      `}} />

      <div className="order-details-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
           <button onClick={() => router.push('/orders')} style={{ background: '#fff', border: `1px solid ${colors.border}`, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.accent, flexShrink: 0 }}>
              <ArrowLeft size={16} />
           </button>
           <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="order-info-h1" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', lineHeight: 1 }}>Order <span style={{ color: colors.accent }}>Info</span></h1>
              <p className="protocol-id-text" style={{ margin: '4px 0 0', fontSize: '0.75rem', fontWeight: 900, color: colors.textMuted, letterSpacing: '0.8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Protocol ID: {order.id.slice(0, 12).toUpperCase()}</p>
           </div>
        </div>

        <div className="order-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', alignItems: 'start' }}>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* TRACKING CARD WITH ANIMATIONS */}
              {order.status !== 'Cancelled' && (
                <div className="tracking-card" style={{ background: '#fff', borderRadius: '30px', padding: '2.5rem', border: `1px solid ${colors.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '2.5rem' }}>
                      <div style={{ position: 'absolute', top: '22px', left: '10%', right: '10%', height: '3px', background: '#f5f5f5', zIndex: 0 }}>
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(currentStep - 1) * 50}%` }}
                           transition={{ duration: 1.2, ease: "circOut" }}
                           style={{ height: '100%', background: colors.accent }}
                         ></motion.div>
                      </div>
                      
                      {[
                        { label: 'Wait', icon: Clock, step: 1 },
                        { label: 'Ship', icon: Truck, step: 2 },
                        { label: 'Arrive', icon: CheckCircle2, step: 3 }
                      ].map((s, idx) => {
                        const Icon = s.icon;
                        const active = currentStep >= s.step;
                        const isCurrent = currentStep === s.step;
                        return (
                          <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                             <motion.div 
                               initial={{ scale: 0.8, opacity: 0 }}
                               animate={{ 
                                 scale: active ? 1 : 0.9, 
                                 opacity: 1,
                                 boxShadow: isCurrent ? `0 0 20px ${colors.accent}` : 'none'
                               }}
                               transition={{ delay: idx * 0.2, type: 'spring', stiffness: 200 }}
                               style={{ 
                                 width: '44px', 
                                 height: '44px', 
                                 borderRadius: '50%', 
                                 background: active ? colors.accent : '#fff', 
                                 color: active ? '#fff' : colors.textMuted, 
                                 border: `2px solid ${active ? colors.accent : colors.border}`, 
                                 display: 'flex', 
                                 alignItems: 'center', 
                                 justifyContent: 'center', 
                                 transition: '0.3s',
                                 position: 'relative'
                               }}
                             >
                                <Icon size={20} strokeWidth={2.5} />
                                {isCurrent && (
                                   <motion.div 
                                     animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                                     transition={{ repeat: Infinity, duration: 2 }}
                                     style={{ position: 'absolute', inset: -4, border: `2px solid ${colors.accent}`, borderRadius: '50%' }}
                                   />
                                )}
                             </motion.div>
                             <span className="step-label" style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: active ? colors.text : colors.textMuted }}>{s.label}</span>
                          </div>
                        );
                      })}
                   </div>

                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.8 }}
                     style={{ textAlign: 'center', paddingTop: '1.5rem', borderTop: `1px dashed ${colors.border}` }}
                   >
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated Arrival</span>
                      <h4 className="arrival-h4" style={{ margin: '5px 0 0', fontSize: '1.4rem', fontWeight: 900, color: colors.text }}>
                         {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Setting up delivery...'}
                      </h4>
                   </motion.div>
                </div>
              )}

              {/* ITEMS CARD */}
              <div className="card-generic" style={{ background: '#fff', borderRadius: '30px', padding: '2rem', border: `1px solid ${colors.border}` }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Package size={18} color={colors.accent} /> Items in Order
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {order.items && order.items.map((item: any, idx: number) => (
                       <motion.div 
                         key={idx} 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.2 + idx * 0.1 }}
                         style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1rem', background: 'rgba(20, 104, 69, 0.03)', borderRadius: '20px', border: `1px solid ${colors.border}` }}
                       >
                          <img src={item.image} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #fff' }} />
                          <div style={{ flex: 1 }}>
                             <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>{item.name}</p>
                             <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textMuted, fontWeight: 600 }}>Quantity: {item.quantity || 1}</p>
                          </div>
                          <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>₹{parseFloat(item.price).toFixed(0)}</span>
                       </motion.div>
                    ))}
                 </div>
              </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* SUMMARY CARD */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="summary-card-inner"
                style={{ background: colors.accent, borderRadius: '30px', padding: '2rem', color: '#fff', boxShadow: '0 15px 30px rgba(20, 104, 69, 0.2)' }}
              >
                 <h3 style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', marginBottom: '1.5rem', opacity: 0.8 }}>Summary</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}><span>Total Price</span><span>₹{(order.total || 0).toFixed(0)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800 }}><span>Shipping</span><span>Free</span></div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontWeight: 900, fontSize: '1rem', fontFamily: 'Oswald, sans-serif' }}>GRAND TOTAL</span>
                       <span style={{ fontWeight: 900, fontSize: '1.8rem' }}>₹{(order.total || 0).toFixed(0)}</span>
                    </div>
                 </div>
              </motion.div>

              {/* LOGISTICS CARD */}
              <div className="card-generic" style={{ background: '#fff', borderRadius: '30px', padding: '2rem', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    <MapPin size={18} color={colors.accent} />
                    <div>
                       <span style={{ fontSize: '0.65rem', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase' }}>Delivery To</span>
                       <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>{order.address || 'Standard Address'}</p>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    <Calendar size={18} color={colors.accent} />
                    <div>
                       <span style={{ fontSize: '0.65rem', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase' }}>Placed On</span>
                       <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>{orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    <CreditCard size={18} color={colors.accent} />
                    <div>
                       <span style={{ fontSize: '0.65rem', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase' }}>Paid Using</span>
                       <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>Visa Card •••• 4242</p>
                    </div>
                 </div>
              </div>

              {/* CANCEL ACTION */}
              {order.status === 'Processing' && (
                 <button 
                  disabled={isCancelling}
                  onClick={handleCancelOrder} 
                  style={{ 
                    background: '#fff', border: '1px dashed #ff4444', borderRadius: '20px', 
                    padding: '1.2rem', color: '#ff4444', fontWeight: 900, 
                    fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase',
                    opacity: isCancelling ? 0.5 : 1, transition: '0.3s'
                  }}>
                    {isCancelling ? 'CANCELING...' : 'Cancel Order Protocol'}
                 </button>
               )}
               
               {order.status === 'Cancelled' && (
                 <div style={{ background: '#fff1f1', border: '1px solid #ffcccc', borderRadius: '20px', padding: '1.2rem', textAlign: 'center', color: '#ff4444', fontWeight: 800 }}>
                    <XCircle size={20} style={{ marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>PROTOCOL TERMINATED: ORDER CANCELLED</p>
                 </div>
               )}

           </div>

        </div>
      </div>
    </div>
  );
}
