import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

function getGroqKey(): string | null {
  let key = process.env.GROQ_API_KEY;
  if (!key) {
    try {
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const match = envFile.match(/GROQ_API_KEY=(.*)/);
        if (match && match[1]) key = match[1].trim();
      }
    } catch (e) {
      console.error('Failed to read .env.local:', e);
    }
  }
  return key || null;
}

async function callGroq(apiKey: string, model: string, messages: any[], maxTokens = 2048) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: maxTokens }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = getGroqKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
  }

  const { imageBase64, action } = req.body as {
    imageBase64?: string; // full data URL  e.g. "data:image/png;base64,..."
    action: 'extract' | 'quiz' | 'flashcards' | 'concepts' | 'summary';
  };

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required' });
  }

  // Ensure it is a proper data URL
  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  try {
    // ── Step 1: Extract text via vision model ───────────────────────────────
    const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

    const extractedText = await callGroq(
      apiKey,
      VISION_MODEL,
      [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
            {
              type: 'text',
              text: `Please carefully read and transcribe ALL text visible in this image. 
Preserve headings, bullet points, numbered lists, and paragraph breaks as much as possible.
After the transcription, add a separator line "---" and write a one-sentence description of what kind of content this image contains (e.g. "This appears to be a textbook page about photosynthesis.").
Output ONLY the transcribed text and the description — nothing else.`,
            },
          ],
        },
      ],
      1500
    );

    if (action === 'extract') {
      return res.status(200).json({ extractedText });
    }

    // ── Step 2: Generate study content from extracted text ──────────────────
    const TEXT_MODEL = 'llama-3.3-70b-versatile';

    const [summaryText, conceptsText, quizText, flashcardsText] = await Promise.all([
      // Summary
      callGroq(
        apiKey,
        TEXT_MODEL,
        [
          {
            role: 'system',
            content:
              'You are a study assistant. Produce a concise, well-structured summary (3-5 paragraphs) of the following extracted text. Use clear language suitable for a student. Do not include any preamble.',
          },
          { role: 'user', content: extractedText },
        ],
        700
      ),

      // Key Concepts
      callGroq(
        apiKey,
        TEXT_MODEL,
        [
          {
            role: 'system',
            content: `You are a study assistant. Extract the 5-8 most important key concepts from the following text.
For each concept return JSON like:
[{"term": "...", "definition": "...", "importance": "high|medium"}]
Return ONLY the JSON array, no markdown fences, no extra text.`,
          },
          { role: 'user', content: extractedText },
        ],
        700
      ),

      // Quiz
      callGroq(
        apiKey,
        TEXT_MODEL,
        [
          {
            role: 'system',
            content: `You are a quiz generator. Create 5 multiple-choice questions from the following study text.
Return JSON:
[{"question":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A","explanation":"..."}]
Return ONLY the JSON array, no markdown fences, no extra text.`,
          },
          { role: 'user', content: extractedText },
        ],
        900
      ),

      // Flashcards
      callGroq(
        apiKey,
        TEXT_MODEL,
        [
          {
            role: 'system',
            content: `You are a flashcard generator. Create 6 flashcards from the following text.
Return JSON:
[{"front":"...","back":"..."}]
Return ONLY the JSON array, no markdown fences, no extra text.`,
          },
          { role: 'user', content: extractedText },
        ],
        700
      ),
    ]);

    // Parse JSON safely
    function safeParseJson(raw: string, fallback: any[]) {
      try {
        // Strip markdown fences if model added them anyway
        const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        return JSON.parse(cleaned);
      } catch {
        return fallback;
      }
    }

    return res.status(200).json({
      extractedText,
      summary: summaryText,
      concepts: safeParseJson(conceptsText, []),
      quiz: safeParseJson(quizText, []),
      flashcards: safeParseJson(flashcardsText, []),
    });
  } catch (error: any) {
    console.error('[snap-study API]', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
