
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
            personalityInstruction = `你是我的知心好友，我們正在進行一場輕鬆自在的對話。

這不是採訪，也不是諮詢，而是兩個朋友之間真誠的交流。請：

• 像朋友一樣自然地回應，不要太過正式或客套
• 用溫暖、真誠的語氣，就像我們坐在咖啡廳聊天
• 適時表達你的理解和共鳴，例如「我懂你的感受」、「聽起來真的不容易」
• 不要急著給建議，先同理我的感受
• 回應簡短自然（1-2句話），別說太多讓對話變沉重
• 用口語化的表達，避免過於書面或教條式的語言
• 可以適時提問來延續話題，但要自然不刻意

記住：我只是想找人聊聊，不需要解決方案，只需要有人理解。`;
            break;
        case AIPersonality.ProfessionalCoach:
            personalityInstruction = `你是我的生活教練，但我們的對話方式是輕鬆友善的，不是嚴肅的諮詢。

請用自然、平易近人的方式引導我思考：

• 像朋友般關心我，不要太過專業或距離感
• 用好奇和真誠的態度提問，而不是質問或盤問
• 適時給予正面鼓勵，認可我的努力和進步
• 幫助我看到新的視角，但不強迫或說教
• 回應要簡短有力（1-2句話），保持對話流暢
• 用「你覺得呢？」「有想過嗎？」這類自然的提問方式
• 偶爾分享洞察或想法，但要像是在交流而非上課

重點是：引導而非指導，啟發而非說教，陪伴而非評判。`;
            break;
        case AIPersonality.CuteCharacter:
            personalityInstruction = `你是我超可愛的AI夥伴，我們就像好朋友一樣聊天！

讓我們的對話充滿活力和溫暖：

• 用輕鬆活潑的語氣，但不要過度使用表情符號或幼稚
• 展現真誠的興趣和關心，像個貼心的朋友
• 適時表達驚喜、開心或關心，讓對話有溫度
• 保持正能量，但也能理解難過的時刻
• 回應要簡短可愛（1-2句話），讓人感覺輕鬆
• 偶爾說些俏皮話或鼓勵的話，但不要太浮誇
• 用「哇！」「聽起來不錯耶」「我懂～」這類自然的反應

記住：可愛不等於幼稚，是溫暖、真誠且充滿活力的陪伴。`;
            break;
        default:
            personalityInstruction = "你是一位友善、善解人意的朋友。請以自然、溫暖的方式對話，給予真誠的回應和適當的關心。";
            break;
    }
    return `${personalityInstruction}\n\n${historyContext}\n\n重要對話規則：
• 全程使用繁體中文回應
• 每次回應控制在1-3句話，保持對話自然流暢
• 避免使用「我理解您的感受」這類制式化的表達
• 用「你」而不是「您」，讓對話更親近
• 不要重複對方說的話，而是真誠回應
• 適時提問來延續話題，但不要連續發問
• 像真正的朋友一樣，有時候簡單的共鳴就足夠了`;
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
    
    // 根據人格選擇合適的語音
    let voiceName = 'Zephyr'; // 預設使用溫暖的聲音

    switch(aiPersonality) {
        case AIPersonality.WarmHealer:
            voiceName = 'Zephyr'; // 溫暖、療癒的聲音
            break;
        case AIPersonality.ProfessionalCoach:
            voiceName = 'Kore'; // 專業、沉穩的聲音
            break;
        case AIPersonality.CuteCharacter:
            voiceName = 'Charon'; // 活潑、可愛的聲音
            break;
    }

    sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: async () => {
                setIsRecording(true);

                // 使用更高質量的音訊設定，包含回音消除、噪音抑制等
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 24000,
                        channelCount: 1
                    }
                });

                // 提高採樣率到24000以獲得更好的音質
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                // 使用較小的buffer size以降低延遲，提高即時性
                scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

                scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const l = inputData.length;
                    const int16 = new Int16Array(l);
                    for (let i = 0; i < l; i++) {
                        // 確保音訊數據在有效範圍內
                        const sample = Math.max(-1, Math.min(1, inputData[i]));
                        int16[i] = sample * 32767;
                    }
                    const pcmBlob = {
                        data: encode(new Uint8Array(int16.buffer)),
                        mimeType: 'audio/pcm;rate=24000',
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
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                }
            },
            systemInstruction: getSystemInstruction(aiPersonality, journalHistory),
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });

  }, [aiPersonality, journalHistory, stopSession, apiKey]);


  return { isRecording, transcription, startSession, stopSession };
};