import React, { useState, useEffect } from 'react';
import backendAPI from '../api/backendApi';
import LoadingSpinner from '../components/LoadingSpinner';
import MatchTable from '../components/MatchTable';
import PredictionCard from '../components/PredictionCard';
import ModelSelector from '../components/ModelSelector';
import { useToast } from '../contexts/ToastContext';

const Predict: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [leagueId, setLeagueId] = useState(2790);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [useNews, setUseNews] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, [leagueId, days]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await backendAPI.getMatches(leagueId, days);
      setMatches(res.data.data || []);
    } catch (error) {
      addToast('Failed to fetch matches', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMatch = async (matchId: number) => {
    try {
      setLoading(true);
      setSelectedMatch(matches.find(m => m.id === matchId));
      const res = await backendAPI.predictMatch(matchId, leagueId, useNews);
      setPrediction(res.data.data);
      addToast('Prediction generated', 'success');
    } catch (error) {
      addToast('Failed to predict match', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictAll = async () => {
    try {
      setLoading(true);
      const res = await backendAPI.predictUpcoming(leagueId, days, useNews);
      if (res.data.data && res.data.data.length > 0) {
        setPrediction(res.data.data[0]);
        setSelectedMatch(res.data.data[0]);
        addToast(`Predicted ${res.data.count} matches`, 'success');
      }
    } catch (error) {
      addToast('Failed to predict upcoming matches', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Match Predictions</h1>
        <p className="text-gray-600">Get AI-powered predictions for football matches</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">League ID</label>
            <input
              type="number"
              value={leagueId}
              onChange={(e) => setLeagueId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="2790"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Days Ahead</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="30"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useNews}
                onChange={(e) => setUseNews(e.target.checked)}
              />
              <span className="text-sm font-semibold">Include News</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {loading ? 'Loading...' : 'Fetch Matches'}
          </button>
          <button
            onClick={handlePredictAll}
            disabled={loading || matches.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Predict All
          </button>
        </div>
      </div>

      {/* Model Selector */}
      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matches List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
          {loading && !selectedMatch ? (
            <LoadingSpinner size="small" />
          ) : (
            <MatchTable
              matches={matches}
              onSelectMatch={handleSelectMatch}
              loading={loading}
            />
          )}
        </div>

        {/* Prediction Detail */}
        <div className="lg:col-span-2">
          {loading ? (
            <LoadingSpinner text="Generating prediction..." />
          ) : prediction && selectedMatch ? (
            <PredictionCard
              homeTeam={selectedMatch.home_team_name}
              awayTeam={selectedMatch.away_team_name}
              homeProb={prediction.home_probability}
              drawProb={prediction.draw_probability}
              awayProb={prediction.away_probability}
              predictedScore={prediction.predicted_score}
              confidence={prediction.confidence}
              explanation={prediction.explanation || 'Analysis in progress...'}
              matchDate={selectedMatch.match_date}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a match to see prediction details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predict;
