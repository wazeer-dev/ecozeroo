'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#f7faef', 
      padding: '80px 5% 40px',
      borderTop: '1px solid rgba(60, 120, 20, 0.1)',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* TOP ROW: Navigation & Socials */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '60px',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '32px' }}>
            <Link href="/" style={navLinkStyle}>Home</Link>
            <Link href="/products" style={navLinkStyle}>Products</Link>
            <Link href="/about" style={navLinkStyle}>About</Link>
            <Link href="/contact" style={navLinkStyle}>Contact</Link>
            <Link href="/faq" style={navLinkStyle}>FAQ</Link>
          </nav>

          {/* Social Icons */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={socialIconStyle} aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" style={socialIconStyle} aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" style={socialIconStyle} aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" style={socialIconStyle} aria-label="Youtube"><Youtube size={20} /></a>
          </div>
        </div>

        {/* BRAND ROW: Colossal Brand Mark */}
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(5rem, 22vw, 18rem)', 
            fontWeight: 400, 
            fontFamily: 'var(--font-brand), serif',
            color: '#1a3c26',
            letterSpacing: '-3px',
            lineHeight: 0.8,
            margin: '0',
            cursor: 'default',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}>
            ecozero
            <span style={{ 
              display: 'inline-block',
              width: 'clamp(30px, 10vw, 80px)',
              height: 'clamp(30px, 10vw, 80px)',
              backgroundColor: '#1a3c26',
              borderRadius: '50% 50% 0 50%',
              transform: 'rotate(-45deg) translateY(20%)',
              opacity: 0.9
            }} />
          </h2>
        </div>

        {/* BOTTOM ROW: Copyright & Legal */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '60px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          fontSize: '0.85rem',
          color: 'rgba(26, 60, 38, 0.6)',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>© 2024 ECOZERO. All rights reserved.</div>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/privacy" style={bottomLinkStyle}>Privacy Policy</Link>
            <Link href="/terms" style={bottomLinkStyle}>Terms & Conditions</Link>
          </div>

          <div style={{ fontWeight: 600, color: '#1a3c26' }}>Design by Antigravity</div>
        </div>
      </div>
    </footer>
  );
};

const navLinkStyle = {
  textDecoration: 'none',
  color: '#1a3c26',
  fontWeight: 700,
  fontSize: '0.9rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  transition: '0.2s',
  opacity: 0.8
};

const socialIconStyle = {
  color: '#1a3c26',
  opacity: 0.8,
  transition: '0.2s'
};

const bottomLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  transition: '0.2s'
};

export default Footer;
