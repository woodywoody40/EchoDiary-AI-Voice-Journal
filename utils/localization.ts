import { AIPersonality } from '../types';

export const translatePersonality = (personality: AIPersonality): string => {
    switch (personality) {
        case AIPersonality.WarmHealer:
            return '溫暖療癒型';
        case AIPersonality.ProfessionalCoach:
            return '專業教練型';
        case AIPersonality.CuteCharacter:
            return '可愛角色型';
        default:
            return personality;
    }
}

export const personalityDetails = {
    [AIPersonality.WarmHealer]: {
        description: "像朋友一樣，溫柔地傾聽並以溫暖和同理心回應。",
    },
    [AIPersonality.ProfessionalCoach]: {
        description: "以結構化、教練式的方法引導您的思緒，幫助您反思。",
    },
    [AIPersonality.CuteCharacter]: {
        description: "像一個有趣的可愛角色或虛擬寵物一樣互動。",
    }
};
