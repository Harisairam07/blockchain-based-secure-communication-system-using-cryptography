const OpenAI = require('openai');

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 8;

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item?.role === 'user' ? 'user' : 'assistant',
      content: String(item?.text || item?.content || '').slice(0, MAX_MESSAGE_LENGTH)
    }))
    .filter((item) => item.content.trim());
}

function sanitizeClientContext(context = {}) {
  return {
    cameraActive: Boolean(context.cameraActive),
    micReady: Boolean(context.micReady),
    locationPermission: String(context.locationPermission || 'unknown').slice(0, 40),
    demoMode: Boolean(context.demoMode),
    page: String(context.page || 'unknown').slice(0, 80)
  };
}

function buildRequestPayload({ user, message, history, clientContext }) {
  const context = sanitizeClientContext(clientContext);
  const safeHistory = sanitizeHistory(history);

  const instructions =
    'You are Neural Core, a Jarvis-like security-operator assistant inside a blockchain secure communication dashboard. ' +
    'Be concise, calm, capable, and slightly cinematic without roleplay excess. ' +
    'Answer the user directly. Help with app navigation, login, secure messaging, blockchain verification, threat posture, and general questions. ' +
    'Never claim to see camera video, hear microphone audio, or know exact location. Raw camera, audio, and location data stays on the device. ' +
    'If backend services or blockchain are not configured, say so clearly and offer the next practical step. ' +
    `Authenticated user: ${user?.email || 'unknown'} (${user?.role || 'user'}). Client context: ${JSON.stringify(context)}.`;

  return {
    instructions,
    input: [
      ...safeHistory,
      {
        role: 'user',
        content: message
      }
    ]
  };
}

async function chat(req, res) {
  const message = String(req.body?.message || '').trim();

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `message must be ${MAX_MESSAGE_LENGTH} characters or less` });
  }

  const client = getClient();
  if (!client) {
    return res.status(503).json({
      error: 'AI backend is not configured',
      fallback: true
    });
  }

  try {
    const payload = buildRequestPayload({
      user: req.user,
      message,
      history: req.body?.history,
      clientContext: req.body?.clientContext
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      instructions: payload.instructions,
      input: payload.input,
      max_output_tokens: 450
    });

    const answer = response.output_text || 'Neural Core is online, but no response text was returned.';

    return res.json({
      answer,
      model: response.model || process.env.OPENAI_MODEL || 'gpt-5-mini',
      fallback: false
    });
  } catch (error) {
    return res.status(502).json({
      error: 'AI response failed',
      details: error.message,
      fallback: true
    });
  }
}

module.exports = { chat };
