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

      getDocs(query(collection(db, 'orders'), where('userEmail', '==', email)))
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
    background: '#fff',
    borderRadius: '20px',
    padding: '1.5rem 2rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 12px rgba(60,120,20,0.08)',
  };

  return (
    <div className="profile-page-wrapper">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>

        {/* Profile Header Card */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Avatar / Photo Upload */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3c7814, #88c65f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: '#fff',
              overflow: 'hidden', boxShadow: '0 8px 25px rgba(60,120,20,0.15)',
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
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#5a7a40' }}>Display Name</p>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px', borderRadius: '12px',
                        border: '1.5px solid #3c7814',
                        background: 'rgba(60,120,20,0.04)',
                        fontSize: '1rem', fontWeight: 600,
                        color: 'rgb(4, 28, 11)', outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#5a7a40' }}>Phone Number</p>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Add phone number"
                      style={{
                        width: '100%',
                        padding: '12px 14px', borderRadius: '12px',
                        border: '1.5px solid #3c7814',
                        background: 'rgba(60,120,20,0.04)',
                        fontSize: '1rem', fontWeight: 600,
                        color: 'rgb(4, 28, 11)', outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button onClick={handleSaveChanges} disabled={isSaving} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px', background: '#3c7814', color: '#fff',
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
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'rgb(4, 28, 11)' }}>{userName}</h1>
                <p style={{ margin: '2px 0 0', color: '#5a7a40', fontSize: '0.9rem' }}>{userEmail}</p>
                {userPhone && <p style={{ margin: '2px 0 0', color: '#5a7a40', fontSize: '0.85rem', fontWeight: 600 }}>{userPhone}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3c7814' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#3c7814', fontWeight: 600 }}>Verified Account</span>
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
                padding: '10px 20px', border: '1.5px solid #3c7814',
                background: 'transparent', color: '#3c7814',
                borderRadius: '50px', fontWeight: 700,
                fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#3c7814'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3c7814'; }}
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {/* Quick Stats — real data */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {[
            { label: 'Total Orders', value: orderCount === null ? '…' : String(orderCount), icon: <Package size={22} color="#3c7814" />, href: '/orders' },
            { label: 'Wishlist Items', value: String(wishlistCount), icon: <Heart size={22} color="#3c7814" />, href: '/wishlist' },
            { label: 'Saved Addresses', value: String(addressCount), icon: <MapPin size={22} color="#3c7814" />, href: '/profile/addresses' },
          ].map((stat, i) => (
            <Link key={i} href={stat.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '1.4rem 1.5rem',
                boxShadow: '0 2px 12px rgba(60,120,20,0.08)',
                display: 'flex', flexDirection: 'column', gap: '8px',
                transition: '0.2s', cursor: 'pointer',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(60,120,20,0.15)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(60,120,20,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                {stat.icon}
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'rgb(4, 28, 11)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#5a7a40', fontWeight: 500 }}>{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Menu Groups */}
        {menuItems.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '1.2rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#5a7a40', margin: '0 0 6px 4px' }}>
              {group.group}
            </p>
            <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(60,120,20,0.08)' }}>
              {group.items.map((item, ii) => (
                <Link key={ii} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '1.2rem',
                    padding: '1rem 1.5rem', color: 'rgb(4, 28, 11)', transition: '0.2s',
                    borderBottom: ii < group.items.length - 1 ? '1px solid rgba(60,120,20,0.08)' : 'none',
                  }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'rgba(60,120,20,0.04)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: 'rgba(60,120,20,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: '#3c7814',
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'rgb(4, 28, 11)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#5a7a40', marginTop: '1px' }}>{item.desc}</div>
                    </div>
                    <ChevronRight size={16} color="#5a7a40" />
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
            background: '#fff', border: '1.5px solid rgba(220,50,50,0.2)',
            borderRadius: '16px', color: '#cc3333', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer', transition: '0.2s',
            boxShadow: '0 2px 12px rgba(60,120,20,0.08)',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.borderColor = '#cc3333'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(220,50,50,0.2)'; }}
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
          background: rgb(215, 232, 188);
          padding-top: 100px;
          padding-bottom: 40px;
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
