'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User, MapPin, Package, Heart,
  Bell, LogOut, ChevronRight, Edit3, Settings,
  ShieldCheck, CreditCard, Truck, Check, X, Camera, Loader2
} from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function ProfilePage() {
  const [userName, setUserName] = useState('Guest User');
  const [userEmail, setUserEmail] = useState('Not logged in');
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [addressCount, setAddressCount] = useState<number>(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // New state for avatar upload

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('ecozero_user');
    if (!email) {
      window.location.href = '/login';
      return;
    }

    const name = localStorage.getItem('ecozero_user_name') || 'Guest User';
    setUserName(name);
    setEditName(name);
    setUserEmail(email);

    const storedAvatar = localStorage.getItem('ecozero_user_avatar');
    setUserAvatar(storedAvatar);

    // Wishlist count from localStorage
    try {
      const wl = JSON.parse(localStorage.getItem('ecozero_wishlist') || '[]');
      setWishlistCount(Array.isArray(wl) ? wl.length : 0);
      
      const addr = JSON.parse(localStorage.getItem('ecozero_addresses') || '[]');
      setAddressCount(Array.isArray(addr) ? addr.length : 0);
    } catch { 
      setWishlistCount(0); 
      setAddressCount(0);
    }

    // Fetch profile from Firestore
    if (email) {
      const fetchProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', email));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.name) {
              setUserName(data.name);
              setEditName(data.name);
              localStorage.setItem('ecozero_user_name', data.name);
            }
            if (data.phone) {
              setUserPhone(data.phone);
              setEditPhone(data.phone);
            }
            if (data.avatar) {
              setUserAvatar(data.avatar);
              localStorage.setItem('ecozero_user_avatar', data.avatar);
            } else {
              setUserAvatar(null);
              localStorage.removeItem('ecozero_user_avatar');
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };
      fetchProfile();

      getDocs(query(collection(db, 'orders'), where('email', '==', email)))
        .then(snap => setOrderCount(snap.size))
        .catch(() => setOrderCount(0));
    } else {
      setOrderCount(0);
    }
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size — we can be more generous with ImgBB (up to 5MB is fine)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select a photo under 5MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=bc2b31e802ebfbc0450bf45cfef8cf02`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        const imageUrl = result.data.url;
        setUserAvatar(imageUrl);
        localStorage.setItem('ecozero_user_avatar', imageUrl);
        
        // Persist to database immediately
        if (userEmail && userEmail !== 'Not logged in' && userEmail !== '') {
          await setDoc(doc(db, 'users', userEmail), { avatar: imageUrl }, { merge: true });
        }
      } else {
        alert("Upload failed: " + result.error.message);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to connect to image server.");
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSaveChanges = async () => {
    const trimmedName = editName.trim();
    const trimmedPhone = editPhone.trim();
    if (!trimmedName) return;
    
    setIsSaving(true);
    try {
      if (userEmail) {
        await setDoc(doc(db, 'users', userEmail), {
          name: trimmedName,
          phone: trimmedPhone,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      setUserName(trimmedName);
      setUserPhone(trimmedPhone);
      localStorage.setItem('ecozero_user_name', trimmedName);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save changes to database.");
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('ecozero_user');
    localStorage.removeItem('ecozero_user_name');
    window.location.href = '/';
  };

  const menuItems = [
    {
      group: 'My Orders',
      items: [
        { icon: <Package size={20} />, label: 'My Orders', desc: 'Track, return or buy again', href: '/orders' },
        { icon: <Truck size={20} />, label: 'Track Delivery', desc: 'Live delivery status', href: '/orders' },
      ]
    },
    {
      group: 'Account Settings',
      items: [
        { icon: <User size={20} />, label: 'Personal Information', desc: 'Name, email, phone', href: '#' },
        { icon: <MapPin size={20} />, label: 'Saved Addresses', desc: 'Manage delivery locations', href: '#' },
        { icon: <CreditCard size={20} />, label: 'Payment Methods', desc: 'Cards, wallets & UPI', href: '#' },
      ]
    },
    {
      group: 'Preferences',
      items: [
        { icon: <Heart size={20} />, label: 'Wishlist', desc: 'Items saved for later', href: '/wishlist' },
        { icon: <Bell size={20} />, label: 'Notifications', desc: 'Manage your alerts', href: '/notifications' },
        { icon: <ShieldCheck size={20} />, label: 'Privacy & Security', desc: 'Password, 2FA, data', href: '#' },
      ]
    },
  ];

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '28px',
    padding: '1.8rem 2rem',
    marginBottom: '1.2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  return (
    <div className="profile-page-wrapper">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', paddingBottom: '120px' }}>

        {/* Profile Header Card */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '20px' }}>
          {/* Avatar / Photo Upload */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #cddc39, #a8b61e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 800, color: '#0a2a16',
              overflow: 'hidden', boxShadow: '0 10px 30px rgba(205, 220, 57, 0.2)',
              position: 'relative', cursor: 'pointer'
            }}
            onClick={() => document.getElementById('avatarInput')?.click()}
            >
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isUploading ? 0.3 : 1, transition: '0.3s' }} />
              ) : (
                getInitials(userName)
              )}
              
              {/* Overlay Camera Icon / Loader */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isUploading ? 1 : 0, transition: '0.3s'
              }}
              className="avatar-overlay"
              >
                {isUploading ? <Loader2 size={32} color="#fff" className="animate-spin" /> : <Camera size={28} color="#fff" />}
              </div>
            </div>
            
            <input 
              id="avatarInput"
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              style={{ display: 'none' }} 
            />
          </div>

          {/* Info / Edit Form */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            {isEditing ? (
              /* ── EDIT MODE ── */
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#cddc39' }}>Display Name</p>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px', borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1.5px solid #cddc39',
                        fontSize: '1rem', fontWeight: 600,
                        color: '#ffffff', outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#cddc39' }}>Phone Number</p>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Add phone number"
                      style={{
                        width: '100%',
                        padding: '12px 14px', borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)', border: '1.5px solid #cddc39',
                        fontSize: '1rem', fontWeight: 600,
                        color: '#ffffff', outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button onClick={handleSaveChanges} disabled={isSaving} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px', background: '#cddc39', color: '#0a2a16',
                      border: 'none', borderRadius: '12px', fontWeight: 700,
                      cursor: 'pointer', fontSize: '1rem', opacity: isSaving ? 0.7 : 1
                    }}>
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Save Changes
                    </button>
                    <button onClick={() => { setEditName(userName); setEditPhone(userPhone); setIsEditing(false); }} disabled={isSaving} style={{
                      padding: '12px 20px', background: 'rgba(220,50,50,0.08)', color: '#cc3333',
                      border: '1.5px solid rgba(220,50,50,0.2)', borderRadius: '12px', fontWeight: 700,
                      cursor: 'pointer', fontSize: '1rem',
                    }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── VIEW MODE ── */
              <>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{userName}</h1>
                <p style={{ margin: '2px 0 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>{userEmail}</p>
                {userPhone && <p style={{ margin: '2px 0 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', fontWeight: 600 }}>{userPhone}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cddc39' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#cddc39', fontWeight: 600 }}>Verified Account</span>
                </div>
              </>
            )}
          </div>

          {/* Edit Button — only in view mode */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', border: '1.5px solid #cddc39',
                background: 'transparent', color: '#cddc39',
                borderRadius: '50px', fontWeight: 700,
                fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#cddc39'; e.currentTarget.style.color = '#0a2a16'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cddc39'; }}
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {/* Quick Stats — real data */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Orders', value: orderCount === null ? '…' : String(orderCount), icon: <Package size={22} color="#cddc39" />, href: '/orders' },
            { label: 'Wishlist', value: String(wishlistCount), icon: <Heart size={22} color="#cddc39" />, href: '/wishlist' },
            { label: 'Addresses', value: String(addressCount), icon: <MapPin size={22} color="#cddc39" />, href: '/profile/addresses' },
          ].map((stat, i) => (
            <Link key={i} href={stat.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '1.6rem 1rem',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)', border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
              }}
              className="stat-card"
              >
                <div style={{ background: 'rgba(205, 220, 57, 0.1)', padding: '14px', borderRadius: '50%', marginBottom: '4px' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Menu Groups */}
        {menuItems.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#cddc39', margin: '0 0 10px 10px' }}>
              {group.group}
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {group.items.map((item, ii) => (
                <Link key={ii} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '1.2rem',
                    padding: '1.2rem 1.5rem', color: '#ffffff', transition: 'all 0.2s ease',
                    borderBottom: ii < group.items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(60,120,20,0.03)'; e.currentTarget.style.paddingLeft = '1.8rem'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '1.5rem'; }}
                  >
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '14px',
                      background: 'rgba(205, 220, 57, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: '#cddc39', transition: '0.2s'
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>{item.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px', fontWeight: 500 }}>{item.desc}</div>
                    </div>
                    <ChevronRight size={18} color="#5a7a40" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <div style={{ marginTop: '0.5rem' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)', border: '1.5px solid rgba(220,50,50,0.2)',
            borderRadius: '16px', color: '#ff4d4d', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer', transition: '0.2s',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,50,50,0.1)'; e.currentTarget.style.borderColor = '#ff4d4d'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(220,50,50,0.2)'; }}
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .avatar-overlay:hover { opacity: 1 !important; }
        .profile-page-wrapper {
          min-height: 100vh;
          background: var(--bg-color);
          padding-top: 100px;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(60,120,20,0.08) !important;
        }
        @media (max-width: 1024px) {
          .profile-page-wrapper {
            padding-top: 20px !important;
          }
        }
      `}} />
      </div>
    </div>
  );
}
