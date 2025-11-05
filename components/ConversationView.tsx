import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveSession } from '../hooks/useLiveSession';
import { summarizeConversation, getOpeningLineAudio } from '../services/geminiService';
import { AIPersonality, JournalEntry, Mood } from '../types';
import { MicrophoneIcon, LoadingSpinnerIcon, StopIcon } from './icons/Icons';
import { Avatar } from './Avatar';
import { decode, decodeAudioData } from '../utils/audioUtils';


interface ConversationViewProps {
  addJournalEntry: (entry: JournalEntry) => void;
  aiPersonality: AIPersonality;
  journalHistory: JournalEntry[];
  apiKey: string | null;
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center text-text-secondary/80 p-8 empty-state slide-in-up">
        <div className="float-animation mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: '80px', color: '#D1D9E0' }}>waves</span>
        </div>
        <h2 className="text-2xl font-bold gradient-text mb-2">準備好傾聽</h2>
        <p className="text-base mb-6">按下麥克風按鈕，開始您的語音日記。</p>
        <div className="glass-effect p-4 rounded-2xl max-w-xs">
            <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>tips_and_updates</span>
                在安靜的環境中清晰地說話，效果最好！
            </p>
        </div>
    </div>
);


export const ConversationView: React.FC<ConversationViewProps> = ({ addJournalEntry, aiPersonality, journalHistory, apiKey }) => {
  const { isRecording, transcription, startSession, stopSession } = useLiveSession(aiPersonality, journalHistory, apiKey);
  const [status, setStatus] = useState<'idle' | 'initializing' | 'recording' | 'summarizing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const transcriptionContainerRef = useRef<HTMLDivElement>(null);

  const currentAiMood = useMemo(() => {
    return journalHistory[0]?.mood || Mood.Neutral;
  }, [journalHistory]);

  useEffect(() => {
    if (transcriptionContainerRef.current) {
        transcriptionContainerRef.current.scrollTop = transcriptionContainerRef.current.scrollHeight;
    }
  }, [transcription]);

  useEffect(() => {
    if (isRecording) {
      setStatus('recording');
    } else if (status === 'recording' && !isRecording) {
        setStatus('idle');
    }
  }, [isRecording, status]);

  const handleToggleConversation = async () => {
    setError(null);
    if (!apiKey) {
      setError("請先在設定中輸入您的 API 金鑰。");
      return;
    }

    if (status === 'recording') {
      setStatus('summarizing');
      try {
        const fullTranscription = await stopSession();
        if (fullTranscription && fullTranscription.trim().length > 0) {
          const summaryData = await summarizeConversation(apiKey, fullTranscription, aiPersonality, journalHistory);
          const newEntry: JournalEntry = {
            id: new Date().toISOString(),
            date: new Date().toLocaleString('zh-TW'),
            ...summaryData,
            fullTranscription,
          };
          addJournalEntry(newEntry);
        } else {
          console.log("Empty transcription, not summarizing.");
        }
      } catch (e) {
        console.error("Error during summarization:", e);
        setError((e as Error).message || "抱歉，無法建立日記。請再試一次。");
      } finally {
        setStatus('idle');
      }
    } else if (status === 'idle') {
      setStatus('initializing');
      try {
        const audioB64 = await getOpeningLineAudio(apiKey, aiPersonality, journalHistory);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(audioB64), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.onended = async () => {
          audioContext.close();
          try {
            await startSession();
          } catch(e) {
            console.error("Error starting session after greeting:", e);
            setError("無法開始對話。請檢查權限或稍後再試。");
            await stopSession();
            setStatus('idle');
          }
        };
        source.start();
        
      } catch (e) {
        console.error("Error starting session:", e);
        setError((e as Error).message || "無法開始對話。請檢查權限或稍後再試。");
        await stopSession();
        setStatus('idle');
      }
    }
  };
  
  const getButtonIcon = () => {
    switch(status) {
      case 'recording':
        return <StopIcon className="text-4xl"/>;
      case 'summarizing':
      case 'initializing':
        return <LoadingSpinnerIcon className="w-8 h-8"/>;
      case 'idle':
      default:
        return <MicrophoneIcon className="text-4xl"/>;
    }
  };

  const getButtonText = () => {
     switch(status) {
      case 'recording': return "結束對話";
      case 'summarizing': return "正在為您整理思緒...";
      case 'initializing': return "正在準備...";
      case 'idle':
      default: return apiKey ? "開始日記" : "請先設定API金鑰";
    }
  }

  const getStatusText = () => {
     switch(status) {
      case 'recording': return "我正在聆聽，請暢所欲言...";
      case 'summarizing': return "請稍候，AI 正在為您總結...";
      case 'initializing': return "AI 正在準備向您問好...";
      case 'idle':
      default: return apiKey ? "按下按鈕，開始您的語音日記。" : "請點擊右上角設定按鈕輸入您的 API 金鑰。";
    }
  }
  
  const getButtonClass = () => {
    if (!apiKey && status === 'idle') {
        return "bg-gray-400 cursor-not-allowed";
    }
    switch (status) {
      case 'recording': return "bg-danger hover:bg-danger-hover";
      case 'summarizing':
      case 'initializing':
        return "bg-gray-400 cursor-not-allowed";
      case 'idle':
      default: return "bg-primary hover:bg-primary-hover";
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
        <div ref={transcriptionContainerRef} className="flex-grow overflow-y-auto flex flex-col">
            <div className="flex flex-col items-center pt-8 px-4 text-center slide-in-down">
                 <div className={`${(isRecording || status === 'initializing') ? 'icon-pulse' : ''}`}>
                     <Avatar personality={aiPersonality} mood={currentAiMood} isRecording={isRecording || status === 'initializing'}/>
                 </div>
                 <p className="text-text-secondary mt-4 min-h-[24px] font-medium transition-all duration-300">
                    {getStatusText()}
                </p>
            </div>
            
             <div className="p-4 flex-grow flex flex-col">
                {transcription.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <ul className="space-y-5 max-w-3xl mx-auto w-full px-2">
                        {transcription.map((line, index) => {
                            const isLastMessage = index === transcription.length - 1;
                            const isUser = line.speaker === '您';
                            const inProgress = isRecording && isLastMessage;

                            return (
                                <li key={index} className={`flex items-end gap-3 slide-in-up ${isUser ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: `${index * 0.05}s` }}>
                                     <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} scale-in`}>
                                        <p className={`font-semibold text-xs mb-1.5 ${isUser ? 'text-blue-100' : 'text-primary'}`}>{line.speaker}</p>
                                        <p className={`whitespace-pre-wrap leading-relaxed text-[15px] transition-opacity duration-300 ${inProgress ? 'opacity-80' : 'opacity-100'}`}>
                                            {line.text}
                                            {inProgress && <span className="inline-block w-0.5 h-4 bg-current align-text-bottom animate-pulse ml-1"></span>}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center pt-4 pb-4 z-10 bg-gradient-to-t from-background via-background/95 to-transparent">
            {error && (
                <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl slide-in-up">
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                        {error}
                    </p>
                </div>
            )}
            <button
                onClick={handleToggleConversation}
                disabled={status === 'summarizing' || status === 'initializing' || (!apiKey && status === 'idle')}
                className={`w-24 h-24 rounded-full text-white flex items-center justify-center transition-all duration-300 shadow-card transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50 btn-ripple micro-bounce ${getButtonClass()} ${status === 'idle' && !!apiKey ? 'animate-pulse-glow' : ''} ${status === 'recording' ? 'glow' : ''}`}
                aria-label={getButtonText()}
            >
                {getButtonIcon()}
            </button>
            <p className="text-text-secondary font-semibold mt-4 h-6 transition-all duration-300">{getButtonText()}</p>
        </div>
    </div>
  );
};