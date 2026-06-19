'use client';

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Maps emoji characters to their Lucide icon equivalents.
 * Use in render: <EmojiIcon emoji="🍽️" size={20} />
 */
const EMOJI_TO_LUCIDE: Record<string, keyof typeof LucideIcons> = {
    // Food & Dining
    '🍽️': 'UtensilsCrossed', '🍳': 'Flame', '🍜': 'Soup', '☕': 'Coffee', '🍺': 'Beer', '🧁': 'CupcakeCookie',
    // Shopping
    '🛍': 'ShoppingBag', '🛒': 'ShoppingCart',
    // Places & Buildings
    '🏪': 'Store', '🏠': 'Home', '🏖': 'Sun', '🏢': 'Building2', '🏝': 'Palmtree', '🌴': 'TreePine', '🌱': 'Sprout',
    // Services & Work
    '🛠': 'Wrench', '💼': 'Briefcase', '🚗': 'Car', '💊': 'Pill', '👗': 'Shirt', '🎨': 'Palette',
    // Tours & Travel
    '🗺': 'Map', '🎟': 'Ticket', '🥾': 'Footprints', '🌊': 'Waves', '⛵': 'Sailboat', '🧗': 'Mountain', '⚓': 'Anchor',
    // Transport
    '🚕': 'Taxi', '📦': 'Package', '🚤': 'Ship', '🚌': 'Bus', '✈': 'Plane',
    // Community & Social
    '❤': 'Heart', '🤝': 'Handshake', '🌴': 'TreePine', '👥': 'Users', '💬': 'MessageCircle', '📸': 'Camera',
    // Objects & Symbols
    '🔥': 'Flame', '✨': 'Sparkles', '🎬': 'Film', '🎯': 'Target', '💡': 'Lightbulb', '📚': 'BookOpen',
    '🚀': 'Rocket', '🤖': 'Bot', '⚙': 'Settings', '🏷': 'BadgeDollarSign', '📦': 'Package',
    '🎉': 'PartyPopper', '🎁': 'BadgeAward', '💎': 'Gem',
};

/**
 * Renders a Lucide icon for a given emoji string.
 * Falls back to the original emoji if no mapping found.
 */
export function EmojiIcon({ emoji, size = 20, className = '' }: {
    emoji: string;
    size?: number;
    className?: string;
}) {
    // Try exact match first
    let iconName = EMOJI_TO_LUCIDE[emoji];
    // Try first character
    if (!iconName) iconName = EMOJI_TO_LUCIDE[emoji.charAt(0)];
    // Try first two characters (for multi-char emojis)
    if (!iconName && emoji.length >= 2) iconName = EMOJI_TO_LUCIDE[emoji.slice(0, 2)];

    if (iconName) {
        const Icon = LucideIcons[iconName] as LucideIcon;
        if (Icon) return <Icon size={size} className={className} />;
    }

    // Fallback: render original emoji
    return <span className={className}>{emoji}</span>;
}

/**
 * Replaces all emoji characters in a string with Lucide icons.
 * Returns an array of strings and React elements.
 */
export function EmojiText({ text, size = 16, className = '' }: {
    text: string;
    size?: number;
    className?: string;
}) {
    const parts: (string | React.ReactElement)[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        let found = false;
        // Try to match emojis (check longest first)
        for (let len = Math.min(4, remaining.length); len >= 1; len--) {
            const chunk = remaining.slice(0, len);
            const iconName = EMOJI_TO_LUCIDE[chunk] || EMOJI_TO_LUCIDE[chunk.charAt(0)];
            if (iconName) {
                const Icon = LucideIcons[iconName] as LucideIcon;
                if (Icon) {
                    parts.push(<Icon key={key++} size={size} className={`inline-block align-text-bottom ${className}`} />);
                    remaining = remaining.slice(len);
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            // Find next emoji
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
