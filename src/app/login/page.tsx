'use client';

import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Apple } from 'lucide-react';
import { useState } from 'react';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Social Login Helpers
  const handleSocialSuccess = async (user: any) => {
    try {
      // Ensure user profile exists in Firestore
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
      console.error("Firestore sync error:", err);
      // Fallback: even if firestore fails, we have auth session
      localStorage.setItem('ecozero_user', user.email);
      window.location.href = "/";
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleSocialSuccess(result.user);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        alert("Google sign-in is not enabled in Firebase Console. Please enable it in 'Sign-in method'.");
      } else {
        alert("Google sign-in failed: " + error.message);
      }
    }
  };

  const handleAppleLogin = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      await handleSocialSuccess(result.user);
    } catch (error: any) {
      console.error("Apple Auth Error:", error);
      alert("Apple sign-in requires additional configuration in Firebase Console.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    // Direct Admin / Simplified Access
    const normalizedEmail = email.toLowerCase().trim();
    if ((normalizedEmail === 'admin@gmail.com' && password === 'admin@gmail.com') ||
      (normalizedEmail === 'admin' && password === 'admin') ||
      (normalizedEmail === 'ecozero' && password === 'ecozero')) {
      localStorage.setItem('ecozero_user', 'admin');
      localStorage.setItem('ecozero_user_name', 'EcoZero Admin');
      window.location.href = "/admin";
      return;
    }

    try {
      // 1. Authenticate with Firebase Auth
      await signInWithEmailAndPassword(auth, normalizedEmail, password);

      // 2. Fetch User Metadata from Firestore
      const userDoc = await getDoc(doc(db, 'users', normalizedEmail));

      if (!userDoc.exists()) {
        // Fallback for missing profile
        localStorage.setItem('ecozero_user', normalizedEmail);
        window.location.href = "/";
        return;
      }

      const userData = userDoc.data();
      localStorage.setItem('ecozero_user', normalizedEmail);
      localStorage.setItem('ecozero_user_name', userData.name || 'User');
      if (userData.avatar) localStorage.setItem('ecozero_user_avatar', userData.avatar);

      const redirect = localStorage.getItem('redirect_after_login');
      if (redirect) {
        localStorage.removeItem('redirect_after_login');
        window.location.href = redirect;
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Auth Exception:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert("Invalid email or password.");
      } else if (error.code === 'auth/too-many-requests') {
        alert("Too many failed attempts. Try again later.");
      } else {
        alert("An error occurred: " + error.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="page-main-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="login-card" style={{ background: 'var(--surface-color)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(136, 198, 95, 0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'rgb(4, 28, 11)' }}>Welcome Back</h2>
            <p style={{ color: 'rgba(4, 28, 11, 0.65)' }}>Sign in to continue to ECOZERO.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none' }}
                  placeholder="you@domain.com"
                />
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'rgba(4, 28, 11, 0.4)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password</label>
                <Link href="#" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '1rem 3.5rem 1rem 3rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none' }}
                  placeholder="••••••••"
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'rgba(4, 28, 11, 0.4)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '15px', background: 'none', border: 'none', color: 'rgba(4, 28, 11, 0.4)', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', borderRadius: '30px', opacity: isLoggingIn ? 0.7 : 1 }}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(4,28,11,0.1)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(4,28,11,0.1)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '15px', border: '1.5px solid rgba(4,28,11,0.1)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="Google" />
              <span style={{ color: '#041c0b', fontSize: '0.9rem', fontWeight: 600 }}>Google</span>
            </button>
            <button
              type="button"
              onClick={handleAppleLogin}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '15px', border: '1.5px solid rgba(4,28,11,0.1)', background: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <Apple size={18} color="#fff" />
              <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Apple</span>
            </button>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Don't have an account? <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
