const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { config, logJohnActivity } = require('../../john');
const { handleJohnCommand, parseJohnCommand, scanBlockchainIntegrity } = require('../../john/john_commands');
const { verifyVoiceAuthentication, getThreatAlerts } = require('../../john/john_security');

const router = express.Router();

router.use(authMiddleware);

router.get('/config', (req, res) => {
  res.json({
    name: config.name,
    fullName: config.full_name,
    owner: req.user?.name || config.owner,
    wakeWord: config.wake_word,
    themeColor: config.theme_color,
    alertColor: config.alert_color,
    voiceRate: config.voice_rate,
    voiceVolume: config.voice_volume
  });
});

router.get('/status', async (req, res) => {
  try {
    const [integrity, threats] = await Promise.all([
      scanBlockchainIntegrity(),
      getThreatAlerts(5)
    ]);

    res.json({
      status: integrity.compromised ? 'compromised' : 'nominal',
      integrity,
      threats,
      voice: {
        enrolled: Boolean(req.user.johnVoiceProfile?.vector?.length),
        lockedUntil: req.user.johnLockedUntil || null,
        failedAttempts: req.user.johnFailedVoiceAttempts || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'JOHN status unavailable', details: error.message });
  }
});

router.post('/voice-auth', async (req, res) => {
  try {
    const result = await verifyVoiceAuthentication({
      user: req.user,
      features: req.body?.features,
      enroll: Boolean(req.body?.enroll),
      req
    });

    res.status(result.authenticated ? 200 : 401).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Voice authentication failed', details: error.message });
  }
});

router.post('/command', async (req, res) => {
  try {
    const command = String(req.body?.command || '').trim();
    if (!command) {
      return res.status(400).json({ error: 'command is required' });
    }

    const parsed = parseJohnCommand(command);
    if (parsed.sensitive) {
      const auth = await verifyVoiceAuthentication({
        user: req.user,
        features: req.body?.voiceFeatures,
        enroll: Boolean(req.body?.enrollVoice),
        req
      });

      if (!auth.authenticated) {
        return res.status(401).json({
          requiresVoiceAuth: true,
          answer: auth.message,
          auth,
          intent: parsed.intent
        });
      }
    }

    const result = await handleJohnCommand({
      command,
      user: req.user,
      context: req.body?.context || {},
      req
    });

    logJohnActivity('command_completed', {
      user: req.user.email,
      intent: result.intent,
      severity: result.severity || 'normal'
    });

    return res.json(result);
  } catch (error) {
    logJohnActivity('command_failed', {
      user: req.user?.email,
      error: error.message
    });
    return res.status(500).json({ error: 'JOHN command failed', details: error.message });
  }
});

router.post('/log', (req, res) => {
  logJohnActivity(String(req.body?.event || 'frontend_event'), {
    user: req.user.email,
    details: req.body?.details || {}
  });
  res.json({ ok: true });
});

module.exports = router;
