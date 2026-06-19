'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypeWriterProps {
    text: string;
    speed?: number; // ms per character
    delay?: number; // initial delay before typing starts
    cursor?: boolean;
    cursorChar?: string;
    cursorBlink?: boolean;
    loop?: boolean;
    loopDelay?: number;
    deleteSpeed?: number;
    className?: string;
    onComplete?: () => void;
    preset?: 'terminal' | 'smooth' | 'fast' | 'dramatic';
}

const PRESETS: Record<string, { speed: number; deleteSpeed: number; cursorChar: string; cursorBlink: boolean }> = {
    terminal: { speed: 50, deleteSpeed: 30, cursorChar: '▋', cursorBlink: true },
    smooth: { speed: 80, deleteSpeed: 40, cursorChar: '|', cursorBlink: true },
    fast: { speed: 30, deleteSpeed: 20, cursorChar: '▋', cursorBlink: false },
    dramatic: { speed: 120, deleteSpeed: 60, cursorChar: '▎', cursorBlink: true },
};

export default function TypeWriter({
    text,
    speed,
    delay = 0,
    cursor = true,
    cursorChar = '|',
    cursorBlink = true,
    loop = true,
    loopDelay = 2000,
    deleteSpeed,
    className = '',
    onComplete,
    preset,
}: TypeWriterProps) {
    const p = preset ? PRESETS[preset] : null;
    const effectiveSpeed = speed ?? p?.speed ?? 60;
    const effectiveDeleteSpeed = deleteSpeed ?? p?.deleteSpeed ?? effectiveSpeed * 0.6;
    const effectiveCursorChar = cursorChar ?? p?.cursorChar ?? '|';
    const effectiveCursorBlink = cursorBlink ?? p?.cursorBlink ?? true;

    const [displayed, setDisplayed] = useState('');
    const [phase, setPhase] = useState<'waiting' | 'typing' | 'paused' | 'deleting' | 'done'>('waiting');
    const [charIndex, setCharIndex] = useState(0);

    useEffect(() => {
        setDisplayed('');
        setCharIndex(0);
        setPhase('waiting');
    }, [text]);

    useEffect(() => {
        if (phase === 'waiting') {
            const t = setTimeout(() => setPhase('typing'), delay);
            return () => clearTimeout(t);
        }

        if (phase === 'typing') {
            if (charIndex >= text.length) {
                if (loop) {
                    setPhase('paused');
                } else {
                    setPhase('done');
                    onComplete?.();
                }
                return;
            }
            const t = setTimeout(() => {
                setDisplayed(prev => prev + text[charIndex]);
                setCharIndex(prev => prev + 1);
            }, effectiveSpeed);
            return () => clearTimeout(t);
        }

        if (phase === 'paused') {
            const t = setTimeout(() => setPhase('deleting'), loopDelay);
            return () => clearTimeout(t);
        }

        if (phase === 'deleting') {
            if (charIndex <= 0) {
                setPhase('typing');
                return;
            }
            const t = setTimeout(() => {
                setDisplayed(prev => prev.slice(0, -1));
                setCharIndex(prev => prev - 1);
            }, effectiveDeleteSpeed);
            return () => clearTimeout(t);
        }
    }, [phase, charIndex, text, delay, effectiveSpeed, effectiveDeleteSpeed, loop, loopDelay, onComplete]);

    return (
        <span className={`inline-flex items-center ${className}`}>
            <span>{displayed}</span>
            {cursor && phase !== 'done' && (
                <motion.span
                    className="inline-block ml-0.5"
                    animate={{ opacity: effectiveCursorBlink ? [1, 0] : 1 }}
                    transition={effectiveCursorBlink ? { duration: 0.5, repeat: Infinity, ease: 'linear' as const } : undefined}
                >
                    {effectiveCursorChar}
                </motion.span>
            )}
        </span>
    );
}

// Standalone typewriter for single-line use (headlines, CTAs, etc.)
export function TypeWriterLine({
    text,
    as: Tag = 'span',
    preset = 'smooth',
    speed,
    className = '',
    cursor = true,
    loop = false,
}: {
    text: string;
    as?: keyof JSX.IntrinsicElements;
    preset?: 'terminal' | 'smooth' | 'fast' | 'dramatic';
    speed?: number;
    className?: string;
    cursor?: boolean;
    loop?: boolean;
}) {
    return (
        <Tag className={className}>
            <TypeWriter text={text} preset={preset} speed={speed} cursor={cursor} loop={loop} />
        </Tag>
    );
}
