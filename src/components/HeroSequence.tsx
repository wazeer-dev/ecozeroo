'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import styles from './HeroSequence.module.css';
import { ArrowRight } from 'lucide-react';

const CONFIG = {
    frames: 216,
    baseUrl: 'https://sgqbfywdccgmsaakfoqc.supabase.co/storage/v1/object/public/ecozero/',
    suffix: '.jpg'
};

export default function HeroSequence() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const progress = useScrollProgress(containerRef);

    // Preload Images
    const images = useMemo(() => {
        if (typeof window === 'undefined') return [];
        const imgs: HTMLImageElement[] = [];
        const { frames, baseUrl, suffix } = CONFIG;

        for (let i = 0; i < frames; i++) {
            const img = new Image();
            const frameNum = String(i + 1).padStart(4, '0');
            img.src = `${baseUrl}${frameNum}${suffix}`;
            img.onload = () => setImagesLoaded(prev => prev + 1);
            img.onerror = () => console.warn(`Failed to load frame ${i + 1}`);
            imgs.push(img);
        }
        return imgs;
    }, []);

    // Handle Canvas Resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame();
            }
        };

        const renderFrame = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const frameIndex = Math.floor(progress * (CONFIG.frames - 1));
            const currentImage = images[frameIndex];

            if (currentImage && currentImage.complete && currentImage.naturalWidth > 0) {
                const { width, height } = canvas;
                const imgRatio = currentImage.width / currentImage.height;
                const canvasRatio = width / height;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (imgRatio > canvasRatio) {
                    drawHeight = height;
                    drawWidth = height * imgRatio;
                    offsetX = (width - drawWidth) / 2;
                    offsetY = 0;
                } else {
                    drawWidth = width;
                    drawHeight = width / imgRatio;
                    offsetX = 0;
                    offsetY = (height - drawHeight) / 2;
                }

                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial setup and render
        
        return () => window.removeEventListener('resize', handleResize);
    }, [images, progress]);

    // Secondary render effect to catch image loads
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const frameIndex = Math.floor(progress * (CONFIG.frames - 1));
        const currentImage = images[frameIndex];

        if (currentImage && currentImage.complete) {
            const { width, height } = canvas;
            const imgRatio = currentImage.width / currentImage.height;
            const canvasRatio = width / height;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgRatio > canvasRatio) {
                drawHeight = height;
                drawWidth = height * imgRatio;
                offsetX = (width - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = width;
                drawHeight = width / imgRatio;
                offsetX = 0;
                offsetY = (height - drawHeight) / 2;
            }

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);
        }
    }, [imagesLoaded, progress, images]);

    return (
        <div className={styles.heroContainer} ref={containerRef}>
            <div className={styles.stickyWrapper}>
                <canvas ref={canvasRef} className={styles.heroCanvas} />
                
                <div className={styles.overlayContent}>
                    <div className={styles.topBadge}>
                        Eco-Friendly Living Redefined
                    </div>

                    <h1 className={styles.mainTitle}>
                        Go Green. Live Clean. <br />
                        <span className={styles.highlight}>Shop EcoZero.</span>
                    </h1>

                    <p className={styles.subHeadline}>
                        Discover sustainable products crafted for everyday living — good for you, great for the planet.
                    </p>

                    <div className={styles.buttonGroup}>
                        <button 
                            className={styles.btnPrimary}
                            onClick={() => window.scrollTo({ top: window.innerHeight * 3, behavior: 'smooth' })}
                        >
                            Explore Collection
                            <div className={styles.btnIcon}>
                                <ArrowRight size={18} />
                            </div>
                        </button>
                    </div>
                </div>

                <div className={styles.scrollIndicator}>
                    <div className={styles.mouse}>
                        <div className={styles.wheel}></div>
                    </div>
                    <span>Scroll to Explore</span>
                </div>
            </div>
        </div>
    );
}
