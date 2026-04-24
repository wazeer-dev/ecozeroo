'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Package, Heart, ChevronDown, LogOut, Bell, Instagram, Twitter, Facebook, ArrowDownRight, Home as HomeIcon, Menu, Grid, UtensilsCrossed, ShoppingCart, LayoutGrid } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('ecozero_cart') || '[]');
      const count = (cart as any[]).reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (e) {
      setCartCount(0);
    }
  };

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
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    updateCartCount();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ecozero_user');
    localStorage.removeItem('ecozero_user_name');
    setUser(null);
    window.location.reload();
  };

  if (pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/admin')) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .premium-nav-island {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 92%;
          max-width: 1400px;
          height: 72px;
          background: rgba(10, 42, 22, 0.75);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(205, 220, 57, 0.1);
          border-radius: 40px;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Inter', sans-serif;
        }

        .premium-nav-island.scrolled {
          top: 10px;
          width: 85%;
          height: 64px;
          background: rgba(10, 42, 22, 0.9);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 1024px) {
          .premium-nav-island {
            width: 96%;
            padding: 0 20px;
          }
          .nav-links-center {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .premium-nav-island {
            top: 15px;
            height: 60px;
          }
          .nav-actions-right .hide-mobile {
            display: none !important;
          }
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: 0.3s;
        }
        .brand-section:hover {
          transform: scale(1.02);
        }

        .nav-links-center {
          display: flex;
          align-items: center;
          gap: 4px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nav-item {
          color: #e0f2f1;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.3s ease;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          position: relative;
        }

        .nav-item::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          width: 0%;
          height: 2px;
          background: #cddc39;
          transition: 0.3s;
          transform: translateX(-50%);
          border-radius: 2px;
        }

        .nav-item:hover {
          color: #cddc39;
          background: rgba(205, 220, 57, 0.05);
        }

        .nav-item:hover::after {
          width: 20%;
        }

        .nav-item.active {
          color: #cddc39;
        }

        .nav-actions-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #e0f2f1;
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
        }

        .action-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(205, 220, 57, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          color: #cddc39;
        }

        .cart-capsule {
          background: #cddc39;
          color: #0a2a16;
          padding: 8px 16px 8px 20px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none;
          transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .cart-capsule:hover {
          background: #e0f2f1;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(205, 220, 57, 0.2);
        }

        .cart-badge-count {
          background: #ffffff;
          color: #0a2a16;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* DROPDOWNS */
        .premium-dropdown {
          position: absolute;
          top: 110%;
          right: 0;
          width: 240px;
          background: #0a2a16;
          border-radius: 20px;
          padding: 8px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(205, 220, 57, 0.08);
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 100;
        }

        .dd-item {
          padding: 12px 16px;
          border-radius: 14px;
          color: #e0f2f1;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: 0.2s;
        }

        .dd-item:hover {
          background: rgba(205, 220, 57, 0.06);
          color: #cddc39;
          padding-left: 20px;
        }

        .mobile-dock-wrapper {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-dock-wrapper {
            display: flex !important;
            position: fixed;
            bottom: 25px;
            left: 0;
            right: 0;
            justify-content: center;
            z-index: 1000;
            pointer-events: none;
          }
          .mobile-dock-wrapper > * { pointer-events: auto; }
        }
      ` }} />

      <nav className={`premium-nav-island ${isScrolled ? 'scrolled' : ''}`}>
        {/* LOGO AREA */}
        <Link href="/" className="brand-section">
          <img 
            src="/photo_2026-03-13_20-14-52 (1).png" 
            alt="EcoZero" 
            style={{ height: isScrolled ? '32px' : '40px', width: 'auto', transition: '0.3s' }} 
          />
        </Link>

        {/* CENTER LINKS - HIDDEN ON MOBILE */}
        <div className="nav-links-center">
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link href="/about" className={`nav-item ${pathname === '/about' ? 'active' : ''}`}>About</Link>
          
          <div ref={categoriesRef} style={{ position: 'relative' }}>
            <button 
              className="nav-item" 
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Garments <ChevronDown size={14} style={{ transform: isCategoriesOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
            </button>
            <AnimatePresence>
              {isCategoriesOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="premium-dropdown" 
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                >
                  <Link href="/menu" className="dd-item" onClick={() => setIsCategoriesOpen(false)}>
                    <Grid size={16} /> Eco Products
                  </Link>
                  <Link href="/menu" className="dd-item" onClick={() => setIsCategoriesOpen(false)}>
                    <Package size={16} /> Carbon Tracking
                  </Link>
                  <Link href="/menu" className="dd-item" onClick={() => setIsCategoriesOpen(false)}>
                    <LayoutGrid size={16} /> Zero-Waste Home
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Link href="/menu" className={`nav-item ${pathname === '/menu' ? 'active' : ''}`}>Products</Link>
          <Link href="/contact" className={`nav-item ${pathname === '/contact' ? 'active' : ''}`}>FAQ</Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="nav-actions-right">
          <button className="action-btn hide-mobile">
            <Search size={18} strokeWidth={2} />
          </button>
          
          <Link href="#" className="action-btn hide-mobile">
            <Instagram size={18} strokeWidth={2} />
          </Link>

          {!user ? (
            <Link href="/login" className="action-btn">
              <User size={18} strokeWidth={2} />
            </Link>
          ) : (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button 
                className="action-btn" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ overflow: 'hidden', padding: 0 }}
              >
                {avatar ? (
                  <img src={avatar} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={18} strokeWidth={2} />
                )}
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="premium-dropdown"
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                      <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 800, margin: 0 }}>Signed in as</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, margin: '2px 0 0 0' }}>{userName?.split(' ')[0]}</p>
                    </div>
                    <Link href="/profile" className="dd-item" onClick={() => setIsDropdownOpen(false)}><User size={18} /> My Profile</Link>
                    <Link href="/orders" className="dd-item" onClick={() => setIsDropdownOpen(false)}><Package size={18} /> Orders</Link>
                    <Link href="/wishlist" className="dd-item" onClick={() => setIsDropdownOpen(false)}><Heart size={18} /> Wishlist</Link>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 8px' }} />
                    <button className="dd-item" onClick={handleLogout} style={{ color: '#d33', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                      <LogOut size={18} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <Link href="/cart" className="cart-capsule">
            <ShoppingBag size={18} strokeWidth={2.5} />
            <span className="hide-mobile">Cart</span>
            {mounted && cartCount > 0 && (
              <span className="cart-badge-count">{cartCount}</span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile Dock */}
      {mounted && !pathname.startsWith('/product/') && pathname !== '/orders' && (
        <div className="mobile-dock-wrapper">
          <Dock
            panelHeight={64}
            baseItemSize={44}
            magnification={58}
            items={[
              { icon: <HomeIcon />, label: 'Home', onClick: () => handleDockClick('/'), isActive: pathname === '/' },
              { icon: <LayoutGrid />, label: 'Products', onClick: () => handleDockClick('/menu'), isActive: pathname === '/menu' },
              { icon: <Heart />, label: 'Wishlist', onClick: () => handleDockClick('/wishlist'), isActive: pathname === '/wishlist' },
              { icon: <User />, label: 'Profile', onClick: () => handleDockClick('/profile'), isActive: pathname === '/profile' },
              { icon: <ShoppingCart />, label: 'Cart', onClick: () => handleDockClick('/cart'), isActive: pathname === '/cart', badge: cartCount > 0 ? cartCount : undefined },
            ]}
          />
        </div>
      )}
    </>
  );
}
