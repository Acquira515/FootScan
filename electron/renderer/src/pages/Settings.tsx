import React, { useState } from 'react';
import backendAPI from '../api/backendApi';
import { useToast } from '../contexts/ToastContext';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    footballApiKey: '',
    newsApiKey: '',
    llmApiKey: '',
    defaultLeagueId: 2790,
    cacheTtl: 3600
  });
  const [saved, setSaved] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name.includes('Id') || name.includes('Ttl') ? parseInt(value) : value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await backendAPI.updateSettings(settings);
      setSaved(true);
      addToast('Settings saved successfully', 'success');
    } catch (error) {
      addToast('Failed to save settings', 'error');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Configure API keys and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6 max-w-2xl">
        {/* API Keys Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Football API Key</label>
              <input
                type="password"
                name="footballApiKey"
                value={settings.footballApiKey}
                onChange={handleChange}
                placeholder="Enter your football-data.org API key"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">From api.football-data.org</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">News API Key</label>
              <input
                type="password"
                name="newsApiKey"
                value={settings.newsApiKey}
                onChange={handleChange}
                placeholder="Enter your NewsAPI key"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">From newsapi.org</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">LLM API Key</label>
              <input
                type="password"
                name="llmApiKey"
                value={settings.llmApiKey}
                onChange={handleChange}
                placeholder="Enter your OpenAI API key"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">For explanations and insights</p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Default League ID</label>
              <input
                type="number"
                name="defaultLeagueId"
                value={settings.defaultLeagueId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">2790 = Premier League</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Cache TTL (seconds)</label>
              <input
                type="number"
                name="cacheTtl"
                value={settings.cacheTtl}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">How long to cache API responses</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Save Settings
          </button>
          {saved && (
            <span className="text-green-600 font-semibold flex items-center gap-2">
              ✓ Saved
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
        <h3 className="font-semibold mb-2">API Configuration</h3>
        <ul className="text-sm space-y-2 text-gray-700">
          <li>• Get Football API key from <code className="bg-white px-2 py-1 rounded">api.football-data.org</code></li>
          <li>• Get News API key from <code className="bg-white px-2 py-1 rounded">newsapi.org</code></li>
          <li>• Get LLM API key from <code className="bg-white px-2 py-1 rounded">openai.com</code></li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
