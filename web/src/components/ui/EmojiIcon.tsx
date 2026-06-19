'use client';

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Maps emoji characters to their Lucide icon equivalents.
 * Only uses icon names confirmed to exist in lucide-react v0.563.
 * Use in render: <EmojiIcon emoji="🍽️" size={20} />
 */
const EMOJI_TO_LUCIDE: Record<string, string> = {
    // Food & Dining
    '🍽️': 'UtensilsCrossed', '🍳': 'Flame', '🍜': 'Soup', '☕': 'Coffee', '🍺': 'Beer', '🧁': 'Cake', '🍲': 'Soup',
    '🥘': 'Soup', '🍡': 'Candy', '🍔': 'Beef', '🍱': 'Box', '🍴': 'UtensilsCrossed', '🍷': 'Wine',
    '🍎': 'Apple', '🌶️': 'Flame', '🌸': 'Flower', '🌾': 'Wheat', '🍃': 'Leaf', '🥛': 'Milk', '🥬': 'Leaf',
    // Shopping
    '🛍': 'ShoppingBag', '🛒': 'ShoppingCart', '📦': 'Package',
    // Places & Buildings
    '🏪': 'Store', '🏠': 'Home', '🏖': 'Sun', '🏢': 'Building2', '🏝': 'TreePalm', '🌴': 'TreePine', '🌱': 'Sprout', '🏡': 'Home',
    '🏥': 'Hospital', '🏦': 'Landmark', '🏨': 'Hotel', '🏺': 'Grape', '🏛️': 'Landmark', '🏜': 'Sun', '🏰': 'Castle',
    '🏙': 'Building', '🏚': 'Home', '🏸': 'Badge',
    // Services & Work
    '🛠': 'Wrench', '💼': 'Briefcase', '🚗': 'Car', '💊': 'Pill', '👗': 'Shirt', '🎨': 'Palette',
    '🔨': 'Hammer', '🌿': 'Leaf', '🎭': 'Drama', '⚡': 'Zap', '👤': 'User', '💆': 'User',
    // Tours & Travel
    '🗺': 'Map', '🎟': 'Ticket', '🥾': 'Footprints', '🌊': 'Waves', '⛵': 'Sailboat', '🧗': 'Mountain', '⚓': 'Anchor',
    // Transport
    '🚕': 'CarTaxiFront', '🚤': 'Ship', '🚌': 'Bus', '✈': 'Plane', '🚖': 'CarTaxiFront',
    '🚂': 'Train', '🚐': 'Bus', '🚙': 'Car', '🚚': 'Truck', '🚪': 'DoorOpen', '🚲': 'Bike', '🚶': 'User',
    '🛥': 'Ship', '🛵': 'Bike', '🛻': 'Truck', '🏎': 'Car', '🏍': 'Bike',
    // Community & Social
    '❤': 'Heart', '🤝': 'Handshake', '👥': 'Users', '💬': 'MessageCircle', '📸': 'Camera',
    '❤️': 'Heart', '🫂': 'Users',
    // Objects & Symbols
    '🔥': 'Flame', '✨': 'Star', '🎬': 'Film', '🎯': 'Target', '💡': 'Lightbulb', '📚': 'BookOpen',
    '🚀': 'Rocket', '🤖': 'Bot', '⚙': 'Settings', '🏷': 'Tag', '⚙️': 'Settings',
    '🎉': 'PartyPopper', '🎁': 'Gift', '💎': 'Gem', '🔧': 'Wrench', '🔩': 'Wrench',
    // Nature & Weather
    '☀️': 'Sun', '⭐': 'Star', '🌟': 'Star', '🌙': 'Moon', '🌑': 'Moon', '🌃': 'Moon',
    '🌅': 'Sunrise', '🌈': 'Rainbow', '🌋': 'Mountain', '🌌': 'Stars', '🌍': 'Globe', '🌎': 'Globe', '🌐': 'Globe',
    '🌩️': 'CloudLightning', '❄': 'Snowflake',
    // UI & Actions
    '✅': 'Check', '❌': 'X', '❓': 'HelpCircle', '➕': 'Plus', '➡️': 'ArrowRight',
    '⚠️': 'AlertTriangle', '🔍': 'Search', '🔎': 'Search', '🔒': 'Lock', '🔓': 'Unlock',
    '🔔': 'Bell', '🔕': 'BellOff', '🔗': 'Link', '🔖': 'Bookmark', '🔄': 'RefreshCw',
    '🚫': 'Ban', '🗑️': 'Trash2', '🗑': 'Trash2',
    // Communication
    '📧': 'Mail', '📨': 'Mail', '📩': 'Mail', '📬': 'Mail', '📢': 'Megaphone', '📣': 'Megaphone',
    '📤': 'Send', '📥': 'Download', '📞': 'Phone', '📱': 'Smartphone',
    // Media & Files
    '📷': 'Camera', '📹': 'Video', '📺': 'Tv', '📁': 'Folder', '📂': 'FolderOpen', '📄': 'File',
    '📊': 'BarChart3', '📋': 'Clipboard', '📌': 'Pin', '📎': 'Paperclip', '📏': 'Ruler',
    '📐': 'Triangle', '📑': 'Bookmark', '📓': 'Book', '📖': 'BookOpen', '📛': 'Badge',
    '📜': 'Scroll', '📝': 'FileText', '📟': 'Pager', '📠': 'Fax', '📡': 'Satellite',
    '💻': 'Laptop', '💾': 'Save', '💿': 'Disc', '📀': 'Disc',
    // Charts & Trends
    '📈': 'TrendingUp', '📉': 'TrendingDown',
    // Time
    '📅': 'Calendar', '📆': 'Calendar', '🕐': 'Clock', '🕒': 'Clock',
    // Shapes & Symbols
    '🔴': 'Circle', '🔵': 'Circle', '🟠': 'Circle', '🟢': 'Circle', '⚪': 'Circle', '⚫': 'Circle',
    '🔷': 'Diamond', '💠': 'Diamond', '🔘': 'Circle',
    // People & Body
    '👀': 'Eye', '👁': 'Eye', '👋': 'Hand', '👍': 'ThumbsUp', '👊': 'Fist', '🙏': 'Hand',
    '💪': 'Dumbbell', '👑': 'Crown', '💙': 'Heart', '💚': 'Heart', '🖤': 'Heart', '♡': 'Heart',
    // Faces
    '😂': 'Smile', '😊': 'Smile', '😢': 'Frown', '😴': 'Moon', '😄': 'Smile', '😐': 'Meh',
    '😕': 'Frown', '😞': 'Frown', '😮': 'Circle', '🤔': 'HelpCircle',
    // Money
    '💰': 'Banknote', '💳': 'CreditCard', '💸': 'Banknote',
    // Misc
    '🛡️': 'Shield', '🛠️': 'Wrench', '🧭': 'Compass', '🧹': 'Broom', '🧠': 'Brain',
    '🧘': 'User', '🧾': 'Receipt', '🪪': 'IdCard', '🐦': 'Bird',
    '🎓': 'GraduationCap', '🎪': 'Tent', '🎫': 'Ticket', '🎵': 'Music', '🎥': 'Film',
    '🎒': 'Backpack', '🎛️': 'Sliders', '🏁': 'Flag', '🏆': 'Trophy',
    '🏖️': 'Sun', '🏝️': 'TreePalm', '🏎️': 'Car', '🏍️': 'Bike',
    '🛣': 'Construction', '🕸': 'Spider', '🖼': 'Image',
    '🗺️': 'Map', '🛰️': 'Satellite', '🤳': 'Camera',
    '✂': 'Scissors', '✉': 'Mail', '✋': 'Hand', '✏': 'Pencil', '✓': 'Check', '✔': 'Check',
    '✕': 'X', '✗': 'X', '➔': 'ArrowRight', '➤': 'ArrowRight',
    '☪': 'Star', '☰': 'Menu', '⚖': 'Scale', '⚽': 'Circle',
    '🔌': 'Plug', '🔏': 'Lock', '🔐': 'Lock', '🔑': 'Key',
    '🔤': 'Type', '🔭': 'Telescope', '🖱': 'Mouse',
    '☃': 'Snowflake', '⛄': 'Snowflake',
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
        transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' as const },
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
    animate?: boolean;
    hover?: boolean;
}) {
    let iconName = EMOJI_TO_LUCIDE[emoji];
    if (!iconName) iconName = EMOJI_TO_LUCIDE[emoji.charAt(0)];
    if (!iconName && emoji.length >= 2) iconName = EMOJI_TO_LUCIDE[emoji.slice(0, 2)];

    if (iconName && (LucideIcons as Record<string, LucideIcon>)[iconName]) {
        const Icon = (LucideIcons as Record<string, LucideIcon>)[iconName];
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
                const Icon = (LucideIcons as Record<string, LucideIcon>)[iconName];
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
