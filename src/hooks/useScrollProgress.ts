import { useState, useEffect } from 'react';

/**
 * useScrollProgress
 * Returns the scroll progress (0 to 1) of a container.
 * @param {React.RefObject} containerRef - Ref to the container element (should have a height > 100vh)
 * @returns {number} progress - 0 to 1
 */
export function useScrollProgress(containerRef: React.RefObject<HTMLElement | null>) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;

            const { top, height } = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate how much of the container has been scrolled past
            const scrollDist = -top; // Distance from top of viewport
            const totalScrollable = height - windowHeight;

            let p = scrollDist / totalScrollable;
            p = Math.min(1, Math.max(0, p));

            setProgress(p);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Init

        return () => window.removeEventListener('scroll', handleScroll);
    }, [containerRef]);

    return progress;
}
