import React from 'react';
import { AIPersonality, Mood } from '../types';
import { getMoodInfo } from '../utils/moodUtils';

interface AvatarProps {
  personality: AIPersonality;
  mood: Mood;
  isRecording: boolean;
  size?: 'small' | 'large';
}

const AvatarShape: React.FC<Omit<AvatarProps, 'mood'>> = ({ personality, isRecording, size }) => {
    const sizeClass = size === 'small' ? 'w-12 h-12' : 'w-24 h-24';

    switch (personality) {
        case AIPersonality.WarmHealer:
            return (
                <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#E3D9C6] to-[#D4B483] transition-all`}>
                    <div className="w-full h-full rounded-full bg-white/30 backdrop-blur-sm"></div>
                </div>
            );
        case AIPersonality.ProfessionalCoach:
            return (
                <div className={`${sizeClass} bg-gradient-to-br from-[#A9C4D2] to-[#7D9AAB] transition-all`} style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
                </div>
            );
        case AIPersonality.CuteCharacter:
            return (
                <div className={`${sizeClass} rounded-lg bg-gradient-to-br from-[#C8CCC0] to-[#A4A792] relative flex items-center justify-center transition-all`}>
                    <div className="w-3/5 h-1 bg-gray-600 rounded-full"></div>
                    <div className="absolute w-1/4 h-1/4 bg-white rounded-full -top-1 -right-1 border-2 border-[#C8CCC0]"></div>
                </div>
            );
        default:
            return <div className={`${sizeClass} rounded-full bg-gray-400`}></div>;
    }
};

export const Avatar: React.FC<AvatarProps> = ({ personality, mood, isRecording, size = 'large' }) => {
    const { animationClass, color } = getMoodInfo(mood);
    const animationStyle = isRecording ? { animationPlayState: 'running' } : { animationPlayState: 'paused' };
    const sizeClasses = size === 'small' ? { container: 'w-12 h-12', ring: 'w-16 h-16' } : { container: 'w-24 h-24', ring: 'w-32 h-32' };

    return (
        <div 
          className={`relative flex items-center justify-center transition-all duration-500 ${animationClass} ${sizeClasses.container}`}
          style={{...animationStyle, '--mood-color': color} as React.CSSProperties}
        >
            {isRecording && (
                <div 
                    className={`absolute animate-breathing-ring rounded-full border-4 opacity-70`}
                    style={{ 
                        borderColor: 'rgba(196, 122, 122, 0.5)', 
                        width: '125%', 
                        height: '125%',
                    }}
                />
            )}
          <AvatarShape personality={personality} isRecording={isRecording} size={size} />
        </div>
    );
};