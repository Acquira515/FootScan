// --- ALGORITHMIC CORE (Existing Systems) ---

// 1. Elo-based rating system (Simplified for demo)
export const calculateElo = (ratingA: number, ratingB: number, actualScoreA: number, actualScoreB: number) => {
  const kFactor = 32;
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const resultA = actualScoreA > actualScoreB ? 1 : actualScoreA === actualScoreB ? 0.5 : 0;
  return ratingA + kFactor * (resultA - expectedA);
};

// 2. Poisson Distribution for Goals
export const poisson = (k: number, lambda: number) => {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorialize(k);
};

export const factorialize = (num: number): number => {
  if (num < 0) return -1;
  if (num === 0) return 1;
  return (num * factorialize(num - 1));
};

// 3. Negative Binomial (Variance aware goal modeling)
export const negativeBinomial = (k: number, r: number, p: number) => {
  const combinations = factorialize(k + r - 1) / (factorialize(k) * factorialize(r - 1));
  return combinations * Math.pow(1 - p, r) * Math.pow(p, k);
};

// 4. Weighted Rolling Average (Form)
export const getWeightedForm = (last5Matches: string[]) => {
  const weights = [1, 1.2, 1.5, 2, 2.5];
  let score = 0;
  let totalWeight = 0;
  
  last5Matches.forEach((result, index) => {
    const val = result === 'W' ? 3 : result === 'D' ? 1 : 0;
    score += val * weights[index];
    totalWeight += weights[index];
  });
  
  return (score / totalWeight) * 33.33;
};

// --- ADVANCED CALCULATIONS LAYER (NEW) ---

// New 1: Exponential Form Decay
export const calculateExponentialDecayForm = (results: string[]) => {
  const lambda = 0.15;
  let score = 0;
  let weightSum = 0;
  const reversed = [...results].reverse();
  reversed.forEach((res, i) => {
    const val = res === 'W' ? 3 : res === 'D' ? 1 : 0;
    const weight = Math.exp(-lambda * i);
    score += val * weight;
    weightSum += weight;
  });
  return (score / weightSum) * 33.33;
};

// New 2: League Tier Coefficient
export const calculateLeagueTierAdjustment = (leagueName: string) => {
  const tiers: Record<string, number> = { 
    "Champions League": 1.2, 
    "Premier League": 1.1, 
    "La Liga": 1.05, 
    "Default": 1.0 
  };
  return tiers[leagueName] || tiers["Default"];
};

// New 3: Head-to-Head Dominance Factor
export const calculateH2HDominance = (homeWins: number, draws: number, awayWins: number) => {
  const total = homeWins + draws + awayWins;
  if (total === 0) return 0;
  const homeRate = homeWins / total;
  return (homeRate - 0.33) * 0.5;
};

// New 4: Home Field Advantage Strength
export const calculateHomeAdvantageStrength = (baseAdvantage: number) => {
  const crowdFactor = 1.0 + (Math.random() * 0.15); 
  return baseAdvantage * crowdFactor;
};

// New 5: Defensive Resilience Index
export const calculateResilienceIndex = (goalsConcededLast5: number) => {
  const avgConceded = goalsConcededLast5 / 5;
  return Math.max(0.5, Math.min(1.5, avgConceded / 1.2)); 
};

// New 6: Attacking Clinical Efficiency
export const calculateClinicalEfficiency = (goalsScoredLast5: number) => {
  const avgScored = goalsScoredLast5 / 5;
  return Math.max(0.7, Math.min(1.6, avgScored / 1.1));
};

// New 7: Draw Probability Saturation
export const calculateDrawSaturation = (homeStr: number, awayStr: number) => {
  const diff = Math.abs(homeStr - awayStr);
  return diff < 10 ? 1.15 : 1.0; 
};

// New 8: Fatigue Accumulation Model
export const calculateFatigueAccumulation = (daysRest: number, rosterDepth: string) => {
  const baseFatigue = daysRest < 4 ? 0.9 : 1.0;
  const depthBonus = rosterDepth === "High" ? 0.05 : 0;
  return baseFatigue + depthBonus;
};

// New 9: Weather Impact Simulation
export const calculateWeatherImpact = () => {
  const condition = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'Rain' : 'Wind') : 'Clear';
  const goalDampener = condition !== 'Clear' ? 0.9 : 1.0;
  return { condition, goalDampener };
};

// New 10: Margin of Victory Potential
export const calculateMarginPotential = (homeAttack: number, awayDefense: number) => {
  const mismatch = homeAttack - awayDefense;
  if (mismatch > 20) return "High blowout potential";
  if (mismatch > 10) return "Comfortable win likely";
  return "Tight contest";
};

// New 11: Dynamic Season Timing
export const calculateSeasonProgress = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.getMonth();
  if (month >= 7) return (month - 7) / 5;
  if (month <= 4) return 0.6 + (month / 4) * 0.4;
  return 0.1;
};

// New 12: Poisson Mixture Model
export const calculatePoissonMixture = (avgGoalsSeason: number, recentGoalsAvg: number) => {
  const wRecent = 0.4;
  const wSeason = 0.6;
  return (avgGoalsSeason * wSeason) + (recentGoalsAvg * wRecent);
};

// New 13: Confidence Calibration
export const calculateConsensusConfidence = (probs: number[]) => {
  const mean = probs.reduce((a, b) => a + b, 0) / probs.length;
  const variance = probs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / probs.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(50, Math.min(98, 100 - (stdDev * 150))); 
};

// Goal Distribution Calculator
export const calculateGoalDistributions = (lambdaA: number, lambdaB: number) => {
  const data = [];
  for (let i = 0; i <= 5; i++) {
    data.push({
      goals: i,
      homeProb: (poisson(i, lambdaA) * 100).toFixed(1),
      awayProb: (poisson(i, lambdaB) * 100).toFixed(1)
    });
  }
  return data;
};
