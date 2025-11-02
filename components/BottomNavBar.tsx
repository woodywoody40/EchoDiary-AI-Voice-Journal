
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
            className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
            {icon}
            <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
        </button>
    );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView }) => {
    return (
        <nav 
            className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border-color z-20 flex justify-around items-center shadow-md"
            style={{ 
                height: 'calc(4rem + env(safe-area-inset-bottom))',
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}
        >
            <NavItem view="conversation" currentView={currentView} onClick={setCurrentView} icon={<ConversationIcon />} label="對話" />
            <NavItem view="journal" currentView={currentView} onClick={setCurrentView} icon={<JournalIcon />} label="日記" />
            <NavItem view="dashboard" currentView={currentView} onClick={setCurrentView} icon={<DashboardIcon />} label="儀表板" />
        </nav>
    );
};