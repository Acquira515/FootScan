import {
  calculateExponentialDecayForm,
  calculateLeagueTierAdjustment,
  calculateH2HDominance,
  calculateHomeAdvantageStrength,
  calculateResilienceIndex,
  calculateClinicalEfficiency,
  calculateDrawSaturation,
  calculateFatigueAccumulation,
  calculateWeatherImpact,
  calculateMarginPotential,
  calculateSeasonProgress,
  calculatePoissonMixture,
  calculateConsensusConfidence,
  calculateGoalDistributions,
  getWeightedForm,
} from './algorithms';

export const generatePredictions = (matchData: any) => {
  const home = matchData.teams.home;
  const away = matchData.teams.away;
  const matchDate = matchData.fixture.date;
  
  // --- INTEGRATING NEW CALCULATION LAYERS ---
  
  const homeAdvForm = calculateExponentialDecayForm(['W', 'D', 'W', 'W', 'D']);
  const awayAdvForm = calculateExponentialDecayForm(['L', 'D', 'L', 'W', 'L']);
  
  const leagueMod = calculateLeagueTierAdjustment(matchData.league.name || "Default");
  
  const h2hFactor = calculateH2HDominance(2, 1, 1); 

  const homeFieldBoost = calculateHomeAdvantageStrength(1.15); 

  const homeResilience = calculateResilienceIndex(4); 
  const awayEfficiency = calculateClinicalEfficiency(6); 

  const weather = calculateWeatherImpact();

  const seasonMaturity = calculateSeasonProgress(matchDate);
  const seasonConfidence = 0.7 + (seasonMaturity * 0.25);

  const homeBaseIntensity = ((Math.random() * 1.5) + 1.0) * leagueMod; 
  const awayBaseIntensity = ((Math.random() * 1.2) + 0.8) * leagueMod;

  const homeLambda = calculatePoissonMixture(1.45, 1.8);
  const awayLambda = calculatePoissonMixture(1.2, 0.9);

  const homeAttack = homeLambda;
  const awayDefense = (1.0 + (Math.random() * 0.5)) * homeResilience;
  const homexG = (homeAttack / awayDefense) * homeBaseIntensity * homeFieldBoost * weather.goalDampener;
  
  const awayAttack = awayLambda * awayEfficiency;
  const homeDefense = 0.9 + (Math.random() * 0.5);
  const awayxG = (awayAttack / homeDefense) * awayBaseIntensity * weather.goalDampener;

  const homeForm = (getWeightedForm(['W', 'D', 'L', 'W', 'W']) + homeAdvForm) / 2; 
  const awayForm = (getWeightedForm(['L', 'L', 'D', 'W', 'L']) + awayAdvForm) / 2;
  
  const homeMomentum = homeForm > 60 ? "High" : "Average";
  
  const volatility = Math.abs(homeForm - awayForm) < 10 ? "High Risk" : "Stable";

  const restDays = 4; 
  const fatigueFactor = calculateFatigueAccumulation(restDays, "Average");

  const probHomeElo = 0.45 + h2hFactor; 
  const probHomeForm = (homeForm / (homeForm + awayForm));
  const probHomePoisson = homexG / (homexG + awayxG);
  
  let wElo = 0.3;
  let wForm = 0.4;
  let wPoisson = 0.3;

  if (Math.abs(probHomeForm - 0.5) > 0.4) wForm *= 0.8;
  
  const totalW = wElo + wForm + wPoisson;
  wElo /= totalW; 
  wForm /= totalW; 
  wPoisson /= totalW;
  
  const rawHomeProb = ((probHomeElo * wElo) + (probHomeForm * wForm) + (probHomePoisson * wPoisson)) * fatigueFactor * seasonConfidence;
  
  const drawSaturator = calculateDrawSaturation(homeForm, awayForm);
  
  const finalHomeProb = Math.min(0.9, rawHomeProb);
  const finalAwayProb = (1 - finalHomeProb) * 0.7 * (1 / drawSaturator); 
  const finalDrawProb = 1 - finalHomeProb - finalAwayProb;

  const confidenceScore = calculateConsensusConfidence([probHomeElo, probHomeForm, probHomePoisson]);

  const xPointsHome = (finalHomeProb * 3) + (finalDrawProb * 1);

  const marginNote = calculateMarginPotential(homeForm, awayForm);

  // --- DYNAMIC CHART DATA GENERATION ---
  
  const momentumData = [];
  for(let i=0; i<6; i++) {
     const timeFactor = i < 4 ? (i+1) * 0.2 : 1.0 - ((i-3)*0.1);
     const homeNoise = (Math.random() * 20) - 10;
     const awayNoise = (Math.random() * 20) - 10;
     
     momentumData.push({
         period: `${i*15}-${(i+1)*15}`,
         home: Math.max(10, Math.min(95, (homexG * 30 * timeFactor) + homeForm/3 + homeNoise)),
         away: Math.max(10, Math.min(95, (awayxG * 30 * timeFactor) + awayForm/3 + awayNoise))
     });
  }

  const expertConsensusData = [
    { subject: 'Elo Rating', A: Math.min(100, probHomeElo * 150), B: Math.min(100, (1-probHomeElo) * 150), fullMark: 100 },
    { subject: 'Recent Form', A: Math.min(100, homeForm), B: Math.min(100, awayForm), fullMark: 100 },
    { subject: 'H2H History', A: 50 + (h2hFactor * 100), B: 50 - (h2hFactor * 100), fullMark: 100 },
    { subject: 'Attack Strength', A: Math.min(100, homexG * 40), B: Math.min(100, awayxG * 40), fullMark: 100 },
    { subject: 'Defense Solidarity', A: Math.min(100, homeResilience * 60), B: Math.min(100, (2-calculateResilienceIndex(4))*60), fullMark: 100 },
    { subject: 'Motivation', A: 95, B: 70, fullMark: 100 },
  ];

  return {
    probabilities: {
      home: Math.min(Math.max(finalHomeProb * 100, 10), 90),
      draw: Math.max(finalDrawProb * 100, 5),
      away: Math.min(Math.max(finalAwayProb * 100, 10), 90)
    },
    metrics: {
      homexG: homexG.toFixed(2),
      awayxG: awayxG.toFixed(2),
      volatility,
      homeMomentum,
      xPoints: xPointsHome.toFixed(2),
      fatigueImpact: restDays < 3 ? "High" : "Low",
      weatherCondition: weather.condition,
      marginNote: marginNote,
      confidenceScore: confidenceScore.toFixed(0)
    },
    distributions: calculateGoalDistributions(homexG, awayxG),
    charts: {
        momentum: momentumData,
        consensus: expertConsensusData
    }
  };
};
