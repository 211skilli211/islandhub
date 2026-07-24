'use client';

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

const createIcon = (paths: React.ReactNode, size = 20) => {
  return (props: IconProps) => (
    <svg
      width={props.size || size}
      height={props.size || size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      {paths}
    </svg>
  );
};

export const EyeIcon = createIcon([
  <path key="1" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />,
  <circle cx="12" cy="12" r="3" />,
]);

export const EyeOffIcon = createIcon([
  <path key="1" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />,
  <line x1="1" y1="1" x2="23" y2="23" />,
]);

export const MailIcon = createIcon([
  <path key="1" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />,
  <polyline points="22,6 12,13 2,6" />,
]);

export const LockIcon = createIcon([
  <rect key="1" x="3" y="11" width="18" height="11" rx="2" ry="2" />,
  <path d="M12 11V7a4 4 0 0 1 8 0v4" />,
];

export const UserIcon = createIcon([
  <path key="1" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
  <circle cx="12" cy="7" r="4" />,
]);

export const AlertCircleIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <line x1="12" y1="8" x2="12" y2="12" />,
  <line x1="12" y1="16" x2="12.01" y2="16" />,
]);

export const CheckIcon = createIcon([
  <polyline key="1" points="20 6 9 17 4 12" />,
]);

export const ChevronLeftIcon = createIcon([
  <polyline key="1" points="15 18 9 12 15 6" />,
]);

export const ChevronRightIcon = createIcon([
  <polyline key="1" points="9 18 15 12 9 6" />,
]);

export const GoogleIcon = createIcon([
  <path
    key="1"
    fill="#4285F4"
    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
  />
  <path
    fill="#34A853"
    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
  />
  <path
    fill="#FBBC05"
    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
  />
  <path
    fill="#EA4335"
    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.02-3.02C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
  />
);

export const UserIcon = createIcon([
  <path key="1" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
  <circle cx="12" cy="7" r="4" />,
]);

export const LockIcon = createIcon([
  <rect key="1" x="3" y="11" width="18" height="11" rx="2" ry="2" />,
  <path d="M12 11V7a4 4 0 0 1 8 0v4" />,
]);

export const MailIcon = createIcon([
  <path key="1" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />,
  <polyline points="22,6 12,13 2,6" />,
]);

export const ChevronLeftIcon = createIcon([
  <polyline key="1" points="15 18 9 12 15 6" />,
]);

export const ChevronRightIcon = createIcon([
  <polyline key="1" points="9 18 15 12 9 6" />,
]);

export const EyeIcon = createIcon([
  <path key="1" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />,
  <circle cx="12" cy="12" r="3" />,
]);

export const EyeOffIcon = createIcon([
  <path key="1" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />,
  <line x1="1" y1="1" x2="23" y2="23" />,
]);

export const GoogleIcon = createIcon([
  <path
    key="1"
    fill="#4285F4"
    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
  />
  <path
    fill="#34A853"
    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
  />
  <path
    fill="#FBBC05"
    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
  />
  <path
    fill="#EA4335"
    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.02-3.02C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
  />
);

export const ChevronLeftIcon = createIcon([
  <polyline key="1" points="15 18 9 12 15 6" />,
]);

export const ChevronRightIcon = createIcon([
  <polyline key="1" points="9 18 15 12 9 6" />,
]);

export const EyeIcon = createIcon([
  <path key="1" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />,
  <circle cx="12" cy="12" r="3" />,
]);

export const EyeOffIcon = createIcon([
  <path key="1" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />,
  <line x1="1" y1="1" x2="23" y2="23" />,
]);

export const ChevronLeftIcon = createIcon([
  <polyline key="1" points="15 18 9 12 15 6" />,
]);

export const ChevronRightIcon = createIcon([
  <polyline key="1" points="9 18 15 12 9 6" />,
]);

export const UserIcon = createIcon([
  <path key="1" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
  <circle cx="12" cy="7" r="4" />,
]);

export const EmojiIcon = ({ emoji = '😀', size = 20, className = '', ...props }: React.SVGProps<SVGSVGElement> & { emoji?: string; size?: number }) => {
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    >
      {emoji}
    </span>
  );
}

export const StarIcon = createIcon([
  <polygon key="1" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 7 8.26 12 2" />,
]);

export const HeartIcon = createIcon([
  <path key="1" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.38-1.38a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
]);

export const ArrowUpRightIcon = createIcon([
  <path key="1" d="M7 7h10v10" />,
  <path key="2" d="M17 7 7 17" />,
]);

export const ArrowRightIcon = createIcon([
  <path key="1" d="M5 12h14" />,
  <polyline key="2" points="15 5 19 12 5 19" />,
]);

export const PlusIcon = createIcon([
  <line key="1" x1="12" y1="5" x2="12" y2="19" />,
  <line key="2" x1="5" y1="12" x2="19" y2="12" />,
]);

export const MinusIcon = createIcon([
  <line key="1" x1="5" y1="12" x2="19" y2="12" />,
]);

export const XIcon = createIcon([
  <line key="1" x1="18" y1="6" x2="6" y2="18" />,
  <line key="2" x1="6" y1="6" x2="18" y2="18" />,
]);

export const MenuIcon = createIcon([
  <line key="1" x1="3" y1="12" x2="21" y2="12" />,
  <line key="2" x1="3" y1="6" x2="21" y2="6" />,
  <line key="3" x1="3" y1="18" x2="21" y2="18" />,
]);

export const SearchIcon = createIcon([
  <circle key="1" cx="11" cy="11" r="8" />,
  <line key="2" x1="21" y1="21" x2="16.65" y2="16.65" />,
]);

export const SettingsIcon = createIcon([
  <circle key="1" cx="12" cy="12" r="3" />,
  <path key="2" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />,
]);

export const HomeIcon = createIcon([
  <path key="1" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  <polyline key="2" points="9 22 9 12 15 12 15 22" />,
]);

export const ShoppingBagIcon = createIcon([
  <path key="1" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />,
  <line key="2" x1="3" y1="6" x2="21" y2="6" />,
  <path key="3" d="M16 10a4 4 0 0 1-8 0" />,
);

export const MapPinIcon = createIcon([
  <path key="1" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />,
  <circle key="2" cx="12" cy="10" r="3" />,
]);

export const MessageCircleIcon = createIcon([
  <path key="1" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
]);

export const MonitorIcon = createIcon([
  <rect key="1" x="2" y="3" width="20" height="14" rx="2" ry="2" />,
  <line key="2" x1="8" y1="21" x2="16" y2="21" />,
  <line key="3" x1="12" y1="17" x2="12" y2="21" />,
]);

export const TrendingUpIcon = createIcon([
  <polyline key="1" points="23 6 13.5 15.5 8.5 10.5 1 18" />,
  <polyline key="2" points="17 6 23 6 23 12" />,
]);

export const UsersIcon = createIcon([
  <path key="1" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />,
  <circle key="2" cx="9" cy="7" r="4" />,
  <path key="3" d="M23 21v-2a4 4 0 0 0-3-3.87" />,
  <path key="4" d="M16 3.13a4 4 0 0 1 0 7.75" />,
]);