'use client';

/**
 * Shader Registry — Add new shaders here.
 * Each shader is a self-contained CSS animation that renders as a hero background.
 * To add a new shader: add an entry to the SHADERS object with a unique key.
 */
export interface ShaderConfig {
  name: string;
  description: string;
  defaultColors: string[];
  css: string;
}

export const SHADERS: Record<string, ShaderConfig> = {
  aurora: {
    name: 'Aurora',
    description: 'Flowing aurora borealis waves',
    defaultColors: ['#0f766e', '#06b6d4', '#8b5cf6', '#ec4899'],
    css: `
      .shader-aurora {
        background: linear-gradient(135deg, var(--s1), var(--s2), var(--s3), var(--s4));
        background-size: 400% 400%;
        animation: aurora-shift 12s ease infinite;
      }
      .shader-aurora::before, .shader-aurora::after {
        content: '';
        position: absolute;
        inset: 0;
        background: inherit;
        filter: blur(80px);
        opacity: 0.6;
        animation: aurora-drift 15s ease-in-out infinite alternate;
      }
      .shader-aurora::after {
        animation-delay: -7s;
        opacity: 0.4;
        filter: blur(120px);
      }
      @keyframes aurora-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      @keyframes aurora-drift {
        0% { transform: translate(-5%, -5%) rotate(0deg); }
        100% { transform: translate(5%, 5%) rotate(5deg); }
      }
    `,
  },
  mesh: {
    name: 'Mesh Gradient',
    description: 'Smooth morphing gradient mesh',
    defaultColors: ['#1e293b', '#0f766e', '#0e7490', '#4f46e5'],
    css: `
      .shader-mesh {
        background:
          radial-gradient(ellipse at 20% 50%, var(--s1) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, var(--s2) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, var(--s3) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 70%, var(--s4) 0%, transparent 50%);
        animation: mesh-morph 18s ease-in-out infinite;
      }
      @keyframes mesh-morph {
        0%, 100% {
          background:
            radial-gradient(ellipse at 20% 50%, var(--s1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, var(--s2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, var(--s3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, var(--s4) 0%, transparent 50%);
        }
        33% {
          background:
            radial-gradient(ellipse at 60% 30%, var(--s1) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 70%, var(--s2) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, var(--s3) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 40%, var(--s4) 0%, transparent 50%);
        }
        66% {
          background:
            radial-gradient(ellipse at 40% 80%, var(--s1) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 40%, var(--s2) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 30%, var(--s3) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 60%, var(--s4) 0%, transparent 50%);
        }
      }
    `,
  },
  ocean: {
    name: 'Ocean Waves',
    description: 'Layered wave motion',
    defaultColors: ['#0c4a6e', '#0369a1', '#0284c7', '#38bdf8'],
    css: `
      .shader-ocean {
        background: linear-gradient(180deg, var(--s1) 0%, var(--s2) 50%, var(--s3) 100%);
        overflow: hidden;
      }
      .shader-ocean::before, .shader-ocean::after {
        content: '';
        position: absolute;
        bottom: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(ellipse at center, transparent 40%, var(--s4) 45%, transparent 50%);
        background-size: 100% 8%;
        animation: ocean-wave 8s linear infinite;
        opacity: 0.5;
      }
      .shader-ocean::after {
        animation-delay: -4s;
        animation-duration: 12s;
        opacity: 0.3;
        background-size: 100% 12%;
      }
      @keyframes ocean-wave {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(-25%) rotate(2deg); }
      }
    `,
  },
  fire: {
    name: 'Fire & Ember',
    description: 'Warm flickering fire effect',
    defaultColors: ['#7c2d12', '#c2410c', '#f59e0b', '#fbbf24'],
    css: `
      .shader-fire {
        background: linear-gradient(180deg, var(--s1) 0%, var(--s2) 40%, var(--s3) 70%, var(--s4) 100%);
        animation: fire-flicker 4s ease-in-out infinite;
      }
      .shader-fire::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at 30% 100%, var(--s4) 0%, transparent 40%),
          radial-gradient(ellipse at 70% 100%, var(--s3) 0%, transparent 35%),
          radial-gradient(ellipse at 50% 100%, var(--s4) 0%, transparent 30%);
        animation: fire-dance 3s ease-in-out infinite alternate;
        filter: blur(20px);
      }
      @keyframes fire-flicker {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.1); }
      }
      @keyframes fire-dance {
        0% { transform: scaleY(1) translateY(0); opacity: 0.8; }
        100% { transform: scaleY(1.1) translateY(-5%); opacity: 1; }
      }
    `,
  },
  cosmic: {
    name: 'Cosmic Dust',
    description: 'Deep space with floating particles',
    defaultColors: ['#0f0f23', '#1a1a3e', '#2d1b69', '#4c1d95'],
    css: `
      .shader-cosmic {
        background: linear-gradient(135deg, var(--s1), var(--s2), var(--s3));
        overflow: hidden;
      }
      .shader-cosmic::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
          radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.8), transparent),
          radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,0.6), transparent),
          radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.7), transparent),
          radial-gradient(2px 2px at 80% 50%, rgba(255,255,255,0.5), transparent),
          radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.9), transparent),
          radial-gradient(2px 2px at 50% 10%, rgba(255,255,255,0.4), transparent),
          radial-gradient(1px 1px at 70% 90%, rgba(255,255,255,0.6), transparent),
          radial-gradient(2px 2px at 90% 40%, rgba(255,255,255,0.7), transparent),
          radial-gradient(1px 1px at 30% 50%, rgba(255,255,255,0.5), transparent),
          radial-gradient(2px 2px at 85% 75%, rgba(255,255,255,0.8), transparent);
        animation: cosmic-float 20s linear infinite;
      }
      .shader-cosmic::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 50%, var(--s4) 0%, transparent 60%);
        opacity: 0.4;
        animation: cosmic-pulse 8s ease-in-out infinite;
      }
      @keyframes cosmic-float {
        0% { transform: translateY(0); }
        100% { transform: translateY(-100%); }
      }
      @keyframes cosmic-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.1); }
      }
    `,
  },
  neon: {
    name: 'Neon Pulse',
    description: 'Cyberpunk neon grid pulse',
    defaultColors: ['#09090b', '#18181b', '#0ea5e9', '#22d3ee'],
    css: `
      .shader-neon {
        background: var(--s1);
        overflow: hidden;
      }
      .shader-neon::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, transparent 49%, var(--s3) 49%, var(--s3) 51%, transparent 51%),
          linear-gradient(0deg, transparent 49%, var(--s3) 49%, var(--s3) 51%, transparent 51%);
        background-size: 60px 60px;
        opacity: 0.15;
        animation: neon-grid 4s linear infinite;
      }
      .shader-neon::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 50%, var(--s4) 0%, transparent 50%);
        opacity: 0.3;
        animation: neon-pulse 3s ease-in-out infinite;
        filter: blur(40px);
      }
      @keyframes neon-grid {
        0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
        100% { transform: perspective(500px) rotateX(60deg) translateY(60px); }
      }
      @keyframes neon-pulse {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 0.5; }
      }
    `,
  },
};

export function getShaderNames(): { key: string; name: string; description: string }[] {
  return Object.entries(SHADERS).map(([key, s]) => ({ key, name: s.name, description: s.description }));
}
