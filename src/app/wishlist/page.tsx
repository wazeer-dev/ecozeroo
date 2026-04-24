'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, ArrowLeft, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    const stored = JSON.parse(localStorage.getItem('ecozero_wishlist') || '[]');
    setWishlist(Array.isArray(stored) ? stored : []);
    setLoading(false);
  };

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('ecozero_wishlist', JSON.stringify(updated));
  };

  const addToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('ecozero_cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('ecozero_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('Added to cart!');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
        <Loader2 className="animate-spin" size={40} color="#cddc39" />
      </div>
    );
  }

  return (
    <div className="page-main-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh', paddingTop: '120px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-1px' }}>
              My <span style={{ color: '#cddc39' }}>Wishlist</span>
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.05rem', marginTop: '6px', fontWeight: 500 }}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          <Link href="/menu" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: '#cddc39', textDecoration: 'none', fontWeight: 700,
            fontSize: '0.95rem', padding: '12px 24px', borderRadius: '40px',
            border: '2px solid rgba(205, 220, 57, 0.2)', background: 'rgba(255, 255, 255, 0.03)',
            transition: '0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(205, 220, 57, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
        </div>

        {wishlist.length > 0 ? (
          /* ── WISHLIST GRID ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {wishlist.map((item) => (
              <div key={item.id} style={{
                background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', flexDirection: 'column', transition: '0.3s'
              }}
              className="wishlist-card"
              >
                {/* Image Section */}
                <Link href={`/product/${item.id}`} style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                  <img 
                    src={item.image || 'https://via.placeholder.com/400'} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s transform cubic-bezier(0.2, 0, 0, 1)' }} 
                    className="wish-img"
                  />
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#cddc39', padding: '6px 14px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 800, color: '#0a2a16' }}>
                    ESSENTIAL
                  </div>
                </Link>

                {/* Info Content */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{item.name}</h3>
                    <div style={{ textAlign: 'right' }}>
                       {item.oldPrice && parseFloat(item.oldPrice) > parseFloat(item.price) && (
                         <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', textDecoration: 'line-through', fontWeight: 600 }}>₹{item.oldPrice}</span>
                       )}
                       <span style={{ fontSize: '1.25rem', fontWeight: 850, color: '#cddc39' }}>₹{item.price}</span>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '1.5rem', textTransform: 'capitalize', fontWeight: 500 }}>{item.category}</p>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.8rem' }}>
                    <button 
                      onClick={() => addToCart(item)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '12px', background: '#cddc39', color: '#0a2a16',
                        border: 'none', borderRadius: '14px', fontWeight: 700,
                        cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#b8c832'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#cddc39'}
                    >
                      <ShoppingCart size={18} /> Add
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '46px', height: '46px', background: 'rgba(220,50,50,0.05)', color: '#cc3333',
                        border: 'none', borderRadius: '14px', cursor: 'pointer', transition: '0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#cc3333'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(220,50,50,0.05)'; e.currentTarget.style.color = '#cc3333'; }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div style={{
            textAlign: 'center', padding: '100px 40px',
            background: 'rgba(255, 255, 255, 0.03)', borderRadius: '32px',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'rgba(205, 220, 57, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <Heart size={48} color="rgba(205, 220, 57, 0.4)" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
              Wishlist is currently empty
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: 1.6, fontWeight: 500 }}>
              Discover your favorite eco-friendly essentials and save them for a sustainable future.
            </p>
            <Link href="/menu" style={{
              background: '#cddc39', color: '#0a2a16',
              padding: '1.1rem 3rem', borderRadius: '50px',
              fontWeight: 850, textDecoration: 'none', fontSize: '1.1rem',
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              transition: '0.3s', boxShadow: '0 8px 25px rgba(205, 220, 57, 0.2)'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(205, 220, 57, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(205, 220, 57, 0.2)'; }}
            >
              <ShoppingBag size={22} /> Discover Products
            </Link>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        .wishlist-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.2) !important;
        }
        .wishlist-card:hover .wish-img {
          transform: scale(1.08);
        }
      `}} />
    </div>
  );
}
