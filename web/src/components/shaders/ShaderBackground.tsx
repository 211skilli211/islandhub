'use client';

import { useMemo } from 'react';
import { SHADERS, type ShaderConfig } from './shaderRegistry';

interface ShaderBackgroundProps {
  shader: string;
  colors?: string[];
  opacity?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function ShaderBackground({
  shader,
  colors,
  opacity = 1,
  children,
  className = '',
}: ShaderBackgroundProps) {
  const config: ShaderConfig | undefined = SHADERS[shader];
  const resolvedColors = colors || config?.defaultColors || ['#0f766e', '#06b6d4', '#8b5cf6', '#ec4899'];

  const cssVars = useMemo(() => ({
    '--s1': resolvedColors[0],
    '--s2': resolvedColors[1],
    '--s3': resolvedColors[2],
    '--s4': resolvedColors[3],
  } as React.CSSProperties), [resolvedColors]);

  if (!config) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 ${className}`} style={cssVars}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden shader-${shader} ${className}`}
      style={{ ...cssVars, opacity }}
    >
      <style jsx global>{`
        ${config.css}
      `}</style>
      {children}
    </div>
  );
}
