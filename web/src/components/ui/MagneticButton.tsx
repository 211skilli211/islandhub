'use client';
import { motion, useSpring } from 'framer-motion';
import { useRef, type ButtonHTMLAttributes } from 'react';
import { cnTheme } from '@/lib/theme-helpers';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

/**
 * Magnetic Button — subtle pull effect toward cursor + 3D press.
 * Wraps framer-motion for spring-based magnetic hover.
 */
export default function MagneticButton({ children, className, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.97, y: 2 }}
      className={cnTheme(
        'btn-3d inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3',
        'font-semibold text-sm transition-colors',
        'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]',
        'active:scale-[0.98]',
        className,
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
