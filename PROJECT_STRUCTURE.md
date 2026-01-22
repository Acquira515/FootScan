# Project Structure Documentation

Comprehensive guide to the Football Prediction Desktop App architecture.

## 📁 Root Level

```
FootScan/
├── README.md              # Main documentation
├── QUICKSTART.md          # Quick start guide
├── LICENSE                # MIT License
├── package.json           # Root npm config (if monorepo)
└── .gitignore            # Git ignore rules
```

## 🔙 Backend (`backend/`)

### Core Application (`backend/app/`)

#### `main.py`
- **Purpose**: FastAPI application entry point
- **Endpoints**: All REST API routes
- **Startup**: Initializes database, services
- **Middleware**: CORS, error handling

```python
# Usage
python backend/app/main.py
# Runs on http://localhost:5000
```

#### `config.py`
- **Purpose**: Configuration management
- **Loads**: Environment variables from `.env`
- **Variables**:
  - API keys (Football, News, LLM)
  - Database path
  - Server host/port
  - Logging configuration

```python
from config import Config
league_id = Config.DEFAULT_LEAGUE_ID
api_key = Config.FOOTBALL_API_KEY
```

#### `logger.py`
- **Purpose**: Centralized logging
- **Output**: Console + rotating file logs
- **Level**: INFO, DEBUG, WARNING, ERROR

```python
from logger import setup_logger
logger = setup_logger(__name__)
logger.info("Message")
```

#### `database.py`
- **Purpose**: SQLite database management
- **Tables**:
  - `teams` - Team information
  - `matches` - Match data
  - `predictions` - Model predictions
  - `results` - Actual match results
  - `model_metrics` - Performance metrics
  - `cache` - Cached API responses
  - `team_stats` - Team statistics
  - `match_features` - Engineered features

```python
db = Database()
db.add_team(1, "Manchester United")
team = db.get_team(1)
matches = db.get_upcoming_matches(league_id=2790, days=7)
```

#### `cache.py`
- **Purpose**: Redis-like caching with SQLite backend
- **Methods**:
  - `get_cache(key)` - Retrieve cached value
  - `set_cache(key, value, ttl)` - Store value
  - `delete_cache(key)` - Remove entry
  - `cleanup_expired()` - Delete old entries

```python
cache = Cache()
data = cache.get_cache("matches_2790")
if not data:
    data = fetch_from_api()
    cache.set_cache("matches_2790", data, 3600)
```

### API Clients (`backend/app/api_clients/`)

#### `football_api.py`
- **Source**: api.football-data.org
- **Methods**:
  - `get_upcoming_matches(league_id, days)` - Scheduled matches
  - `get_match_stats(match_id)` - Match details
  - `get_team_stats(team_id)` - Team information
  - `get_head_to_head(home_id, away_id)` - H2H record
  - `get_injuries(team_id)` - Player injuries

```python
api = FootballAPIClient()
matches = api.get_upcoming_matches(2790, 7)
# Returns: [{id, home_team, away_team, date, odds}]
```

#### `news_api.py`
- **Source**: newsapi.org
- **Methods**:
  - `get_team_news(team_name, days)` - Recent news
  - `analyze_sentiment(articles)` - Sentiment analysis

```python
news = NewsAPIClient()
articles = news.get_team_news("Manchester United", 7)
sentiment = news.analyze_sentiment(articles)  # 0-1 scale
```

#### `llm_api.py`
- **Source**: OpenAI API (optional)
- **Methods**:
  - `generate_explanation(match_data, prediction)` - Prediction explanation
  - `extract_news_insights(articles)` - News analysis

```python
llm = LLMAPIClient()
explanation = llm.generate_explanation(match, prediction)
# Returns: "Man United favored due to home advantage..."
insights = llm.extract_news_insights(articles)
# Returns: {injuries: [...], form: "good", sentiment: 0.7}
```

### Models (`backend/app/models/`)

