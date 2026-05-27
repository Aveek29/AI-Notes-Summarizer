import { GROQ_API_KEY, DEFAULT_MODEL } from '../config';

export class GroqService {
  constructor(apiKey = GROQ_API_KEY, model = DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async makeRequest(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('Please add your Groq API key in Settings to use this feature.');
    }

    const { temperature = 0.3, maxTokens = 4000, timeoutMs = 30000 } = options;

    const attempt = async (retriesLeft) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.status === 429 && retriesLeft > 0) {
          await new Promise(r => setTimeout(r, 2000));
          return attempt(retriesLeft - 1);
        }

        if (!response.ok) {
          const errorDetails = await response.json().catch(() => ({}));
          const msg = errorDetails.error?.message || `API request failed (${response.status})`;

          if (response.status === 401) {
            throw new Error('Invalid API key.');
          }
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait and try again.');
          }

          throw new Error(msg);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        if (retriesLeft > 0 && (error.name === 'TypeError' || error.message?.includes('Failed to fetch'))) {
          await new Promise(r => setTimeout(r, 1500));
          return attempt(retriesLeft - 1);
        }
        throw error;
      }
    };

    return attempt(1);
  }

  async summarizeNote(rawContent) {
    const trimmed = rawContent.substring(0, 25000);

    const prompt = `You are a study note generator. Analyze the content below and return ONLY valid JSON with exactly these fields:
"summary": "3-4 sentence overview",
"highlights": ["5-8 key bullet points"],
"topics": [{"name": "term", "description": "explanation"}],
"questions": [{"question": "...", "answer": "..."}]

Content to analyze:
${trimmed}

Return ONLY the JSON object, no markdown, no code fences, no extra text before or after.`;

    const rawResult = await this.makeRequest(
      [{ role: 'user', content: prompt }],
      { temperature: 0.5, maxTokens: 8192, timeoutMs: 60000 },
    );

    return this._parseJSON(rawResult);
  }

  async generateStudyGuide(title, author) {
    const prompt = `Generate structured study notes for educational content titled "${title}" by ${author}. Return ONLY valid JSON with these fields:
- "summary": 3-4 sentence overview of what this topic covers
- "highlights": array of 5-8 key concepts someone would learn from this
- "topics": array of {name, description} for important terms
- "questions": array of {question, answer} for self-study

Return ONLY raw JSON, no markdown, no code fences.`;

    const rawResult = await this.makeRequest(
      [{ role: 'user', content: prompt }],
      { temperature: 0.5, maxTokens: 2000, timeoutMs: 30000 },
    );
    return this._parseJSON(rawResult);
  }

  async sendMessage(history, currentMessage, targetLanguage = 'English', notesContext = null) {
    const langInstruction = targetLanguage !== 'English'
      ? `Respond primarily in ${targetLanguage}. Include English technical terms in parentheses where helpful.`
      : 'Respond in clear, natural English.';

    const notesInstruction = notesContext
      ? `\n\nThe user has these saved notes for reference:\n${notesContext}`
      : '';

    const systemPrompt = `You are Briefly, a helpful study assistant. Explain concepts clearly with examples. Be concise but thorough. Respond in plain text without markdown formatting.${notesInstruction}

${langInstruction}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: currentMessage },
    ];

    return this.makeRequest(messages, { temperature: 0.7, maxTokens: 1500, timeoutMs: 30000 });
  }

  async chatAboutNote(noteContent, question, language = 'English') {
    const highlightsText = noteContent.highlights?.map(h => `- ${h}`).join('\n') || '';
    const topicsText = noteContent.topics?.map(t => `- ${t.name || t.topic}: ${t.description || t.meaning}`).join('\n') || '';
    const questionsText = noteContent.questions?.map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}`).join('\n') || '';

    const systemPrompt = `You are Briefly, a helpful study assistant. The user just generated these study notes and wants to ask a follow-up question.

Summary:
${noteContent.summary}

Key Takeaways:
${highlightsText}

Topics:
${topicsText}

Study Questions:
${questionsText}

Answer the user's question based on these notes. If the answer isn't in the notes, say so honestly. Respond in ${language === 'English' ? 'English' : `${language} (include English terms in parentheses where helpful)`}. Be concise.`;

    return this.makeRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      { temperature: 0.7, maxTokens: 1000, timeoutMs: 20000 },
    );
  }

  _parseJSON(text) {
    let cleaned = text
      .replace(/```json\s*|\s*```/g, '')
      .trim();

    const braceStart = cleaned.indexOf('{');
    if (braceStart === -1) throw new Error('Unable to parse the AI response. Please try again.');
    cleaned = cleaned.substring(braceStart);

    const strategies = [
      (s) => JSON.parse(s),
      (s) => {
        let d = 0, inStr = false, esc = false, end = -1;
        for (let i = 0; i < s.length; i++) {
          const c = s[i];
          if (esc) { esc = false; continue; }
          if (c === '\\' && inStr) { esc = true; continue; }
          if (c === '"') { inStr = !inStr; continue; }
          if (!inStr) {
            if (c === '{') d++;
            else if (c === '}') { d--; if (d === 0) { end = i + 1; break; } }
          }
        }
        if (end > 0) s = s.substring(0, end);
        for (let i = 0; i < d; i++) s += '}';
        return JSON.parse(s);
      },
      (s) => JSON.parse(s.replace(/,\s*([}\]])/g, '$1')),
      (s) => JSON.parse(s.replace(/'/g, '"').replace(/,\s*([}\]])/g, '$1')),
    ];

    for (const fn of strategies) {
      try {
        const parsed = fn(cleaned);
        if (parsed && typeof parsed === 'object') {
          return {
            summary: parsed.summary || '',
            highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
            topics: Array.isArray(parsed.topics) ? parsed.topics : [],
            questions: Array.isArray(parsed.questions) ? parsed.questions : [],
          };
        }
      } catch { continue; }
    }

    throw new Error('Unable to parse the AI response. Please try again.');
  }
}
