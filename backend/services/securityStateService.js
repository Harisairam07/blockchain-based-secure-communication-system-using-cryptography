const state = {
  emergencyShutdown: false,
  updatedAt: new Date().toISOString(),
  reason: null
};

function getSecurityState() {
  return { ...state };
}

function setEmergencyShutdown(enabled, reason = null) {
  state.emergencyShutdown = Boolean(enabled);
  state.reason = enabled ? reason || 'Manual admin activation' : null;
  state.updatedAt = new Date().toISOString();
  return getSecurityState();
}

module.exports = {
  getSecurityState,
  setEmergencyShutdown
};
