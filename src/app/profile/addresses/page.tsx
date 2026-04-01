'use client';

import { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, Trash2, Home, Building, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ecozero_addresses') || '[]');
    setAddresses(Array.isArray(stored) ? stored : []);
    setLoading(false);
  }, []);

  const deleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('ecozero_addresses', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgb(215, 232, 188)' }}>
        <Loader2 className="animate-spin" size={40} color="#3c7814" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(215, 232, 188)', paddingTop: '110px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'rgb(4, 28, 11)', letterSpacing: '-1px' }}>
              Saved <span style={{ color: '#3c7814' }}>Addresses</span>
            </h1>
            <p style={{ color: '#5a7a40', fontSize: '1.05rem', marginTop: '6px', fontWeight: 500 }}>Manage your delivery locations</p>
          </div>
          <Link href="/profile" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: '#3c7814', textDecoration: 'none', fontWeight: 700,
            fontSize: '0.95rem', padding: '12px 24px', borderRadius: '40px',
            border: '2px solid rgba(60,120,20,0.2)', background: '#fff'
          }}>
            <ArrowLeft size={18} /> Back to Profile
          </Link>
        </div>

        {addresses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{
                background: '#fff', borderRadius: '24px', padding: '1.8rem',
                display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
                boxShadow: '0 4px 15px rgba(60,120,20,0.06)',
                border: '1px solid rgba(60,120,20,0.05)'
              }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '14px',
                  background: 'rgba(60,120,20,0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#3c7814', flexShrink: 0
                }}>
                  <MapPin size={24} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'rgb(4, 28, 11)' }}>{addr.name}</h3>
                    <button 
                      onClick={() => deleteAddress(addr.id)}
                      style={{ background: 'none', border: 'none', color: '#cc3333', cursor: 'pointer', padding: '5px' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p style={{ margin: '8px 0', color: '#5a7a40', fontSize: '1rem', lineHeight: 1.5 }}>
                    {addr.address}, {addr.detail}<br />
                    {addr.city}, {addr.state} - {addr.pin}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'rgb(4, 28, 11)' }}>
                    Phone: {addr.phone}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Action Tip */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(60,120,20,0.05)', borderRadius: '20px', border: '1px dashed rgba(60,120,20,0.2)', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#3c7814', fontWeight: 600, fontSize: '0.95rem' }}>
                💡 New addresses are automatically saved during checkout for your convenience.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: '#fff', borderRadius: '32px',
            border: '2px dashed rgba(60,120,20,0.1)'
          }}>
            <MapPin size={56} color="rgba(60,120,20,0.3)" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'rgb(4, 28, 11)', marginBottom: '1rem' }}>No addresses saved yet</h2>
            <p style={{ color: '#5a7a40', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
              Your shipping addresses will appear here once you place an order.
            </p>
            <Link href="/menu" style={{
              background: '#3c7814', color: '#fff', padding: '1.1rem 3rem',
              borderRadius: '50px', fontWeight: 800, textDecoration: 'none'
            }}>
              Start Shopping
            </Link>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
