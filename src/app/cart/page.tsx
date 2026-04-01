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
  CreditCard
} from 'lucide-react';

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
    // Also update a global event or something if needed, but for now this works on refresh/navigation
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#041c0b' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(136, 198, 95, 0.1)', borderTopColor: '#88c65f', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div className="page-main-wrapper" style={{ background: '#041c0b', color: '#fff' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <Link href="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#88c65f', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <ChevronLeft size={18} /> CONTINUE SHOPPING
          </Link>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0 }}>Shopping Cart</h1>
          <p style={{ color: 'rgba(215, 232, 188, 0.7)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Manage your eco-friendly selections before checking out.</p>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(136, 198, 95, 0.03)', borderRadius: '32px', border: '1px dashed rgba(136, 198, 95, 0.2)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(136, 198, 95, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <ShoppingBag size={40} color="#88c65f" />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your cart is empty</h2>
            <p style={{ color: 'rgba(215, 232, 188, 0.7)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>Looks like you haven't added any eco-friendly essentials yet.</p>
            <Link href="/menu" className="btn-primary" style={{ padding: '1rem 3rem', borderRadius: '40px', textDecoration: 'none', display: 'inline-block' }}>Explore Products</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
            
            {/* LEFT: Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cart.map((item) => (
                <div key={item.id} className="cart-item-container" style={{ background: 'rgba(7, 38, 15, 1)', border: '1px solid rgba(136, 198, 95, 0.1)', borderRadius: '24px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', transition: '0.3s' }}>
                  <div className="cart-item-image" style={{ width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>{item.name}</h3>
                      <button onClick={() => removeItem(item.id)} style={{ padding: '8px', borderRadius: '12px', background: 'rgba(255, 107, 107, 0.1)', border: 'none', color: '#ff6b6b', cursor: 'pointer', transition: '0.2s' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p style={{ color: '#88c65f', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.2rem' }}>{item.category || 'Organic Essential'}</p>
                    
                    <div className="cart-item-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '30px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a1a1a', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ width: '40px', textAlign: 'center', fontWeight: 700, color: '#fff' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a1a1a', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Summary */}
            <div style={{ position: 'sticky', top: '120px' }}>
              <div style={{ background: 'rgba(7, 38, 15, 1)', border: '1px solid rgba(136, 198, 95, 0.2)', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', borderBottom: '1px solid rgba(136, 198, 95, 0.1)', paddingBottom: '1rem' }}>Order Summary</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(215, 232, 188, 0.7)' }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(215, 232, 188, 0.7)' }}>
                    <span>Delivery</span>
                    <span style={{ color: '#88c65f', fontWeight: 600 }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(215, 232, 188, 0.7)' }}>
                    <span>Eco-Tax</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>$0.00</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '2px solid rgba(136, 198, 95, 0.1)', marginBottom: '2.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#88c65f' }}>${total.toFixed(2)}</span>
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
                  className="btn-primary" 
                  style={{ width: '100%', padding: '1.2rem', borderRadius: '40px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </button>

                {/* Trust Badges */}
                <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'rgba(215, 232, 188, 0.5)' }}>
                    <Truck size={16} color="#88c65f" /> Carbon-neutral dispatch guaranteed
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'rgba(215, 232, 188, 0.5)' }}>
                    <ShieldCheck size={16} color="#88c65f" /> Secure bio-encrypted transaction
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'rgba(215, 232, 188, 0.5)' }}>
                    <CreditCard size={16} color="#88c65f" /> All major terminal credits accepted
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        @media (max-width: 900px) {
          .page-main-wrapper {
            padding-top: 20px !important;
          }
          div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          h1 {
            font-size: 2.2rem !important;
          }
        }

        @media (max-width: 640px) {
          .cart-item-container {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.2rem !important;
          }
          .cart-item-image {
            width: 100% !important;
            height: 200px !important;
          }
          .cart-item-price-row {
            width: 100% !important;
            justify-content: space-between !important;
          }
        }
      `}} />
    </div>
  );
}

