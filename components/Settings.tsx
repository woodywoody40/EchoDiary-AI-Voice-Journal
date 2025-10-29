import React from 'react';
import { AIPersonality, Mood } from '../types';
import { Avatar } from './Avatar';
import { translatePersonality, personalityDetails } from '../utils/localization';


interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentPersonality: AIPersonality;
    setPersonality: (personality: AIPersonality) => void;
    onManageApiKey: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, currentPersonality, setPersonality, onManageApiKey }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-card w-full max-w-md p-6 m-4 flex flex-col divide-y divide-border-color" onClick={e => e.stopPropagation()}>
                <div className="pb-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-text-primary">設定</h2>
                        <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-gray-100">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary">AI 人格</h3>
                        <p className="text-sm text-text-secondary">選擇 EchoDiary 與您互動的方式。</p>
                        <div className="space-y-3 pt-2">
                            {Object.values(AIPersonality).map(p => (
                                <div 
                                    key={p} 
                                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${currentPersonality === p ? 'border-primary ring-2 ring-primary/50 bg-primary-light' : 'border-border-color hover:border-primary/50'}`}
                                    onClick={() => setPersonality(p)}
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar personality={p} mood={Mood.Neutral} isRecording={false} size="small" />
                                        <div>
                                            <h4 className="font-bold text-text-primary">{translatePersonality(p)}</h4>
                                            <p className="text-sm text-text-secondary">{personalityDetails[p].description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="pt-6">
                     <h3 className="text-lg font-semibold text-text-primary">API 金鑰</h3>
                     <p className="text-sm text-text-secondary mt-2 mb-4">您的 Google AI API 金鑰已安全儲存在您的瀏覽器中。</p>
                     <button 
                        onClick={onManageApiKey}
                        className="w-full text-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors duration-200"
                    >
                        管理 API 金鑰
                    </button>
                </div>
            </div>
        </div>
    );
};