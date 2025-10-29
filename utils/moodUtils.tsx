import React from 'react';
import { Mood } from '../types';

export const getMoodInfo = (mood: Mood): { icon: React.ReactNode; color: string; bgColor: string; animationClass: string; displayName: string; } => {
  switch (mood) {
    case Mood.Joyful:
      return { 
        icon: <span className="material-symbols-outlined">sentiment_very_satisfied</span>, 
        color: '#D4B483', 
        bgColor: 'bg-[#FBF6EE]',
        animationClass: 'animate-joyful-pulse',
        displayName: '快樂'
      };
    case Mood.Content:
      return { 
        icon: <span className="material-symbols-outlined">sentiment_satisfied</span>, 
        color: '#A4A792', 
        bgColor: 'bg-[#F3F4F1]',
        animationClass: 'animate-content-glow',
        displayName: '滿足'
      };
    case Mood.Neutral:
      return { 
        icon: <span className="material-symbols-outlined">sentiment_neutral</span>, 
        color: '#A9A9A9', 
        bgColor: 'bg-[#F4F4F4]',
        animationClass: 'animate-subtle-pulse',
        displayName: '平靜'
      };
    case Mood.Stressed:
      return { 
        icon: <span className="material-symbols-outlined">sentiment_stressed</span>, 
        color: '#C47A7A', 
        bgColor: 'bg-[#F8F0F0]',
        animationClass: 'animate-stressed-jitter',
        displayName: '壓力'
      };
    case Mood.Sad:
      return { 
        icon: <span className="material-symbols-outlined">sentiment_sad</span>, 
        color: '#7D9AAB', 
        bgColor: 'bg-[#F0F3F5]',
        animationClass: 'animate-sad-fade',
        displayName: '悲傷'
      };
    case Mood.Reflective:
      return { 
        icon: <span className="material-symbols-outlined">self_improvement</span>, 
        color: '#9388A2', 
        bgColor: 'bg-[#F2F1F4]',
        animationClass: 'animate-reflective-swirl',
        displayName: '反思'
      };
    default:
      return { 
        icon: <span className="material-symbols-outlined">help_outline</span>, 
        color: '#A9A9A9', 
        bgColor: 'bg-[#F4F4F4]',
        animationClass: 'animate-subtle-pulse',
        displayName: '未知'
      };
  }
};