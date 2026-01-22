"""Database management for the football prediction app."""
import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from config import Config
from logger import setup_logger

logger = setup_logger(__name__)


class Database:
    """SQLite database manager."""

    def __init__(self, db_path: str = None):
        """Initialize database."""
        self.db_path = db_path or Config.DATABASE_PATH
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_db()

    def get_connection(self):
        """Get database connection."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Initialize database tables."""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Teams table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS teams (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                country TEXT,
                founded_year INTEGER,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Matches table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY,
                external_id INTEGER UNIQUE NOT NULL,
                home_team_id INTEGER NOT NULL,
                away_team_id INTEGER NOT NULL,
                home_team_name TEXT NOT NULL,
                away_team_name TEXT NOT NULL,
                league_id INTEGER NOT NULL,
                match_date TIMESTAMP NOT NULL,
                home_score INTEGER,
                away_score INTEGER,
                status TEXT,
                odds_home REAL,
                odds_draw REAL,
                odds_away REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(home_team_id) REFERENCES teams(id),
                FOREIGN KEY(away_team_id) REFERENCES teams(id)
            )
        """)

        # Predictions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY,
                match_id INTEGER NOT NULL,
                model_type TEXT NOT NULL,
                home_probability REAL,
                draw_probability REAL,
                away_probability REAL,
                predicted_score TEXT,
                confidence REAL,
                explanation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(match_id) REFERENCES matches(id)
            )
        """)

        # Results table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY,
                match_id INTEGER NOT NULL,
                prediction_id INTEGER NOT NULL,
                actual_result TEXT,
                accuracy_score REAL,
                log_loss REAL,
                brier_score REAL,
                evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(match_id) REFERENCES matches(id),
                FOREIGN KEY(prediction_id) REFERENCES predictions(id)
            )
        """)

        # Model metrics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS model_metrics (
                id INTEGER PRIMARY KEY,
                model_type TEXT NOT NULL,
                metric_type TEXT NOT NULL,
                metric_value REAL,
                period_start DATE,
                period_end DATE,
                sample_size INTEGER,
                calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(model_type, metric_type, period_start, period_end)
            )
        """)

        # Cache table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cache (
                id INTEGER PRIMARY KEY,
                cache_key TEXT UNIQUE NOT NULL,
                cache_value TEXT NOT NULL,
                ttl_seconds INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP
            )
        """)

        # Team statistics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS team_stats (
                id INTEGER PRIMARY KEY,
                team_id INTEGER NOT NULL,
                matches_played INTEGER,
                wins INTEGER,
                draws INTEGER,
                losses INTEGER,
                goals_for INTEGER,
                goals_against INTEGER,
                form_rating REAL,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(team_id) REFERENCES teams(id)
            )
        """)

        # Match features table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS match_features (
                id INTEGER PRIMARY KEY,
                match_id INTEGER NOT NULL,
                home_form REAL,
                away_form REAL,
                home_attack_strength REAL,
                away_attack_strength REAL,
                home_defense_strength REAL,
                away_defense_strength REAL,
                home_injuries INTEGER,
                away_injuries INTEGER,
                news_sentiment REAL,
                calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(match_id) REFERENCES matches(id)
            )
        """)

        conn.commit()
        conn.close()
        logger.info("Database initialized")

    # Teams operations
    def add_team(self, team_id: int, name: str, country: str = None, founded_year: int = None):
        """Add or update a team."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO teams (id, name, country, founded_year)
            VALUES (?, ?, ?, ?)
        """, (team_id, name, country, founded_year))
        conn.commit()
        conn.close()

    def get_team(self, team_id: int) -> Optional[Dict]:
        """Get team by ID."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM teams WHERE id = ?", (team_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    # Matches operations
    def add_match(self, external_id: int, home_team_id: int, away_team_id: int,
                  home_team_name: str, away_team_name: str, league_id: int,
                  match_date: str, **kwargs):
        """Add or update a match."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO matches 
            (external_id, home_team_id, away_team_id, home_team_name, 
             away_team_name, league_id, match_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (external_id, home_team_id, away_team_id, home_team_name, 
              away_team_name, league_id, match_date, kwargs.get('status', 'SCHEDULED')))
        conn.commit()
        conn.close()

    def get_match(self, match_id: int) -> Optional[Dict]:
        """Get match by ID."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM matches WHERE id = ?", (match_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_upcoming_matches(self, league_id: int, days: int = 7) -> List[Dict]:
        """Get upcoming matches."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM matches 
            WHERE league_id = ? AND status = 'SCHEDULED'
            AND match_date > datetime('now')
            AND match_date < datetime('now', '+' || ? || ' days')
            ORDER BY match_date ASC
        """, (league_id, days))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    # Predictions operations
    def add_prediction(self, match_id: int, model_type: str, home_prob: float,
                       draw_prob: float, away_prob: float, predicted_score: str,
                       confidence: float, explanation: str) -> int:
        """Add a prediction."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO predictions 
            (match_id, model_type, home_probability, draw_probability, 
             away_probability, predicted_score, confidence, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (match_id, model_type, home_prob, draw_prob, away_prob, 
              predicted_score, confidence, explanation))
        conn.commit()
        prediction_id = cursor.lastrowid
        conn.close()
        return prediction_id

    def get_predictions(self, match_id: int) -> List[Dict]:
        """Get predictions for a match."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM predictions WHERE match_id = ? ORDER BY created_at DESC
        """, (match_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    # Results operations
    def add_result(self, match_id: int, prediction_id: int, actual_result: str,
                   accuracy: float = None, log_loss: float = None, brier: float = None):
        """Add a match result."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO results 
            (match_id, prediction_id, actual_result, accuracy_score, log_loss, brier_score)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (match_id, prediction_id, actual_result, accuracy, log_loss, brier))
        conn.commit()
        conn.close()

    # Model metrics operations
    def save_model_metrics(self, model_type: str, metric_type: str, metric_value: float,
                          period_start: str = None, period_end: str = None, 
                          sample_size: int = None):
        """Save model metrics."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO model_metrics 
            (model_type, metric_type, metric_value, period_start, period_end, sample_size)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (model_type, metric_type, metric_value, period_start, period_end, sample_size))
        conn.commit()
        conn.close()

    def get_model_metrics(self, model_type: str = None) -> List[Dict]:
        """Get model metrics."""
        conn = self.get_connection()
        cursor = conn.cursor()
        if model_type:
            cursor.execute("""
                SELECT * FROM model_metrics WHERE model_type = ? ORDER BY calculated_at DESC
            """, (model_type,))
        else:
            cursor.execute("SELECT * FROM model_metrics ORDER BY calculated_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    # Stats operations
    def save_team_stats(self, team_id: int, stats: Dict):
        """Save team statistics."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO team_stats 
            (team_id, matches_played, wins, draws, losses, goals_for, 
             goals_against, form_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (team_id, stats.get('matches_played', 0), stats.get('wins', 0),
              stats.get('draws', 0), stats.get('losses', 0), 
              stats.get('goals_for', 0), stats.get('goals_against', 0),
              stats.get('form_rating', 0.0)))
        conn.commit()
        conn.close()

    def get_team_stats(self, team_id: int) -> Optional[Dict]:
        """Get team statistics."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM team_stats WHERE team_id = ?", (team_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def clean_expired_cache(self):
        """Clean expired cache entries."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM cache 
            WHERE expires_at IS NOT NULL AND expires_at < datetime('now')
        """)
        conn.commit()
        conn.close()
