const config = require('./john_config.json');
const { JohnAssistant } = require('./john_assistant');
const { logJohnActivity, logPath } = require('./john_logger');

function createJohnAssistant() {
  return new JohnAssistant({ config, logJohnActivity });
}

module.exports = {
  config,
  createJohnAssistant,
  logJohnActivity,
  logPath
};