Each model implements:
- `fit(home_goals, away_goals, features)` - Train
- `predict(features)` - Generate prediction

#### `poisson.py`
- **Model**: Poisson regression
- **Parameters**: lambda_home, lambda_away
- **Output**: Score probabilities

#### `negative_binomial.py`
- **Model**: Negative Binomial (overdispersion handling)
- **Parameters**: mu, alpha (both home and away)
- **Use**: Better for high-scoring matches

#### `hawkes.py`
- **Model**: Hawkes point process (self-exciting)
- **Parameters**: lambda0, alpha, beta
- **Use**: Captures momentum effects

#### `hmm.py`
- **Model**: Hidden Markov Model
- **States**: Good, Medium, Poor form
- **Use**: Team form prediction

#### `mixture_expert.py`
- **Model**: Ensemble of all models
- **Weights**: Learned from backtesting
- **Use**: Best overall predictions

### Prediction Pipeline (`backend/app/prediction/`)

#### `predict.py`
Main orchestration:

```
1. Fetch match data from database
2. Fetch team statistics
3. Fetch news articles
4. Build feature vector
5. Get historical goals
6. Fit each model
7. Generate predictions
8. Ensemble results
9. Generate explanation
10. Save to database
```

Key functions:
- `predict_match(match_id)` - Single match
- `predict_upcoming(league_id, days)` - Multiple matches
- `_build_features()` - Feature engineering
- `_get_historical_goals()` - Training data

### Explainability (`backend/app/explainability/`)

#### `explain.py`
- `explain_prediction(match_data, prediction)` - Generate explanation
- Calls LLM or fallback to template

Output example:
```
"Manchester United are favorites with 65% win probability. 
The team's strong home record and Liverpool's recent injuries 
support this prediction. Confidence: 78%."
```

### Backtesting (`backend/app/backtest/`)

#### `backtest.py`
- `backtest_models(league_id, start_date, end_date)` - Run all models
- `_backtest_single_model()` - Individual model

Metrics calculated:
- **Accuracy**: % correct predictions
- **Log Loss**: Probability calibration
- **Brier Score**: Mean squared error
- **Calibration Curve**: Confidence vs accuracy

## 🖥️ Frontend (`electron/`)

### Main Files

#### `main.js`
- Electron main process
- Window creation
- Python backend startup
- Application menu

#### `preload.js`
- IPC bridge (Electron to React)
- Security context

#### `package.json`
- Dependencies: react, axios, router
- Dev dependencies: typescript, tailwindcss
- Build config: electron-builder

### React App (`electron/renderer/`)

#### `src/main.tsx`
- React DOM root
- App mount point

#### `src/App.tsx`
- Main layout component
- Navigation
- Toast notifications
- Route definitions

### Pages (`src/pages/`)

#### `Home.tsx`
- API status display
- Configuration overview
- Getting started guide

#### `Predict.tsx`
- Upcoming matches list
- Match prediction
- Result display
- Model/option selection

#### `Backtest.tsx`
- Backtest controls
- Results display
- Calibration curves

#### `History.tsx`
- Prediction history search
- Model metrics display
- Performance comparison

#### `Settings.tsx`
- API key configuration
- Preference settings
- Save/Load

### Components (`src/components/`)

#### `MatchTable.tsx`
- Displays list of matches
- Sortable columns
- Select match action

#### `PredictionCard.tsx`
- Prediction display
- Probability visualization
- Explanation text
- Match details

#### `ModelSelector.tsx`
- Model choice buttons
- Poisson, NB, Hawkes, HMM, Ensemble

#### `LoadingSpinner.tsx`
- Animated loading indicator
- Optional text
- Size variants

#### `Toast.tsx`
- Notification message
- Auto-dismiss
- Type: success, error, info

### API Client (`src/api/`)

#### `backendApi.ts`
- HTTP client (axios)
- All backend endpoint calls
- Error handling
- Default config

