"""Hawkes process model for self-exciting goal events."""
import numpy as np
from typing import Dict, List, Tuple
from logger import setup_logger

logger = setup_logger(__name__)


class HawkesModel:
    """Hawkes process model for modeling self-exciting goal scoring patterns."""

    def __init__(self, kernel_type: str = 'exponential'):
        """Initialize Hawkes model."""
        self.kernel_type = kernel_type
        self.lambda0_home = 0.05  # Base intensity
        self.lambda0_away = 0.04
        self.alpha = 0.2  # Excitement level after a goal
        self.beta = 1.0  # Decay rate
        self.max_score = 10

    def fit(self, home_goals: List[float], away_goals: List[float], 
            features: Dict = None):
        """Fit Hawkes model using goal times."""
        try:
            # Simple parameter estimation
            if len(home_goals) > 0:
                self.lambda0_home = max(0.01, np.mean(home_goals) * 0.05)
            if len(away_goals) > 0:
                self.lambda0_away = max(0.01, np.mean(away_goals) * 0.04)
            
            if features:
                home_form = features.get('home_form', 0.5)
                away_form = features.get('away_form', 0.5)
                self.lambda0_home *= (0.5 + home_form)
                self.lambda0_away *= (0.5 + away_form)
        except Exception as e:
            logger.error(f"Failed to fit Hawkes model: {e}")

    def intensity(self, t: float, goal_times: List[float], 
                 base_intensity: float) -> float:
        """Calculate intensity at time t."""
        try:
            intensity = base_intensity
            for goal_time in goal_times:
                if goal_time < t:
                    time_diff = t - goal_time
                    # Exponential kernel
                    intensity += self.alpha * np.exp(-self.beta * time_diff)
            return intensity
        except:
            return base_intensity

    def predict(self, features: Dict = None, match_length: float = 90.0) -> Dict:
        """Predict goals using Hawkes process intensity."""
        try:
            # Simulate goal events
            home_goals_simulated = self._simulate_goals(
                self.lambda0_home,
                match_length
            )
            away_goals_simulated = self._simulate_goals(
                self.lambda0_away,
                match_length
            )
            
            num_home_goals = len(home_goals_simulated)
            num_away_goals = len(away_goals_simulated)
            
            # Calculate probabilities based on simulations
            # This is a simplified version
            total_goals = num_home_goals + num_away_goals
            if total_goals > 0:
                home_intensity = self.lambda0_home * match_length
                away_intensity = self.lambda0_away * match_length
                total_intensity = home_intensity + away_intensity
                
                home_prob = home_intensity / total_intensity if total_intensity > 0 else 0.45
                away_prob = away_intensity / total_intensity if total_intensity > 0 else 0.45
            else:
                home_prob = 0.45
                away_prob = 0.45
            
            draw_prob = 1.0 - home_prob - away_prob
            draw_prob = max(0.0, draw_prob)
            
            # Normalize
            total_prob = home_prob + draw_prob + away_prob
            if total_prob > 0:
                home_prob /= total_prob
                draw_prob /= total_prob
                away_prob /= total_prob
            
            predicted_score = f"{num_home_goals}-{num_away_goals}"
            
            return {
                "home_probability": float(home_prob),
                "draw_probability": float(draw_prob),
                "away_probability": float(away_prob),
                "predicted_score": predicted_score,
                "home_goals": num_home_goals,
                "away_goals": num_away_goals
            }
        except Exception as e:
            logger.error(f"Hawkes prediction failed: {e}")
            return self._get_default_prediction()

    def _simulate_goals(self, base_intensity: float, 
                       match_length: float, simulations: int = 100) -> np.ndarray:
        """Simulate goal times using Hawkes process."""
        try:
            goal_counts = []
            for _ in range(simulations):
                goals = []
                t = 0
                intensity = base_intensity
                
                while t < match_length:
                    # Generate next event time
                    dt = -np.log(np.random.uniform()) / intensity
                    t += dt
                    
                    if t < match_length:
                        # Accept/reject based on thinning
                        if np.random.uniform() < intensity / (base_intensity * 2):
                            goals.append(t)
                            intensity = base_intensity + self.alpha * np.exp(-self.beta * 0)
                
                goal_counts.append(len(goals))
            
            return np.array(goal_counts)
        except:
            return np.array([np.random.poisson(base_intensity * match_length / 90.0)])

    def _get_default_prediction(self) -> Dict:
        """Return default prediction."""
        return {
            "home_probability": 0.35,
            "draw_probability": 0.32,
            "away_probability": 0.33,
            "predicted_score": "1-1",
            "home_goals": 1,
            "away_goals": 1
        }
