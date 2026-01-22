# Development Notes

## Getting Started as a Developer

### 1. Initial Setup (5 minutes)

```bash
# Clone and enter directory
cd FootScan

# Install Python dependencies
pip install -r backend/requirements.txt

# Install Node dependencies
cd electron/renderer
npm install
cd ../..

# Copy environment file
copy backend\app\.env.example backend\app\.env

# Edit .env with your API keys (optional, app works without)
```

### 2. Running in Development

**Option A: Using startup script (Windows)**
```bash
scripts\start_dev.bat
```

**Option B: Manual (3 terminals)**

Terminal 1 - Backend:
```bash
cd backend
python run.py
# Or: python app/main.py
```

Terminal 2 - React dev server:
```bash
cd electron/renderer
npm start
```

Terminal 3 - Electron (wait for React to start):
```bash
cd electron
npm start
```

### 3. Testing Components

**Test Backend API**
```bash
cd backend/app
python test_backend.py
```

**Test Individual Models**
```python
from models.poisson import PoissonModel
import numpy as np

model = PoissonModel()
model.fit(np.array([1,2,1,3]), np.array([1,1,2,1]))
prediction = model.predict()
print(prediction)
```

**Test Database**
```python
from database import Database

db = Database()
db.add_team(1, "Manchester United")
team = db.get_team(1)
print(team)
```

---

## Common Development Tasks

### Adding a New Endpoint

1. Add function to `backend/app/main.py`:
```python
@app.get("/api/new-endpoint")
async def new_endpoint(param: int = Query(...)):
    """New endpoint documentation."""
    try:
        # Implementation
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

2. Add client method in `electron/renderer/src/api/backendApi.ts`:
```typescript
async getNewData(param: number) {
    return this.api.get('/new-endpoint', { params: { param } });
}
```

3. Use in React component:
```typescript
const data = await backendAPI.getNewData(123);
```

### Adding a New Page

1. Create page in `electron/renderer/src/pages/NewPage.tsx`:
```typescript
import React from 'react';

const NewPage: React.FC = () => {
  return <div>New Page</div>;
};

export default NewPage;
```

2. Add route in `electron/renderer/src/App.tsx`:
```typescript
<Route path="/newpage" element={<NewPage />} />
```

3. Add navigation link in `Navigation` component

### Adding a New Model

1. Create `backend/app/models/new_model.py`:
```python
class NewModel:
    def __init__(self):
        pass
    
    def fit(self, home_goals, away_goals, features=None):
        pass
    
    def predict(self, features=None):
        return {
            "home_probability": 0.33,
            "draw_probability": 0.34,
            "away_probability": 0.33,
            "predicted_score": "1-1"
        }
```

2. Update `PredictionPipeline` in `backend/app/prediction/predict.py`:
```python
from models.new_model import NewModel

self.new_model = NewModel()

# In predict_match method:
self.new_model.fit(home_goals, away_goals, features)
predictions['new_model'] = self.new_model.predict(features)
```

---

## Debugging Tips

### Backend Issues

**Check logs:**
```bash
# View log file
type app.log

# Or enable debug mode in .env
DEBUG=True
```

**Test endpoints:**
```bash
# Using curl
curl http://localhost:5000/status

# Or use browser
http://localhost:5000/status

# Or use Python requests
import requests
r = requests.get('http://localhost:5000/api/matches')
print(r.json())
```

**Database issues:**
```python
from database import Database
db = Database()

