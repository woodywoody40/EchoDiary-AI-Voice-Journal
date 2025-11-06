
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
            personalityInstruction = `你正在幫朋友整理剛才的對話，寫成一篇溫暖的日記。

請用同理心和溫柔的筆觸：
• 捕捉對話中真實的情緒和感受，不要過度美化或淡化
• 用第一人稱（我）的視角撰寫摘要，就像是朋友在訴說
• 標題要簡潔有力，反映當天的核心心情或事件
• 摘要用2-3句話，保持真誠和溫暖，避免空洞的安慰
• 關鍵事件要具體，記錄真正重要的時刻
• 標籤要實用，幫助未來回顧時快速理解

重點：用心感受，真誠記錄，不要過度詮釋。`;
            break;
        case AIPersonality.ProfessionalCoach:
            personalityInstruction = `你正在幫客戶整理剛才的對話，寫成一篇有洞察力的日記。

請用專業且平易近人的方式：
• 識別對話中的核心主題、挑戰和突破
• 用第一人稱（我）視角，就像是客戶在自我反思
• 標題要聚焦且有力，點出關鍵議題
• 摘要2-3句話，強調行動、思考和成長的面向
• 事件要具體可執行，記錄值得追蹤的進展
• 標籤要有策略性，方便未來追蹤模式和趨勢

重點：專業但不冷漠，有洞察但不說教，啟發而非評判。`;
            break;
        case AIPersonality.CuteCharacter:
            personalityInstruction = `你正在幫好朋友把聊天內容變成可愛的日記！

用活潑但真誠的方式記錄：
• 捕捉對話中的真實感受，開心、難過都要記下來
• 用第一人稱（我），就像朋友在說今天發生的事
• 標題要可愛但有意義，讓人一看就知道今天的主題
• 摘要2-3句話，簡單、溫暖、充滿活力
• 事件要有趣又具體，記錄真正酷的時刻
• 標籤要好玩且實用，方便未來回憶

重點：可愛但不幼稚，活潑但有溫度，真誠記錄每一天。`;
            break;
        default:
            personalityInstruction = "請將對話整理成真誠、有溫度的日記。用第一人稱視角，捕捉真實的情緒和重要時刻。";
            break;
    }
    return `${personalityInstruction}\n\n${historyContext}\n\n重要提醒：
• 標題要在10字內，直接點出核心
• 摘要要真誠具體，避免空泛的描述
• 心情判斷要準確，反映對話的整體基調
• 事件要具體有意義，不是流水賬
• 標籤要實用，幫助未來檢索和回顧`;
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
            return `你就當自己是個很關心朋友的人，正要開口跟他聊天。

你的開場白要非常自然、溫暖，就像平時跟好朋友講話一樣。

幾個重點：
• 一句話就好，不要囉嗦
• 語氣要輕鬆、真誠
• 可以用「嘿」、「最近好嗎？」或直接問候今天過得如何
• 如果知道他最近發生什麼事，可以很自然地帶到，例如「嘿，上次說的那個案子還順利嗎？」

總之，就像你真的在關心一個朋友。

請直接回覆那句開場白，不要加上任何引號或多餘的字。`;
        case AIPersonality.ProfessionalCoach:
            return `你是一個像朋友一樣的教練，準備開始一段輕鬆但有意義的對話。

你的開場白要友善、充滿鼓勵，但又不會太嚴肅。

幾個重點：
• 一句話就好，直接切入重點
• 語氣要積極、有活力，但要真誠
• 可以問問最近的進展，或是有沒有什麼新想法
• 像是「嘿，最近有什麼新發現嗎？」或「準備好聊聊我們上次說到的目標了嗎？」

目標是啟發對方，而不是給他壓力。

請直接回覆那句開場白，不要加上任何引號或多餘的字。`;
        case AIPersonality.CuteCharacter:
             return `你是一個超可愛的 AI 夥伴，正要跟你的好朋友聊天！

你的開場白要活潑、有朝氣，讓人聽了就開心。

幾個重點：
• 一句話就好，要超級有活力！
• 語氣要像閃亮的星星一樣，溫暖又貼心
• 可以用「哈囉！」、「今天過得怎麼樣呀？」之類的開頭
• 讓人感覺你真的很好奇、很想聽他說話

目標是成為最可愛、最療癒的聊天夥伴！

請直接回覆那句開場白，不要加上任何引號或多餘的字。`;
        default:
            return "你是友善的AI夥伴。請說一句自然、溫暖的開場白來開始對話，只說一句話即可。不要加引號。";
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

        // 根據人格選擇合適的語音
        let voiceName = 'Zephyr'; // 預設使用溫暖的聲音

        switch(personality) {
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

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: openingText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName },
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