# FootScan

Advanced football match prediction system powered by machine learning and statistical analysis. FootScan provides real-time match outcome predictions, expected goals analysis, and consensus scoring from multiple predictive models.

## Overview

FootScan utilizes a mixture-of-experts architecture combining Elo ratings, recent form analysis, Poisson distributions, and contextual factors including fatigue and weather conditions. The system operates in hybrid mode, supporting both live API data from api-football.com and built-in simulation mode for demonstrations.

## Features

Match Prediction Engine
- Home win, draw, and away win probability calculations
- Confidence scoring based on multi-model consensus
- Real-time updates via api-football.com integration
- Fallback simulation mode for continuous operation

Expected Goals Analysis
- Poisson distribution-based goal probability modeling
- Expected goal (xG) differential calculations
- Exact score probability distributions
- Volatility assessment for game stability prediction

Advanced Analytics
- Consensus radar charts comparing prediction models
- Scoring intensity visualization over 90-minute match duration
- Team form momentum tracking with exponential decay weighting
- Defensive resilience and attacking efficiency metrics

Contextual Modeling
- Dynamic home field advantage adjustment
- Fatigue accumulation from rest days and roster depth
- Weather impact simulation on goal-scoring probabilities
- League-tier adjustments for competition strength variation

User Interface
- Premium dark theme with professional styling
- Fully responsive across desktop and mobile devices
- Real-time match card updates
- Interactive detailed match analysis views

## Getting Started

### Requirements

Node.js 18.x or later
npm or yarn package manager

### Installation

```
git clone <repository-url>
cd FootScan
npm install
```

### Running Locally

```
npm run dev
```

Application launches at http://localhost:3000

Simulation mode starts automatically. To enable live data, enter an API key via the settings panel.

### Production Deployment

```
npm run build
npm start
```

## API Configuration

The application operates in two distinct modes:

Simulation Mode (Default)
- No API key required
- Uses structured mock match data
- Ideal for evaluation and demonstration
- Full feature access including predictions and analytics

Live Mode
- Requires free API key from api-football.com
- Fetches current and upcoming matches
- Real team data and current fixtures
- 100 requests per day on free tier

To obtain an API key:
1. Visit api-football.com
2. Create free account
3. Copy API key from dashboard
4. Enter in application Settings
5. Data persists via browser localStorage

## Browser Compatibility

- Chrome/Edge 90 and later
- Firefox 88 and later
- Safari 14 and later

Desktop and mobile compatible.

## Technical Architecture

Single-file implementation containing all algorithmic systems, UI components, and state management. Technology stack includes React 18.2+, Next.js 14, Tailwind CSS, and Recharts.

## Predictive Models

The system integrates 13+ calculation layers:

Elo Rating System - Quantifies relative team strength
Poisson Distribution - Probability modeling for goal counts
Exponential Form Decay - Time-weighted recent performance
League Tier Adjustment - Competition strength normalization
Head-to-Head Analysis - Historical matchup patterns
Home Field Advantage - Dynamic crowd factor integration
Defensive Resilience - Expected goal absorption capability
Clinical Efficiency - Offensive conversion rates
Draw Saturation - Competitive balance modeling
Fatigue Accumulation - Rest and squad depth factors
Weather Impact - Condition-based goal dampening
Season Progress - Temporal confidence calibration
Consensus Confidence - Multi-model agreement measurement

## Performance Notes

Processing typically completes in under 1 second. Chart visualizations use progressive rendering. All calculations execute client-side with no backend dependency beyond API calls.

## Data Privacy

API keys are stored exclusively in browser localStorage and never transmitted to external servers. No personal data collection. Session-based storage only.

## Support

For technical issues or feature requests, contact through repository channels or visit api-football.com for API-specific assistance.

## License

MIT

---

FootScan is a demonstration system designed for evaluative purposes. Production predictions would require extensive historical training data and continuous model validation.