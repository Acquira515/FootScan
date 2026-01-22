"""Main prediction pipeline."""
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime
from database import Database
from cache import Cache
from api_clients.football_api import FootballAPIClient
from api_clients.news_api import NewsAPIClient
from api_clients.llm_api import LLMAPIClient
from models.poisson import PoissonModel
from models.negative_binomial import NegativeBinomialModel
from models.hawkes import HawkesModel
from models.hmm import HMMFormModel
from models.mixture_expert import MixtureOfExpertsModel
from logger import setup_logger

logger = setup_logger(__name__)


class PredictionPipeline:
    """Main prediction pipeline orchestrating all models and data sources."""

    def __init__(self):
        """Initialize pipeline."""
        self.db = Database()
        self.cache = Cache()
        self.football_api = FootballAPIClient()
        self.news_api = NewsAPIClient()
        self.llm_api = LLMAPIClient()
        
        # Initialize models
        self.poisson = PoissonModel()
        self.nb = NegativeBinomialModel()
        self.hawkes = HawkesModel()
        self.hmm = HMMFormModel()
        self.moe = MixtureOfExpertsModel()

    def predict_match(self, match_id: int, league_id: int = None,
                     use_news: bool = True) -> Optional[Dict]:
        """Predict a single match."""
        try:
            # Fetch match data
            match_data = self.db.get_match(match_id)
            if not match_data:
                logger.warning(f"Match {match_id} not found")
                return None

            # Build features
            features = self._build_features(
                match_data['home_team_id'],
                match_data['away_team_id'],
                match_data['home_team_name'],
                match_data['away_team_name'],
                use_news=use_news
            )

            # Get training data for models
            home_team_id = match_data['home_team_id']
            away_team_id = match_data['away_team_id']
            
            home_goals, away_goals = self._get_historical_goals(
                home_team_id, away_team_id, league_id or match_data['league_id']
            )

            # Fit and predict with each model
            predictions = {}

            # Poisson
            self.poisson.fit(home_goals, away_goals, features)
            predictions['poisson'] = self.poisson.predict(features)

            # Negative Binomial
            self.nb.fit(home_goals, away_goals, features)
            predictions['negative_binomial'] = self.nb.predict(features)

            # Hawkes
            self.hawkes.fit(home_goals.tolist(), away_goals.tolist(), features)
            predictions['hawkes'] = self.hawkes.predict(features)

            # HMM
            home_results = self._get_team_results(home_team_id, league_id or match_data['league_id'])
            self.hmm.fit(home_results)
            predictions['hmm'] = self.hmm.predict(features)

            # Mixture of Experts (ensemble)
            ensemble_pred = self.moe.predict(predictions)
            predictions['ensemble'] = ensemble_pred

            # Generate explanation
            explanation = self.llm_api.generate_explanation(match_data, ensemble_pred)
            ensemble_pred['explanation'] = explanation

            # Save to database
            for model_type, pred in predictions.items():
                self.db.add_prediction(
                    match_id,
                    model_type,
                    pred.get('home_probability', 0),
                    pred.get('draw_probability', 0),
                    pred.get('away_probability', 0),
                    pred.get('predicted_score', '1-1'),
                    pred.get('confidence', 0),
                    pred.get('explanation', '')
                )

            return ensemble_pred
        except Exception as e:
            logger.error(f"Failed to predict match {match_id}: {e}")
            return None

    def predict_upcoming(self, league_id: int, days: int = 7,
                        use_news: bool = True) -> List[Dict]:
        """Predict upcoming matches for a league."""
        try:
            matches = self.db.get_upcoming_matches(league_id, days)
            predictions = []

            for match in matches:
                pred = self.predict_match(match['id'], league_id, use_news)
                if pred:
                    pred['match_id'] = match['id']
                    pred['home_team'] = match['home_team_name']
                    pred['away_team'] = match['away_team_name']
                    pred['match_date'] = match['match_date']
                    predictions.append(pred)

            return predictions
        except Exception as e:
            logger.error(f"Failed to predict upcoming matches: {e}")
            return []

    def _build_features(self, home_team_id: int, away_team_id: int,
                       home_team_name: str, away_team_name: str,
                       use_news: bool = True) -> Dict:
        """Build feature vector for prediction."""
        try:
            features = {}

            # Get team stats
            home_stats = self.db.get_team_stats(home_team_id) or {}
            away_stats = self.db.get_team_stats(away_team_id) or {}

            # Form ratings
            features['home_form'] = home_stats.get('form_rating', 0.5)
            features['away_form'] = away_stats.get('form_rating', 0.5)

            # Attack and defense strength
            home_gf = home_stats.get('goals_for', 0)
            home_ga = home_stats.get('goals_against', 1)
            away_gf = away_stats.get('goals_for', 0)
            away_ga = away_stats.get('goals_against', 1)

            features['home_attack_strength'] = 1.0 + (home_gf / 30.0) if home_gf > 0 else 1.0
            features['home_defense_strength'] = 1.0 - (home_ga / 30.0) if home_ga > 0 else 1.0
            features['away_attack_strength'] = 1.0 + (away_gf / 30.0) if away_gf > 0 else 1.0
            features['away_defense_strength'] = 1.0 - (away_ga / 30.0) if away_ga > 0 else 1.0

            # Home advantage
            features['home_advantage'] = 1.05

            # News sentiment
            if use_news:
                home_news = self.news_api.get_team_news(home_team_name)
                away_news = self.news_api.get_team_news(away_team_name)
                features['home_news_sentiment'] = self.news_api.analyze_sentiment(home_news or [])
                features['away_news_sentiment'] = self.news_api.analyze_sentiment(away_news or [])
            else:
                features['home_news_sentiment'] = 0.5
                features['away_news_sentiment'] = 0.5

            return features
        except Exception as e:
            logger.error(f"Failed to build features: {e}")
            return {}

    def _get_historical_goals(self, home_team_id: int, away_team_id: int,
                             league_id: int, num_matches: int = 20) -> tuple:
        """Get historical goals for model fitting."""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            # Home goals
            cursor.execute("""
                SELECT home_score FROM matches
                WHERE home_team_id = ? AND league_id = ? AND home_score IS NOT NULL
                ORDER BY match_date DESC LIMIT ?
            """, (home_team_id, league_id, num_matches))
            home_goals = np.array([row[0] or 0 for row in cursor.fetchall()])

            # Away goals
            cursor.execute("""
                SELECT away_score FROM matches
                WHERE away_team_id = ? AND league_id = ? AND away_score IS NOT NULL
                ORDER BY match_date DESC LIMIT ?
            """, (away_team_id, league_id, num_matches))
            away_goals = np.array([row[0] or 0 for row in cursor.fetchall()])

            conn.close()

            if len(home_goals) == 0:
                home_goals = np.array([1.5])
            if len(away_goals) == 0:
                away_goals = np.array([1.2])

            return home_goals, away_goals
        except Exception as e:
            logger.error(f"Failed to get historical goals: {e}")
            return np.array([1.5]), np.array([1.2])

    def _get_team_results(self, team_id: int, league_id: int,
                         num_matches: int = 20) -> np.ndarray:
        """Get team match results (1=win, 0.5=draw, 0=loss)."""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT home_score, away_score FROM matches
                WHERE (home_team_id = ? OR away_team_id = ?) 
                AND league_id = ? AND home_score IS NOT NULL
                ORDER BY match_date DESC LIMIT ?
            """, (team_id, team_id, league_id, num_matches))
            
            results = []
            for row in cursor.fetchall():
                home_score, away_score = row
                if home_score > away_score:
                    results.append(1.0)
                elif home_score == away_score:
                    results.append(0.5)
                else:
                    results.append(0.0)
            
            conn.close()

            return np.array(results) if results else np.array([0.5])
        except Exception as e:
            logger.error(f"Failed to get team results: {e}")
            return np.array([0.5])
