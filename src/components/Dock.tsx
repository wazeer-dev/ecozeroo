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
        height: 48,
        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
        borderRadius: '14px',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClick}
      className={`relative shrink-0 cursor-pointer transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, { 
          size: isActive ? 24 : 22, 
          strokeWidth: isActive ? 2.5 : 1.8,
          color: isActive ? '#146845' : '#FFFFFF' 
        })}
      </div>
    </motion.div>
  );
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 220, damping: 22 },
  magnification = 58,
  distance = 120,
  panelHeight = 64,
  baseItemSize = 48,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{ 
        height: panelHeight,
        background: '#146845',
        borderRadius: '32px',
        padding: '0 8px',
        boxShadow: '0 15px 40px rgba(20,104,69,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: 'max-content',
        maxWidth: 'calc(100vw - 32px)',
        border: '1px solid rgba(255,255,255,0.1)'
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
