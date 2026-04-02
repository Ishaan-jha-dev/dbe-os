"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Linkedin, ArrowLeft } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const isHome = pathname === "/";

    return (
        <nav className="bg-gradient-to-r from-slate-900 via-slate-800/95 to-slate-900 backdrop-blur-xl border-b border-slate-600/30 sticky top-0 z-10 shadow-xl shadow-black/30 print:hidden">
            <div className="max-w-5xl mx-auto px-8 sm:px-16 lg:px-24 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    {!isHome && (
                        <button
                            onClick={() => router.push('/')}
                            className="p-1.5 sm:p-2 hover:bg-slate-700/60 transition-all duration-200 rounded-lg group mr-1"
                            aria-label="Back"
                        >
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-white transition-colors" />
                        </button>
                    )}

                    <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group transition-all duration-300 hover:scale-[1.02]">
                        <div className="relative">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 drop-shadow-lg transition-transform duration-300 group-hover:rotate-3">
                                <defs>
                                    <linearGradient id="aceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="50%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#4f46e5" />
                                    </linearGradient>
                                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#fbbf24" />
                                        <stop offset="100%" stopColor="#f59e0b" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle cx="20" cy="20" r="18" fill="url(#aceGradient)" opacity="0.15" />
                                <path d="M20 6L8 32H13L15.5 26H24.5L27 32H32L20 6ZM17 22L20 13L23 22H17Z" fill="url(#aceGradient)" filter="url(#glow)" />
                                <path d="M30 8L31.5 11.5L35 13L31.5 14.5L30 18L28.5 14.5L25 13L28.5 11.5L30 8Z" fill="url(#starGradient)" filter="url(#glow)" />
                                <circle cx="10" cy="12" r="1.5" fill="url(#starGradient)" opacity="0.7" />
                            </svg>
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent tracking-tight">DBE OS</span>
                            <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5">EXCEL BBA-DBE EXAMS</span>
                        </div>
                    </Link>
                </div>
                <a href="https://www.linkedin.com/in/madhavgupta2002/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full transition-all duration-300 text-xs sm:text-sm font-semibold shadow-md hover:shadow-blue-500/30 hover:shadow-lg group border border-blue-400/30">
                    <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:scale-110" />
                    <span className="hidden sm:inline">Connect</span>
                </a>
            </div>
        </nav>
    );
}
