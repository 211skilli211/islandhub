'use client';

import { useEffect, useState } from 'react';
import { usePerformanceTier, getRecommendedParticleCount, getRecommendedQuality, PerformanceTier } from '@/lib/performanceDetector';

interface AdaptiveShaderProps {
  tier: PerformanceTier;
  children: (config: {
    quality: 'low' | 'medium' | 'high';
    particleCount: number;
    requestedParticleCount: number;
  }) => React.ReactNode;
  requestedParticleCount?: number;
}

export function AdaptiveShaderRenderer({
  tier,
  children,
  requestedParticleCount = 120,
}: AdaptiveShaderProps) {
  const quality = getRecommendedQuality(tier);
  const particleCount = getRecommendedParticleCount(tier, requestedParticleCount);

  return <>{children({ quality, particleCount, requestedParticleCount })}</>;
}

/**
 * Hook that provides adaptive shader configuration
 */
export function useAdaptiveShader(requestedParticleCount: number = 120) {
  const tier = usePerformanceTier();
  const quality = getRecommendedQuality(tier);
  const particleCount = getRecommendedParticleCount(tier, requestedParticleCount);

  return {
    tier,
    quality,
    particleCount,
    isWebGLSupported: typeof window !== 'undefined' && !!window.WebGLRenderingContext,
  };
}