# Check tables
import sqlite3
conn = sqlite3.connect(db.db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
print(cursor.fetchall())
```

### Frontend Issues

**Check browser console:**
- Open DevTools: Ctrl+I
- Look for errors in Console tab
- Check Network tab for API failures

**React specific:**
- Use React DevTools browser extension
- Check component state and props

**Electron specific:**
- Look for main process errors
- Check preload script IPC bridge

### API Integration Issues

**Test API connectivity:**
```bash
# Football API
curl -H "X-Auth-Token: YOUR_KEY" \
  "https://api.football-data.org/v4/competitions/2790/matches"

# News API
curl "https://newsapi.org/v2/everything?q=football&apiKey=YOUR_KEY"

# OpenAI
curl -H "Authorization: Bearer YOUR_KEY" \
  https://api.openai.com/v1/models
```

---

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Use logging not print()

### TypeScript (Frontend)
- Use interfaces for types
- Document React components
- Follow React hooks best practices
- Use React.FC for components

---

## Building for Release

### Full Build Process

```bash
# Build script handles all steps
scripts\build_windows.bat

# Or manually:

# 1. Build React app
cd electron/renderer
npm run react-build

# 2. Install Python dependencies
cd ../../backend
pip install -r requirements.txt

# 3. Create Python executable
cd app
pyinstaller --onefile --windowed main.py

# 4. Build Electron app
cd ../../electron
npm run build-win

# Output: electron/dist/Football Prediction Setup.exe
```

---

## Performance Optimization

### Backend
- Use caching for API responses (already implemented)
- Database queries are indexed on match_id
- Consider pagination for large result sets
- Monitor log file size (auto-rotated at 10MB)

### Frontend
- React code splitting (React Router handles this)
- Use memo() for expensive components
- Lazy load pages with React.lazy()

### Models
- Predictions run in parallel (no optimization needed)
- Consider batch predictions for multiple matches
- Cache model parameters if reusing

---

## Testing Workflow

1. **Unit Tests** (Optional - add as needed)
```bash
cd backend
pytest tests/
```

2. **Integration Tests**
```bash
cd backend/app
python test_backend.py
```

3. **Manual Testing**
- Start development server
- Use browser to test UI
- Use curl/Postman to test API endpoints

4. **Performance Testing**
- Use browser DevTools
- Monitor backend logs for slow queries

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally
# Commit
git commit -m "Add new feature"

# Push
git push origin feature/new-feature

# Create pull request on GitHub
```

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive: "Add prediction explanation endpoint" not "Fix bug"
- Reference issues: "Fixes #123"

---

## Database Migration (if needed)

The database is auto-created on first run. To reset:

```python
import os
from database import Database
from config import Config

# Remove old database
os.remove(Config.DATABASE_PATH)

# Create new one
db = Database()
```

Or manually:
```bash
rm football_predictions.db
python app/main.py
```

---

## Deployment Checklist

Before building for release:

- [ ] All API keys configured (or provide .env template)
- [ ] Environment set to "production" in .env
- [ ] Debug mode disabled
- [ ] Version number updated
- [ ] All endpoints tested
- [ ] UI responsive on 1400x900+
- [ ] Build script runs without errors
- [ ] Installer tested on clean Windows machine
- [ ] Documentation updated
- [ ] Release notes prepared

---

## Useful Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Electron: https://www.electronjs.org/docs
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

### APIs
- Football Data: https://www.football-data.org/
- NewsAPI: https://newsapi.org/docs
- OpenAI: https://platform.openai.com/docs

### Tools
- Postman: API testing
- React DevTools: Browser extension
- Electron DevTools: Built-in
- SQLite Browser: Database visualization

---

## Troubleshooting Build Issues

| Issue | Solution |
|-------|----------|
| Node not found | Install Node.js from nodejs.org |
| Python not found | Add Python to PATH or use full path |
| npm install fails | Run `npm cache clean --force` |
| Build hangs | Check internet connection, retry |
| Installer won't create | Check disk space, run as admin |
| React won't start | Delete node_modules and reinstall |
| Backend won't connect | Check port 5000 not in use, firewall |

---

## Performance Benchmarks

Typical performance on modern hardware:

- Backend startup: < 2 seconds
- Predict single match: 1-3 seconds (depends on news API)
- Backtest 100 matches: 5-10 seconds
- Frontend load time: < 1 second

---

## Future Improvements

- Add automated tests (pytest, Jest)
- Add CI/CD pipeline (GitHub Actions)
- Add more statistical models
- Add real-time predictions
- Add betting integration
- Add mobile app
- Add cloud deployment option
- Add advanced analytics dashboard

---

*Happy coding! 🚀*
