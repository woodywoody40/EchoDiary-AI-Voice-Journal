
import React from 'react';
import { JournalEntry, Mood } from '../types';
import { getMoodInfo } from '../utils/moodUtils';

interface JournalViewProps {
  entries: JournalEntry[];
  selectedEntry: JournalEntry | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onBack: () => void;
}

const EntryCard: React.FC<{ entry: JournalEntry; onSelect: () => void; }> = ({ entry, onSelect }) => {
  const { icon, color, bgColor, displayName } = getMoodInfo(entry.mood);
  return (
    <div
      onClick={onSelect}
      className="bg-surface p-6 rounded-2xl shadow-card card-hover-lift cursor-pointer overflow-hidden border border-border-color/50 hover:border-primary/30 transition-all duration-300"
    >
      <div className="h-2 w-full -ml-6 -mt-6 mb-5" style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}></div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-3">
          <h3 className="text-xl font-bold text-text-primary mb-1 line-clamp-1">{entry.title}</h3>
          <p className="text-xs text-text-secondary flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
            {entry.date}
          </p>
        </div>
        <div className={`badge ${bgColor} flex-shrink-0 shadow-sm`} style={{ color }}>
          {React.cloneElement(icon as React.ReactElement, {style: {fontSize: '16px'}})}
          <span>{displayName}</span>
        </div>
      </div>
      <p className="mt-3 text-text-secondary line-clamp-3 leading-relaxed text-sm">{entry.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {entry.tags.slice(0, 3).map(tag => (
          <span key={tag} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">{tag}</span>
        ))}
        {entry.tags.length > 3 && (
          <span className="text-xs text-text-secondary font-medium px-2 py-1.5">+{entry.tags.length - 3} more</span>
        )}
      </div>
    </div>
  );
};

const EntryDetail: React.FC<{ entry: JournalEntry; onBack: () => void }> = ({ entry, onBack }) => {
    const { icon, color, bgColor, displayName } = getMoodInfo(entry.mood);
    return (
        <div className="bg-surface p-6 sm:p-10 rounded-3xl shadow-card border border-border-color/50 slide-in-up">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-primary font-semibold mb-8 hover:gap-3 transition-all duration-300 group"
            >
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                返回日記列表
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex-1">
                    <h2 className="text-4xl font-extrabold text-text-primary mb-2">{entry.title}</h2>
                    <p className="text-sm text-text-secondary flex items-center gap-1.5">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                        {entry.date}
                    </p>
                </div>
                <div className={`badge ${bgColor} flex-shrink-0 py-2.5 px-5 text-base shadow-md`} style={{ color }}>
                    {React.cloneElement(icon as React.ReactElement, {style: {fontSize: '20px'}})}
                    <span className="font-bold">{displayName}</span>
                </div>
            </div>

            <div className="divider-gradient"></div>

            <div className="space-y-10">
                <div className="scale-in">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">description</span>
                        <h4 className="text-2xl font-bold text-text-primary">摘要</h4>
                    </div>
                    <div className="glass-effect p-5 rounded-2xl">
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-[15px]">{entry.summary}</p>
                    </div>
                </div>

                <div className="scale-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">event_note</span>
                        <h4 className="text-2xl font-bold text-text-primary">關鍵事件</h4>
                    </div>
                    {entry.events.length > 0 ? (
                        <ul className="space-y-3">
                            {entry.events.map((event, index) => (
                                <li key={index} className="flex items-start gap-3 glass-effect p-4 rounded-xl">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">{index + 1}</span>
                                    <span className="text-text-secondary leading-relaxed">{event}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="glass-effect p-5 rounded-2xl text-center">
                            <p className="text-text-secondary italic">未識別出關鍵事件。</p>
                        </div>
                    )}
                </div>

                <div className="scale-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">label</span>
                        <h4 className="text-2xl font-bold text-text-primary">標籤</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                         {entry.tags.map(tag => (
                            <span key={tag} className="bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors">{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="scale-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">transcribe</span>
                        <h4 className="text-2xl font-bold text-text-primary">完整逐字稿</h4>
                    </div>
                    <div className="glass-effect p-5 rounded-2xl max-h-80 overflow-y-auto border border-border-color/30">
                        <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{entry.fullTranscription}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const JournalView: React.FC<JournalViewProps> = ({ entries, selectedEntry, onSelectEntry, onBack }) => {
  if (selectedEntry) {
    return <EntryDetail entry={selectedEntry} onBack={onBack} />;
  }

  return (
    <div className="slide-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold gradient-text">我的日記</h2>
          <p className="text-sm text-text-secondary mt-1">{entries.length} 篇日記</p>
        </div>
        {entries.length > 0 && (
          <div className="glass-effect px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-primary">book</span>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-24 bg-surface rounded-3xl shadow-card border border-border-color/30 flex flex-col items-center slide-in-up">
            <div className="float-animation mb-6">
                <span className="material-symbols-outlined empty-state-icon" style={{ fontSize: '100px', color: '#D1D9E0' }}>edit_note</span>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">您的日記是空的</h3>
            <p className="text-text-secondary mb-8 max-w-sm">開始一段對話，讓AI幫您記錄生活的點點滴滴</p>
            <div className="glass-effect px-5 py-3 rounded-xl">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>chat</span>
                    前往「對話」頁面開始您的第一篇日記
                </p>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry, index) => (
            <div key={entry.id} className="scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <EntryCard entry={entry} onSelect={() => onSelectEntry(entry)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};