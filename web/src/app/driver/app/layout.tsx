import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'IslandHub Driver',
    description: 'IslandHub Driver App - Accept rides, manage trips, track earnings',
    manifest: '/manifest-driver.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'IslandHub Driver'
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false
    }
};

export default function DriverAppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest-driver.json" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Driver" />
                <meta name="theme-color" content="#0d9488" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            </head>
            <body className="bg-slate-900">
                {children}
            </body>
        </html>
    );
}