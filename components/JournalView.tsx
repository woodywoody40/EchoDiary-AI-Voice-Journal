
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
    <div onClick={onSelect} className="bg-surface p-5 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden">
      <div className="h-1.5 w-full -ml-5 -mt-5 mb-4" style={{ background: color }}></div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{entry.title}</h3>
          <p className="text-sm text-text-secondary">{entry.date}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium py-1 px-3 rounded-full ${bgColor}`} style={{ color }}>
          {React.cloneElement(icon as React.ReactElement, {style: {fontSize: '1.2em'}})}
          <span>{displayName}</span>
        </div>
      </div>
      <p className="mt-3 text-text-secondary line-clamp-2">{entry.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {entry.tags.slice(0, 3).map(tag => (
          <span key={tag} className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
        ))}
      </div>
    </div>
  );
};

const EntryDetail: React.FC<{ entry: JournalEntry; onBack: () => void }> = ({ entry, onBack }) => {
    const { icon, color, bgColor, displayName } = getMoodInfo(entry.mood);
    return (
        <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-card">
            <button onClick={onBack} className="flex items-center gap-2 text-primary font-semibold mb-6 hover:underline">
                <span className="material-symbols-outlined">arrow_back</span>
                返回日記列表
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-text-primary">{entry.title}</h2>
                    <p className="text-md text-text-secondary mt-1">{entry.date}</p>
                </div>
                <div className={`mt-4 sm:mt-0 flex items-center gap-2 text-md font-medium py-2 px-4 rounded-full ${bgColor}`} style={{ color }}>
                    {icon}
                    <span>{displayName}</span>
                </div>
            </div>
            
            <div className="my-6 border-t border-border-color"></div>

            <div className="space-y-8">
                <div>
                    <h4 className="text-xl font-semibold text-text-primary mb-2">摘要</h4>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{entry.summary}</p>
                </div>
                <div>
                    <h4 className="text-xl font-semibold text-text-primary mb-2">關鍵事件</h4>
                    {entry.events.length > 0 ? (
                        <ul className="list-disc list-inside text-text-secondary space-y-2">
                            {entry.events.map((event, index) => <li key={index}>{event}</li>)}
                        </ul>
                    ) : <p className="text-text-secondary italic">未識別出關鍵事件。</p>}
                </div>
                <div>
                    <h4 className="text-xl font-semibold text-text-primary mb-2">標籤</h4>
                    <div className="flex flex-wrap gap-2">
                         {entry.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="text-xl font-semibold text-text-primary mb-2">完整逐字稿</h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-border-color max-h-60 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.fullTranscription}</p>
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
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-6">我的日記</h2>
      {entries.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl shadow-card flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">edit_note</span>
            <p className="text-lg text-text-secondary">您的日記是空的</p>
            <p className="mt-2 text-gray-400">開始一段對話以建立您的第一篇日記</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onSelect={() => onSelectEntry(entry)} />
          ))}
        </div>
      )}
    </div>
  );
};