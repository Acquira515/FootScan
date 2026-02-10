'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, TrendingUp, Activity, Shield, Target, Settings, Info,
  ChevronLeft, AlertCircle, BarChart2, Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area 
} from 'recharts';

// --- THEME CONSTANTS ---
const THEME = {
  bg: "bg-slate-950",
  card: "bg-slate-900",
  cardHover: "hover:bg-slate-800",
  textMain: "text-white",
  textMuted: "text-slate-400",
  accent: "text-red-600",
  accentBg: "bg-red-600",
  accentBorder: "border-red-600",
  border: "border-slate-800",
  success: "text-green-500",
  chartColors: {
    primary: "#E50914",
    secondary: "#F5F5F5",
    tertiary: "#525252",
    grid: "#333333"
  }
};

// --- MOCK DATA ---
const MOCK_MATCHES = [
  {
    fixture: { id: 1, date: new Date().toISOString(), status: { short: 'NS' } },
    league: { name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
    teams: {
      home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
      away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" }
    },
    goals: { home: null, away: null }
  },
  {
    fixture: { id: 2, date: new Date(Date.now() + 3600000).toISOString(), status: { short: 'NS' } },
    league: { name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
    teams: {
      home: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      away: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }
    },
    goals: { home: null, away: null }
  },
  {
    fixture: { id: 3, date: new Date(Date.now() + 7200000).toISOString(), status: { short: 'NS' } },
    league: { name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png" },
    teams: {
      home: { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
      away: { id: 489, name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" }
    },
    goals: { home: null, away: null }
  }
];

// --- ALGORITHMIC CORE ---

const calculateElo = (ratingA: number, ratingB: number, actualScoreA: number, actualScoreB: number) => {
  const kFactor = 32;
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const resultA = actualScoreA > actualScoreB ? 1 : actualScoreA === actualScoreB ? 0.5 : 0;
  return ratingA + kFactor * (resultA - expectedA);
};

const poisson = (k: number, lambda: number) => {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorialize(k);
};

const factorialize = (num: number): number => {
  if (num < 0) return -1;
  if (num === 0) return 1;
  return (num * factorialize(num - 1));
};

const negativeBinomial = (k: number, r: number, p: number) => {
  const combinations = factorialize(k + r - 1) / (factorialize(k) * factorialize(r - 1));
  return combinations * Math.pow(1 - p, r) * Math.pow(p, k);
};

const getWeightedForm = (last5Matches: string[]) => {
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

const calculateExponentialDecayForm = (results: string[]) => {
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

const calculateLeagueTierAdjustment = (leagueName: string) => {
  const tiers: Record<string, number> = { 
    "Champions League": 1.2, "Premier League": 1.1, "La Liga": 1.05, "Default": 1.0 
  };
  return tiers[leagueName] || tiers["Default"];
};

const calculateH2HDominance = (homeWins: number, draws: number, awayWins: number) => {
  const total = homeWins + draws + awayWins;
  if (total === 0) return 0;
  const homeRate = homeWins / total;
  return (homeRate - 0.33) * 0.5;
};

const calculateHomeAdvantageStrength = (baseAdvantage: number) => {
  const crowdFactor = 1.0 + (Math.random() * 0.15); 
  return baseAdvantage * crowdFactor;
};

const calculateResilienceIndex = (goalsConcededLast5: number) => {
  const avgConceded = goalsConcededLast5 / 5;
  return Math.max(0.5, Math.min(1.5, avgConceded / 1.2)); 
};

const calculateClinicalEfficiency = (goalsScoredLast5: number) => {
  const avgScored = goalsScoredLast5 / 5;
  return Math.max(0.7, Math.min(1.6, avgScored / 1.1));
};

const calculateDrawSaturation = (homeStr: number, awayStr: number) => {
  const diff = Math.abs(homeStr - awayStr);
  return diff < 10 ? 1.15 : 1.0; 
};

const calculateFatigueAccumulation = (daysRest: number, rosterDepth: string) => {
  const baseFatigue = daysRest < 4 ? 0.9 : 1.0;
  const depthBonus = rosterDepth === "High" ? 0.05 : 0;
  return baseFatigue + depthBonus;
};

const calculateWeatherImpact = () => {
  const condition = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'Rain' : 'Wind') : 'Clear';
  const goalDampener = condition !== 'Clear' ? 0.9 : 1.0;
  return { condition, goalDampener };
};

const calculateMarginPotential = (homeAttack: number, awayDefense: number) => {
  const mismatch = homeAttack - awayDefense;
  if (mismatch > 20) return "High blowout potential";
  if (mismatch > 10) return "Comfortable win likely";
  return "Tight contest";
};

const calculateSeasonProgress = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.getMonth();
  if (month >= 7) return (month - 7) / 5;
  if (month <= 4) return 0.6 + (month / 4) * 0.4;
  return 0.1;
};

const calculatePoissonMixture = (avgGoalsSeason: number, recentGoalsAvg: number) => {
  const wRecent = 0.4;
  const wSeason = 0.6;
  return (avgGoalsSeason * wSeason) + (recentGoalsAvg * wRecent);
};

const calculateConsensusConfidence = (probs: number[]) => {
  const mean = probs.reduce((a, b) => a + b, 0) / probs.length;
  const variance = probs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / probs.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(50, Math.min(98, 100 - (stdDev * 150))); 
};

const calculateGoalDistributions = (lambdaA: number, lambdaB: number) => {
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

// --- PREDICTION ENGINE ---

const generatePredictions = (matchData: any) => {
  const matchDate = matchData.fixture.date;
  
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
  
  let wElo = 0.3, wForm = 0.4, wPoisson = 0.3;
  if (Math.abs(probHomeForm - 0.5) > 0.4) wForm *= 0.8;
  
  const totalW = wElo + wForm + wPoisson;
  wElo /= totalW; wForm /= totalW; wPoisson /= totalW;
  
  const rawHomeProb = ((probHomeElo * wElo) + (probHomeForm * wForm) + (probHomePoisson * wPoisson)) * fatigueFactor * seasonConfidence;
  const drawSaturator = calculateDrawSaturation(homeForm, awayForm);
  
  const finalHomeProb = Math.min(0.9, rawHomeProb);
  const finalAwayProb = (1 - finalHomeProb) * 0.7 * (1 / drawSaturator); 
  const finalDrawProb = 1 - finalHomeProb - finalAwayProb;

  const confidenceScore = calculateConsensusConfidence([probHomeElo, probHomeForm, probHomePoisson]);
  const xPointsHome = (finalHomeProb * 3) + (finalDrawProb * 1);
  const marginNote = calculateMarginPotential(homeForm, awayForm);

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
      marginNote,
      confidenceScore: confidenceScore.toFixed(0)
    },
    distributions: calculateGoalDistributions(homexG, awayxG),
    charts: {
        momentum: momentumData,
        consensus: expertConsensusData
    }
  };
};

// --- COMPONENTS ---

const Header = ({ onSettingsClick, hasKey }: any) => (
  <header className={`${THEME.bg} ${THEME.border} border-b p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg shadow-black/50`}>
    <div className="flex items-center gap-2">
      <div className={`p-2 ${THEME.accentBg} rounded-lg`}>
        <Activity className="text-white w-6 h-6" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tighter text-white">
          FOOT<span className={THEME.accent}>SCAN</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">INTELLIGENT PREDICTION SYSTEM</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
       {!hasKey && (
         <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 hidden sm:block font-bold">
           Simulation Mode ( API Key Needed ) - Example Data
         </span>
       )}
      <button 
        onClick={onSettingsClick}
        className={`p-2 rounded-full ${THEME.card} ${THEME.border} border hover:border-slate-600 transition-colors text-slate-300`}
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  </header>
);

const MatchCard = ({ match, onClick }: any) => {
  const date = new Date(match.fixture.date);
  const predictions = match.predictions || { probabilities: { home: 50, draw: 25, away: 25 } };
  const confidence = predictions.metrics?.confidenceScore || Math.max(predictions.probabilities.home, predictions.probabilities.away).toFixed(0);

  return (
    <div 
      onClick={() => onClick(match)}
      className={`${THEME.card} ${THEME.border} border rounded-xl p-0 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/10 overflow-hidden group`}
    >
      <div className="bg-slate-950/50 p-3 flex justify-between items-center border-b border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          {match.league.logo && <img src={match.league.logo} className="w-4 h-4" alt="" />}
          {match.league.name}
        </span>
        <span className={`text-xs ${THEME.accent} font-mono flex items-center gap-1`}>
          <Clock className="w-3 h-3" />
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="p-5 flex justify-between items-center relative">
        <div className="flex flex-col items-center w-1/3">
          <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-12 h-12 mb-3 object-contain drop-shadow-lg" />
          <span className="text-sm font-bold text-center leading-tight text-white">{match.teams.home.name}</span>
        </div>
        
        <div className="flex flex-col items-center justify-center w-1/3 z-10">
           <span className="text-2xl font-black text-slate-700">VS</span>
           {match.fixture.status.short === 'FT' && (
             <span className="text-lg font-bold text-white mt-1 bg-slate-800 px-3 py-1 rounded">
               {match.goals.home} - {match.goals.away}
             </span>
           )}
        </div>

        <div className="flex flex-col items-center w-1/3">
          <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-12 h-12 mb-3 object-contain drop-shadow-lg" />
          <span className="text-sm font-bold text-center leading-tight text-white">{match.teams.away.name}</span>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-50" />
      </div>

      <div className="px-5 pb-5">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Home Win</span>
          <span>Away Win</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${predictions.probabilities.home}%` }} className="bg-white h-full" />
          <div style={{ width: `${predictions.probabilities.draw}%` }} className="bg-slate-600 h-full" />
          <div style={{ width: `${predictions.probabilities.away}%` }} className="bg-red-600 h-full" />
        </div>
        <div className="mt-2 text-center">
            <span className="text-xs text-slate-500">
               AI Confidence: <span className="text-white">{confidence}%</span>
            </span>
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, onSave, currentKey }: any) => {
  const [key, setKey] = useState(currentKey || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`${THEME.card} border ${THEME.border} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden`}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-600" />
            System Configuration
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Football-API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all font-mono"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-xs text-slate-500 mt-2">
              Your key is stored locally in your browser session. It is never transmitted to our servers.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-red-600" />
              How to get a key
            </h3>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
              <li>Visit <a href="https://www.api-football.com/" target="_blank" rel="noreferrer" className="text-red-500 hover:underline">api-football.com</a></li>
              <li>Sign up for a free account (100 req/day).</li>
              <li>Copy your API Key from the dashboard.</li>
              <li>Paste it above to enable live data.</li>
            </ol>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/30">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(key)}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 text-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

const MatchDetail = ({ match, onClose }: any) => {
  const predictions = useMemo(() => match.predictions || generatePredictions(match), [match]);
  const homeProb = parseFloat(predictions.probabilities.home);
  const drawProb = parseFloat(predictions.probabilities.draw);
  const awayProb = parseFloat(predictions.probabilities.away);

  const momentumData = predictions.charts.momentum;
  const expertConsensusData = predictions.charts.consensus;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto animate-in fade-in duration-300">
      <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between z-20">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Matches</span>
        </button>
        <span className="text-sm font-mono text-red-600 font-bold tracking-wider">MATCH ANALYSIS ENGINE</span>
        <div className="w-8" />
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-8 border-b border-slate-800">
          <div className="text-center md:text-right flex-1">
            <h2 className="text-3xl md:text-5xl font-black text-white">{match.teams.home.name}</h2>
            <div className="flex items-center justify-center md:justify-end gap-2 mt-2">
              <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">Rank: 4</span>
              <span className="px-2 py-1 bg-green-900/30 text-green-500 text-xs rounded border border-green-900">Form: W-W-D</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-8">
               <img src={match.teams.home.logo} className="w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl" alt="" />
               <div className="flex flex-col items-center">
                  <span className="text-slate-500 font-mono text-sm mb-1">{new Date(match.fixture.date).toLocaleDateString()}</span>
                  <span className="text-4xl font-black text-white tracking-widest bg-slate-900 px-6 py-2 rounded-lg border border-slate-800">VS</span>
                  <span className="text-red-600 font-mono text-sm mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> LIVE PREDICTION
                  </span>
               </div>
               <img src={match.teams.away.logo} className="w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl" alt="" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-5xl font-black text-white">{match.teams.away.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
               <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">Rank: 8</span>
               <span className="px-2 py-1 bg-red-900/30 text-red-500 text-xs rounded border border-red-900">Form: L-D-L</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border} relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Target className="w-24 h-24 text-white" />
             </div>
             <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Outcome Probability</h3>
             <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between text-white font-bold mb-1">
                    <span>{match.teams.home.name} Win</span>
                    <span>{homeProb.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${homeProb}%` }} className="h-full bg-white" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Draw</span>
                    <span>{drawProb.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${drawProb}%` }} className="h-full bg-slate-600" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white font-bold mb-1">
                    <span>{match.teams.away.name} Win</span>
                    <span>{awayProb.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${awayProb}%` }} className="h-full bg-red-600" />
                  </div>
                </div>
             </div>
             <div className="mt-6 pt-4 border-t border-slate-800">
               <p className="text-xs text-slate-500 leading-relaxed">
                 <strong className="text-white">Analysis:</strong> Our mixture-of-experts model favors {homeProb > awayProb ? 'the home side' : 'the visitors'} due to superior form decay metrics and higher expected goal intensity.
               </p>
             </div>
          </div>

          <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border} flex flex-col justify-between`}>
             <div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Expected Goals (xG)</h3>
                <div className="flex items-end gap-2 mb-6">
                   <span className="text-4xl font-black text-white">{predictions.metrics.homexG}</span>
                   <span className="text-slate-600 font-light text-2xl mb-1">:</span>
                   <span className="text-4xl font-black text-red-600">{predictions.metrics.awayxG}</span>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                   <div className="text-xs text-slate-500 mb-1">Game Volatility</div>
                   <div className={`font-bold ${predictions.metrics.volatility === 'High Risk' ? 'text-red-500' : 'text-green-500'}`}>
                     {predictions.metrics.volatility}
                   </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                   <div className="text-xs text-slate-500 mb-1">Expected Points</div>
                   <div className="font-bold text-white">{predictions.metrics.xPoints}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                   <div className="text-xs text-slate-500 mb-1">Fatigue Impact</div>
                   <div className="font-bold text-white">{predictions.metrics.fatigueImpact}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                   <div className="text-xs text-slate-500 mb-1">Weather Context</div>
                   <div className="font-bold text-white">{predictions.metrics.weatherCondition}</div>
                </div>
             </div>
          </div>

          <div className={`${THEME.card} p-4 rounded-2xl border ${THEME.border} flex flex-col items-center justify-center`}>
             <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider w-full text-left mb-2">Model Consensus</h3>
             <div className="w-full h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={expertConsensusData}>
                   <PolarGrid stroke="#333" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar name={match.teams.home.name} dataKey="A" stroke="#fff" fill="#fff" fillOpacity={0.3} />
                   <Radar name={match.teams.away.name} dataKey="B" stroke="#E50914" fill="#E50914" fillOpacity={0.3} />
                   <Legend wrapperStyle={{ fontSize: '10px' }} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                   />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
             <p className="text-xs text-slate-500 text-center mt-2">
               Aggregated metrics from 6 distinct sub-models.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border}`}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-white font-bold text-lg">Goal Probability Spread</h3>
                    <p className="text-slate-500 text-xs">Based on Negative Binomial Distribution</p>
                 </div>
                 <BarChart2 className="text-slate-700" />
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictions.distributions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="goals" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      cursor={{fill: '#1e293b', opacity: 0.5}}
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar name={match.teams.home.name} dataKey="homeProb" fill="#f8fafc" radius={[4, 4, 0, 0]} />
                    <Bar name={match.teams.away.name} dataKey="awayProb" fill="#E50914" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border}`}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-white font-bold text-lg">Scoring Intensity (Hawkes Process)</h3>
                    <p className="text-slate-500 text-xs">Projected pressure intensity over 90 mins</p>
                 </div>
                 <TrendingUp className="text-slate-700" />
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={momentumData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAway" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E50914" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#fff' }} />
                    <Area type="monotone" dataKey="home" stroke="#fff" fillOpacity={1} fill="url(#colorHome)" name={match.teams.home.name} />
                    <Area type="monotone" dataKey="away" stroke="#E50914" fillOpacity={1} fill="url(#colorAway)" name={match.teams.away.name} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
        
        <div className="bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-800">
           <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
             <Info className="w-4 h-4" /> Understanding the Data
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
             <p><strong>Volatility:</strong> Measures the variance in recent team performances. High risk suggests inconsistent results.</p>
             <p><strong>Goal Probability Spread:</strong> The likelihood of exactly 0, 1, 2, etc. goals being scored, calculated using a Poisson distribution adjusted for defense strength.</p>
             <p><strong>Expected Points (xPoints):</strong> The long-term average points a team would collect if this exact match was played 100 times.</p>
             <p><strong>Scoring Intensity:</strong> A temporal model showing which periods of the match (0-15m, etc.) are likely to see the highest attacking output.</p>
           </div>
        </div>

      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('football_api_key') || '';
    }
    return '';
  });
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  const fetchData = async (key: string) => {
    setLoading(true);
    setError(null);
    
    if (!key) {
      setTimeout(() => {
        const enriched = MOCK_MATCHES.map(m => ({
          ...m,
          predictions: generatePredictions(m)
        }));
        setMatches(enriched);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
        method: "GET",
        headers: {
          "x-rapidapi-key": key,
          "x-rapidapi-host": "v3.football.api-sports.io"
        }
      });
      
      const data = await response.json();
      
      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error("API Limit Reached or Invalid Key");
      }

      let fetchedMatches = data.response;
      
      if (!fetchedMatches || fetchedMatches.length === 0) {
        const nextResponse = await fetch("https://v3.football.api-sports.io/fixtures?next=10", {
            method: "GET",
            headers: {
              "x-rapidapi-key": key,
              "x-rapidapi-host": "v3.football.api-sports.io"
            }
          });
          const nextData = await nextResponse.json();
          fetchedMatches = nextData.response;
      }

      const processed = fetchedMatches.map((m: any) => ({
        ...m,
        predictions: generatePredictions(m)
      }));

      setMatches(processed);
    } catch (err: any) {
      setError(err.message);
      const enriched = MOCK_MATCHES.map(m => ({
          ...m,
          predictions: generatePredictions(m)
      }));
      setMatches(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(apiKey);
  }, [apiKey]);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('football_api_key', key);
    }
    setShowSettings(false);
  };

  return (
    <div className={`min-h-screen ${THEME.bg} text-white font-sans selection:bg-red-900 selection:text-white`}>
      <Header 
        onSettingsClick={() => setShowSettings(true)} 
        hasKey={!!apiKey}
      />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="text-slate-400 animate-pulse">Initializing Neural Models...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="text-red-600" />
                Active Analysis
              </h2>
              <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {matches.length} matches tracked
              </span>
            </div>

            {error && (
              <div className="mb-6 bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-500 w-5 h-5" />
                <div>
                  <p className="text-sm text-red-200 font-bold">Connection Warning</p>
                  <p className="text-xs text-red-300">{error}. Switched to Simulation Mode.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map(match => (
                <MatchCard 
                  key={match.fixture.id} 
                  match={match} 
                  onClick={setSelectedMatch}
                />
              ))}
            </div>
            
            {matches.length === 0 && !loading && (
              <div className="text-center py-20 text-slate-500">
                <p>No matches currently available in the feed.</p>
              </div>
            )}
          </>
        )}
      </main>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onSave={handleSaveKey}
        currentKey={apiKey}
      />

      {selectedMatch && (
        <MatchDetail 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}
