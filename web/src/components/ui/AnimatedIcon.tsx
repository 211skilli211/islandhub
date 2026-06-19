'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface AnimatedIconProps {
    icon: LucideIcon;
    size?: number;
    className?: string;
    animate?: 'bounce' | 'pulse' | 'spin' | 'float' | 'shake' | 'none';
    color?: string;
    strokeWidth?: number;
}

const animations = {
    bounce: {
        y: [0, -4, 0],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
    },
    pulse: {
        scale: [1, 1.15, 1],
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
    spin: {
        rotate: [0, 360],
        transition: { duration: 8, repeat: Infinity, ease: 'linear' as const },
    },
    float: {
        y: [0, -3, 0],
        x: [0, 1, 0],
        rotate: [0, 2, -2, 0],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
    },
    shake: {
        rotate: [0, -8, 8, -4, 4, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 2 },
    },
    none: {},
};

export default function AnimatedIcon({
    icon: Icon,
    size = 20,
    className = '',
    animate = 'none',
    color,
    strokeWidth = 2,
}: AnimatedIconProps) {
    const anim = animations[animate];

    return (
        <motion.div
            className={`inline-flex items-center justify-center ${className}`}
            animate={anim}
            style={{ color }}
        >
            <Icon size={size} strokeWidth={strokeWidth} />
        </motion.div>
    );
}
