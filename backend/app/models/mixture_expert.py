"""Mixture of Experts model ensemble."""
import numpy as np
from typing import Dict, List
from logger import setup_logger

logger = setup_logger(__name__)


class MixtureOfExpertsModel:
    """Ensemble model combining multiple expert predictions with learned weights."""

    def __init__(self):
        """Initialize MoE."""
        # Weights for each model (learned from backtesting)
        self.weights = {
            'poisson': 0.25,
            'negative_binomial': 0.25,
            'hawkes': 0.25,
            'hmm': 0.25
        }
        self.model_performances = {}

    def fit_weights(self, model_performances: Dict[str, float]):
        """Learn weights based on model performance."""
        try:
            # Normalize performances to sum to 1
            total_perf = sum(model_performances.values())
            if total_perf > 0:
                for model, perf in model_performances.items():
                    self.weights[model] = perf / total_perf
            self.model_performances = model_performances
        except Exception as e:
            logger.error(f"Failed to fit MoE weights: {e}")

    def predict(self, predictions: Dict[str, Dict]) -> Dict:
        """Combine predictions from multiple models."""
        try:
            weighted_home = 0.0
            weighted_draw = 0.0
            weighted_away = 0.0
            
            # Weight each prediction
            for model_type, weight in self.weights.items():
                if model_type in predictions:
                    pred = predictions[model_type]
                    weighted_home += weight * pred.get('home_probability', 0)
                    weighted_draw += weight * pred.get('draw_probability', 0)
                    weighted_away += weight * pred.get('away_probability', 0)
            
            # Normalize
            total = weighted_home + weighted_draw + weighted_away
            if total > 0:
                weighted_home /= total
                weighted_draw /= total
                weighted_away /= total
            
            # Combine predicted scores
            predicted_score = self._combine_scores(predictions)
            
            # Calculate confidence as average of model confidences
            confidences = []
            for pred in predictions.values():
                if 'confidence' in pred:
                    confidences.append(pred['confidence'])
                else:
                    # Infer confidence from max probability
                    max_prob = max(pred.get('home_probability', 0),
                                 pred.get('draw_probability', 0),
                                 pred.get('away_probability', 0))
                    confidences.append(max_prob)
            
            confidence = np.mean(confidences) if confidences else 0.5
            
            return {
                "home_probability": float(weighted_home),
                "draw_probability": float(weighted_draw),
                "away_probability": float(weighted_away),
                "predicted_score": predicted_score,
                "confidence": float(confidence),
                "weights": self.weights,
                "ensemble_type": "mixture_of_experts"
            }
        except Exception as e:
            logger.error(f"MoE prediction failed: {e}")
            return self._get_default_prediction()

    def _combine_scores(self, predictions: Dict[str, Dict]) -> str:
        """Combine predicted scores from multiple models."""
        try:
            home_scores = []
            away_scores = []
            
            for pred in predictions.values():
                score_str = pred.get('predicted_score', '1-1')
                parts = score_str.split('-')
                if len(parts) == 2:
                    try:
                        home_scores.append(int(parts[0]))
                        away_scores.append(int(parts[1]))
                    except ValueError:
                        pass
            
            if home_scores and away_scores:
                avg_home = round(np.mean(home_scores))
                avg_away = round(np.mean(away_scores))
                return f"{avg_home}-{avg_away}"
            
            return "1-1"
        except Exception as e:
            logger.error(f"Failed to combine scores: {e}")
            return "1-1"

    def _get_default_prediction(self) -> Dict:
        """Return default prediction."""
        return {
            "home_probability": 0.33,
            "draw_probability": 0.34,
            "away_probability": 0.33,
            "predicted_score": "1-1",
            "confidence": 0.5,
            "weights": self.weights,
            "ensemble_type": "mixture_of_experts"
        }
