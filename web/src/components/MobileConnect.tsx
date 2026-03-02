'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function MobileConnect() {
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Provide the IP address URL if possible, otherwise current.
            // Since we can't detect IP client side easily without external help, 
            // we will just instruct the user to ensure they are on the same network
            // and provide the current href.
            // Wait, window.location.href on localhost is localhost. 
            // We need the LAN IP. 
            // Let's hardcode the one we saw earlier as a fallback/hint or ask user to replace it.
            // Actually, "window.location.host" will be localhost:3002.
            // We'll trust the user accessing this page might already be on the LAN ip if they are not exclusively on localhost.
            // OR we can just hardcode the network IP found in logs for this demo.
            setUrl('http://192.168.1.122:3002');
        }
    }, []);

    if (!url) return null;

    return (
        <div className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Take IslandFund with you.
                    </h2>
                    <p className="mt-3 text-xl text-gray-300">
                        Scan the QR code to test the mobile experience on your phone.
                        <br />
                        <span className="text-sm text-gray-400">(Ensure your phone is on the same Wi-Fi)</span>
                    </p>
                    <a href={url} className="block mt-4 text-teal-400 hover:underline">{url}</a>
                </div>
                <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG value={url} size={150} />
                </div>
            </div>
        </div>
    );
}
