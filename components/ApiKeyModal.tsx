
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn" style={{ animationDuration: '0.3s' }}>
            <div className="bg-surface rounded-2xl shadow-card w-full max-w-md p-6 m-4 text-center">
                <h2 className="text-2xl font-bold text-text-primary mb-2">請輸入您的 Google AI API 金鑰</h2>
                <p className="text-sm text-text-secondary mb-4">
                    若要使用 EchoDiary，需要您自己的 API 金鑰。您的金鑰將安全地儲存在您的瀏覽器中，且絕不會離開您的裝置。
                </p>
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-semibold"
                >
                    在此處取得您的 API 金鑰 &rarr;
                </a>
                <div className="my-6">
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="貼上您的 API 金鑰"
                        className="w-full px-4 py-2 border border-border-color rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
                    />
                </div>
                <button 
                    onClick={handleSave}
                    disabled={!key.trim()}
                    className="w-full bg-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isInitialSetup ? '儲存並開始' : '儲存金鑰'}
                </button>
            </div>
        </div>
    );
};
