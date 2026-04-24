'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ChevronLeft,
  Truck,
  ShieldCheck,
  CreditCard,
  PackageSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('ecozero_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('ecozero_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart);
  };

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  const shipping = 0; // Free delivery as per promo
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(255, 255, 255, 0.1)', borderTopColor: '#cddc39', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div className="page-main-wrapper" style={{ background: 'var(--bg-color)', color: '#fff', minHeight: '100vh', paddingTop: '100px' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#cddc39', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', padding: 0 }}>
            <ChevronLeft size={18} /> CONTINUE SHOPPING
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px', color: '#fff' }}>Shopping Cart</h1>
            <span style={{ fontWeight: 800, color: '#cddc39', fontSize: '1.2rem' }}>{cart.length} ITEMS</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ 
              textAlign: 'center', padding: '6rem 2rem', 
              background: 'rgba(255,255,255,0.02)', borderRadius: '40px', 
              boxShadow: '0 25px 60px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ 
              width: '120px', height: '120px', 
              background: 'rgba(20, 104, 69, 0.05)', 
              borderRadius: '35%', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 2.5rem',
              transform: 'rotate(-5deg)'
            }}>
              <PackageSearch size={50} color="#cddc39" />
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px', color: '#fff' }}>Your cart is empty</h2>
            <p style={{ color: '#e0f2f1', marginBottom: '2.5rem', maxWidth: '420px', margin: '0 auto 2.5rem', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6 }}>Looks like you haven't added any eco-friendly essentials yet. Start browsing our live catalog!</p>
            <Link href="/menu" style={{ 
              background: '#cddc39', color: '#0a2a16',
              padding: '1.2rem 3.5rem', borderRadius: '50px', 
              textDecoration: 'none', display: 'inline-block',
              fontWeight: 800, fontSize: '1rem',
              boxShadow: '0 15px 30px rgba(205,220,57,0.2)',
              transition: '0.3s'
            }}>Explore Products</Link>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* LEFT: Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="cart-item-container" 
                      style={{ 
                        position: 'relative',
                        background: 'rgba(255,255,255,0.03)', borderRadius: '28px', 
                        padding: '1.2rem', display: 'flex', 
                        alignItems: 'center', gap: '1.5rem', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                    <div className="cart-item-image" style={{ width: '100px', height: '100px', borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, position: 'relative' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    
                    <div style={{ flex: 1, position: 'static' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{item.name}</h3>
                          <p style={{ color: '#aaa', fontWeight: 600, fontSize: '0.8rem', margin: '4px 0 0' }}>{item.category || 'Organic Essential'}</p>
                        </div>
                        <button className="trash-btn" onClick={() => removeItem(item.id)} style={{ padding: '8px', borderRadius: '12px', background: 'rgba(255, 107, 107, 0.05)', border: 'none', color: '#ff6b6b', cursor: 'pointer', transition: '0.2s', alignSelf: 'flex-start' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="cart-item-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '3px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ width: '35px', textAlign: 'center', fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={12} />
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#cddc39' }}>₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* RIGHT: Summary */}
            <div style={{ position: 'sticky', top: '120px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '35px', padding: '2rem', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', color: '#ffffff' }}>Order Summary</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0f2f1', fontWeight: 500 }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0f2f1', fontWeight: 500 }}>
                    <span>Shipping</span>
                    <span style={{ color: '#cddc39', fontWeight: 700 }}>FREE</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.2rem', borderTop: '2px dashed rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Total Amount</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#cddc39' }}>₹{total.toFixed(0)}</span>
                </div>

                <button 
                  onClick={() => {
                    const user = localStorage.getItem('ecozero_user');
                    if (!user) {
                      localStorage.setItem('redirect_after_login', '/checkout');
                      router.push('/login');
                    } else {
                      router.push('/checkout');
                    }
                  }}
                  style={{ 
                    width: '100%', padding: '1.2rem', 
                    borderRadius: '50px', fontSize: '1rem', 
                    fontWeight: 900, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    gap: '12px', background: '#cddc39', color: '#0a2a16',
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 15px 30px rgba(205, 220, 57, 0.2)',
                    transition: '0.3s'
                  }}
                >
                  Checkout Now <ArrowRight size={20} />
                </button>

                {/* Trust Badges */}
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>
                    <Truck size={14} color="#cddc39" /> Carbon-neutral dispatch
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>
                    <ShieldCheck size={14} color="#cddc39" /> Secure bio-encryption
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        @media (max-width: 900px) {
          .page-main-wrapper {
            padding-top: 50px !important;
            padding-bottom: 120px !important; /* Clear bottom dock */
          }
          div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          h1 {
            font-size: 2.2rem !important;
          }
        }

        @media (max-width: 640px) {
          .cart-item-container {
            flex-direction: row !important;
            align-items: center !important;
            padding: 1rem !important;
            gap: 1rem !important;
          }
          .cart-item-image {
            width: 85px !important;
            height: 85px !important;
            border-radius: 16px !important;
          }
          .cart-item-price-row {
            margin-top: 0.6rem !important;
          }
          .trash-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
          }
        }
      `}} />
    </div>
  </div>
);
}

