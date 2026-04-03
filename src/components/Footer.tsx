'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Facebook, Instagram, Youtube, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#041c0b', 
      padding: '100px 5% 40px',
      color: '#fcf7de',
      position: 'relative',
      zIndex: 10,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '60px',
          marginBottom: '80px'
        }}>
          {/* BRAND COLUMN */}
          <div style={{ gridColumn: 'span 2' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              color: '#fff', 
              marginBottom: '20px', 
              fontFamily: 'var(--font-brand), serif',
              fontStyle: 'italic',
              letterSpacing: '-1.5px'
            }}>ecozero</h2>
            <p style={{ 
              maxWidth: '350px', 
              fontSize: '1rem', 
              lineHeight: 1.7, 
              color: 'rgba(252, 247, 222, 0.7)',
              fontWeight: 500,
              marginBottom: '30px'
            }}>
              Discover premium organic smoothies, cold-pressed juices, and eco-friendly blends crafted for your body and the planet. Join the zero-waste revolution.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={socialBadgeStyle}><Instagram size={18} /></a>
              <a href="#" style={socialBadgeStyle}><Twitter size={18} /></a>
              <a href="#" style={socialBadgeStyle}><Facebook size={18} /></a>
              <a href="#" style={socialBadgeStyle}><Youtube size={18} /></a>
            </div>
          </div>

          {/* CATALOG COLUMN */}
          <div>
            <h4 style={columnTitleStyle}>Catalog</h4>
            <nav style={navColumnStyle}>
              <Link href="/menu" style={footerLinkStyle}>All Products</Link>
              <Link href="/menu?cat=Dairy Products" style={footerLinkStyle}>Dairy Fresh</Link>
              <Link href="/menu?cat=Fruits and Vegetables" style={footerLinkStyle}>Eco Gardens</Link>
              <Link href="/menu?cat=Snacks" style={footerLinkStyle}>Planet Snacks</Link>
            </nav>
          </div>

          {/* SUPPORT COLUMN */}
          <div>
            <h4 style={columnTitleStyle}>Foundation</h4>
            <nav style={navColumnStyle}>
              <Link href="/about" style={footerLinkStyle}>Our Story</Link>
              <Link href="/contact" style={footerLinkStyle}>Collaborate</Link>
              <Link href="/faq" style={footerLinkStyle}>Help Terminal</Link>
              <Link href="/terms" style={footerLinkStyle}>Eco Terms</Link>
            </nav>
          </div>

          {/* CONTACT COLUMN */}
          <div>
            <h4 style={columnTitleStyle}>Terminal</h4>
            <div style={navColumnStyle}>
              <div style={contactRowStyle}><Mail size={16} /> hi@ecozero.eco</div>
              <div style={contactRowStyle}><Phone size={16} /> +91 eco-zero-99</div>
              <div style={contactRowStyle}><MapPin size={16} /> Global Green Zone</div>
            </div>
          </div>
        </div>

        {/* COLOSSAL BACKGROUND TEXT */}
        <div style={{ 
          textAlign: 'center', 
          opacity: 0.03, 
          fontSize: 'clamp(5rem, 15vw, 15rem)', 
          fontWeight: 900, 
          pointerEvents: 'none',
          userSelect: 'none',
          marginBottom: '20px',
          color: '#fff'
        }}>
          ECOZERO
        </div>

        {/* BOTTOM LINE */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingTop: '32px',
          borderTop: '1px solid rgba(252, 247, 222, 0.1)',
          fontSize: '0.85rem',
          color: 'rgba(252, 247, 222, 0.5)',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ fontWeight: 600 }}>© 2024 ECOZERO PLATFORM. All eco-rights reserved.</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Node</Link>
            <Link href="/cookies" style={{ color: 'inherit', textDecoration: 'none' }}>Data Cookies</Link>
            <div style={{ fontWeight: 800, color: '#fcf7de', display: 'flex', alignItems: 'center', gap: '5px' }}>
              AG-OS <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const columnTitleStyle = {
  fontSize: '0.8rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  color: '#8BC34A',
  marginBottom: '30px',
  fontWeight: 800
};

const navColumnStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '18px'
};

const footerLinkStyle = {
  color: 'rgba(252, 247, 222, 0.8)',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  transition: '0.3s'
};

const contactRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '0.95rem',
  color: 'rgba(252, 247, 222, 0.8)',
  fontWeight: 500
};

const socialBadgeStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  background: 'rgba(252, 247, 222, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fcf7de',
  transition: '0.3s',
  border: '1px solid rgba(252, 247, 222, 0.1)'
};

export default Footer;
