
import React, { useState, useCallback, useEffect } from 'react';
import { ConversationView } from './components/ConversationView';
import { JournalView } from './components/JournalView';
import { DashboardView } from './components/DashboardView';
import { AIPersonality, JournalEntry, View } from './types';
import { Header } from './components/Header';
import { Settings } from './components/Settings';
import { BottomNavBar } from './components/BottomNavBar';
import { ApiKeyModal } from './components/ApiKeyModal';

const App: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentView, setCurrentView] = useState<View>('conversation');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>(AIPersonality.WarmHealer);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
    }
  }, [apiKey]);

  const handleSaveApiKey = (key: string) => {
    if (key.trim()) {
      setApiKey(key.trim());
      localStorage.setItem('gemini-api-key', key.trim());
      setIsApiKeyModalOpen(false);
    }
  };

  const addJournalEntry = useCallback((entry: JournalEntry) => {
    setJournalEntries(prevEntries => [entry, ...prevEntries]);
    setCurrentView('journal');
  }, []);

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'conversation':
        return <ConversationView addJournalEntry={addJournalEntry} aiPersonality={aiPersonality} journalHistory={journalEntries} apiKey={apiKey} />;
      case 'journal':
        return <JournalView entries={journalEntries} selectedEntry={selectedEntry} onSelectEntry={handleSelectEntry} onBack={handleBackToList} />;
      case 'dashboard':
        return <DashboardView entries={journalEntries} />;
      default:
        return <ConversationView addJournalEntry={addJournalEntry} aiPersonality={aiPersonality} journalHistory={journalEntries} apiKey={apiKey} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <Header 
        onSettingsClick={() => setIsSettingsOpen(true)} 
      />
      <main 
        className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 pb-24"
        style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
      >
        <div key={currentView} className="animate-fadeIn h-full">
          {renderView()}
        </div>
      </main>
      <BottomNavBar 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentPersonality={aiPersonality}
        setPersonality={setAiPersonality}
        onManageApiKey={() => setIsApiKeyModalOpen(true)}
      />
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onSave={handleSaveApiKey}
        isInitialSetup={!apiKey}
      />
    </div>
  );
};

export default App;