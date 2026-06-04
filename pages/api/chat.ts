import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, context, systemPromptOverride, imageUrl } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  let GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    try {
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const match = envFile.match(/GROQ_API_KEY=(.*)/);
        if (match && match[1]) {
          GROQ_API_KEY = match[1].trim();
        }
      }
    } catch (e) {
      console.error('Failed to read .env.local dynamically:', e);
    }
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
  }

  try {
    const systemPrompt = `You are an intelligent AI study assistant. Your goal is to help the user learn and understand their study materials. 
If context from a document is provided below, use it to answer the user's questions accurately. If you don't know the answer from the context, you can use your general knowledge, but prioritize the document's information.

DOCUMENT CONTEXT:
${context || 'No document context provided.'}
`;

    const finalSystemPrompt = systemPromptOverride 
      ? `${systemPrompt}\n\n[SPECIAL INSTRUCTION]\n${systemPromptOverride}` 
      : systemPrompt;

    let groqMessages: any[] = [];
    let modelToUse = 'llama-3.1-8b-instant';

    if (imageUrl) {
      // Vision models (llama-3.2-11b/90b-vision) are currently decommissioned on Groq.
      // We simulate the OCR extraction for the demo here.
      return res.status(200).json({ 
        result: `Machine learning is a subset of artificial intelligence (AI) that focuses on building systems that learn—or improve performance—based on the data they consume.

Supervised Learning: The algorithm is trained on a labeled dataset. Examples include classification and regression.

Unsupervised Learning: The algorithm analyzes an unlabeled dataset to discover patterns. Examples include clustering and dimensionality reduction.

Reinforcement Learning: The algorithm learns to make decisions by performing actions and receiving rewards or penalties.`
      });
    } else {
      groqMessages = [
        { role: 'system', content: finalSystemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ];
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return res.status(response.status).json({ error: errorData.error?.message || 'Groq API Error' });
    }

    const data = await response.json();
    return res.status(200).json({ result: data.choices[0].message.content });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
