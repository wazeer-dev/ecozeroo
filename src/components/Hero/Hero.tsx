import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import styles from './Hero.module.css';

// Configuration
const HERO_CONFIG = {
    desktop: {
        frames: 216,
        baseUrl: 'https://sgqbfywdccgmsaakfoqc.supabase.co/storage/v1/object/public/ecozero/',
        prefix: '',
        suffix: '.jpg',
        padding: 4,
        start: 1
    },
    mobile: {
        frames: 192,
        baseUrl: 'https://sgqbfywdccgmsaakfoqc.supabase.co/storage/v1/object/public/mobile%20animation/',
        prefix: 'frame_',
        suffix: '_delay-0.041s.webp',
        padding: 3,
        start: 0
    }
};

export default function Hero() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Progress determines the frame
    const progress = useScrollProgress(containerRef);

    // 1. Detect Screen Size and Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                setDimensions({ width: window.innerWidth, height: window.innerHeight });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 2. Preload Images
    useEffect(() => {
        let isMounted = true;
        setImagesLoaded(0);
        const activeConfig = isMobile ? HERO_CONFIG.mobile : HERO_CONFIG.desktop;
        const { frames, baseUrl, suffix, prefix, padding, start } = activeConfig;
        const imgs: HTMLImageElement[] = [];

        for (let i = 0; i < frames; i++) {
            const img = new Image();
            const frameNum = String(i + start).padStart(padding, '0');
            img.src = `${baseUrl}${prefix}${frameNum}${suffix}`;

            img.onload = () => {
                if (isMounted) {
                    setImagesLoaded(prev => prev + 1);
                }
            };
            img.onerror = () => console.warn(`Failed to load frame ${i + start}`);
            imgs.push(img);
        }
        
        if (isMounted) {
            setImages(imgs);
        }

        return () => {
            isMounted = false;
        };
    }, [isMobile]); // Re-preload when switching devices

    // 3. Robust Rendering Loop
    const renderStateRef = useRef({ progress, images, imagesLoaded, dimensions, isMobile });
    const smoothedProgressRef = useRef(0);
    
    useEffect(() => {
        renderStateRef.current = { progress, images, imagesLoaded, dimensions, isMobile };
    }, [progress, images, imagesLoaded, dimensions, isMobile]);

    useEffect(() => {
        let frameId: number;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            const { 
                progress: targetProgress, 
                images: currentImages, 
                imagesLoaded: currentLoaded,
                isMobile: currentIsMobile 
            } = renderStateRef.current;
            
            // Linear Interpolation for smooth scrolling
            // 0.1 is the smoothing factor (lower = smoother/slower, higher = faster/snappier)
            smoothedProgressRef.current += (targetProgress - smoothedProgressRef.current) * 0.1;
            const currentProgress = smoothedProgressRef.current;
            
            const activeConfig = currentIsMobile ? HERO_CONFIG.mobile : HERO_CONFIG.desktop;
            
            const totalFrames = activeConfig.frames;
            const frameIndex = Math.floor(currentProgress * (totalFrames - 1));
            const currentImage = currentImages[frameIndex];

            if (currentImage && currentImage.complete && currentImage.naturalWidth > 0) {
                    const { width, height } = canvas;
                    const imgRatio = currentImage.naturalWidth / currentImage.naturalHeight;
                    const canvasRatio = width / height;

                    let drawWidth, drawHeight;
                    if (imgRatio > canvasRatio) {
                        drawHeight = height;
                        drawWidth = height * imgRatio;
                    } else {
                        drawWidth = width;
                        drawHeight = width / imgRatio;
                    }

                    const offsetX = (width - drawWidth) / 2;
                    const desktopOffset = 0; // Removed offset to full fill frame
                    const offsetY = ((height - drawHeight) / 2) + desktopOffset;
                    
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);
                }
            frameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(frameId);
    }, []); // Empty dependency array - size never changes

    return (
        <div className={styles.heroContainer} ref={containerRef}>
            <div className={styles.stickyWrapper}>
                <canvas ref={canvasRef} className={styles.heroCanvas} />

                <div className={styles.overlayContent}>
                    <div className={styles.topBadge}>
                        Eco-Friendly Living Redefined
                    </div>

                    <h1 className={styles.mainTitle}>
                        GO GREEN <span className={styles.highlight}>LIVE CLEAN</span>
                    </h1>

                    <p className={styles.subHeadline}>
                        Experience the purest organic blends crafted for your body and the planet.
                    </p>

                    <div className={styles.buttonGroup}>
                        <button 
                            className={styles.btnPrimary} 
                            onClick={() => router.push('/menu')}
                        >
                            EXPLORE COLLECTION
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
