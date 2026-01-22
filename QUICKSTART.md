# Quick Start Guide

Get Football Prediction Desktop running in 5 minutes.

## ⚡ For Users (Download & Install)

### Windows Installation

1. **Download** the installer from releases
2. **Run** `Football Prediction Setup.exe`
3. **Follow** the installation wizard
4. **Launch** from Desktop or Start Menu

### First Run

1. **Open Settings** tab
2. **Add your API keys**:
   - Get free Football API key: https://www.football-data.org/
   - Get free News API key: https://newsapi.org/
   - Get LLM API key (optional): https://openai.com/
3. **Click Save**
4. **Go to Predict** and start making predictions!

## 👨‍💻 For Developers (Build from Source)

### Prerequisites

- **Windows 10/11**
- **Node.js 16+**: https://nodejs.org/
- **Python 3.8+**: https://www.python.org/
- **Git**: https://git-scm.com/

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/FootScan.git
cd FootScan
```

### Step 2: Setup Backend

```bash
# Copy environment file
copy backend\app\.env.example backend\app\.env

# Edit .env with your API keys
# Open in notepad: backend\app\.env

# Install Python dependencies
pip install -r backend\requirements.txt
```

### Step 3: Setup Frontend

```bash
cd electron\renderer

# Install Node dependencies
npm install

# Install Tailwind and other tools
npm install -D tailwindcss postcss autoprefixer
npm install axios react-router-dom

cd ..\..
```

### Step 4: Run Development Server

**Option A: Using batch script (Windows)**
```bash
scripts\start_dev.bat
```

**Option B: Manual start**
```bash
# Terminal 1: Start backend
python backend\app\main.py

# Terminal 2: Start frontend (wait 3 seconds)
cd electron\renderer
npm start
```

The app will open automatically. Backend runs on `http://localhost:5000`.

### Step 5: Build for Distribution

```bash
scripts\build_windows.bat
```

The installer will be created at: `electron/dist/Football Prediction Setup.exe`

## 🎯 Common Tasks

### Add API Keys

1. Open app → Settings tab
2. Enter your API keys
3. Click "Save Settings"
4. Restart app

### Make Predictions

1. Go to "Predict" tab
2. Select league (default: Premier League)
3. Choose number of days ahead
4. Optional: Enable "Include News"
5. Click "Fetch Matches" then "Predict All"

### Evaluate Models

1. Go to "Backtest" tab
2. Set date range (e.g., 2024-01-01 to 2024-12-31)
3. Click "Run Backtest"
4. View metrics for each model

### Check History

1. Go to "History" tab
2. Enter a match ID
3. Click "Load"
4. View all predictions and accuracy

## 🚨 Troubleshooting

### "Backend connection failed"
- Check Python is running: `python backend/app/main.py`
- Verify localhost:5000 is accessible
- Check Windows Firewall

### "npm command not found"
- Restart terminal after installing Node.js
- Or add Node to PATH manually

### "ModuleNotFoundError"
```bash
# Reinstall Python dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### "Cannot find module" (React/TypeScript)
```bash
cd electron/renderer
npm install
npm start
```

### Slow predictions
- Disable "Include News" in Predict tab
- Use ensemble model (faster than individual models)
- Clear cache in settings

## 📞 Support

- **Issues**: Report bugs on GitHub
- **Features**: Suggest on GitHub Discussions
- **Questions**: Check Wiki or FAQ

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [FastAPI Guide](https://fastapi.tiangolo.com/)
- [Electron Tutorial](https://www.electronjs.org/docs)
- [Statistical Modeling](https://www.statsmodels.org/)

## 📦 What Gets Installed

- **Node Modules**: React, routing, HTTP client (~500MB)
- **Python Packages**: Scientific libraries (~300MB)
- **Electron App**: Desktop runtime (~150MB)
- **Total**: ~1-1.5GB

## ✅ Verification

After installation:

```bash
# Check backend
curl http://localhost:5000/status

# Should return:
# {"status": "ok", "version": "1.0.0", ...}

# Check frontend
# App window should open with home page
```

## 🔄 Updates

To update to latest version:

```bash
# Pull latest code
git pull

# Rebuild
scripts\build_windows.bat

# Or rebuild incrementally
cd backend
pip install -r requirements.txt

cd ..\electron\renderer
npm install
npm run react-build
```

## 📚 Next Steps

1. **Read** the full [README.md](README.md)
2. **Explore** the API documentation
3. **Experiment** with different models and leagues
4. **Check** calibration curves for model reliability
5. **Integrate** with your betting platform (optional)

---

**Enjoy predicting! ⚽**
