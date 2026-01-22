import React, { useState, useEffect } from 'react';
import backendAPI from '../api/backendApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';

const Backtest: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [leagueId, setLeagueId] = useState(2790);
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [calibration, setCalibration] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const { addToast } = useToast();

  const handleBacktest = async () => {
    try {
      setLoading(true);
      const res = await backendAPI.runBacktest(leagueId, startDate, endDate);
      setResults(res.data.data);
      addToast('Backtest completed', 'success');
    } catch (error) {
      addToast('Failed to run backtest', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCalibration = async () => {
    try {
      setLoading(true);
      const res = await backendAPI.getCalibration(selectedModel, leagueId);
      setCalibration(res.data.data);
      addToast('Calibration data loaded', 'success');
    } catch (error) {
      addToast('Failed to load calibration data', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Backtest Models</h1>
        <p className="text-gray-600">Evaluate prediction model performance</p>
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
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={handleBacktest}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          {loading ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(results).map(([model, data]: any) => (
            <div key={model} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 capitalize">{model}</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-semibold">{(data.accuracy * 100).toFixed(2)}%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Log Loss:</span>
                  <span className="font-semibold">{data.log_loss.toFixed(4)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Brier Score:</span>
                  <span className="font-semibold">{data.brier_score.toFixed(4)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Matches:</span>
                  <span className="font-semibold">{data.count}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calibration */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Select Model for Calibration</label>
          <div className="flex gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            >
              <option value="ensemble">Ensemble</option>
              <option value="poisson">Poisson</option>
              <option value="negative_binomial">Negative Binomial</option>
              <option value="hawkes">Hawkes</option>
              <option value="hmm">HMM</option>
            </select>
            <button
              onClick={handleLoadCalibration}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Load
            </button>
          </div>
        </div>

        {calibration && (
          <div>
            <h3 className="font-semibold mb-3">Calibration Data</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">Confidence vs Accuracy</p>
              <div className="space-y-1">
                {calibration.confidence && calibration.confidence.map((conf: number, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">{conf.toFixed(2)}</span>
                    <div className="flex-1 bg-gray-200 h-6 rounded relative">
                      <div
                        className="bg-blue-500 h-6 rounded"
                        style={{ width: `${(calibration.accuracy[idx] || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-12 text-right">
                      {((calibration.accuracy[idx] || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Processing..." />}
    </div>
  );
};

export default Backtest;
