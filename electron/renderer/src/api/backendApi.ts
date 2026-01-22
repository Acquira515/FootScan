import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class BackendAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Status
  async getStatus() {
    return this.api.get('/status');
  }

  // Matches
  async getMatches(leagueId: number = 2790, days: number = 7) {
    return this.api.get('/matches', {
      params: { league_id: leagueId, days }
    });
  }

  // Predictions
  async predictMatch(matchId: number, leagueId: number = 2790, useNews: boolean = true) {
    return this.api.post('/predict', null, {
      params: { match_id: matchId, league_id: leagueId, use_news: useNews }
    });
  }

  async predictUpcoming(leagueId: number = 2790, days: number = 7, useNews: boolean = true) {
    return this.api.post('/predict/upcoming', null, {
      params: { league_id: leagueId, days, use_news: useNews }
    });
  }

  async getPredictions(matchId: number) {
    return this.api.get(`/predictions/${matchId}`);
  }

  // Backtest
  async runBacktest(
    leagueId: number = 2790,
    startDate: string = '2023-01-01',
    endDate: string = '2024-12-31',
    models?: string[]
  ) {
    return this.api.post('/backtest', null, {
      params: { league_id: leagueId, start_date: startDate, end_date: endDate, models }
    });
  }

  // Metrics
  async getMetrics(modelType?: string) {
    return this.api.get('/metrics', {
      params: { model_type: modelType }
    });
  }

  // News
  async getTeamNews(teamName: string, days: number = 7) {
    return this.api.get(`/news/${teamName}`, { params: { days } });
  }

  // Calibration
  async getCalibration(modelType: string, leagueId: number = 2790) {
    return this.api.get(`/calibration/${modelType}`, {
      params: { league_id: leagueId }
    });
  }

  // Settings
  async getSettings() {
    return this.api.get('/settings');
  }

  async updateSettings(settings: any) {
    return this.api.post('/settings', settings);
  }
}

export default new BackendAPI();
