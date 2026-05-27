import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Send, Globe, MessageSquare, Trash2 } from 'lucide-react';
import { GroqService } from '../services/groq';

const LANGUAGES = ['English', 'Spanish', 'Hindi', 'French', 'German', 'Italian', 'Mandarin', 'Arabic', 'Portuguese', 'Japanese'];

const GREETINGS = {
  English: "Hi! I'm here to help with your studies. What would you like to explore today?",
  Spanish: '¡Hola! Estoy aquí para ayudarte con tus estudios. ¿Qué te gustaría explorar hoy?',
  Hindi: 'नमस्ते! मैं आपकी पढ़ाई में मदद करने के लिए यहाँ हूँ। आज आप क्या जानना चाहेंगे?',
  French: 'Bonjour ! Je suis là pour vous aider dans vos études. Que voulez-vous explorer aujourd\'hui ?',
  German: 'Hallo! Ich bin hier, um dir bei deinem Studium zu helfen. Was möchtest du heute erkunden?',
  Italian: 'Ciao! Sono qui per aiutarti con i tuoi studi. Cosa vorresti esplorare oggi?',
  Mandarin: '你好！我来帮你学习。今天想探索什么？',
  Arabic: 'مرحباً! أنا هنا لمساعدتك في دراستك. ماذا تريد أن تستكشف اليوم؟',
  Portuguese: 'Olá! Estou aqui para ajudar nos seus estudos. O que gostaria de explorar hoje?',
  Japanese: 'こんにちは！勉強のお手伝いをします。今日は何を探求したいですか？',
};

const BOT_AVATAR = <Sparkles className="w-3.5 h-3.5" />;

function createInitialMessage(language) {
  return GREETINGS[language] || GREETINGS.English;
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mr-auto">
      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-brand-500/10 border border-brand-500/20 text-brand-400">
        {BOT_AVATAR}
      </div>
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function Chatbot({ apiKey, notes, defaultLanguage = 'English', selectedModel, onLanguageChange }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: createInitialMessage(defaultLanguage), timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState('');
  const inputTextRef = useRef('');
  const messagesRef = useRef(messages);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [error, setError] = useState('');

  useEffect(() => {
    inputTextRef.current = inputText;
    messagesRef.current = messages;
  });

  const chatEndRef = useRef(null);

  const groq = useMemo(() => new GroqService(apiKey, selectedModel), [apiKey, selectedModel]);

  const notesContext = useMemo(() => {
    if (!notes?.length) return null;
    return notes
      .slice(-5)
      .map(n => `Title: ${n.title}\nSummary: ${n.content?.summary || ''}`)
      .join('\n\n');
  }, [notes]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    setSelectedLanguage(defaultLanguage);
  }, [defaultLanguage]);

  const handleLanguageChange = useCallback((e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    onLanguageChange?.(lang);
  }, [onLanguageChange]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    const text = inputTextRef.current;
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      text,
      timestamp: new Date(),
    }]);
    setInputText('');
    setIsLoading(true);
    setError('');

    try {
      const history = messagesRef.current.slice(-10);
      const aiReply = await groq.sendMessage(history, text, selectedLanguage, notesContext);

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        text: aiReply,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, groq, selectedLanguage, notesContext]);

  const clearChat = useCallback(() => {
    setMessages([
      { id: Date.now(), role: 'assistant', text: createInitialMessage(selectedLanguage), timestamp: new Date() },
    ]);
    setError('');
  }, [selectedLanguage]);

  const hasContext = !!notesContext;
  const msgCount = messages.length;

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl shrink-0">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            Chat
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {msgCount > 1 ? `${msgCount - 1} messages · ` : ''}
            {selectedLanguage}
            {hasContext ? ' · notes loaded' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-500" />
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-500 cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-500 hover:text-slate-300 border border-slate-800 rounded-lg hover:bg-slate-800/50 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl p-4 flex flex-col min-h-0 relative">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-start gap-2">
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${isUser ? 'bg-slate-800 text-slate-300' : 'bg-brand-500/10 border border-brand-500/20 text-brand-400'}`}>
                  {isUser ? 'U' : BOT_AVATAR}
                </div>
                <div className="space-y-1">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isUser ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-slate-900/40 border border-slate-800/80 text-slate-200 rounded-tl-sm'}`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                  <span className={`text-[9px] text-slate-500 block ${isUser ? 'text-right pr-1' : 'pl-1'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          {isLoading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 border-t border-slate-800/85 pt-4 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
