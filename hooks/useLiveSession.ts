
import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { AIPersonality, JournalEntry } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';

const formatJournalHistory = (history: JournalEntry[]): string => {
    if (history.length === 0) return "使用者沒有過去的日記條目。";
    
    const recentHistory = history.slice(0, 3).map(entry => 
        `- 日期 ${entry.date}, 使用者感覺 '${entry.mood}' 並討論了: "${entry.title}".`
    ).join('\n');

    return `作為參考，這是使用者最近的幾篇日記摘要：\n${recentHistory}\n請在對話中自然地運用這些資訊來提出有見解的後續問題或注意模式，但僅在相關時才這樣做。`;
}

const getSystemInstruction = (personality: AIPersonality, history: JournalEntry[]): string => {
    const historyContext = formatJournalHistory(history);
    let personalityInstruction = '';

    switch(personality) {
        case AIPersonality.WarmHealer:
            personalityInstruction = "你是 EchoDiary，一位溫暖且富有同理心的朋友。請耐心傾聽，並以親切和理解的態度回應。你的目標是為使用者創造一個安全、療癒的空間來表達自己。請讓你的回應保持簡短和對話性。";
            break;
        case AIPersonality.ProfessionalCoach:
            personalityInstruction = "你是 EchoDiary，一位專業的人生教練。你的語氣是鼓舞人心且富有洞察力的。請提出澄清性的問題，幫助使用者獲得觀點。你的目標是引導他們進行反思，而不僅僅是傾聽。請讓你的回應專注且以行動為導向。";
            break;
        case AIPersonality.CuteCharacter:
            personalityInstruction = "你是 EchoDiary，一個可愛又開朗的機器人朋友！你的聲音充滿了活潑的能量。你充滿好奇心和支持，就像一個虛擬寵物。請使用簡單、正面的語言，並以驚奇和鼓勵的態度作出反應。回應要簡短可愛喔。";
            break;
        default:
            personalityInstruction = "你是一位友善且樂於助人的 AI 助理。";
            break;
    }
    return `${personalityInstruction}\n\n${historyContext}\n\n使用者的對話將以繁體中文進行，請你也全程使用繁體中文回應。`;
}


export const useLiveSession = (aiPersonality: AIPersonality, journalHistory: JournalEntry[], apiKey: string | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<{ speaker: '您' | 'AI'; text: string; }[]>([]);
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const fullTranscriptionRef = useRef<string>('');
  const currentInputRef = useRef<string>('');
  const currentOutputRef = useRef<string>('');

  const stopSession = useCallback(async (): Promise<string> => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (scriptProcessorRef.current && mediaStreamSourceRef.current && audioContextRef.current) {
        mediaStreamSourceRef.current.disconnect();
        scriptProcessorRef.current.disconnect();
        audioContextRef.current.close();
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        audioContextRef.current = null;
    }
    
    setIsRecording(false);
    const finalTranscription = fullTranscriptionRef.current;
    fullTranscriptionRef.current = ''; // Reset for next session
    return finalTranscription;
  }, []);


  const startSession = useCallback(async () => {
    setTranscription([]);
    fullTranscriptionRef.current = '';
    currentInputRef.current = '';
    currentOutputRef.current = '';

    if (!apiKey) {
        throw new Error("API key is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    let nextStartTime = 0;
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);
    const sources = new Set<AudioBufferSourceNode>();
    
    sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: async () => {
                setIsRecording(true);
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                
                mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

                scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const l = inputData.length;
                    const int16 = new Int16Array(l);
                    for (let i = 0; i < l; i++) {
                        int16[i] = inputData[i] * 32768;
                    }
                    const pcmBlob = {
                        data: encode(new Uint8Array(int16.buffer)),
                        mimeType: 'audio/pcm;rate=16000',
                    };

                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(audioContextRef.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputNode);
                    source.addEventListener('ended', () => { sources.delete(source); });
                    source.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                    sources.add(source);
                }

                if (message.serverContent?.interrupted) {
                    sources.forEach(source => {
                        source.stop();
                        sources.delete(source);
                    });
                    nextStartTime = 0;
                }
                
                if (message.serverContent?.inputTranscription) {
                    currentInputRef.current += message.serverContent.inputTranscription.text;
                    setTranscription(prev => {
                        const last = prev[prev.length - 1];
                        if (last && last.speaker === '您') {
                            const updatedLast = { ...last, text: currentInputRef.current };
                            return [...prev.slice(0, -1), updatedLast];
                        } else {
                            return [...prev, { speaker: '您', text: currentInputRef.current }];
                        }
                    });
                }
                 if (message.serverContent?.outputTranscription) {
                    currentOutputRef.current += message.serverContent.outputTranscription.text;
                    setTranscription(prev => {
                        const last = prev[prev.length - 1];
                        if (last && last.speaker === 'AI') {
                            const updatedLast = { ...last, text: currentOutputRef.current };
                            return [...prev.slice(0, -1), updatedLast];
                        } else {
                            return [...prev, { speaker: 'AI', text: currentOutputRef.current }];
                        }
                    });
                }

                if (message.serverContent?.turnComplete) {
                     const finalInput = currentInputRef.current.trim();
                     const finalOutput = currentOutputRef.current.trim();
                     
                     if (finalInput) {
                        fullTranscriptionRef.current += `使用者: ${finalInput}\n`;
                     }
                     if(finalOutput) {
                        fullTranscriptionRef.current += `AI: ${finalOutput}\n`;
                     }
                     currentInputRef.current = '';
                     currentOutputRef.current = '';
                }

            },
            onerror: (e: ErrorEvent) => {
                console.error("Live session error:", e);
                stopSession();
            },
            onclose: (e: CloseEvent) => {
                console.debug('Live session closed');
                outputAudioContext.close();
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: getSystemInstruction(aiPersonality, journalHistory),
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });

  }, [aiPersonality, journalHistory, stopSession, apiKey]);


  return { isRecording, transcription, startSession, stopSession };
};