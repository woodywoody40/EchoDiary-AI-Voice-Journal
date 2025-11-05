
import React from 'react';
import { View } from '../types';
import { ConversationIcon, JournalIcon, DashboardIcon } from './icons/Icons';

interface BottomNavBarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
    view: View;
    currentView: View;
    onClick: (view: View) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ view, currentView, onClick, label, icon }) => {
    const isActive = currentView === view;
    return (
        <button
            onClick={() => onClick(view)}
            className={`relative flex flex-col items-center justify-center gap-1.5 w-full pt-2.5 pb-2 transition-all duration-300 btn-ripple micro-bounce ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
            <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {icon}
            </div>
            <span className={`text-xs font-medium transition-all duration-300 ${isActive ? 'font-bold scale-105' : ''}`}>
                {label}
            </span>
            {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full scale-in"></div>
            )}
        </button>
    );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView }) => {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border-color/50 z-20 flex justify-around items-center shadow-lg"
            style={{
                height: 'calc(4.5rem + env(safe-area-inset-bottom))',
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}
        >
            <NavItem view="conversation" currentView={currentView} onClick={setCurrentView} icon={<ConversationIcon />} label="對話" />
            <NavItem view="journal" currentView={currentView} onClick={setCurrentView} icon={<JournalIcon />} label="日記" />
            <NavItem view="dashboard" currentView={currentView} onClick={setCurrentView} icon={<DashboardIcon />} label="儀表板" />
        </nav>
    );
};