Methods:
- `getStatus()` - Health check
- `getMatches()` - Fetch matches
- `predictMatch()` - Single prediction
- `predictUpcoming()` - Batch prediction
- `runBacktest()` - Run backtest
- `getMetrics()` - Model metrics
- etc.

### Contexts (`src/contexts/`)

#### `ToastContext.tsx`
- Global toast/notification state
- Hooks: `useToast()`
- Methods: `addToast()`, `removeToast()`

### Styles (`src/styles/`)

#### `globals.css`
- Tailwind imports
- Global CSS
- Custom utilities

### Configuration

#### `tsconfig.json`
- TypeScript config
- Strict mode enabled
- Path aliases

#### `tailwind.config.js`
- Tailwind CSS config
- Custom theme colors (if any)
- Plugins

#### `postcss.config.js`
- Tailwind and autoprefixer

#### `public/index.html`
- HTML template
- Meta tags
- Root element

## 📜 Scripts (`scripts/`)

#### `build_windows.bat`
- Installs npm dependencies
- Builds React app
- Installs Python packages
- Creates PyInstaller executable
- Builds Electron installer

#### `start_dev.bat`
- Installs dependencies
- Starts Python backend
- Starts Electron + React dev server

## 📦 Dependencies

### Backend (`requirements.txt`)
```
fastapi==0.104.1         # Web framework
uvicorn==0.24.0          # ASGI server
requests==2.31.0         # HTTP client
numpy==1.24.3            # Numerical computing
scipy==1.11.4            # Scientific computing
scikit-learn==1.3.2      # Machine learning
pandas==2.1.3            # Data analysis
python-dotenv==1.0.0     # Environment config
```

### Frontend (`electron/renderer/package.json`)
```
react==18.2.0            # UI framework
react-dom==18.2.0        # React DOM
react-router-dom==6.20.0 # Routing
axios==1.6.1             # HTTP client
tailwindcss==3.4.0       # CSS framework
electron==27.0.0         # Desktop runtime
electron-builder==24.6.4 # Packaging
```

## 🔄 Data Flow

### Prediction Request
```
User clicks "Predict" 
    ↓
Electron sends GET /api/predict?match_id=X
    ↓
Backend fetches match data from DB
    ↓
Fetches team stats
    ↓
Fetches news (optional)
    ↓
Builds features
    ↓
Runs 5 models in parallel
    ↓
Ensemble combines results
    ↓
LLM generates explanation
    ↓
Results saved to DB
    ↓
Response returned to Electron
    ↓
React renders PredictionCard
    ↓
Toast notification shown
```

## 📊 Database Schema

```sql
teams (id, name, country, founded_year)
matches (id, external_id, home_team_id, away_team_id, 
         home_team_name, away_team_name, league_id, 
         match_date, home_score, away_score, status, odds_home, 
         odds_draw, odds_away)
predictions (id, match_id, model_type, home_probability, 
             draw_probability, away_probability, 
             predicted_score, confidence, explanation)
results (id, match_id, prediction_id, actual_result, 
         accuracy_score, log_loss, brier_score)
model_metrics (id, model_type, metric_type, metric_value, 
               period_start, period_end, sample_size)
cache (cache_key, cache_value, ttl_seconds, expires_at)
team_stats (team_id, matches_played, wins, draws, losses, 
            goals_for, goals_against, form_rating)
match_features (match_id, home_form, away_form, 
                home_attack_strength, away_attack_strength, 
                home_defense_strength, away_defense_strength)
```

## 🚀 Deployment

### Windows Installer Creation

1. Build process:
```
npm install → npm run react-build → pip install → 
PyInstaller → electron-builder → NSIS installer
```

2. Output: `electron/dist/Football Prediction Setup.exe`

3. Size: ~500MB (includes all dependencies)

### Running in Production

- Single executable installer
- Auto-extracts to Program Files
- Creates Start Menu shortcuts
- No dependency installation needed

---

**Last Updated**: January 2025
