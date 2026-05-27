# Briefly AI

A browser-based study tool that summarizes text, URLs, and YouTube videos using the Groq API. Built with React + Vite + Tailwind.

## Features

- **Summarize** — Paste text, enter a URL, or drop a YouTube link for structured study notes (summary, highlights, topics, Q&A)
- **Inline Chat** — Ask follow-up questions about any generated summary
- **Global Chat** — Conversational study assistant with multi-language support
- **Saved Notes** — Persist notes in localStorage; copy, search, export to PDF
- **No Signup** — Mock auth, data stays in your browser

## Getting Started

```bash
# 1. Clone and install
git clone <repo>
cd briefly-ai-summarizer
npm install

# 2. Add your Groq API key
cp .env.example .env
# Edit .env and set VITE_GROQ_API_KEY=your_key

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 18 — UI
- Vite 5 — Dev/build
- Tailwind 3 — Styling
- Groq API — AI inference (llama-3.3-70b)
- Jina AI Reader — URL content extraction
- html2pdf.js — PDF export
- localStorage — Client-side persistence

## License

MIT
