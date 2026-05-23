'use client';

import { useMemo, useId } from 'react';
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
  const uid = useId().replace(/:/g, '');

  const cssVars = useMemo(() => ({
    '--s1': resolvedColors[0],
    '--s2': resolvedColors[1],
    '--s3': resolvedColors[2],
    '--s4': resolvedColors[3],
  } as React.CSSProperties), [resolvedColors]);

  const scopedCss = useMemo(() => {
    if (!config) return '';
    // Scope all shader CSS to this instance using the unique ID
    return config.css
      .replace(/\.shader-[a-z]+/g, `.shader-${shader}-${uid}`)
      .replace(/@keyframes\s+([a-z-]+)/g, `@keyframes $1-${uid}`);
  }, [config, shader, uid]);

  const wrapperClass = config ? `shader-${shader}-${uid}` : '';

  return (
    <div
      className={`relative overflow-hidden ${wrapperClass} ${className}`}
      style={{ ...cssVars, opacity }}
    >
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {children}
    </div>
  );
}
