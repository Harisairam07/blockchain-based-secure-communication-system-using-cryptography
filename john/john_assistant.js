const { getRecentAttackLogs } = require('../backend/services/attackDetectionService');
const { scanBlockchainIntegrity } = require('./john_commands');

class JohnAssistant {
  constructor({ config, logJohnActivity }) {
    this.config = config;
    this.log = logJohnActivity;
    this.io = null;
    this.monitorTimer = null;
    this.lastThreatId = null;
  }

  getGreeting() {
    return `Good ${getTimeOfDay()}, I am ${this.config.name}. How may I assist you?`;
  }

  getStartupMessage() {
    return `Initializing ${this.config.name}... Blockchain link established. Cryptographic protocols loaded. Good ${getTimeOfDay()}, I am ${this.config.name}. All systems are operational.`;
  }

  start({ io } = {}) {
    this.io = io || null;
    this.log('startup', {
      message: this.getStartupMessage(),
      monitorIntervalSeconds: this.config.blockchain_monitor_interval
    });

    if (this.io) {
      this.io.emit('john:boot', {
        message: this.getStartupMessage(),
        config: this.getPublicConfig()
      });
    }

    this.startMonitoring();
  }

  stop() {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
    this.log('shutdown');
  }

  getPublicConfig() {
    return {
      name: this.config.name,
      fullName: this.config.full_name,
      owner: this.config.owner,
      themeColor: this.config.theme_color,
      alertColor: this.config.alert_color,
      wakeWord: this.config.wake_word,
      voiceRate: this.config.voice_rate,
      voiceVolume: this.config.voice_volume
    };
  }

  startMonitoring() {
    const intervalMs = Math.max(10, Number(this.config.blockchain_monitor_interval || 30)) * 1000;

    if (this.monitorTimer) clearInterval(this.monitorTimer);

    this.monitorTimer = setInterval(() => {
      this.runBackgroundScan().catch((error) => {
        this.log('background_scan_failed', { error: error.message });
      });
    }, intervalMs);

    this.runBackgroundScan().catch(() => null);
  }

  async runBackgroundScan() {
    const integrity = await scanBlockchainIntegrity();
    this.log('blockchain_monitor_tick', {
      compromised: integrity.compromised,
      compromisedRecords: integrity.compromisedRecords,
      checkedRecords: integrity.checkedRecords
    });

    if (integrity.compromised && this.io) {
      const message = 'Alert: Chain integrity compromised. Initiating countermeasures.';
      this.io.emit('john:alert', {
        level: 'critical',
        message,
        integrity
      });
      this.log('blockchain_compromise_alert', { message, integrity });
    }

    const attacks = await getRecentAttackLogs(5);
    const latest = attacks.find((entry) => entry.blocked);
    if (!latest) return;

    const latestId = String(latest._id || latest.createdAt || '');
    if (latestId && latestId !== this.lastThreatId) {
      this.lastThreatId = latestId;
      const node = getNodeNumber(latest.ip);
      const message = `Warning: Unauthorized access detected on Node ${node}`;

      if (this.io) {
        this.io.emit('john:alert', {
          level: 'warning',
          message,
          threat: {
            id: latestId,
            type: latest.type,
            ip: latest.ip,
            node,
            createdAt: latest.createdAt
          }
        });
      }

      this.log('threat_alert', { message, attackType: latest.type, node });
    }
  }
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getNodeNumber(input = '') {
  const sum = String(input)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return (sum % 5) + 1;
}

module.exports = { JohnAssistant };
