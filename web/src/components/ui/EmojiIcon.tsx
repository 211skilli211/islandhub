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
    // Extended emoji map
    '🔨': 'Hammer', '🌿': 'Leaf', '🎭': 'Drama', '🆘': 'AlertTriangle', '⚡': 'Zap', '🍡': 'Candy', '👤': 'User',
    '🥘': 'Pot', '⚙️': 'Settings',
    '☀️': 'Sun', '⭐': 'Star', '🌟': 'Star', '✅': 'Check', '❌': 'X', '❓': 'HelpCircle',
    '➕': 'Plus', '➡️': 'ArrowRight', '⚠️': 'AlertTriangle', '💳': 'CreditCard',
    '💰': 'Banknote', '📱': 'Smartphone', '🔍': 'Search', '🔒': 'Lock', '🔓': 'Unlock',
    '🔔': 'Bell', '🔗': 'Link', '📧': 'Mail', '📎': 'Paperclip', '📍': 'MapPin',
    '📅': 'Calendar', '📆': 'CalendarDays', '📊': 'BarChart3', '📋': 'Clipboard', '📌': 'Pin',
    '📝': 'FileText', '📞': 'Phone', '📡': 'Antenna', '📢': 'Megaphone', '📤': 'Send',
    '📥': 'Download', '🔄': 'RefreshCw', '🔧': 'Wrench', '🔭': 'Telescope', '🗑️': 'Trash2',
    '🚫': 'Ban', '🚲': 'Bike', '🚶': 'PersonStanding', '🛡️': 'Shield', '🛠️': 'Wrench',
    '🤔': 'HelpCircle', '😂': 'Laugh', '😊': 'Smile', '😢': 'Frown', '😴': 'Moon',
    '🙏': 'HandHeart', '👍': 'ThumbsUp', '👋': 'Hand', '👑': 'Crown', '💥': 'Zap',
    '💪': 'Dumbbell', '💻': 'Laptop', '💾': 'Save', '💿': 'Disc', '📀': 'Disc',
    '📁': 'Folder', '📂': 'FolderOpen', '📄': 'File', '📈': 'TrendingUp', '📉': 'TrendingDown',
    '📏': 'Ruler', '📐': 'Triangle', '📑': 'Bookmark', '📓': 'Book', '📖': 'BookOpen',
    '📛': 'Badge', '📜': 'Scroll', '📟': 'Pager', '📠': 'Fax', '📣': 'Megaphone',
    '📨': 'MailOpen', '📩': 'Mail', '📬': 'Mailbox', '📷': 'Camera',
    '📹': 'Video', '📺': 'Tv', '🔌': 'PlugPower', '🔎': 'Search', '🔏': 'PenLine',
    '🔐': 'LockKeyhole', '🔑': 'KeyRound', '🔕': 'BellOff', '🔖': 'Bookmark',
    '🔘': 'CircleDot', '🔤': 'CaseSensitive', '🔴': 'Circle', '🔵': 'Circle',
    '🔷': 'Diamond', '🕐': 'Clock', '🕒': 'Clock1', '🖤': 'Heart', '🖱': 'MousePointer2',
    '🗺️': 'Map', '🛰️': 'Satellite', '🛵': 'Bike', '🛻': 'Truck', '🟠': 'Circle',
    '🟢': 'Circle', '🤳': 'Camera', '🥛': 'Milk', '🥬': 'LeafyGreen',
    '🧘': 'Sparkles', '🧠': 'Brain', '🧭': 'Compass', '🧹': 'Broom', '🧾': 'Receipt',
    '🪪': 'IdCard', '🫂': 'Users', '🏥': 'Hospital', '🏦': 'Landmark', '🏨': 'Hotel',
    '🏺': 'Bean', '🐦': 'Bird', '👀': 'Eye', '👁': 'Eye', '👊': 'ContactRound',
    '💆': 'UserRound', '💙': 'Heart', '💚': 'Heart', '💸': 'Banknote',
    '🏛️': 'Landmark', '🏜️': 'MountainSnow', '🏝️': 'Trees', '🏎️': 'Car',
    '🏍': 'Bike', '🏁': 'Flag', '🏆': 'Trophy', '🎓': 'GraduationCap',
    '🎪': 'Tent', '🎫': 'Ticket', '🎵': 'Music', '🎥': 'Film', '🎒': 'Backpack',
    '🎛️': 'SlidersHorizontal', '🌃': 'MoonStar', '🌅': 'Sunrise', '🌈': 'Rainbow',
    '🌋': 'Mountain', '🌌': 'Sparkles', '🌍': 'Globe', '🌎': 'Globe', '🌐': 'Globe',
    '🌑': 'Moon', '🌙': 'Moon', '🌩️': 'CloudLightning', '🌶️': 'Flame',
    '🌸': 'Flower', '🌾': 'Wheat', '🍃': 'Leaf', '🍎': 'Apple',
    '🍔': 'Beef', '🍱': 'Box', '🍴': 'UtensilsCrossed', '🍷': 'Wine',
    '🚂': 'Train', '🚐': 'Bus', '🚙': 'Car', '🚚': 'Truck',
    '🚪': 'DoorOpen', '🛥': 'Ship', '🛣': 'Construction', '🕸': 'Spider',
    '🖼': 'Image', '🗑': 'Trash2', '😄': 'Smile', '😐': 'Meh', '😕': 'Frown',
    '😞': 'Sad', '😮': 'Circle', '⚽': 'Circle', '⚖': 'Scale', '⚪': 'Circle',
    '⚫': 'Circle', '☪': 'StarCrescent', '☰': 'Menu', '♡': 'Heart',
    '✂': 'Scissors', '✉': 'Mail', '✋': 'Hand', '✏': 'Pencil', '✓': 'Check',
    '❄': 'Snowflake', '➔': 'ArrowRight', '➤': 'ArrowRight', '❤️': 'Heart',
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
