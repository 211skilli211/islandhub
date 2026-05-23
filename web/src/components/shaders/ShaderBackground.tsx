'use client';

import { useMemo, useId, useEffect, useRef, useState } from 'react';
import { SHADERS, type ShaderConfig } from './shaderRegistry';

interface ShaderBackgroundProps {
  shader: string;
  colors?: string[];
  opacity?: number;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  speed?: number;
}

export default function ShaderBackground({
  shader,
  colors,
  opacity = 1,
  children,
  className = '',
  interactive = false,
  speed = 1,
}: ShaderBackgroundProps) {
  const config: ShaderConfig | undefined = SHADERS[shader];
  const resolvedColors = colors || config?.defaultColors || ['#0f766e', '#06b6d4', '#8b5cf6', '#ec4899'];
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const cssVars = useMemo(() => ({
    '--s1': resolvedColors[0],
    '--s2': resolvedColors[1],
    '--s3': resolvedColors[2],
    '--s4': resolvedColors[3],
    '--mouse-x': `${mousePos.x * 100}%`,
    '--mouse-y': `${mousePos.y * 100}%`,
  } as React.CSSProperties), [resolvedColors, mousePos]);

  // Mouse tracking for interactive mode
  useEffect(() => {
    if (!interactive || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: 0.5, y: 0.5 });
    };

    const el = containerRef.current;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive]);

  const scopedCss = useMemo(() => {
    if (!config) return '';
    let css = config.css
      .replace(/\.shader-[a-z]+/g, `.shader-${shader}-${uid}`)
      .replace(/@keyframes\s+([a-z-]+)/g, `@keyframes $1-${uid}`);

    // Apply speed multiplier to all animation durations
    if (speed !== 1) {
      css = css.replace(/(\d+(?:\.\d+)?)s\s+(ease|linear|infinite|alternate|forwards|backwards)/g, (_match, dur: string, rest: string) => {
        const newDur = (parseFloat(dur) / speed).toFixed(2);
        return `${newDur}s ${rest}`;
      });
    }

    // Add interactive mouse-following effect
    if (interactive) {
      css += `
        .shader-${shader}-${uid} {
          background-position: var(--mouse-x) var(--mouse-y) !important;
        }
        .shader-${shader}-${uid}::before {
          transform: translate(calc((var(--mouse-x) - 50%) * -0.3), calc((var(--mouse-y) - 50%) * -0.3));
        }
        .shader-${shader}-${uid}::after {
          transform: translate(calc((var(--mouse-x) - 50%) * 0.2), calc((var(--mouse-y) - 50%) * 0.2));
        }
      `;
    }

    return css;
  }, [config, shader, uid, speed, interactive]);

  const wrapperClass = config ? `shader-${shader}-${uid}` : '';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${wrapperClass} ${className}`}
      style={{ ...cssVars, opacity }}
    >
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {children}
    </div>
  );
}
