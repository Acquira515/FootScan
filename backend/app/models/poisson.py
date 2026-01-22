"""Poisson model for football score prediction."""
import numpy as np
from scipy import stats
from typing import Tuple, Dict
from logger import setup_logger

logger = setup_logger(__name__)


class PoissonModel:
    """Poisson regression model for goal prediction."""

    def __init__(self):
        """Initialize model."""
        self.home_lambda = 1.5
        self.away_lambda = 1.2
        self.max_score = 10

    def fit(self, home_goals: np.ndarray, away_goals: np.ndarray, 
            features: Dict = None):
        """Fit model parameters."""
        try:
            # Simple MLE for Poisson lambda
            self.home_lambda = max(np.mean(home_goals), 0.1) if len(home_goals) > 0 else 1.5
            self.away_lambda = max(np.mean(away_goals), 0.1) if len(away_goals) > 0 else 1.2
            
            # Adjust for features if provided
            if features:
                attack_factor = features.get('home_attack_strength', 1.0)
                defense_factor = features.get('away_defense_strength', 1.0)
                self.home_lambda *= attack_factor * defense_factor
                
                attack_factor = features.get('away_attack_strength', 1.0)
                defense_factor = features.get('home_defense_strength', 1.0)
                self.away_lambda *= attack_factor * defense_factor
        except Exception as e:
            logger.error(f"Failed to fit Poisson model: {e}")

    def predict(self, features: Dict = None) -> Dict:
        """Predict match outcome probabilities."""
        try:
            home_lambda = self.home_lambda
            away_lambda = self.away_lambda
            
            # Adjust with features
            if features:
                home_form = features.get('home_form', 0.5)
                away_form = features.get('away_form', 0.5)
                home_lambda *= (0.5 + home_form)
                away_lambda *= (0.5 + away_form)
            
            # Calculate probabilities for each possible score
            home_scores = np.arange(0, self.max_score)
            away_scores = np.arange(0, self.max_score)
            
            home_probs = stats.poisson.pmf(home_scores, home_lambda)
            away_probs = stats.poisson.pmf(away_scores, away_lambda)
            
            # Calculate match outcome probabilities
            home_win = 0.0
            draw = 0.0
            away_win = 0.0
            
            for i, home_score in enumerate(home_scores):
                for j, away_score in enumerate(away_scores):
                    prob = home_probs[i] * away_probs[j]
                    if home_score > away_score:
                        home_win += prob
                    elif home_score == away_score:
                        draw += prob
                    else:
                        away_win += prob
            
            # Normalize
            total = home_win + draw + away_win
            if total > 0:
                home_win /= total
                draw /= total
                away_win /= total
            
            # Find most likely score
            predicted_score = self._get_most_likely_score(home_lambda, away_lambda)
            
            return {
                "home_probability": float(home_win),
                "draw_probability": float(draw),
                "away_probability": float(away_win),
                "predicted_score": predicted_score,
                "home_lambda": float(home_lambda),
                "away_lambda": float(away_lambda)
            }
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return self._get_default_prediction()

    def _get_most_likely_score(self, home_lambda: float, away_lambda: float) -> str:
        """Get most likely score."""
        home_score = int(round(home_lambda))
        away_score = int(round(away_lambda))
        return f"{home_score}-{away_score}"

    def _get_default_prediction(self) -> Dict:
        """Return default prediction."""
        return {
            "home_probability": 0.33,
            "draw_probability": 0.34,
            "away_probability": 0.33,
            "predicted_score": "1-1",
            "home_lambda": 1.5,
            "away_lambda": 1.2
        }
