export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function strengthLabel(score) {
  return ['Weak', 'Fair', 'Good', 'Strong'][Math.max(0, score - 1)] || 'Weak';
}
