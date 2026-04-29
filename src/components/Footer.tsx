'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Facebook, Instagram, Youtube, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#0a2a16', 
      padding: '120px 8% 60px',
      color: '#ffffff',
      position: 'relative',
      zIndex: 10,
      fontFamily: "'Inter', sans-serif",
      borderRadius: '80px 80px 0 0',
      boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.4)',
      borderTop: '1px solid rgba(205, 220, 57, 0.1)'
    }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div className="footer-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: '60px',
          marginBottom: '100px'
        }}>
          {/* BRAND COLUMN */}
          <div className="footer-brand-col" style={{ gridColumn: 'span 5' }}>
            <img 
              src="/photo_2026-03-13_20-14-52 (1).png" 
              alt="ecozero" 
              style={{ 
                height: '60px', 
                objectFit: 'contain', 
                marginBottom: '32px'
              }} 
            />
            <p style={{ 
              maxWidth: '400px', 
              fontSize: '1.1rem', 
              lineHeight: 1.8, 
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 400,
              marginBottom: '40px'
            }}>
              ECOZERO — redefining sustainable luxury with organic blends, cold-pressed purity, and a zero-waste commitment for the modern world.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={socialBadgeStyle}><Instagram size={18} /></a>
              <a href="#" style={socialBadgeStyle}><Twitter size={18} /></a>
              <a href="#" style={socialBadgeStyle}><Facebook size={18} /></a>
              <a href="#" style={socialBadgeStyle}><Youtube size={18} /></a>
            </div>
          </div>

          {/* CATEGORIES COLUMN */}
          <div className="footer-link-col" style={{ gridColumn: 'span 2' }}>
            <h4 style={columnTitleStyle}>Categories</h4>
            <nav style={navColumnStyle}>
              <Link href="/menu" style={footerLinkStyle}>All Collections</Link>
              <Link href="/menu?cat=Smoothies" style={footerLinkStyle}>Organic Smoothies</Link>
              <Link href="/menu?cat=Juices" style={footerLinkStyle}>Cold-Pressed Juices</Link>
              <Link href="/menu?cat=Sustainability" style={footerLinkStyle}>Eco Essentials</Link>
              <Link href="/menu?cat=Combos" style={footerLinkStyle}>Eco Kits</Link>
            </nav>
          </div>

          {/* FOUNDATION COLUMN */}
          <div className="footer-link-col" style={{ gridColumn: 'span 2' }}>
            <h4 style={columnTitleStyle}>Foundation</h4>
            <nav style={navColumnStyle}>
              <Link href="/about" style={footerLinkStyle}>Our Mission</Link>
              <Link href="/contact" style={footerLinkStyle}>Collaborate</Link>
              <Link href="/faq" style={footerLinkStyle}>Help Center</Link>
              <Link href="/terms" style={footerLinkStyle}>Eco Terms</Link>
            </nav>
          </div>

          {/* NEWSLETTER COLUMN */}
          <div className="footer-newsletter-col" style={{ gridColumn: 'span 3' }}>
            <h4 style={columnTitleStyle}>Newsletter</h4>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px', lineHeight: 1.5 }}>
              Subscribe to get eco-tips and exclusive launch offers.
            </p>
            <div style={{ position: 'relative', display: 'flex' }}>
              <input 
                type="email" 
                placeholder="Your email" 
                style={{ 
                  width: '100%', 
                  padding: '14px 20px', 
                  borderRadius: '30px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }} 
              />
              <button style={{ 
                position: 'absolute', 
                right: '5px', 
                top: '5px', 
                bottom: '5px', 
                padding: '0 20px', 
                borderRadius: '25px', 
                background: '#cddc39', 
                color: '#0a2a16', 
                border: 'none', 
                fontWeight: 800, 
                fontSize: '0.8rem',
                cursor: 'pointer' 
              }}>
                JOIN
              </button>
            </div>
          </div>
        </div>



        {/* BOTTOM LINE */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingTop: '32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.5)',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ fontWeight: 600 }}>© 2024 ECOZERO PLATFORM. All eco-rights reserved.</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Node</Link>
            <Link href="/cookies" style={{ color: 'inherit', textDecoration: 'none' }}>Data Cookies</Link>
            <div style={{ fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '5px' }}>
              AG-OS <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .footer-grid { 
            display: grid !important; 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 30px 20px !important; 
            margin-bottom: 40px !important;
          }
          .footer-brand-col { 
            grid-column: span 2 !important; 
            margin-bottom: 10px !important;
          }
          .footer-link-col { 
            grid-column: span 1 !important; 
          }
          /* Ensure the terminal column spans both on even smaller screens if needed, 
             but here it will just sit in the grid. */
          
          footer { 
            border-radius: 40px 40px 0 0 !important; 
            padding: 50px 6% 30px !important; 
          }
        }
      ` }} />
    </footer>
  );
};

const columnTitleStyle = {
  fontSize: '0.8rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  color: '#A0C2C2',
  marginBottom: '30px',
  fontWeight: 800
};

const navColumnStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '18px'
};

const footerLinkStyle = {
  color: 'rgba(255, 255, 255, 0.8)',
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
  color: 'rgba(255, 255, 255, 0.8)',
  fontWeight: 500
};

const socialBadgeStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  transition: '0.3s',
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

export default Footer;
