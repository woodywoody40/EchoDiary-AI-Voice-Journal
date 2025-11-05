
import React, { useState } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSave: (key: string) => void;
    isInitialSetup: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, isInitialSetup }) => {
    const [key, setKey] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn p-4" style={{ animationDuration: '0.3s' }}>
            <div className="bg-surface rounded-3xl shadow-card border border-border-color/30 w-full max-w-md p-8 m-4 text-center scale-in">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center float-animation">
                        <span className="material-symbols-outlined text-white text-4xl">key</span>
                    </div>
                    <h2 className="text-3xl font-bold gradient-text mb-3">API 金鑰設定</h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        若要使用 EchoDiary，需要您自己的 Google AI API 金鑰。您的金鑰將安全地儲存在您的瀏覽器中，且絕不會離開您的裝置。
                    </p>
                </div>

                <div className="glass-effect p-4 rounded-xl mb-6">
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
                        在此處取得您的 API 金鑰
                    </a>
                </div>

                <div className="mb-6 text-left">
                    <label className="block text-sm font-semibold text-text-primary mb-2">API 金鑰</label>
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="貼上您的 API 金鑰"
                        className="w-full px-4 py-3 border-2 border-border-color rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && key.trim()) {
                                handleSave();
                            }
                        }}
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={!key.trim()}
                    className="w-full bg-gradient-primary text-white font-bold py-3.5 px-5 rounded-xl hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 btn-ripple micro-bounce"
                >
                    {isInitialSetup ? '儲存並開始' : '儲存金鑰'}
                </button>

                {!isInitialSetup && (
                    <p className="text-xs text-text-secondary mt-4">按 Enter 鍵快速儲存</p>
                )}
            </div>
        </div>
    );
};
