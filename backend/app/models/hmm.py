"""Hidden Markov Model for team form prediction."""
import numpy as np
from typing import Dict, Tuple
from logger import setup_logger

logger = setup_logger(__name__)


class HMMFormModel:
    """Hidden Markov Model for capturing team form states."""

    def __init__(self, n_states: int = 3):
        """Initialize HMM."""
        self.n_states = n_states  # Good form, Medium form, Poor form
        self.transition_matrix = np.array([
            [0.6, 0.3, 0.1],  # Good -> Good, Medium, Poor
            [0.3, 0.5, 0.2],  # Medium -> Good, Medium, Poor
            [0.2, 0.4, 0.4]   # Poor -> Good, Medium, Poor
        ])
        self.emission_probs = np.array([
            [0.8, 0.15, 0.05],  # Good form: high win prob, med draw, low loss
            [0.4, 0.4, 0.2],    # Medium form: balanced
            [0.1, 0.3, 0.6]     # Poor form: high loss prob
        ])
        self.state_probs = np.array([0.33, 0.33, 0.34])  # Initial state distribution

    def fit(self, results: np.ndarray):
        """Fit HMM parameters using historical results."""
        try:
            if len(results) < 5:
                return
            
            # Simple estimation based on win rate
            win_rate = np.mean(results)
            
            if win_rate > 0.6:
                # Team in good form
                self.state_probs = np.array([0.7, 0.25, 0.05])
            elif win_rate > 0.4:
                # Medium form
                self.state_probs = np.array([0.3, 0.5, 0.2])
            else:
                # Poor form
                self.state_probs = np.array([0.1, 0.3, 0.6])
        except Exception as e:
            logger.error(f"Failed to fit HMM: {e}")

    def predict(self, features: Dict = None) -> Dict:
        """Predict using HMM."""
        try:
            # Current state based on form
            home_form = features.get('home_form', 0.5) if features else 0.5
            away_form = features.get('away_form', 0.5) if features else 0.5
            
            # Map form to state
            home_state = self._get_state_from_form(home_form)
            away_state = self._get_state_from_form(away_form)
            
            # Get emission probabilities
            home_emissions = self.emission_probs[home_state]
            away_emissions = self.emission_probs[away_state]
            
            # Combine probabilities
            home_prob = home_emissions[0] * (1 - away_emissions[2])
            away_prob = away_emissions[2] * (1 - home_emissions[0])
            draw_prob = 1.0 - home_prob - away_prob
            
            # Normalize
            total = home_prob + draw_prob + away_prob
            if total > 0:
                home_prob /= total
                draw_prob /= total
                away_prob /= total
            
            # Predict score
            predicted_score = self._predict_score(home_state, away_state)
            
            return {
                "home_probability": float(home_prob),
                "draw_probability": float(draw_prob),
                "away_probability": float(away_prob),
                "predicted_score": predicted_score,
                "home_state": home_state,
                "away_state": away_state
            }
        except Exception as e:
            logger.error(f"HMM prediction failed: {e}")
            return self._get_default_prediction()

    def _get_state_from_form(self, form: float) -> int:
        """Map form value (0-1) to state (0-2)."""
        if form > 0.65:
            return 0  # Good form
        elif form > 0.35:
            return 1  # Medium form
        else:
            return 2  # Poor form

    def _predict_score(self, home_state: int, away_state: int) -> str:
        """Predict score based on states."""
        state_names = ["Good", "Medium", "Poor"]
        
        # Base goals by state
        state_goals = [1.8, 1.3, 0.8]
        home_goals = int(round(state_goals[home_state]))
        away_goals = int(round(state_goals[away_state]))
        
        return f"{home_goals}-{away_goals}"

    def _get_default_prediction(self) -> Dict:
        """Return default prediction."""
        return {
            "home_probability": 0.33,
            "draw_probability": 0.34,
            "away_probability": 0.33,
            "predicted_score": "1-1",
            "home_state": 1,
            "away_state": 1
        }
