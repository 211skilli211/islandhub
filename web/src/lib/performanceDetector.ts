'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export type PerformanceTier = 'low' | 'medium' | 'high';

/**
 * Detect device performance capability
 * Uses deviceMemory, hardwareConcurrency, and GPU info
 */
export function detectPerformanceTier(): PerformanceTier {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'medium';

  let score = 0;

  // Device memory (GB)
  const memory = (navigator as any).deviceMemory || 4;
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else if (memory >= 2) score += 1;

  // CPU cores
  const cores = navigator.hardwareConcurrency || 4;
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else if (cores >= 2) score += 1;

  // Touch points (desktop bonus)
  const touchPoints = navigator.maxTouchPoints || 0;
  if (touchPoints === 0) score += 1;

  // Screen size (larger screens = more pixels to render)
  const pixelCount = window.innerWidth * window.innerHeight;
  if (pixelCount > 2073600) score -= 1; // >1080p penalty

  // Connection type
  const conn = (navigator as any).connection;
  if (conn) {
    if (conn.effectiveType === '4g') score += 1;
    else if (conn.effectiveType === '3g') score -= 1;
    else if (conn.effectiveType === '2g') score -= 2;
    if (conn.saveData) score -= 1;
  }

  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * Hook to get performance tier, with optional FPS-based refinement
 */
export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>('medium');
  const fpsRef = useRef<number[]>([]);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    // Initial detection
    const initialTier = detectPerformanceTier();
    setTier(initialTier);

    // For medium tier, run a quick FPS test to refine
    if (initialTier === 'medium') {
      let frames = 0;
      const startTime = performance.now();
      const testDuration = 500; // 500ms test

      const measureFPS = () => {
        frames++;
        const elapsed = performance.now() - startTime;

        if (elapsed < testDuration) {
          requestAnimationFrame(measureFPS);
        } else {
          const fps = (frames / elapsed) * 1000;
          if (fps < 30) setTier('low');
          else if (fps >= 55) setTier('high');
        }
      };

      requestAnimationFrame(measureFPS);
    }
  }, []);

  return tier;
}

/**
 * Hook to monitor FPS in real-time
 */
export function useFPSMonitor(enabled: boolean = false): number {
  const [fps, setFps] = useState(60);
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    let running = true;
    const tick = () => {
      if (!running) return;
      framesRef.current++;

      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        const currentFps = Math.round((framesRef.current * 1000) / delta);
        setFps(currentFps);
        framesRef.current = 0;
        lastTimeRef.current = now;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => { running = false; };
  }, [enabled]);

  return fps;
}

/**
 * Get recommended particle count based on performance tier
 */
export function getRecommendedParticleCount(tier: PerformanceTier, requested: number): number {
  switch (tier) {
    case 'high': return Math.min(requested, 300);
    case 'medium': return Math.min(requested, 120);
    case 'low': return Math.min(requested, 50);
  }
}

/**
 * Get recommended shader quality based on performance tier
 */
export function getRecommendedQuality(tier: PerformanceTier): 'low' | 'medium' | 'high' {
  return tier;
}
