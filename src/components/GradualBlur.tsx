'use client';
import React, { CSSProperties, useMemo } from 'react';
import { usePathname } from 'next/navigation';

type GradualBlurProps = {
  position?: 'top' | 'bottom' | 'left' | 'right';
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  zIndex?: number;
  opacity?: number;
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
  responsive?: boolean;
};

const GradualBlur: React.FC<GradualBlurProps> = ({
  position = 'bottom',
  strength = 1,
  height = '150px',
  width = '100%',
  divCount = 10,
  exponential = true,
  zIndex = 1,
  opacity = 1,
}) => {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/signup') return null;

  const divs = useMemo(() => {
    const layers = [];
    for (let i = 0; i < divCount; i++) {
      const progress = i / (divCount - 1);
      const blurValue = exponential ? Math.pow(progress, 2) * strength : progress * strength;
      
      const style: CSSProperties = {
        position: 'absolute',
        zIndex: zIndex + i,
        pointerEvents: 'none',
        backdropFilter: `blur(${blurValue}px)`,
        WebkitBackdropFilter: `blur(${blurValue}px)`,
        opacity: opacity,
      };

      if (position === 'bottom') {
        style.bottom = `${(i / divCount) * 100}%`;
        style.left = 0;
        style.width = '100%';
        style.height = `${100 / divCount}%`;
      } else if (position === 'top') {
        style.top = `${(i / divCount) * 100}%`;
        style.left = 0;
        style.width = '100%';
        style.height = `${100 / divCount}%`;
      } else if (position === 'left') {
        style.left = `${(i / divCount) * 100}%`;
        style.top = 0;
        style.height = '100%';
        style.width = `${100 / divCount}%`;
      } else if (position === 'right') {
        style.right = `${(i / divCount) * 100}%`;
        style.top = 0;
        style.height = '100%';
        style.width = `${100 / divCount}%`;
      }

      layers.push(<div key={i} style={style} />);
    }
    return layers;
  }, [position, strength, divCount, exponential, zIndex, opacity]);

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: position === 'top' || position === 'left' || position === 'right' ? 0 : 'auto',
    bottom: position === 'bottom' ? 0 : 'auto',
    left: position === 'left' || position === 'top' || position === 'bottom' ? 0 : 'auto',
    right: position === 'right' ? 0 : 'auto',
    width: width,
    height: height,
    pointerEvents: 'none',
    zIndex: zIndex,
    overflow: 'hidden',
  };

  return <div style={containerStyle}>{divs}</div>;
};

export default GradualBlur;
