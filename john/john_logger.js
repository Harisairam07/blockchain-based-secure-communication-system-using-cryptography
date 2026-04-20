const fs = require('fs');
const path = require('path');

const logPath = path.resolve(__dirname, '../john_activity.log');

function logJohnActivity(event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    source: 'JOHN',
    event,
    details
  };

  fs.appendFile(logPath, `${JSON.stringify(entry)}\n`, (error) => {
    if (error) {
      console.warn(`JOHN log write failed: ${error.message}`);
    }
  });
}

module.exports = {
  logJohnActivity,
  logPath
};
