'use client';

import { useMemo } from 'react';
import { ChevronLeft, Target, BarChart2, TrendingUp, Info } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { THEME } from '@/constants/theme';
import { generatePredictions } from '@/lib/predictions';

interface MatchDetailProps {
  match: any;
  onClose: () => void;
}

export const MatchDetail = ({ match, onClose }: MatchDetailProps) => {
  const predictions = useMemo(() => match.predictions || generatePredictions(match), [match]);
  const homeProb = parseFloat(predictions.probabilities.home);
  const drawProb = parseFloat(predictions.probabilities.draw);
  const awayProb = parseFloat(predictions.probabilities.away);

  const momentumData = predictions.charts.momentum;
  const expertConsensusData = predictions.charts.consensus;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto animate-in fade-in duration-300">
      {/* Detail Header */}
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
        
        {/* Match Header Hero */}
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
                    LIVE PREDICTION
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

        {/* Primary Prediction Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Win Probability */}
          <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border} relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Target className="w-24 h-24 text-white" />
             </div>
             <div className="flex items-center justify-between">
               <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Outcome Probability</h3>
               <div className="text-right">
                 <div className="text-xs text-slate-400">Consensus</div>
                 <div className="text-sm font-bold text-white">{predictions.probabilities.home}% / {predictions.probabilities.draw}% / {predictions.probabilities.away}%</div>
               </div>
             </div>
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

          {/* Expected Goals (xG) */}
          <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border} flex flex-col justify-between`}>
             <div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Expected Goals (xG)</h3>
                <div className="flex items-end gap-2 mb-6">
                   <span className="text-4xl font-black text-white">{predictions.metrics.homexG}</span>
                   <span className="text-slate-600 font-light text-2xl mb-1">:</span>
                   <span className="text-4xl font-black text-red-600">{predictions.metrics.awayxG}</span>
                </div>
             </div>
             
             {/* Stats Grid */}
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

          {/* Consensus Radar */}
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
              Aggregated metrics from all 13 models.
            </p>
          </div>
        </div>

        {/* Detailed per-model breakdown */}
        <div className="mt-6">
          <h3 className="text-white font-bold mb-3">Model Contributions</h3>
          <div className="grid grid-cols-1 gap-3">
            {(predictions.modelBreakdown || []).map((m: any) => (
              <div key={m.name} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{m.name}</span>
                    <span className="text-xs text-slate-400">weight: {(m.weight*100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">Confidence</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-sm rounded text-white">{m.confidence}%</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${Math.round(m.home*100)}%` }} className="bg-white h-full" title={`Home ${Math.round(m.home*100)}%`} />
                  <div style={{ width: `${Math.round(m.draw*100)}%` }} className="bg-slate-600 h-full" title={`Draw ${Math.round(m.draw*100)}%`} />
                  <div style={{ width: `${Math.round(m.away*100)}%` }} className="bg-red-600 h-full" title={`Away ${Math.round(m.away*100)}%`} />
                </div>

                <div className="mt-2 text-xs text-slate-400 flex justify-between">
                  <span>Home {Math.round(m.home*100)}%</span>
                  <span>Draw {Math.round(m.draw*100)}%</span>
                  <span>Away {Math.round(m.away*100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deep Dive Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Goal Probability Distribution */}
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

           {/* Game Intensity / Momentum */}
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
        
        {/* Helper Section */}
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
