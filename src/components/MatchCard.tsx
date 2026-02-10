'use client';

import { Clock } from 'lucide-react';
import { THEME } from '@/constants/theme';

interface MatchCardProps {
  match: any;
  onClick: (match: any) => void;
}

export const MatchCard = ({ match, onClick }: MatchCardProps) => {
  const date = new Date(match.fixture.date);
  const predictions = match.predictions || { probabilities: { home: 50, draw: 25, away: 25 } };
  const confidence = predictions.metrics?.confidenceScore || Math.max(predictions.probabilities.home, predictions.probabilities.away).toFixed(0);

  return (
    <div 
      onClick={() => onClick(match)}
      className={`${THEME.card} ${THEME.border} border rounded-xl p-0 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/10 overflow-hidden group`}
    >
      {/* League Header */}
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

      {/* Teams */}
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
        
        {/* Background Graphic */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-50" />
      </div>

      {/* Quick Prediction Bar */}
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
