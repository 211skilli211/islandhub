import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                <div className="flex justify-center space-x-6 md:order-2">
                    <Link href="/about" className="text-slate-400 hover:text-slate-500">
                        About
                    </Link>
                    <Link href="/how-it-works" className="text-slate-400 hover:text-slate-500">
                        How It Works
                    </Link>
                    <Link href="/faq" className="text-slate-400 hover:text-slate-500">
                        FAQ
                    </Link>
                    <Link href="/pricing" className="text-slate-400 hover:text-slate-500">
                        Pricing
                    </Link>
                    <Link href="/contact" className="text-slate-400 hover:text-slate-500">
                        Contact
                    </Link>
                    <Link href="/privacy" className="text-slate-400 hover:text-slate-500">
                        Privacy
                    </Link>
                    <Link href="/terms" className="text-slate-400 hover:text-slate-500">
                        Terms
                    </Link>
                </div>
                <div className="mt-8 md:mt-0 md:order-1">
                    <p className="text-center text-base text-slate-400">
                        &copy; {new Date().getFullYear()} IslandHub. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
