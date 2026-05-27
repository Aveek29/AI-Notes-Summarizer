import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Summarizer from './components/Summarizer';
import Chatbot from './components/Chatbot';
import SavedNotes from './components/SavedNotes';
import Settings from './components/Settings';
import ThemeSwitcher from './components/ThemeSwitcher';
import { ThemeProvider } from './context/ThemeContext';
import { GROQ_API_KEY, DEFAULT_MODEL } from './config';

const STORAGE_KEYS = {
  user: 'briefly_user',
  notes: 'briefly_notes',
  model: 'briefly_model',
  language: 'briefly_language',
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiKey] = useState(GROQ_API_KEY);
  const [notes, setNotes] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [language, setLanguage] = useState('English');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.user);
      const savedNotes = localStorage.getItem(STORAGE_KEYS.notes);
      const savedModel = localStorage.getItem(STORAGE_KEYS.model);
      const savedLanguage = localStorage.getItem(STORAGE_KEYS.language);

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedModel) setSelectedModel(savedModel);
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (e) {
      console.warn('Failed to restore session:', e);
    } finally {
      setInitialized(true);
    }
  }, []);

  const persist = (key, value) => {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  };

  const handleLogin = (data) => {
    const newUser = data.type === 'signup'
      ? {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          username: data.firstName.toLowerCase() || data.email.split('@')[0],
        }
      : { email: data.email, username: data.email.split('@')[0] };
    setUser(newUser);
    persist(STORAGE_KEYS.user, newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.user);
    setUser(null);
    setActiveTab('dashboard');
  };

  const saveNotesToStorage = (updatedNotes) => {
    setNotes(updatedNotes);
    persist(STORAGE_KEYS.notes, updatedNotes);
  };

  const saveModel = (model) => {
    setSelectedModel(model);
    persist(STORAGE_KEYS.model, model);
  };

  const saveLanguage = (lang) => {
    setLanguage(lang);
    persist(STORAGE_KEYS.language, lang);
  };

  if (!initialized) {
    return null;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col md:flex-row relative overflow-hidden bg-glow-primary">
        <div className="absolute inset-0 bg-glow-secondary pointer-events-none" />

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
          <Navbar
            user={user}
            setMobileMenuOpen={setMobileMenuOpen}
            setActiveTab={setActiveTab}
          />

          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
            {activeTab === 'dashboard' && (
              <Dashboard
                user={user}
                notes={notes}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'summarizer' && (
              <Summarizer
                notes={notes}
                onSaveNotes={saveNotesToStorage}
                setActiveTab={setActiveTab}
                selectedModel={selectedModel}
              />
            )}
            {activeTab === 'chatbot' && (
              <Chatbot
                apiKey={apiKey}
                notes={notes}
                defaultLanguage={language}
                selectedModel={selectedModel}
                onLanguageChange={saveLanguage}
              />
            )}
            {activeTab === 'saved-notes' && (
              <SavedNotes
                notes={notes}
                onSaveNotes={saveNotesToStorage}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'settings' && (
              <Settings
                user={user}
                onLogout={handleLogout}
                selectedModel={selectedModel}
                onModelChange={saveModel}
                language={language}
                onLanguageChange={saveLanguage}
              />
            )}
          </main>
        </div>
        <ThemeSwitcher />
      </div>
    </ThemeProvider>
  );
}
