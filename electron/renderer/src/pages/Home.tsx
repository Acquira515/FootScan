import React, { useState, useEffect } from 'react';
import backendAPI from '../api/backendApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';

const Home: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const statusRes = await backendAPI.getStatus();
      const settingsRes = await backendAPI.getSettings();
      setApiStatus(statusRes.data);
      setSettings(settingsRes.data.data);
      addToast('Backend connected successfully', 'success');
    } catch (error) {
      addToast('Failed to connect to backend', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Initializing..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Football Prediction</h1>
        <p className="text-gray-600">Advanced statistical match prediction system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          {apiStatus && (
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">{apiStatus.status}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-semibold">{apiStatus.version}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-semibold">{apiStatus.environment}</span>
              </p>
            </div>
          )}
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          {settings && (
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Default League:</span>
                <span className="font-semibold">{settings.default_league_id}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Cache TTL:</span>
                <span className="font-semibold">{settings.cache_ttl}s</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Backtest Period:</span>
                <span className="font-semibold">
                  {settings.backtest_start} to {settings.backtest_end}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
        <ul className="space-y-2 text-gray-700">
          <li>✓ Go to <strong>Predict</strong> to make predictions for upcoming matches</li>
          <li>✓ Check <strong>History</strong> to view past predictions and results</li>
          <li>✓ Run <strong>Backtest</strong> to evaluate model performance</li>
          <li>✓ Adjust <strong>Settings</strong> for API keys and preferences</li>
        </ul>
      </div>

      <button
        onClick={checkStatus}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
      >
        Refresh Status
      </button>
    </div>
  );
};

export default Home;
