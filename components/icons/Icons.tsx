import React from 'react';

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <span className={`material-symbols-outlined ${className || ''}`}>mic</span>
);

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <span
        className={`material-symbols-outlined ${className || ''}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
    >
        stop
    </span>
);

export const LoadingSpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className || 'h-5 w-5'} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const ConversationIcon: React.FC = () => <span className="material-symbols-outlined">record_voice_over</span>;
export const JournalIcon: React.FC = () => <span className="material-symbols-outlined">book</span>;
export const DashboardIcon: React.FC = () => <span className="material-symbols-outlined">monitoring</span>;
export const SettingsIcon: React.FC = () => <span className="material-symbols-outlined">settings</span>;
export const InstallIcon: React.FC = () => <span className="material-symbols-outlined">download</span>;
