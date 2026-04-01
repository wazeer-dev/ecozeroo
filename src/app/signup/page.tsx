'use client';

import Link from 'next/link';
import { Mail, Lock, User as UserIcon, Phone, Loader2, Search, Camera, Check, Apple } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';

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
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        alert("Google sign-in is not enabled in Firebase Console.");
      } else {
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
      alert("Apple sign-in requires additional configuration in Firebase Console.");
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
      console.error("Signup Error:", error);
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already in use.");
      } else if (error.code === 'auth/operation-not-allowed') {
        alert("Email/Password provider not enabled in Firebase Console.");
      } else {
        alert("Signup failed: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-main-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="login-card" style={{ background: 'var(--surface-color)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(136, 198, 95, 0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Join Us</h2>
            <p style={{ color: 'var(--text-muted)' }}>Create your ECOZERO account.</p>
          </div>
          
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div 
                style={{ 
                  width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(60, 120, 20, 0.1)', 
                  border: '2px dashed rgba(60, 120, 20, 0.3)', position: 'relative', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}
                onClick={() => document.getElementById('signupAvatarInput')?.click()}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', opacity: 0.6 }}>
                    {name ? getInitials(name) : <Camera size={30} />}
                  </div>
                )}
                
                {isUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={24} color="#fff" className="animate-spin" />
                  </div>
                )}

                <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent)', padding: '5px', borderRadius: '50%', color: '#fff' }}>
                  {avatar ? <Check size={12} /> : <Camera size={12} />}
                </div>
              </div>
              <input 
                id="signupAvatarInput"
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                style={{ display: 'none' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input required value={name} onChange={e=>setName(e.target.value)} type="text" style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none' }} placeholder="John Doe" />
                <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'rgba(4, 28, 11, 0.4)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input required value={email} onChange={e=>setEmail(e.target.value)} type="email" style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none' }} placeholder="you@domain.com" />
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'rgba(4, 28, 11, 0.4)' }} />
              </div>
            </div>

            <div style={{ zIndex: isDropdownOpen ? 50 : 20, position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Phone Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div ref={dropdownRef} style={{ position: 'absolute', left: '16px', zIndex: 60 }}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ background: 'transparent', color: 'rgb(4, 28, 20)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none', borderRight: '1px solid rgba(136,198,95,0.2)', paddingRight: '12px' }}
                  >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{selectedCountry.flag}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.5, color: 'rgb(4, 28, 11)' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  
                  {isDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: '-16px', background: '#0a1a0f', border: '1px solid rgba(136, 198, 95, 0.4)', borderRadius: '16px', overflow: 'hidden', marginTop: '12px', display: 'flex', flexDirection: 'column', width: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)', maxHeight: '300px', zIndex: 100 }}>
                      <div style={{ padding: '0.8rem', borderBottom: '1px solid rgba(136, 198, 95, 0.2)', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#88c65f' }} />
                        <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.4rem 0.4rem 2.2rem', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.95rem' }} onClick={(e) => e.stopPropagation()} />
                      </div>
                      <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
                        {filteredCountries.map(country => (
                          <div key={country.name} onClick={() => { setSelectedCountry(country); setIsDropdownOpen(false); setSearchQuery(''); }} style={{ padding: '0.7rem 1.2rem', cursor: 'pointer', background: selectedCountry.name === country.name ? 'rgba(136, 198, 95, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{country.flag}</span>
                              <span style={{ color: '#fff', fontSize: '0.9rem' }}>{country.name}</span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{country.code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <input required value={phone} onChange={e=>setPhone(e.target.value)} type="tel" style={{ width: '100%', padding: '1rem 1rem 1rem 5.5rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none' }} placeholder="(000) 000-0000" />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input required value={password} onChange={e=>setPassword(e.target.value)} type="password" style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none' }} placeholder="••••••••" />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'rgba(4, 28, 11, 0.4)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1.5rem', borderRadius: '30px', opacity: isSubmitting ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(4,28,11,0.1)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(4,28,11,0.1)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={handleGoogleSignup} style={{ flex: 1, padding: '0.8rem', borderRadius: '15px', border: '1.5px solid rgba(4,28,11,0.1)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="Google" />
              <span style={{ color: '#041c0b', fontSize: '0.9rem', fontWeight: 600 }}>Google</span>
            </button>
            <button type="button" onClick={handleAppleSignup} style={{ flex: 1, padding: '0.8rem', borderRadius: '15px', border: '1.5px solid rgba(4,28,11,0.1)', background: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Apple size={18} color="#fff" />
              <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Apple</span>
            </button>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-spin { animation: spin 1s linear infinite; }
          `}} />

          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
