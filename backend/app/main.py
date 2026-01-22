"""Main FastAPI backend application."""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
from datetime import datetime
import uvicorn

from config import Config
from database import Database
from logger import setup_logger
from api_clients.football_api import FootballAPIClient
from api_clients.news_api import NewsAPIClient
from prediction.predict import PredictionPipeline
from backtest.backtest import Backtester
from explainability.explain import Explainability

# Initialize
Config.validate()
logger = setup_logger(__name__)
app = FastAPI(
    title="Football Prediction API",
    description="Advanced statistical football match prediction",
    version="1.0.0"
)

# Add CORS middleware for Electron
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db = Database()
football_api = FootballAPIClient()
news_api = NewsAPIClient()
pipeline = PredictionPipeline()
backtester = Backtester()
explainability = Explainability()


# Health check
@app.get("/status")
async def status():
    """API health check."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "environment": Config.ENVIRONMENT
    }


# Fetch upcoming matches
@app.get("/api/matches")
async def get_matches(league_id: int = Query(Config.DEFAULT_LEAGUE_ID),
                     days: int = Query(7)):
    """Get upcoming matches."""
    try:
        matches = db.get_upcoming_matches(league_id, days)
        return {
            "success": True,
            "count": len(matches),
            "data": [dict(m) for m in matches]
        }
    except Exception as e:
        logger.error(f"Failed to get matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Make prediction
@app.post("/api/predict")
async def predict_match(match_id: int = Query(...),
                       league_id: int = Query(Config.DEFAULT_LEAGUE_ID),
                       use_news: bool = Query(True)):
    """Predict a single match."""
    try:
        prediction = pipeline.predict_match(match_id, league_id, use_news)
        if not prediction:
            raise HTTPException(status_code=404, detail="Match not found")
        
        return {
            "success": True,
            "data": prediction
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Predict upcoming matches
@app.post("/api/predict/upcoming")
async def predict_upcoming(league_id: int = Query(Config.DEFAULT_LEAGUE_ID),
                          days: int = Query(7),
                          use_news: bool = Query(True)):
    """Predict upcoming matches."""
    try:
        predictions = pipeline.predict_upcoming(league_id, days, use_news)
        return {
            "success": True,
            "count": len(predictions),
            "data": predictions
        }
    except Exception as e:
        logger.error(f"Failed to predict upcoming: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get predictions history
@app.get("/api/predictions/{match_id}")
async def get_predictions(match_id: int):
    """Get all predictions for a match."""
    try:
        predictions = db.get_predictions(match_id)
        return {
            "success": True,
            "count": len(predictions),
            "data": [dict(p) for p in predictions]
        }
    except Exception as e:
        logger.error(f"Failed to get predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Backtest
@app.post("/api/backtest")
async def run_backtest(league_id: int = Query(Config.DEFAULT_LEAGUE_ID),
                      start_date: str = Query(Config.BACKTEST_START_DATE),
                      end_date: str = Query(Config.BACKTEST_END_DATE),
                      models: List[str] = Query(None)):
    """Run backtest on models."""
    try:
        results = backtester.backtest_models(league_id, start_date, end_date, models)
        return {
            "success": True,
            "data": results
        }
    except Exception as e:
        logger.error(f"Backtest failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get model metrics
@app.get("/api/metrics")
async def get_metrics(model_type: str = Query(None)):
    """Get model performance metrics."""
    try:
        metrics = db.get_model_metrics(model_type)
        return {
            "success": True,
            "count": len(metrics),
            "data": [dict(m) for m in metrics]
        }
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get team news
@app.get("/api/news/{team_name}")
async def get_team_news(team_name: str, days: int = Query(7)):
    """Get team news."""
    try:
        news = news_api.get_team_news(team_name, days)
        sentiment = news_api.analyze_sentiment(news or [])
        return {
            "success": True,
            "team": team_name,
            "sentiment": sentiment,
            "articles": news or []
        }
    except Exception as e:
        logger.error(f"Failed to get news: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get calibration data
@app.get("/api/calibration/{model_type}")
async def get_calibration(model_type: str,
                         league_id: int = Query(Config.DEFAULT_LEAGUE_ID)):
    """Get calibration curve data for a model."""
    try:
        calibration = backtester.get_calibration_data(league_id, model_type)
        return {
            "success": True,
            "model": model_type,
            "data": calibration
        }
    except Exception as e:
        logger.error(f"Failed to get calibration: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Settings
@app.get("/api/settings")
async def get_settings():
    """Get application settings."""
    return {
        "success": True,
        "data": {
            "default_league_id": Config.DEFAULT_LEAGUE_ID,
            "cache_ttl": Config.CACHE_TTL_SECONDS,
            "backtest_start": Config.BACKTEST_START_DATE,
            "backtest_end": Config.BACKTEST_END_DATE,
            "environment": Config.ENVIRONMENT
        }
    }


@app.post("/api/settings")
async def update_settings(settings: Dict):
    """Update application settings."""
    try:
        # Validate and update settings
        if "default_league_id" in settings:
            Config.DEFAULT_LEAGUE_ID = int(settings["default_league_id"])
        return {
            "success": True,
            "message": "Settings updated"
        }
    except Exception as e:
        logger.error(f"Failed to update settings: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# Error handler
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"}
    )


def run_server():
    """Run the server."""
    logger.info(f"Starting Football Prediction API on {Config.API_HOST}:{Config.API_PORT}")
    uvicorn.run(
        app,
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=Config.DEBUG,
        log_level=Config.LOG_LEVEL.lower()
    )


if __name__ == "__main__":
    run_server()
