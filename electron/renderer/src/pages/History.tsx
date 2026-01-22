import React, { useState, useEffect } from 'react';
import backendAPI from '../api/backendApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';

const History: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchId, setMatchId] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const { addToast } = useToast();

  const handleLoadPredictions = async () => {
    if (!matchId) {
      addToast('Please enter a match ID', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await backendAPI.getPredictions(parseInt(matchId));
      setPredictions(res.data.data || []);
      addToast(`Loaded ${res.data.data.length} predictions`, 'success');
    } catch (error) {
      addToast('Failed to load predictions', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMetrics = async () => {
    try {
      setLoading(true);
      const res = await backendAPI.getMetrics(selectedModel || undefined);
      setMetrics(res.data.data || []);
      addToast(`Loaded ${res.data.data.length} metrics`, 'success');
    } catch (error) {
      addToast('Failed to load metrics', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Prediction History</h1>
        <p className="text-gray-600">View past predictions and model metrics</p>
      </div>

      {/* Predictions Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Match Predictions</h2>
        
        <div className="flex gap-2">
          <input
            type="number"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Enter match ID"
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleLoadPredictions}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {predictions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Model</th>
                  <th className="px-4 py-2 text-left">Prediction</th>
                  <th className="px-4 py-2 text-left">Score</th>
                  <th className="px-4 py-2 text-left">Confidence</th>
                  <th className="px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{pred.model_type}</td>
                    <td className="px-4 py-2">
                      <span className="text-blue-600 font-semibold">{pred.predicted_score}</span>
                    </td>
                    <td className="px-4 py-2">
                      {pred.home_probability.toFixed(2)} / {pred.draw_probability.toFixed(2)} / {pred.away_probability.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{(pred.confidence * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {new Date(pred.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Metrics Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Model Metrics</h2>
        
        <div className="flex gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          >
            <option value="">All Models</option>
            <option value="poisson">Poisson</option>
            <option value="negative_binomial">Negative Binomial</option>
            <option value="hawkes">Hawkes</option>
            <option value="hmm">HMM</option>
            <option value="ensemble">Ensemble</option>
          </select>
          <button
            onClick={handleLoadMetrics}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {metrics.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Model</th>
                  <th className="px-4 py-2 text-left">Metric</th>
                  <th className="px-4 py-2 text-left">Value</th>
                  <th className="px-4 py-2 text-left">Period</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{metric.model_type}</td>
                    <td className="px-4 py-2">{metric.metric_type}</td>
                    <td className="px-4 py-2 text-blue-600 font-semibold">{metric.metric_value.toFixed(4)}</td>
                    <td className="px-4 py-2 text-xs">
                      {metric.period_start} to {metric.period_end}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Loading..." />}
    </div>
  );
};

export default History;
