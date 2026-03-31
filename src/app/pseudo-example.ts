
// This is a pseudo-code example of a functional module
export function calculateThreatScore(entropy: number, fileCount: number): number {
  const baseScore = entropy * 10;
  const multiplier = fileCount > 100 ? 2 : 1;
  
  return Math.min(baseScore * multiplier, 100);
}

export const THREAT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'critical'
};
