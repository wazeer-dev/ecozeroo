'use client';

import Link from 'next/link';
import { Home, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#041c0b',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body), sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: '20%', left: '15%',
        width: '400px', height: '400px',
        background: 'rgba(136, 198, 95, 0.06)',
        filter: 'blur(100px)', borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '15%',
        width: '300px', height: '300px',
        background: 'rgba(136, 198, 95, 0.04)',
        filter: 'blur(80px)', borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '2rem' }}>
        {/* Giant 404 */}
        <div style={{
          fontSize: 'clamp(120px, 20vw, 220px)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-10px',
          background: 'linear-gradient(135deg, #88c65f 0%, rgba(136,198,95,0.2) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0',
          fontFamily: 'var(--font-heading), sans-serif',
          userSelect: 'none',
        }}>
          404
        </div>

        <div style={{
          width: '80px', height: '3px',
          background: 'linear-gradient(to right, transparent, #88c65f, transparent)',
          margin: '0 auto 2rem',
        }} />

        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: 800,
          margin: '0 0 1rem',
          fontFamily: 'var(--font-heading), sans-serif',
        }}>
          Page Not Found
        </h1>

        <p style={{
          color: 'rgba(215, 232, 188, 0.6)',
          fontSize: '1.15rem',
          maxWidth: '460px',
          margin: '0 auto 3rem',
          lineHeight: 1.6,
        }}>
          Looks like this page has gone off-grid. Let's get you back to something fresh and organic.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#88c65f', color: '#041c0b',
              padding: '0.9rem 2rem', borderRadius: '50px',
              fontWeight: 800, fontSize: '1rem',
              textDecoration: 'none', transition: 'all 0.3s',
              boxShadow: '0 4px 20px rgba(136,198,95,0.25)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(136,198,95,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(136,198,95,0.25)'; }}
          >
            <Home size={20} /> Back to Home
          </Link>

          <Link
            href="/menu"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'transparent', color: '#88c65f',
              padding: '0.9rem 2rem', borderRadius: '50px',
              fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none', transition: 'all 0.3s',
              border: '1px solid rgba(136,198,95,0.4)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(136,198,95,0.08)'; e.currentTarget.style.borderColor = '#88c65f'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(136,198,95,0.4)'; }}
          >
            <ShoppingBag size={20} /> Browse Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

