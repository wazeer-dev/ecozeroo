'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';

type ImageItem = string | { src: string; alt?: string };

export type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

const DEFAULT_IMAGES: ImageItem[] = [
  { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop', alt: 'Forest Canopy' },
  { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop', alt: 'Nature Valley' },
  { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop', alt: 'Mountain Range' },
  { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', alt: 'Alpine Peaks' }
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: ImageItem[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) return coords.map(c => ({ ...c, src: '', alt: '' }));

  const normalizedImages = pool.map(image => typeof image === 'string' ? { src: image, alt: '' } : { src: image.src || '', alt: image.alt || '' });
  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#060010',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '400px',
  openedImageHeight = '400px',
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);

  const applyTransform = useCallback((xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
      const aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case 'min': basis = Math.min(w, h); break;
        case 'max': basis = Math.max(w, h); break;
        case 'width': basis = w; break;
        case 'height': basis = h; break;
        default: basis = aspect >= 1.3 ? w : Math.min(w, h);
      }
      let radius = clamp(basis * fit, minRadius, maxRadius);
      root.style.setProperty('--radius', `${Math.round(radius)}px`);
      root.style.setProperty('--viewer-pad', `${Math.max(8, Math.round(Math.min(w, h) * padFactor))}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, fitBasis, minRadius, maxRadius, padFactor, overlayBlurColor, grayscale, imageBorderRadius, openedImageBorderRadius, applyTransform]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) { cancelAnimationFrame(inertiaRAF.current); inertiaRAF.current = null; }
  }, []);

  const startInertia = useCallback((vx: number, vy: number) => {
    let vX = vx * 80, vY = vy * 80;
    const friction = 0.94 + 0.055 * clamp(dragDampening, 0, 1);
    const step = () => {
      vX *= friction; vY *= friction;
      if (Math.abs(vX) < 0.01 && Math.abs(vY) < 0.01) { inertiaRAF.current = null; return; }
      const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF.current = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF.current = requestAnimationFrame(step);
  }, [dragDampening, maxVerticalRotationDeg, applyTransform, stopInertia]);

  useGesture({
    onDragStart: ({ event }) => {
      if (focusedElRef.current) return;
      stopInertia();
      const evt = event as PointerEvent;
      draggingRef.current = true;
      movedRef.current = false;
      startRotRef.current = { ...rotationRef.current };
      startPosRef.current = { x: evt.clientX, y: evt.clientY };
    },
    onDrag: ({ event, last, velocity, direction, movement }) => {
      if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
      const evt = event as PointerEvent;
      const dx = evt.clientX - startPosRef.current.x;
      const dy = evt.clientY - startPosRef.current.y;
      if (!movedRef.current && (dx*dx + dy*dy) > 16) movedRef.current = true;
      const nextX = clamp(startRotRef.current.x - dy / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = startRotRef.current.y + dx / dragSensitivity;
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);

      if (last) {
        draggingRef.current = false;
        if (!movedRef.current) {
           const tapTarget = (evt.target as Element).closest?.('.item__image') as HTMLElement;
           if (tapTarget) openItemFromElement(tapTarget);
        } else {
           startInertia(velocity[0] * direction[0], velocity[1] * direction[1]);
        }
        startPosRef.current = null;
      }
    }
  }, { target: mainRef, eventOptions: { passive: false } });

  const openItemFromElement = (el: HTMLElement) => {
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    const parent = el.parentElement!;
    focusedElRef.current = el;
    const parentRot = computeItemBaseRotation(getDataNumber(parent, 'offsetX', 0), getDataNumber(parent, 'offsetY', 0), 2, 2, segments);
    const rotY = -(parentRot.rotateY + (rotationRef.current.y % 360)) % 360;
    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${-parentRot.rotateX - rotationRef.current.x}deg`);
    
    setTimeout(() => {
      const tileR = el.getBoundingClientRect();
      const frameR = frameRef.current!.getBoundingClientRect();
      const mainR = mainRef.current!.getBoundingClientRect();
      originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
      el.style.visibility = 'hidden';
      const overlay = document.createElement('div');
      overlay.className = 'enlarge';
      overlay.style.cssText = `position:absolute; left:50%; top:50%; width:${openedImageWidth || '400px'}; height:${openedImageHeight || '400px'}; transition:all ${enlargeTransitionMs}ms ease; border-radius:${openedImageBorderRadius}; overflow:hidden; z-index:100; transform-origin: center center; transform: translate(-50%, -50%) scale(0.1); opacity: 0;`;
      
      const img = document.createElement('img');
      img.src = (el.querySelector('img') as HTMLImageElement).src;
      img.style.cssText = `width:100%; height:100%; object-fit:cover; filter:${grayscale ? 'grayscale(1)' : 'none'};`;
      overlay.appendChild(img);
      viewerRef.current!.appendChild(overlay);
      
      requestAnimationFrame(() => {
         overlay.style.opacity = '1';
         overlay.style.transform = 'translate(-50%, -50%) scale(1)';
         rootRef.current?.setAttribute('data-enlarging', 'true');
      });
    }, 10);
  };

  useEffect(() => {
    const handleScrimClick = () => {
      if (performance.now() - openStartedAtRef.current < 300) return;
      const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement;
      if (!overlay) return;
      overlay.style.transform = 'translate(-50%, -50%) scale(0.1)';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        if (focusedElRef.current) focusedElRef.current.style.visibility = 'visible';
        focusedElRef.current = null;
        rootRef.current?.removeAttribute('data-enlarging');
        openingRef.current = false;
      }, enlargeTransitionMs);
    };
    const scrim = scrimRef.current;
    scrim?.addEventListener('click', handleScrimClick);
    return () => scrim?.removeEventListener('click', handleScrimClick);
  }, [enlargeTransitionMs]);

  const css = `
    .sphere-root { --radius: 520px; --circ: calc(var(--radius) * 3.14); }
    .sphere, .sphere-item { transform-style: preserve-3d; }
    .sphere { transform: translateZ(calc(var(--radius) * -1)); position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; }
    .sphere-item {
      position: absolute; inset: -999px; margin: auto;
      width: calc(var(--circ) / var(--segments) * 2); height: calc(var(--circ) / var(--segments) * 2);
      transform: rotateY(calc(calc(360deg / var(--segments) / 2) * (var(--offset-x) + 0.5) + var(--rot-y-delta, 0deg))) 
                 rotateX(calc(calc(360deg / var(--segments) / 2) * (var(--offset-y) - 0.5) + var(--rot-x-delta, 0deg))) 
                 translateZ(var(--radius));
      backface-visibility: hidden;
    }
    .item__image { border-radius: var(--tile-radius); overflow: hidden; cursor: pointer; transition: transform 0.3s; }
    .item__image:hover { transform: scale(1.05); }
    .sphere-root[data-enlarging="true"] .scrim { opacity: 1; pointer-events: auto; }
  `;

  return (
    <div ref={rootRef} className="sphere-root relative w-full h-full overflow-hidden" style={{ background: '#000', ['--segments' as any]: segments } as any}>
      <style>{css}</style>
      <main ref={mainRef} className="absolute inset-0 perspective-[1200px] select-none touch-none">
        <div className="absolute inset-0 flex items-center justify-center transform-style-3d">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <div key={i} className="sphere-item" data-offset-x={it.x} data-offset-y={it.y} style={{ ['--offset-x' as any]: it.x, ['--offset-y' as any]: it.y } as any}>
                <div className="item__image w-[90%] h-[90%] m-auto aspect-square bg-gray-900 border border-white/5">
                  <img src={it.src} alt={it.alt} draggable={false} className="w-full h-full object-cover" style={{ filter: 'var(--image-filter)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <div ref={viewerRef} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
        <div ref={scrimRef} className="scrim absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300" />
        <div ref={frameRef} className="pointer-events-none" style={{ width: openedImageWidth, height: openedImageHeight }} />
      </div>
    </div>
  );
}
