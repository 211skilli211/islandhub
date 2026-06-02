'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface ListingCard3DProps {
  children: ReactNode;
  className?: string;
}

/**
 * 3D Tilt Card — perspective tilt + glow on hover (framer-motion).
 * Wraps content in a perspective-transformed container.
 */
export default function ListingCard3D({ children, className = '' }: ListingCard3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ perspective: 800, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`relative group ${className}`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(20,184,166,0.15), transparent 70%)',
          filter: 'blur(20px)',
          transform: 'translateZ(-1px)',
        }}
      />
      <div style={{ transform: 'translateZ(8px)' }}>{children}</div>
    </motion.div>
  );
}
