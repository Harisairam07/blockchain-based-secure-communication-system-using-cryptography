export function explorerLink(txHash) {
  if (!txHash) return '#';
  if (txHash.startsWith('demo-')) return '#';
  const base = import.meta.env.VITE_BLOCK_EXPLORER || 'https://sepolia.etherscan.io/tx/';
  return `${base}${txHash}`;
}
