'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'motion/react';
import React, { useRef } from 'react';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  isActive?: boolean;
  badge?: number | string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  isActive?: boolean;
  badge?: number | string;
};

function DockItem({
  icon,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive = false,
  badge
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const widthTransform = useTransform(
    mouseX,
    (val: number) => {
      const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
      const dist = val - (bounds.x + bounds.width / 2);
      const absDist = Math.abs(dist);
      if (absDist > distance) return baseItemSize;
      const t = 1 - absDist / distance;
      return baseItemSize + (magnification - baseItemSize) * t;
    }
  );

  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{ 
        width: width,
        height: baseItemSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
      onClick={onClick}
      className={`shrink-0 cursor-pointer ${className}`}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="active-pill"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              position: 'absolute',
              inset: '-2px',
              background: '#cddc39',
              borderRadius: '20px',
              zIndex: 0,
              boxShadow: '0 8px 20px rgba(205, 220, 57, 0.25)'
            }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ 
          scale: isActive ? 1.15 : 1,
          y: isActive ? -2 : 0
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {React.cloneElement(icon as React.ReactElement, { 
          size: 24, 
          strokeWidth: isActive ? 3 : 2,
          color: isActive ? '#0a2a16' : '#cddc39'
        })}
        
        {badge !== undefined && badge !== 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={badge}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                backgroundColor: isActive ? '#0a2a16' : '#cddc39',
                color: isActive ? '#cddc39' : '#0a2a16',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 900,
                border: '2px solid transparent',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                zIndex: 10
              }}
            >
              {badge}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 220, damping: 22 },
  magnification = 60,
  distance = 140,
  panelHeight = 70,
  baseItemSize = 52,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 150, 
        damping: 20, 
        delay: 0.8 // Appear slightly after hero animation
      }}
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{ 
        height: panelHeight,
        background: 'linear-gradient(180deg, rgba(18, 53, 31, 0.95) 0%, rgba(10, 42, 22, 0.98) 100%)',
        borderRadius: '50px',
        padding: '0 12px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: 'max-content',
        maxWidth: 'calc(100vw - 32px)',
        border: '1px solid rgba(205, 220, 57, 0.25)',
        margin: '0 auto'
      }}
      className={className}
    >
      {items.map((item, index) => (
        <DockItem
          key={index}
          icon={item.icon}
          label={item.label}
          onClick={item.onClick}
          mouseX={mouseX}
          spring={spring}
          distance={distance}
          magnification={magnification}
          baseItemSize={baseItemSize}
          className={item.className}
          isActive={item.isActive}
          badge={item.badge}
        />
      ))}
    </motion.div>
  );
}
