'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Package, Heart, ChevronDown, LogOut, Bell, Instagram, Twitter, Facebook, ArrowDownRight, Home as HomeIcon, Menu, Grid } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Dock from '@/components/Dock';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isIntroFinished, setIsIntroFinished] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const handleDockClick = (path: string) => {
    router.push(path);
    // Force scroll to top on navigation via dock
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    setUser(localStorage.getItem('ecozero_user'));
    setAvatar(localStorage.getItem('ecozero_user_avatar'));
    setUserName(localStorage.getItem('ecozero_user_name'));

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ecozero_user');
    localStorage.removeItem('ecozero_user_name');
    setUser(null);
    window.location.reload();
  };

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Dancing+Script:wght@700&family=Inter:wght@500;700;800&display=swap');
        
        .pill-nav-container {
          position: fixed;
          top: 12px; 
          left: 4%;
          right: 4%;
          z-index: 2000;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .pill-nav-container {
            top: 12px;
            left: 12px;
            right: 12px;
          }
        }
        
        .pill-nav-container > * { pointer-events: auto; }

        .brand-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 64px;
          flex-shrink: 0;
        }
        
        .nav-center {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .nav-pill {
          background: #fff;
          color: #111;
          border-radius: 40px;
          padding: 6px 16px;
          font-size: 0.70rem;
          font-weight: 800;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: 0.2s;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          border: none;
        }
        .nav-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        .nav-circle {
          background: #fff;
          color: #111;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: 0.2s;
          cursor: pointer;
          border: none;
          text-decoration: none;
        }
        .nav-circle:hover {
          transform: translateY(-2px);
          background: #f0f0f0;
        }
        
        .quote-pill {
          background: #fff;
          border-radius: 40px;
          padding: 6px 6px 6px 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          text-decoration: none;
          color: #111;
          font-weight: 800;
          font-size: 0.8rem;
          transition: 0.2s;
          cursor: pointer;
        }
        .quote-pill:hover {
          transform: translateY(-2px);
        }
        .quote-btn-icon {
          background: #73B541;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* DROPDOWN */
        .ez-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          width: 220px;
          background: #fff;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 100;
        }
        .ez-dd-item {
          padding: 10px 15px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #333;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: 0.1s;
        }
        .ez-dd-item:hover {
          background: rgba(115, 181, 65, 0.1);
          color: #73B541;
        }
        
        @media (max-width: 768px) {
          .nav-center { display: none; }
          .pill-nav-container { 
            top: 12px !important;
            left: 12px !important;
            right: 12px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            height: 64px;
            justify-content: space-between; 
          }
          .brand-logo {
            width: 160px;
            height: 64px;
            padding: 10px 16px;
          }
          .mobile-dock-wrapper {
            display: block !important;
          }
        }
      ` }} />

      <nav className="pill-nav-container">
        
        {/* LOGO */}
        <Link href="/" className="brand-logo">
          <img src="/logo.png" alt="EcoZero" style={{ height: '56px', width: 'auto', display: 'block', objectFit: 'contain' }} />
        </Link>
        
        {/* CENTER LINKS */}
        <div className="nav-center">
          <Link href="/" className="nav-pill">HOME</Link>
          <Link href="/about" className="nav-pill">ABOUT US</Link>
          
          <div ref={categoriesRef} style={{ position: 'relative' }}>
            <button className="nav-pill" onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}>
              GARMENTS <ChevronDown size={14} style={{ transform: isCategoriesOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
            {isCategoriesOpen && (
              <div className="ez-dropdown">
                <Link href="/menu" className="ez-dd-item" onClick={() => setIsCategoriesOpen(false)}>Eco Products</Link>
                <Link href="/menu" className="ez-dd-item" onClick={() => setIsCategoriesOpen(false)}>Carbon Tracking</Link>
                <Link href="/menu" className="ez-dd-item" onClick={() => setIsCategoriesOpen(false)}>Zero-Waste Home</Link>
              </div>
            )}
          </div>
          
          <Link href="/menu" className="nav-pill">PRODUCTS</Link>
          <Link href="/contact" className="nav-pill">FAQ</Link>
          
          <Link href="#" className="nav-circle" style={{ marginLeft: '10px' }}><Search size={16} strokeWidth={2.5} /></Link>
          <Link href="#" className="nav-circle"><Facebook size={16} fill="currentColor" strokeWidth={0} /></Link>
          <Link href="#" className="nav-circle"><Instagram size={16} strokeWidth={2.5} /></Link>
        </div>
        
        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          {!user ? (
            <Link href="/login" className="nav-circle">
              <User size={16} strokeWidth={2.5} />
            </Link>
          ) : (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button className="nav-circle" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {avatar ? (
                  <img src={avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <User size={16} strokeWidth={2.5} />
                )}
              </button>
              {isDropdownOpen && (
                <div className="ez-dropdown" style={{ left: 'auto', right: 0, transform: 'none' }}>
                  <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee', marginBottom: '4px', fontWeight: 800 }}>Hi, {userName?.split(' ')[0]}</div>
                  <Link href="/profile" className="ez-dd-item" onClick={() => setIsDropdownOpen(false)}><User size={16} /> My Profile</Link>
                  <Link href="/orders" className="ez-dd-item" onClick={() => setIsDropdownOpen(false)}><Package size={16} /> Orders</Link>
                  <Link href="/wishlist" className="ez-dd-item" onClick={() => setIsDropdownOpen(false)}><Heart size={16} /> Wishlist</Link>
                  <div style={{ height: '1px', background: '#eee', margin: '4px 8px' }} />
                  <button className="ez-dd-item" onClick={handleLogout} style={{ color: '#d33', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}><LogOut size={16} /> Sign Out</button>
                </div>
              )}
            </div>
          )}
          
          <Link href="/cart" className="quote-pill">
            Cart
            <div className="quote-btn-icon">
              <ShoppingBag size={18} strokeWidth={3} />
            </div>
          </Link>
        </div>
      </nav>

      {/* Mobile Dock — shown only on small screens */}
      <div style={{
        display: 'none',
        position: 'fixed',
        bottom: '16px',
        left: '12px',
        right: '12px',
        zIndex: 9999,
      }} className="mobile-dock-wrapper">
        <Dock
          panelHeight={64}
          baseItemSize={44}
          magnification={58}
          items={[
            { icon: <HomeIcon size={22} strokeWidth={1.5} />, label: 'Home', onClick: () => handleDockClick('/') },
            { icon: <Grid size={22} strokeWidth={1.5} />, label: 'Products', onClick: () => handleDockClick('/menu') },
            { icon: <Heart size={22} strokeWidth={1.5} />, label: 'Wishlist', onClick: () => handleDockClick('/wishlist') },
            { icon: <Package size={22} strokeWidth={1.5} />, label: 'Orders', onClick: () => handleDockClick('/orders') },
            { icon: <User size={22} strokeWidth={1.5} />, label: 'Profile', onClick: () => handleDockClick('/profile') },
          ]}
        />
      </div>

      {/* Spacer for non-home pages, excluding auth pages which handle their own layout */}
      {mounted && pathname !== '/' && pathname !== '/login' && pathname !== '/signup' && <div style={{ height: '90px' }} />}
    </>
  );
}
