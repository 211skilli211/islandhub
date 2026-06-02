'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with canvas
const ParticleField = dynamic(() => import('@/components/ParticleField'), {
  ssr: false,
  loading: () => null,
});

export default function ClientParticles() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/site-settings/public')
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.particles_enabled === 'true' || data.particles_enabled === true);
      })
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;
  return <ParticleField count={40} />;
}
