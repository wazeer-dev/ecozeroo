'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // Also handle actual window load
    const handleLoad = () => {
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#0a2a16',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Animated Background Elements */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              width: '800px',
              height: '800px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #cddc39 0%, transparent 70%)',
              filter: 'blur(100px)',
              zIndex: 1
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', marginBottom: '60px' }}>
              {/* Logo Glow Ring */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  inset: '-20px',
                  background: 'radial-gradient(circle, rgba(205, 220, 57, 0.2) 0%, transparent 70%)',
                  borderRadius: '50%',
                  zIndex: -1
                }}
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative' }}
              >
                <img 
                  src="/photo_2026-03-13_20-14-52 (1).png" 
                  alt="EcoZero" 
                  style={{ height: '100px', width: 'auto', filter: 'drop-shadow(0 0 20px rgba(205, 220, 57, 0.3))' }} 
                />
                
                {/* Shimmer Effect */}
                <motion.div
                  animate={{ 
                    left: ['-100%', '200%']
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transform: 'skewX(-20deg)',
                    zIndex: 2
                  }}
                />
              </motion.div>
            </div>

            <div style={{ width: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    backgroundColor: '#cddc39',
                    width: `${progress}%`,
                    boxShadow: '0 0 15px #cddc39'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  fontSize: '0.65rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '5px', 
                  color: '#ffffff',
                  fontWeight: 800,
                  opacity: 0.5
                }}>
                  Establishing Eco-Link
                </span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ color: '#cddc39', fontWeight: 900, fontSize: '0.8rem' }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
            </div>
          </div>

          {/* Reveal Curtain */}
          <motion.div
            initial={{ y: '100%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#cddc39',
              zIndex: 3
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
