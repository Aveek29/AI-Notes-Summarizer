import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FileText,
  Link as LinkIcon,
  Youtube,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
  Bookmark,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Send,
} from 'lucide-react';
import { GroqService } from '../services/groq';
import { copyToClipboard } from '../utils';

const MAX_CHARS = 25000;

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchYouTubeMetadata(videoId) {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const resp = await fetch(oembedUrl);
  if (!resp.ok) throw new Error('Could not fetch video metadata');
  return resp.json();
}

function cleanScrapedText(text) {
  return text
    .replace(/^Title:.*$/m, '')
    .replace(/^URL Source:.*$/m, '')
    .replace(/^Markdown Content:.*$/m, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(Skip navigation|Search|Sign in|Share|Save|Play|Pause|Mute|Unmute|Settings|Watch later|Add to|Queue|Back to|Show more|Show less)/gi, '')
    .replace(/#+\s/g, '')
    .replace(/\|/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPageContent(url) {
  try {
    const resp = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(15000),
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
    });
    if (resp.ok) {
      const text = await resp.text();
      const clean = cleanScrapedText(text);
      if (clean.length >= 100) return clean.substring(0, MAX_CHARS);
    }
  } catch { /* fall through */ }

  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
  ];
  for (const proxyUrl of proxies) {
    try {
      const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      if (!resp.ok) continue;
      const data = await resp.json();
      const contents = data.contents || data.text || (typeof data === 'string' ? data : '');
      const div = document.createElement('div');
      div.innerHTML = contents;
      const text = (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
      if (text.length >= 100) return text.substring(0, MAX_CHARS);
    } catch { continue; }
  }
  throw new Error('Could not fetch page content. Use the Direct Paste tab to paste the article text manually.');
}

export default function Summarizer({ notes, onSaveNotes, selectedModel }) {
  const [activeSource, setActiveSource] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [ytInput, setYtInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const [copied, setCopied] = useState(false);
  const savedTimeoutRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    return () => clearTimeout(savedTimeoutRef.current);
  }, []);

  const handleSummarize = async () => {
    setError('');
    setResults(null);
    setSaved(false);
    setChatMessages([]);
    setChatOpen(false);

    if (activeSource === 'text' && !textInput.trim()) { setError('Please enter some text to summarize.'); return; }
    if (activeSource === 'link' && (!linkInput.trim() || !/^https?:\/\//i.test(linkInput))) { setError('Please enter a valid URL starting with http:// or https://'); return; }
    if (activeSource === 'youtube' && !ytInput.trim()) { setError('Please enter a YouTube video URL.'); return; }
    if (activeSource === 'youtube') {
      const videoId = extractVideoId(ytInput);
      if (!videoId) { setError('Could not extract a YouTube video ID from that URL.'); return; }
    }

    let rawText = '';
    setIsLoading(true);

    try {
      if (activeSource === 'link') {
        setLoadingMessage('Fetching page content...');
        rawText = await fetchPageContent(linkInput);
      } else if (activeSource === 'youtube') {
        setLoadingMessage('Fetching video info...');
        const meta = await fetchYouTubeMetadata(extractVideoId(ytInput));
        setLoadingMessage('Scraping video page for description...');
        const pageText = await fetchPageContent(ytInput).catch(() => null);
        const groq = new GroqService(undefined, selectedModel);
        if (pageText && pageText.length > 200) {
          const fullContent = `Title: ${meta.title}\nAuthor: ${meta.author_name}\n\n${pageText}`;
          setLoadingMessage('Generating notes from video content...');
          const parsedNote = await groq.summarizeNote(fullContent);
          setResults(parsedNote);
        } else {
          setLoadingMessage('Generating study guide from video topic...');
          const parsedNote = await groq.generateStudyGuide(meta.title, meta.author_name);
          setResults(parsedNote);
        }
        return;
      }

      setLoadingMessage('Generating summary...');
      const groq = new GroqService(undefined, selectedModel);
      const parsedNote = await groq.summarizeNote(
        activeSource === 'text' ? textInput.substring(0, MAX_CHARS) : rawText,
      );
      setResults(parsedNote);
    } catch (err) {
      const tips = {
        link: '\n\nTip: Try copying the text directly and using the "Direct Paste" tab instead.',
        youtube: '\n\nTip: Try pasting the video transcript directly into the "Direct Paste" tab.',
      };
      setError((err.message || 'An unexpected error occurred.') + (tips[activeSource] || ''));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCopy = () => {
    if (!results) return;
    clearTimeout(savedTimeoutRef.current);
    const text = [
      'Briefly AI Summary:',
      results.summary,
      '',
      'Key Takeaways:',
      ...results.highlights.map(h => `- ${h}`),
      '',
      'Topics Covered:',
      ...results.topics.map(t => `- ${t.name || t.topic}: ${t.description || t.meaning}`),
      '',
      'Questions & Answers:',
      ...results.questions.map((q, idx) => `Q${idx + 1}: ${q.question}\nA: ${q.answer}`),
    ].join('\n');

    copyToClipboard(text).then(() => {
      setCopied(true);
      savedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setError('Failed to copy to clipboard.');
    });
  };

  const handleSave = () => {
    if (!results || saved) return;

    let title = `Summary - ${new Date().toLocaleDateString()}`;
    if (activeSource === 'link' && linkInput) {
      try { title = new URL(linkInput).hostname; } catch { title = 'URL Summary'; }
    } else if (activeSource === 'youtube' && ytInput) {
      title = 'YouTube Summary';
    }

    const note = {
      id: Date.now(),
      title: title.substring(0, 80),
      createdAt: new Date().toISOString(),
      content: results,
    };

    onSaveNotes([...notes, note]);
    setSaved(true);
  };

  const handleExportPDF = async () => {
    if (!results) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const el = document.getElementById('printable-content');
      html2pdf().set({
        margin: 0.5,
        filename: `briefly-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      }).from(el).save();
    } catch (err) {
      setError('PDF export failed: ' + err.message);
    }
  };

  const handleChatSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !results) return;
    const question = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);
    try {
      const groq = new GroqService(undefined, selectedModel);
      const reply = await groq.chatAboutNote(results, question, 'English');
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I couldn\'t process that. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatLoading, results, selectedModel, chatInput]);

  const clearAll = () => {
    setTextInput('');
    setLinkInput('');
    setYtInput('');
    setResults(null);
    setError('');
    setCopied(false);
    setSaved(false);
    setChatOpen(false);
    setChatMessages([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-brand-500" />
            Summarizer
          </h1>
          <p className="text-slate-400 text-xs mt-1">From text, URLs, or YouTube videos</p>
        </div>
        {results && (
          <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            New Summary
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/60 border border-slate-800 rounded-xl max-w-lg">
        {[
          { id: 'text', label: 'Direct Paste', icon: FileText, short: 'Text' },
          { id: 'link', label: 'Website URL', icon: LinkIcon, short: 'URL' },
          { id: 'youtube', label: 'YouTube', icon: Youtube, short: 'YouTube' },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSource(tab.id); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeSource === tab.id
                  ? 'bg-slate-800 text-white shadow-inner border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          );
        })}
      </div>

      <div className="glass-panel rounded-2xl p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl mb-4 flex items-start gap-2 whitespace-pre-line">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSummarize(); }}>
          {activeSource === 'text' && (
            <textarea
              rows={8}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste text here..."
              className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-200 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600 resize-none"
            />
          )}

          {activeSource === 'link' && (
            <div className="space-y-4">
              <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl text-sm text-slate-200 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Uses Jina AI reader to extract article content. Falls back to CORS proxies if needed. Paste text directly if neither works.
              </p>
            </div>
          )}

          {activeSource === 'youtube' && (
            <div className="space-y-4">
              <div className="relative">
                <Youtube className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  value={ytInput}
                  onChange={(e) => setYtInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl text-sm text-slate-200 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Extracts video description and page context for study notes. For best results, paste the transcript into Direct Paste.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-xl font-medium text-xs flex items-center gap-2 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadingMessage || 'Processing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Summary
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {results && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl">
            <span className="text-xs text-slate-400">Notes generated</span>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-accent-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={handleSave} className={`px-3.5 py-2 border text-xs font-medium flex items-center gap-1.5 transition-all rounded-lg ${saved ? 'bg-accent-500/10 border-accent-500/30 text-accent-400' : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-white'}`}>
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-accent-400' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button onClick={handleExportPDF} className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {chatOpen ? 'Close AI Chat' : 'Ask AI about this summary'}
            </button>

            {chatOpen && (
              <div className="mt-4 border border-slate-800/60 rounded-xl bg-slate-950/40">
                <div className="h-48 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-slate-500 text-center pt-8">Ask a question about this summary...</p>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white rounded-tr-sm'
                          : 'bg-slate-900/60 border border-slate-800/60 text-slate-200 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                    {chatLoading && (
                        <div className="flex gap-2">
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 rounded-tl-sm flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                <form onSubmit={handleChatSubmit} className="border-t border-slate-800/60 p-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this summary..."
                    className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-brand-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          <div id="printable-content" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-8 text-slate-100 mt-6">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-display font-extrabold text-white">Briefly<span className="text-brand-500">.AI</span></h2>
                <span className="text-[10px] text-slate-500">Study Notes</span>
              </div>
              <span className="text-xs text-slate-400">{new Date().toLocaleDateString()}</span>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-400 border-l-2 border-brand-500 pl-3">Summary</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{results.summary}</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-400 border-l-2 border-accent-500 pl-3">Key Takeaways</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/20 border border-slate-800/40 p-3 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {results.topics?.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 border-l-2 border-purple-500 pl-3">Topics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.topics.map((t, i) => (
                    <div key={i} className="p-3.5 bg-slate-950/30 border border-slate-800/80 rounded-xl">
                      <strong className="text-slate-200 text-xs font-semibold block">{t.name || t.topic}</strong>
                      <span className="text-[11px] text-slate-400 mt-1 block">{t.description || t.meaning}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-400 border-l-2 border-brand-500 pl-3">Study Questions</h3>
              <div className="space-y-3">
                {results.questions.map((q, i) => (
                  <div key={i} className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-2">
                    <h4 className="text-xs font-semibold text-slate-200 flex gap-2">
                      <span className="text-brand-400">Q{i + 1}:</span>
                      {q.question}
                    </h4>
                    <p className="text-xs text-slate-400 pl-6 leading-relaxed">{q.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
