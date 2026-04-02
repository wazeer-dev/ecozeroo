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
import React, { useEffect, useMemo, useRef, useState } from 'react';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  isActive?: boolean;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
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
};

function DockItem({
  icon,
  label,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive = false
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const widthTransform = useTransform(
    mouseX,
    (val: number) => {
      // Don't modify width for active items using hover springs!
      if (isActive) return baseItemSize * 2.6; // ~110px+ based on word length 
      const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
      const dist = val - (bounds.x + bounds.width / 2);
      const absDist = Math.abs(dist);
      if (absDist > distance) return baseItemSize;
      const t = 1 - absDist / distance;
      return baseItemSize + (magnification - baseItemSize) * t;
    }
  );

  const width = useSpring(widthTransform, spring);
  const activeWidth = label === 'Products' || label === 'Wishlist' ? 120 : 105;

  return (
    <motion.div
      ref={ref}
      style={{ 
        width: isActive ? activeWidth : width,
        height: 44,
        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
        borderRadius: '100px',
      }}
      onClick={onClick}
      className={`relative flex items-center justify-center shrink-0 overflow-hidden ${isActive ? 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : 'hover:bg-white/10'} transition-colors duration-300 ${className}`}
    >
      <div className="flex items-center justify-start w-full h-full" style={{ padding: isActive ? '0 6px' : '0' }}>
        {isActive ? (
          <div className="flex items-center justify-start gap-1.5 w-full">
            <div style={{ 
              background: '#146845', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {React.cloneElement(icon as React.ReactElement, { 
                size: 16, 
                strokeWidth: 2.5,
                color: '#FFFFFF' 
              })}
            </div>
            <span style={{ 
              color: '#146845', 
              fontSize: '13px', 
              fontWeight: 800,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.02em',
              paddingRight: '6px'
            }}>
              {label}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            {React.cloneElement(icon as React.ReactElement, { 
              size: 22, 
              strokeWidth: 1.8,
              color: 'rgba(255,255,255,0.95)' 
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 220, damping: 22 },
  magnification = 54,
  distance = 100,
  panelHeight = 68,
  baseItemSize = 46,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{ 
        height: panelHeight,
        background: '#146845',
        borderRadius: '100px',
        padding: '0 6px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4px',
        width: 'max-content',
        maxWidth: '100%'
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
        />
      ))}
    </motion.div>
  );
}
