import React from 'react';
import { SettingsIcon } from './icons/Icons';

interface HeaderProps {
    onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
    return (
        <header className="bg-surface/80 backdrop-blur-lg shadow-subtle sticky top-0 z-20 border-b border-border-color">
            <nav className="container mx-auto px-4 sm:px-6 md:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4H23C23.5523 4 24 4.44772 24 5V19C24 19.5523 23.5523 20 23 20H8L4 24V5C4 4.44772 4.44772 4 5 4Z" fill="url(#paint0_linear_logo)"/>
                        <path d="M9 12C10.5 10 13.5 10 15 12C16.5 14 19.5 14 21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <defs>
                            <linearGradient id="paint0_linear_logo" x1="4" y1="14" x2="24" y2="14" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#A4A792"/>
                                <stop offset="1" stopColor="#7D9AAB"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="font-bold text-xl text-text-primary">EchoDiary</span>
                </div>
                <div className="flex items-center">
                    <button onClick={onSettingsClick} className="p-2 rounded-full hover:bg-gray-100 text-text-secondary transition-colors">
                        <SettingsIcon />
                    </button>
                </div>
            </nav>
        </header>
    );
};