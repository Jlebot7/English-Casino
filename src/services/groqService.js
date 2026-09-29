// Groq API client for generating English educational activities

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';

export const DEFAULT_MODEL = 'llama-3.1-8b-instant';

export const GROQ_MODELS = [
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Ultra Fast & Universal)' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (High Intelligence)' },
  { id: 'llama3-70b-8192', name: 'Llama 3 70B (High Capacity)' },
  { id: 'llama3-8b-8192', name: 'Llama 3 8B (Fast & Reliable)' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (High Context)' }
];

export async function testGroqConnection(apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Please enter a valid Groq API Key.');
  }

  // Verify the API key by querying the /models endpoint
  // This verifies key validity directly without model access restrictions
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

  // Model fallback chain: try preferred model first, then universally available fallbacks
  const candidateModels = [
    model,
    'llama-3.1-8b-instant',
    'llama3-8b-8192',
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768'
  ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

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
      const response = await fetch(GROQ_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate the ${questionCount} English questions for the topic: "${topic}" at level ${level}. Output only the JSON object.` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}`;
        // If error is model access or not found, try the next fallback model
        if (msg.includes('model') && (msg.includes('does not exist') || msg.includes('access') || response.status === 404)) {
          lastError = new Error(msg);
          continue;
        }
        throw new Error(msg);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;

      if (!rawContent) {
        throw new Error('Groq returned an empty response.');
      }

      const parsed = JSON.parse(rawContent);
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
      if (err.message && err.message.includes('model') && (err.message.includes('does not exist') || err.message.includes('access'))) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Failed to generate quiz with available Groq models.');
}
