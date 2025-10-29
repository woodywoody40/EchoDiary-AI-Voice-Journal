
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { AIPersonality, JournalEntry, Mood } from '../types';

const formatJournalHistory = (history: JournalEntry[]): string => {
    if (history.length === 0) return "使用者沒有過去的日記條目。";
    
    const recentHistory = history.slice(0, 3).map(entry => 
        `- 日期 ${entry.date}, 使用者感覺 '${entry.mood}' 並討論了: "${entry.title}".`
    ).join('\n');

    return `作為參考，這是使用者最近的幾篇日記摘要：\n${recentHistory}\n請利用這些資訊建立一個更有洞察力的摘要，並在適當時與過去的主題建立關聯。`;
}


const getSummarizationSystemInstruction = (personality: AIPersonality, history: JournalEntry[]): string => {
    const historyContext = formatJournalHistory(history);
    let personalityInstruction = '';

    switch(personality) {
        case AIPersonality.WarmHealer:
            personalityInstruction = "你是一位體貼的日記助理。你的使用者剛完成一次語音日記。你的任務是分析提供的逐字稿，並將其整理成一篇反思性的日記。請辨識核心情緒、以同理心總結重點、提取重要事件，並建立相關標籤。語氣應溫和且充滿理解。";
            break;
        case AIPersonality.ProfessionalCoach:
            personalityInstruction = "你是一位有洞察力的日記分析師。你的客戶剛完成一次語音記錄。請分析逐字稿以建立一篇結構化的日記。確定主要情緒、提供專注於挑戰與突破的簡潔摘要、列出可執行的事件或主題，並生成用於追蹤進度的標籤。語氣應客觀且鼓舞人心。";
            break;
        case AIPersonality.CuteCharacter:
            personalityInstruction = "你是一個快樂的小機器人，幫助大家寫日記！你的朋友剛告訴你他的一天。閱讀聊天內容，創作一頁超可愛的日記。弄清楚他們是開心還是難過，寫一個簡短有趣的摘要，列出發生的酷事，並製作一些有趣的標籤。要簡單又開朗喔！";
            break;
        default:
            personalityInstruction = "你是一個將對話摘要為日記條目的 AI 助理。";
            break;
    }
    return `${personalityInstruction}\n\n${historyContext}`;
}

const schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: '為日記條目取一個簡潔、引人入勝的標題，少於 15 個字。',
    },
    summary: {
      type: Type.STRING,
      description: '對話的深入摘要，捕捉主要話題和感受。長度應為 2-4 個句子。',
    },
    mood: {
      type: Type.STRING,
      enum: Object.values(Mood),
      description: '使用者在對話期間的主要心情或情緒。',
    },
    events: {
      type: Type.ARRAY,
      description: '提及的 2-5 個具體事件、約會或重要時刻的列表。',
      items: { type: Type.STRING },
    },
    tags: {
      type: Type.ARRAY,
      description: '3-5 個相關關鍵字或標籤的列表（例如："工作"、"家庭"、"反思"、"專案規劃"）。',
      items: { type: Type.STRING },
    },
  },
  required: ['title', 'summary', 'mood', 'events', 'tags'],
};

export const summarizeConversation = async (apiKey: string, transcription: string, personality: AIPersonality, history: JournalEntry[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `請分析以下對話逐字稿，並根據提供的 JSON 結構將其格式化為一篇日記。\n\n逐字稿：\n${transcription}`,
            config: {
                systemInstruction: getSummarizationSystemInstruction(personality, history),
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (!Object.values(Mood).includes(parsedData.mood)) {
            console.warn(`Received invalid mood: ${parsedData.mood}, defaulting to Neutral.`);
            parsedData.mood = Mood.Neutral;
        }

        return parsedData;

    } catch (error) {
        console.error("Error summarizing conversation:", error);
        throw new Error("無法產生日記摘要。");
    }
};

const getOpeningLineSystemInstruction = (personality: AIPersonality): string => {
    switch(personality) {
        case AIPersonality.WarmHealer:
            return "你是 EchoDiary，一位溫暖且富有同理心的朋友。你的任務是根據使用者的日記歷史（如果有的話）產生一句溫柔、個人化的問候語來開始對話。問候語應該簡短、自然，並且只有一句話。請直接回覆那句問候語，不要包含任何其他文字或引號。";
        case AIPersonality.ProfessionalCoach:
            return "你是 EchoDiary，一位專業的人生教練。你的任務是根據使用者的日記歷史（如果有的話）產生一句清晰、鼓舞人心的話來開始對話。問候語應該簡潔有力，並且只有一句話。請直接回覆那句問候語，不要包含任何其他文字或引號。";
        case AIPersonality.CuteCharacter:
             return "你是 EchoDiary，一個可愛又開朗的機器人朋友！你的任務是根據使用者的日記歷史（如果有的話）產生一句活潑又可愛的話來打招呼！問候語應該非常簡短、充滿活力，並且只有一句話。請直接回覆那句問候語，不要包含任何其他文字或引號。";
        default:
            return "你是 EchoDiary。請產生一句友善的問候來開始對話。問候語應該只有一句話。請直接回覆那句問候語，不要包含任何其他文字或引號。";
    }
};

const getOpeningLineText = async (apiKey: string, personality: AIPersonality, history: JournalEntry[]): Promise<string> => {
    const instruction = getOpeningLineSystemInstruction(personality);
    const historyContext = formatJournalHistory(history);

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `這是使用者的近期日記摘要，請參考此資訊產生一句個人化的開場問候語，讓對話感覺是連貫的。如果沒有歷史紀錄，就說一句通用問候語。\n\n日記摘要:\n${historyContext}`,
            config: {
                systemInstruction: instruction,
            },
        });
        let text = response.text.trim();
        // The model might still wrap the output in quotes, so we remove them.
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('「') && text.endsWith('」'))) {
            text = text.substring(1, text.length - 1);
        }
        return text;
    } catch(error) {
        console.error("Error getting opening line text:", error);
        throw new Error("無法產生問候語文字。");
    }
};


export const getOpeningLineAudio = async (apiKey: string, personality: AIPersonality, history: JournalEntry[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const openingText = await getOpeningLineText(apiKey, personality, history);
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: openingText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' }, // A gentle, universal voice
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("無法產生開場語音：未收到音訊資料。");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error getting opening line audio:", error);
        if (error instanceof Error && (error.message.startsWith("無法產生"))) {
            throw error;
        }
        throw new Error("無法產生開場語音。");
    }
};