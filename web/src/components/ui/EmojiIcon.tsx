'use client';

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Maps emoji characters to their Lucide icon equivalents.
 * Use in render: <EmojiIcon emoji="🍽️" size={20} />
 */
const EMOJI_TO_LUCIDE: Record<string, keyof typeof LucideIcons> = {
    // Food & Dining
    '🍽️': 'UtensilsCrossed', '🍳': 'Flame', '🍜': 'Soup', '☕': 'Coffee', '🍺': 'Beer', '🧁': 'Cake', '🍲': 'Soup',
    // Shopping
    '🛍': 'ShoppingBag', '🛒': 'ShoppingCart',
    // Places & Buildings
    '🏪': 'Store', '🏠': 'Home', '🏖': 'Sun', '🏢': 'Building2', '🏝': 'TreePalm', '🌴': 'TreePine', '🌱': 'Sprout', '🏡': 'Home',
    // Services & Work
    '🛠': 'Wrench', '💼': 'Briefcase', '🚗': 'Car', '💊': 'Pill', '👗': 'Shirt', '🎨': 'Palette',
    // Tours & Travel
    '🗺': 'Map', '🎟': 'Ticket', '🥾': 'Footprints', '🌊': 'Waves', '⛵': 'Sailboat', '🧗': 'Mountain', '⚓': 'Anchor',
    // Transport
    '🚕': 'CarTaxiFront', '📦': 'Package', '🚤': 'Ship', '🚌': 'Bus', '✈': 'Plane', '🚖': 'CarTaxiFront',
    // Community & Social
    '❤': 'Heart', '🤝': 'Handshake', '👥': 'Users', '💬': 'MessageCircle', '📸': 'Camera',
    // Objects & Symbols
    '🔥': 'Flame', '✨': 'Star', '🎬': 'Film', '🎯': 'Target', '💡': 'Lightbulb', '📚': 'BookOpen',
    '🚀': 'Rocket', '🤖': 'Bot', '⚙': 'Settings', '🏷': 'Tag',
    '🎉': 'PartyPopper', '🎁': 'Gift', '💎': 'Gem',
    // Extra emojis used across the app
    '🔨': 'Hammer', '🌿': 'Leaf', '🎭': 'Drama', '🆘': 'Siren', '⚡': 'Zap', '🍡': 'Candy', '👤': 'User',
};

const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.2, rotate: 5 },
    tap: { scale: 0.9 },
};

const pulseVariants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.1, 1],
        transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
    },
};

/** Animated Lucide icon that replaces emoji characters */
export function EmojiIcon({
    emoji,
    size = 20,
    className = '',
    animate = false,
    hover = true,
}: {
    emoji: string;
    size?: number;
    className?: string;
    animate?: boolean;   // continuous pulse animation
    hover?: boolean;     // hover scale effect
}) {
    let iconName = EMOJI_TO_LUCIDE[emoji];
    if (!iconName) iconName = EMOJI_TO_LUCIDE[emoji.charAt(0)];
    if (!iconName && emoji.length >= 2) iconName = EMOJI_TO_LUCIDE[emoji.slice(0, 2)];

    if (iconName) {
        const Icon = LucideIcons[iconName] as LucideIcon;
        if (Icon) {
            if (animate) {
                return (
                    <motion.span
                        className={`inline-flex ${className}`}
                        variants={pulseVariants}
                        initial="initial"
                        animate="animate"
                    >
                        <Icon size={size} />
                    </motion.span>
                );
            }
            if (hover) {
                return (
                    <motion.span
                        className={`inline-flex ${className}`}
                        variants={iconVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        whileTap="tap"
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                        <Icon size={size} />
                    </motion.span>
                );
            }
            return <Icon size={size} className={className} />;
        }
    }

    // Fallback: render original emoji
    return <span className={className}>{emoji}</span>;
}

/** Replaces all emoji characters in a string with animated Lucide icons */
export function EmojiText({
    text,
    size = 16,
    className = '',
    animate = false,
}: {
    text: string;
    size?: number;
    className?: string;
    animate?: boolean;
}) {
    const parts: (string | React.ReactElement)[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        let found = false;
        for (let len = Math.min(4, remaining.length); len >= 1; len--) {
            const chunk = remaining.slice(0, len);
            const iconName = EMOJI_TO_LUCIDE[chunk] || EMOJI_TO_LUCIDE[chunk.charAt(0)];
            if (iconName) {
                const Icon = LucideIcons[iconName] as LucideIcon;
                if (Icon) {
                    if (animate) {
                        parts.push(
                            <motion.span key={key++} variants={pulseVariants} initial="initial" animate="animate" className="inline-flex">
                                <Icon size={size} className={`inline-block align-text-bottom ${className}`} />
                            </motion.span>
                        );
                    } else {
                        parts.push(
                            <motion.span key={key++} className="inline-flex">
                                <Icon size={size} className={`inline-block align-text-bottom ${className}`} />
                            </motion.span>
                        );
                    }
                    remaining = remaining.slice(len);
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            let nextEmoji = remaining.length;
            for (let i = 1; i < remaining.length; i++) {
                if (EMOJI_TO_LUCIDE[remaining[i]] || EMOJI_TO_LUCIDE[remaining.slice(i, i + 2)]) {
                    nextEmoji = i;
                    break;
                }
            }
            parts.push(remaining.slice(0, nextEmoji));
            remaining = remaining.slice(nextEmoji);
        }
    }

    return <>{parts}</>;
}
