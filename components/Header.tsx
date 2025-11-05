import React from 'react';
import { SettingsIcon } from './icons/Icons';

interface HeaderProps {
    onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
    return (
        <header
            className="glass-effect sticky top-0 z-20 border-b border-border-color/50 slide-in-down shadow-sm"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
            <nav className="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 group">
                    <div className="micro-rotate">
                        <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform">
                            <path d="M5 4H23C23.5523 4 24 4.44772 24 5V19C24 19.5523 23.5523 20 23 20H8L4 24V5C4 4.44772 4.44772 4 5 4Z" fill="url(#paint0_linear_logo)"/>
                            <path d="M9 12C10.5 10 13.5 10 15 12C16.5 14 19.5 14 21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <defs>
                                <linearGradient id="paint0_linear_logo" x1="4" y1="14" x2="24" y2="14" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#A4A792"/>
                                    <stop offset="1" stopColor="#7D9AAB"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div>
                        <span className="font-bold text-2xl gradient-text">EchoDiary</span>
                        <p className="text-[10px] text-text-secondary -mt-1">AI 語音日記</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={onSettingsClick}
                        className="p-3 rounded-xl hover:bg-primary/10 text-text-secondary hover:text-primary transition-all duration-300 micro-bounce focus-ring"
                        aria-label="設定"
                    >
                        <SettingsIcon />
                    </button>
                </div>
            </nav>
        </header>
    );
};