// Groq API client for generating English educational activities

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';

export const DEFAULT_MODEL = 'openai/gpt-oss-120b';

export const GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'OpenAI GPT OSS 120B (Recomendado - Alta Inteligencia)' },
  { id: 'openai/gpt-oss-20b', name: 'OpenAI GPT OSS 20B (Ultra Rápido)' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (Alta Precisión)' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' }
];

// Query active chat models directly from the user's account
export async function getActiveGroqModels(apiKey) {
  try {
    const response = await fetch(GROQ_MODELS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.data)) {
        // Filter out audio, whisper, safeguard, and prompt guard models
        const chatModels = data.data
          .map(m => m.id)
          .filter(id => 
            !id.includes('whisper') && 
            !id.includes('guard') && 
            !id.includes('orpheus') && 
            !id.includes('safeguard')
          );

        // Put preferred models at front if present
        const priority = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
        chatModels.sort((a, b) => {
          const aPri = priority.indexOf(a);
          const bPri = priority.indexOf(b);
          if (aPri !== -1 && bPri !== -1) return aPri - bPri;
          if (aPri !== -1) return -1;
          if (bPri !== -1) return 1;
          return 0;
        });

        if (chatModels.length > 0) {
          return chatModels;
        }
      }
    }
  } catch (err) {
    console.warn('Could not query dynamic Groq models list:', err);
  }

  // Fallback defaults
  return ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
}

export async function testGroqConnection(apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Please enter a valid Groq API Key.');
  }

  const response = await fetch(GROQ_MODELS_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API returned HTTP ${response.status}. Please check your key.`);
  }

  const data = await response.json().catch(() => ({}));
  const availableModels = Array.isArray(data?.data) ? data.data.map(m => m.id) : [];

  return { success: true, availableModels };
}

export async function generateEnglishQuiz({
  apiKey,
  topic,
  level = 'B1',
  questionCount = 8,
  gameType = 'all',
  model = DEFAULT_MODEL,
  customInstructions = ''
}) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Groq API Key is missing. Please add it in settings.');
  }

  // 1. Fetch live active models from user's account to never call a decommissioned model
  const liveModels = await getActiveGroqModels(apiKey);

  // 2. Candidate chain: user choice first, then active live models, then production defaults
  const candidateModels = [
    model,
    ...liveModels,
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b'
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const systemPrompt = `You are an elite ESL / English Language Teacher and educational game designer.
Your task is to generate high-quality, engaging English learning quiz questions tailored for a Casino-themed educational game.

Target CEFR Level: ${level}
Topic: ${topic}
Number of Questions: ${questionCount}
Target Machine/Game: ${gameType}
${customInstructions ? `Special Teacher Instructions: ${customInstructions}` : ''}

Rules:
1. Provide realistic, clear English questions (multiple choice with 4 distinct options).
2. One option MUST be strictly correct, and the other 3 must be plausible ESL distractors.
3. Include an insightful, friendly educational explanation for why the correct answer is right.
4. Categorize each question into one of: "Grammar", "Vocabulary", "Pronunciation", "Idioms", "Reading", or "Speaking".
5. For each question, assign a casino coin payout value (e.g. 100 to 500 based on difficulty).

You MUST respond strictly with a valid JSON object matching this schema:
{
  "title": "Short catchy title in English (e.g. 'Vegas Irregular Verbs Bonanza')",
  "description": "Engaging description explaining what the student will learn",
  "level": "${level}",
  "category": "Main topic category",
  "questions": [
    {
      "id": "q1",
      "question": "The question text in English",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact string of correct option",
      "explanation": "Clear explanation of grammar rule or vocabulary meaning",
      "category": "Grammar",
      "points": 200
    }
  ]
}`;

  let lastError = null;

  for (const currentModel of candidateModels) {
    try {
      // First try with json_object format, fallback to standard if not supported
      let requestBody = {
        model: currentModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate the ${questionCount} English questions for the topic: "${topic}" at level ${level}. Output only the JSON object.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3000
      };

      let response = await fetch(GROQ_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(requestBody)
      });

      // If response_format json_object caused an error on this model, retry without response_format
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}`;

        if (msg.toLowerCase().includes('response_format') || msg.toLowerCase().includes('json')) {
          delete requestBody.response_format;
          response = await fetch(GROQ_CHAT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify(requestBody)
          });
        } else {
          // If error is decommissioned or model access, skip to next model
          if (msg.includes('decommissioned') || msg.includes('does not exist') || msg.includes('access') || response.status === 404 || response.status === 400) {
            console.warn(`Model ${currentModel} unavailable (${msg}), trying next...`);
            lastError = new Error(msg);
            continue;
          }
          throw new Error(msg);
        }
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `HTTP ${response.status}`;
        lastError = new Error(errMsg);
        continue;
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;

      if (!rawContent) {
        throw new Error('Groq returned an empty response.');
      }

      // Robust JSON extraction (handles both raw JSON and markdown codeblock ```json ... ```)
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON from model output.');
        }
      }

      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Generated response does not contain a valid questions list.');
      }

      parsed.questions = parsed.questions.map((q, idx) => ({
        id: q.id || `q_${Date.now()}_${idx}`,
        question: q.question || 'Missing question',
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Yes', 'No', 'Maybe', 'Never'],
        correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'Yes'),
        explanation: q.explanation || 'No explanation provided.',
        category: q.category || 'General',
        points: Number(q.points) || 150
      }));

      return parsed;
    } catch (err) {
      lastError = err;
      if (err.message && (err.message.includes('decommissioned') || err.message.includes('model') || err.message.includes('access'))) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('No se pudo generar la actividad con los modelos activos de Groq.');
}
