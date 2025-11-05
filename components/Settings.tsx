import React from 'react';
import { AIPersonality, Mood } from '../types';
import { Avatar } from './Avatar';
import { translatePersonality, personalityDetails } from '../utils/localization';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { InstallIcon } from './icons/Icons';


interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentPersonality: AIPersonality;
    setPersonality: (personality: AIPersonality) => void;
    onManageApiKey: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, currentPersonality, setPersonality, onManageApiKey }) => {
    const { isInstallable, triggerInstall } = useInstallPrompt();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn p-4" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="bg-surface rounded-3xl shadow-card border border-border-color/30 w-full max-w-lg p-8 flex flex-col divide-y divide-border-color/30 max-h-[90vh] overflow-y-auto scale-in" onClick={e => e.stopPropagation()}>
                <div className="pb-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">設定</h2>
                            <p className="text-sm text-text-secondary mt-1">自訂您的 EchoDiary 體驗</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-text-secondary hover:text-text-primary p-2 rounded-xl hover:bg-gray-100 transition-all micro-bounce"
                            aria-label="關閉"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary">psychology</span>
                            <h3 className="text-xl font-bold text-text-primary">AI 人格</h3>
                        </div>
                        <p className="text-sm text-text-secondary mb-4">選擇 EchoDiary 與您互動的方式。</p>
                        <div className="space-y-3">
                            {Object.values(AIPersonality).map(p => (
                                <div
                                    key={p}
                                    className={`p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 card-hover-lift ${currentPersonality === p ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border-color/50 hover:border-primary/40 hover:bg-primary/5'}`}
                                    onClick={() => setPersonality(p)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`transition-transform duration-300 ${currentPersonality === p ? 'scale-110' : 'scale-100'}`}>
                                            <Avatar personality={p} mood={Mood.Neutral} isRecording={false} size="small" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-text-primary text-base mb-1">{translatePersonality(p)}</h4>
                                            <p className="text-xs text-text-secondary leading-relaxed">{personalityDetails[p].description}</p>
                                        </div>
                                        {currentPersonality === p && (
                                            <span className="material-symbols-outlined text-primary scale-in">check_circle</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="py-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">key</span>
                        <h3 className="text-xl font-bold text-text-primary">API 金鑰</h3>
                    </div>
                     <p className="text-sm text-text-secondary mb-5">您的 Google AI API 金鑰已安全儲存在您的瀏覽器中。</p>
                     <button
                        onClick={onManageApiKey}
                        className="w-full text-center bg-gradient-primary text-white font-bold py-3 px-5 rounded-xl hover:shadow-lg transition-all duration-300 btn-ripple micro-bounce"
                    >
                        管理 API 金鑰
                    </button>
                </div>

                 {isInstallable && (
                    <div className="pt-8">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary">install_desktop</span>
                            <h3 className="text-xl font-bold text-text-primary">應用程式安裝</h3>
                        </div>
                        <p className="text-sm text-text-secondary mb-5">將 EchoDiary 安裝到您的裝置上，以便快速存取和離線使用。</p>
                        <button
                            onClick={triggerInstall}
                            className="w-full flex items-center justify-center gap-3 text-center bg-accent text-white font-bold py-3 px-5 rounded-xl hover:shadow-lg transition-all duration-300 btn-ripple micro-bounce"
                        >
                            <InstallIcon />
                            <span>安裝應用程式</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
