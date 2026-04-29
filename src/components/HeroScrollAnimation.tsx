'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useScroll, useTransform, motion, useSpring, AnimatePresence } from 'motion/react';

const TOTAL_FRAMES = 216;
const IMAGE_URL_BASE = 'https://sgqbfywdccgmsaakfoqc.supabase.co/storage/v1/object/public/ecozero/';

const HeroScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress for the animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [1, TOTAL_FRAMES]);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    const preloadImages = async () => {
      const promises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
        return new Promise((resolve) => {
          const img = new Image();
          const frameStr = (i + 1).toString().padStart(4, '0');
          img.src = `${IMAGE_URL_BASE}${frameStr}.jpg`;
          img.onload = () => {
            loadedCount++;
            setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
            resolve(img);
          };
          img.onerror = resolve; // Continue even if one fails
          loadedImages[i] = img;
        });
      });

      await Promise.all(promises);
      setImages(loadedImages);
      setIsLoading(false);
    };

    preloadImages();
  }, []);

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const currentFrame = Math.floor(frameIndex.get());
      const image = images[currentFrame - 1];

      if (image && image.complete) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aspect ratio cover logic
        const canvasAspect = canvas.width / canvas.height;
        const imageAspect = image.width / image.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imageAspect) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imageAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imageAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }

        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      }
      requestAnimationFrame(render);
    };

    const animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [images, frameIndex]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Text animations
  const text1Opacity = useTransform(smoothProgress, [0, 0.05, 0.15, 0.2], [0, 1, 1, 0]);
  const text1Scale = useTransform(smoothProgress, [0, 0.1, 0.2], [0.9, 1, 1.1]);
  const text1Y = useTransform(smoothProgress, [0, 0.1, 0.2], [20, 0, -20]);
  
  const text2Opacity = useTransform(smoothProgress, [0.25, 0.3, 0.45, 0.5], [0, 1, 1, 0]);
  const text2Scale = useTransform(smoothProgress, [0.25, 0.35, 0.5], [0.95, 1, 1.05]);
  const text2Y = useTransform(smoothProgress, [0.25, 0.35, 0.5], [30, 0, -30]);

  const text3Opacity = useTransform(smoothProgress, [0.55, 0.6, 0.75, 0.8], [0, 1, 1, 0]);
  const text3Scale = useTransform(smoothProgress, [0.55, 0.65, 0.8], [1.1, 1, 0.9]);
  const text3Y = useTransform(smoothProgress, [0.55, 0.65, 0.8], [30, 0, -30]);

  const text4Opacity = useTransform(smoothProgress, [0.85, 0.92], [0, 1]);
  const text4Y = useTransform(smoothProgress, [0.85, 0.95], [40, 0]);

  return (
    <div ref={containerRef} style={{ height: '800vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#0a2a16' }}>
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              key="loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: '#0a2a16' }}
            >
              <div style={{ width: '240px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${loadProgress}%` }}
                  style={{ height: '100%', background: '#cddc39' }} 
                />
              </div>
              <motion.p 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ marginTop: '24px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '4px', color: '#cddc39', textTransform: 'uppercase' }}
              >
                Initializing EcoZero {loadProgress}%
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Subtle Gradient Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, rgba(10, 42, 22, 0.4) 100%)', pointerEvents: 'none' }} />

        {/* Text Overlays */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
          
          <motion.div style={{ opacity: text1Opacity, scale: text1Scale, y: text1Y, position: 'absolute', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.04em', color: '#fff', maxWidth: '1000px' }}>
              Go Green. Live Clean. <br/> <span style={{ color: '#cddc39' }}>Shop EcoZero.</span>
            </h1>
          </motion.div>

          <motion.div style={{ opacity: text2Opacity, scale: text2Scale, y: text2Y, position: 'absolute', textAlign: 'center' }}>
            <p style={{ color: '#cddc39', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '20px' }}>Our Mission</p>
            <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', maxWidth: '900px' }}>
              Discover sustainable products crafted for everyday living.
            </h2>
          </motion.div>

          <motion.div style={{ opacity: text3Opacity, scale: text3Scale, y: text3Y, position: 'absolute', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', maxWidth: '900px' }}>
              Good for you, <br/> <span style={{ color: '#cddc39' }}>great for the planet.</span>
            </h2>
            <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div style={{ padding: '12px 24px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Organic</div>
              <div style={{ padding: '12px 24px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Zero Waste</div>
            </div>
          </motion.div>

          <motion.div style={{ opacity: text4Opacity, y: text4Y, position: 'absolute', textAlign: 'center', pointerEvents: 'auto' }}>
             <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)', fontWeight: 500, marginBottom: '40px', color: '#fff', letterSpacing: '-0.02em' }}>Ready to make a change?</h2>
             <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: window.innerHeight * 8.1, behavior: 'smooth' })}
              style={{ backgroundColor: '#cddc39', color: '#0a2a16', border: 'none', borderRadius: '40px', padding: '20px 48px', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transition: 'background-color 0.3s' }}
             >
                Shop Collection
             </motion.button>
          </motion.div>

        </div>

        {/* Scroll Progress Indicator */}
        <motion.div 
          style={{ opacity: useTransform(smoothProgress, [0, 0.05], [1, 0]), position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
        >
          <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(205, 220, 57, 0.8))' }}></div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px', color: '#cddc39', fontWeight: 600 }}>Scroll</span>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroScrollAnimation;
