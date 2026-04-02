'use client';

import Link from 'next/link';
import { Mail, Lock, User as UserIcon, Phone, Loader2, Search, Camera, Check, Apple, ArrowRight, Leaf } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';

const colors = {
  bg: '#f7fdf4',
  primary: 'rgb(60, 120, 20)',
  accent: 'rgb(136, 198, 95)',
  text: 'rgb(4, 28, 11)',
  textMuted: 'rgba(4, 28, 11, 0.6)',
  border: 'rgba(4, 28, 11, 0.08)',
  inputBg: 'rgba(255, 255, 255, 0.8)',
};

export default function SignupPage() {
  const COUNTRIES = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'Afghanistan', code: '+93', flag: '🇦🇫' },
    { name: 'Albania', code: '+355', flag: '🇦🇱' },
    { name: 'Algeria', code: '+213', flag: '🇩🇿' },
    { name: 'American Samoa', code: '+1684', flag: '🇦🇸' },
    { name: 'Andorra', code: '+376', flag: '🇦🇩' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'China', code: '+86', flag: '🇨🇳' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  ];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setAvatar(result.data.url);
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

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Social Login Helpers
  const handleSocialSuccess = async (user: any) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.email));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.email), {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          role: 'customer',
          avatar: user.photoURL || null,
          createdAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('ecozero_user', user.email);
      localStorage.setItem('ecozero_user_name', user.displayName || 'User');
      if (user.photoURL) localStorage.setItem('ecozero_user_avatar', user.photoURL);
      
      const redirect = localStorage.getItem('redirect_after_login');
      window.location.href = redirect || "/";
    } catch (err) {
      console.error("Social sync error:", err);
      localStorage.setItem('ecozero_user', user.email);
      window.location.href = "/";
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleSocialSuccess(result.user);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Google Auth Error:", error);
        alert("Google sign-in failed: " + error.message);
      }
    }
  };

  const handleAppleSignup = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      await handleSocialSuccess(result.user);
    } catch (error: any) {
      console.error("Apple Auth Error:", error);
      alert("Apple sign-in requires additional configuration.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Create User in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save additional metadata to Firestore
      await setDoc(doc(db, 'users', email), {
        uid: user.uid,
        name,
        email,
        phone: `${selectedCountry.code} ${phone}`,
        role: 'customer',
        avatar: avatar || null,
        createdAt: new Date().toISOString()
      });

      // Auto-create local "session"
      localStorage.setItem('ecozero_user', email);
      localStorage.setItem('ecozero_user_name', name);
      if (avatar) localStorage.setItem('ecozero_user_avatar', avatar);

      const redirect = localStorage.getItem('redirect_after_login');
      window.location.href = redirect || "/";
    } catch (error: any) {
      console.error("Signup Error:", error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Please login instead.");
        window.location.href = '/login';
      } else {
        alert("Signup failed: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-root" style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', background: '#ffffff' }}>
      {/* Left Pane - Hero Visual */}
      <div className="login-hero" style={{ 
        flex: 1, 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-end', 
        padding: '5rem',
        overflow: 'hidden'
      }}>
        {/* Background Image with blur effects */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          right: '20px', 
          bottom: '20px', 
          borderRadius: '40px',
          overflow: 'hidden',
          zIndex: 0
        }}>
          <img src="/login-bg.png" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)' }} alt="" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,28,11,0.95), transparent)' }} />
        </div>

        {/* Content over background */}
        <div style={{ position: 'relative', zIndex: 2, color: '#fff', maxWidth: '600px' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8 }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <Leaf size={24} color={colors.accent} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>EcoZero Systems</span>
          </div>
          
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, margin: '0 0 1.5rem 0', letterSpacing: '-2px' }}>
            Build<br />A Sustainable<br />Future
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Join our global community of conscious investors. Start tracking your environmental impact today.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '50px', height: '3px', background: colors.accent, borderRadius: '2px' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.accent }}>JOIN THE MOVEMENT</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Form Card */}
      <div className="login-form-container" style={{ width: '45%', minWidth: '500px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 5rem', background: '#fff', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.8s ease-out', position: 'relative' }}>
          <Link href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: colors.textMuted, 
            textDecoration: 'none', 
            fontSize: '0.9rem', 
            fontWeight: 700, 
            marginBottom: '1rem',
            transition: '0.3s'
          }}>
            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Home
          </Link>
          
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: colors.text, marginBottom: '0.5rem', letterSpacing: '-1.5px' }}>Create Account</h2>
            <p style={{ color: colors.textMuted, fontSize: '1rem' }}>Join the EcoZero community today!</p>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', color: colors.text, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input required value={name || ''} onChange={e=>setName(e.target.value)} type="text" style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '18px', border: `1.5px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} placeholder="John Doe" />
                <UserIcon size={20} style={{ position: 'absolute', left: '16px', top: '16px', opacity: 0.3 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', color: colors.text, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input required value={email || ''} onChange={e=>setEmail(e.target.value)} type="email" style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '18px', border: `1.5px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} placeholder="you@domain.com" />
                <Mail size={20} style={{ position: 'absolute', left: '16px', top: '16px', opacity: 0.3 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', color: colors.text, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input required value={password || ''} onChange={e=>setPassword(e.target.value)} type="password" style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '18px', border: `1.5px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} placeholder="••••••••" />
                <Lock size={20} style={{ position: 'absolute', left: '16px', top: '16px', opacity: 0.3 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', color: colors.text, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <input required value={phone || ''} onChange={e=>setPhone(e.target.value)} type="tel" style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '18px', border: `1.5px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} placeholder="Your mobile number" />
                <Phone size={20} style={{ position: 'absolute', left: '16px', top: '16px', opacity: 0.3 }} />
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '1.3rem', fontSize: '1.1rem', fontWeight: 900, marginTop: '1rem', borderRadius: '20px', background: colors.text, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Creating Account...</> : (<>Create Account <ArrowRight size={20} /></>)}
            </button>
          </form>

          {/* Social Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', gap: '15.2px' }}>
            <div style={{ flex: 1, height: '1px', background: colors.border }}></div>
            <span style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>OR JOIN WITH</span>
            <div style={{ flex: 1, height: '1px', background: colors.border }}></div>
          </div>

          {/* Social Buttons */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              type="button"
              onClick={handleGoogleSignup}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '1rem', borderRadius: '18px', border: `1.5px solid ${colors.border}`, background: '#fff', cursor: 'pointer', fontWeight: 700, transition: '0.2s', color: colors.text }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button 
              type="button"
              onClick={handleAppleSignup}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '1rem', borderRadius: '18px', border: `1.5px solid ${colors.border}`, background: '#000', cursor: 'pointer', fontWeight: 700, transition: '0.2s', color: '#fff' }}
            >
              <Apple size={20} fill="currentColor" />
              Apple
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: colors.textMuted, fontSize: '1rem', fontWeight: 600, paddingBottom: '2rem' }}>
            Already have an account? <Link href="/login" style={{ color: colors.primary, textDecoration: 'none', fontWeight: 900, marginLeft: '8px' }}>Sign in</Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}
