import React, { useRef, useEffect, useState } from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import styles from './Hero.module.css';

// Configuration
const HERO_CONFIG = {
    frames: 216,
    baseUrl: 'https://sgqbfywdccgmsaakfoqc.supabase.co/storage/v1/object/public/ecozero/',
    suffix: '.jpg'
};

export default function Hero() {
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
        const imgs: HTMLImageElement[] = [];
        const { frames, baseUrl, suffix } = HERO_CONFIG;

        for (let i = 1; i <= frames; i++) {
            const img = new Image();
            const frameNum = String(i).padStart(4, '0');
            img.src = `${baseUrl}${frameNum}${suffix}`;

            img.onload = () => {
                if (isMounted) {
                    setImagesLoaded(prev => prev + 1);
                }
            };
            img.onerror = () => console.warn(`Failed to load frame ${i}`);
            imgs.push(img);
        }
        
        if (isMounted) {
            setImages(imgs);
        }

        return () => {
            isMounted = false;
        };
    }, []);

    // 3. Robust Rendering Loop
    // We use a ref to store the latest state and an empty dependency array []
    // for the useEffect to definitively solve the "changed size" HMR error.
    const renderStateRef = useRef({ progress, images, imagesLoaded, dimensions });
    
    useEffect(() => {
        renderStateRef.current = { progress, images, imagesLoaded, dimensions };
    }, [progress, images, imagesLoaded, dimensions]);

    useEffect(() => {
        let frameId: number;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            const { progress: currentProgress, images: currentImages, imagesLoaded: currentLoaded } = renderStateRef.current;
            
            if (currentImages.length > 0 && currentLoaded > 0) {
                const totalFrames = HERO_CONFIG.frames;
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
                    const isCurrentlyMobile = window.innerWidth < 768;
                    const desktopOffset = !isCurrentlyMobile ? 120 : 0;
                    const offsetY = ((height - drawHeight) / 2) + desktopOffset;
                    
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);
                }
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
                        Discover sustainable products crafted for everyday living.
                    </p>

                    <div className={styles.buttonGroup}>
                        <button 
                            className={styles.btnPrimary} 
                            onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Explore Collection
                        </button>
                        <button 
                            className={styles.btnSecondary} 
                            onClick={() => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Our Story
                        </button>
                        <div 
                            className={styles.playWrapper} 
                            onClick={() => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.rotatingText}>
                                <svg viewBox="0 0 100 100">
                                    <defs>
                                        <path id="circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                                    </defs>
                                    <text>
                                        <textPath xlinkHref="#circle">
                                            PLAY VIDEO • PLAY VIDEO •
                                        </textPath>
                                    </text>
                                </svg>
                            </div>
                            <div className={styles.playCenter}>
                                <span className={styles.playIcon}>▶</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
