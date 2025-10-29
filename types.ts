
export enum Mood {
  Joyful = 'Joyful',
  Content = 'Content',
  Neutral = 'Neutral',
  Stressed = 'Stressed',
  Sad = 'Sad',
  Reflective = 'Reflective'
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  summary: string;
  mood: Mood;
  tags: string[];
  events: string[];
  fullTranscription: string;
}

export enum AIPersonality {
  WarmHealer = 'Warm & Healing',
  ProfessionalCoach = 'Professional Coach',
  CuteCharacter = 'Cute Character'
}

export type View = 'conversation' | 'journal' | 'dashboard';
