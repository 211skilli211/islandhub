'use client';
import { useEffect, useRef } from 'react';

/**
 * ParticleHero — Canvas-based animated particle field for hero backgrounds.
 * Three themes: 'tropical' (golden motes), 'ocean' (teal bubbles), 'aurora' (multi-color).
 * No external dependencies — pure canvas 2D.
 */
export default function ParticleHero({ theme = 'tropical', count = 80, speed = 1 }: {
  theme?: 'tropical' | 'ocean' | 'aurora' | 'fireflies';
  count?: number;
  speed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const actualCount = isMobile ? Math.min(count, 35) : count;

    const w = () => canvas.width;
    const h = () => canvas.height;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Color palettes per theme
    const palettes: Record<string, string[]> = {
      tropical: ['rgba(245,158,11,', 'rgba(20,184,166,', 'rgba(251,191,36,', 'rgba(245,158,11,'],
      ocean: ['rgba(20,184,166,', 'rgba(6,182,212,', 'rgba(45,212,191,', 'rgba(94,234,212,'],
      aurora: ['rgba(20,184,166,', 'rgba(245,158,11,', 'rgba(239,68,68,', 'rgba(6,182,212,'],
      fireflies: ['rgba(20,184,166,', 'rgba(245,158,11,', 'rgba(251,191,36,', 'rgba(168,85,247,'],
    };

    const colors = palettes[theme] || palettes.tropical;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
      pulse: number; pulseSpeed: number;
    }

    const particles: Particle[] = Array.from({ length: actualCount }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.3 * speed,
      vy: -(Math.random() * 0.4 + 0.15) * speed,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    // Connection lines between nearby particles
    const maxDist = 120;

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, w(), h());

      // Update & draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        p.opacity = 0.1 + Math.sin(p.pulse) * 0.2;

        // Wrap
        if (p.y < -10) { p.y = h() + 10; p.x = Math.random() * w(); }
        if (p.x < -10) p.x = w() + 10;
        if (p.x > w() + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
      });

      // Connection lines (subtle)
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const opacity = (1 - dist / maxDist) * 0.08;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(20,184,166,${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [theme, count, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
