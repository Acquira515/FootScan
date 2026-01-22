"""Negative Binomial model for football prediction with overdispersion."""
import numpy as np
from scipy import stats
from typing import Dict
from logger import setup_logger

logger = setup_logger(__name__)


class NegativeBinomialModel:
    """Negative Binomial model handling overdispersion in goal data."""

    def __init__(self):
        """Initialize model."""
        self.home_mu = 1.5
        self.home_alpha = 1.0
        self.away_mu = 1.2
        self.away_alpha = 1.0
        self.max_score = 10

    def fit(self, home_goals: np.ndarray, away_goals: np.ndarray, 
            features: Dict = None):
        """Fit model parameters using method of moments."""
        try:
            # Calculate mean and variance
            if len(home_goals) > 1:
                home_mean = np.mean(home_goals)
                home_var = np.var(home_goals)
                self.home_mu = max(home_mean, 0.1)
                # Alpha = mu / (variance - mu) for negative binomial
                self.home_alpha = max(home_mean ** 2 / (home_var - home_mean), 0.1) \
                    if home_var > home_mean else 1.0
            
            if len(away_goals) > 1:
                away_mean = np.mean(away_goals)
                away_var = np.var(away_goals)
                self.away_mu = max(away_mean, 0.1)
                self.away_alpha = max(away_mean ** 2 / (away_var - away_mean), 0.1) \
                    if away_var > away_mean else 1.0

            # Adjust for features
            if features:
                attack_factor = features.get('home_attack_strength', 1.0)
                defense_factor = features.get('away_defense_strength', 1.0)
                self.home_mu *= attack_factor * defense_factor
                
                attack_factor = features.get('away_attack_strength', 1.0)
                defense_factor = features.get('home_defense_strength', 1.0)
                self.away_mu *= attack_factor * defense_factor
        except Exception as e:
            logger.error(f"Failed to fit NB model: {e}")

    def predict(self, features: Dict = None) -> Dict:
        """Predict match outcome probabilities."""
        try:
            home_mu = self.home_mu
            away_mu = self.away_mu
            home_alpha = self.home_alpha
            away_alpha = self.away_alpha
            
            # Adjust with features
            if features:
                home_form = features.get('home_form', 0.5)
                away_form = features.get('away_form', 0.5)
                home_mu *= (0.5 + home_form)
                away_mu *= (0.5 + away_form)
            
            # Calculate probabilities for each possible score
            home_scores = np.arange(0, self.max_score)
            away_scores = np.arange(0, self.max_score)
            
            home_probs = stats.nbinom.pmf(
                home_scores, 
                home_alpha, 
                home_alpha / (home_alpha + home_mu)
            )
            away_probs = stats.nbinom.pmf(
                away_scores,
                away_alpha,
                away_alpha / (away_alpha + away_mu)
            )
            
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
            
            # Most likely score
            predicted_score = self._get_most_likely_score(home_mu, away_mu)
            
            return {
                "home_probability": float(home_win),
                "draw_probability": float(draw),
                "away_probability": float(away_win),
                "predicted_score": predicted_score,
                "home_mu": float(home_mu),
                "away_mu": float(away_mu),
                "home_alpha": float(home_alpha),
                "away_alpha": float(away_alpha)
            }
        except Exception as e:
            logger.error(f"NB prediction failed: {e}")
            return self._get_default_prediction()

    def _get_most_likely_score(self, home_mu: float, away_mu: float) -> str:
        """Get most likely score."""
        home_score = int(round(home_mu))
        away_score = int(round(away_mu))
        return f"{home_score}-{away_score}"

    def _get_default_prediction(self) -> Dict:
        """Return default prediction."""
        return {
            "home_probability": 0.33,
            "draw_probability": 0.34,
            "away_probability": 0.33,
            "predicted_score": "1-1",
            "home_mu": 1.5,
            "away_mu": 1.2,
            "home_alpha": 1.0,
            "away_alpha": 1.0
        }
