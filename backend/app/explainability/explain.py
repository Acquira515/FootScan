"""Explainability module for generating explanations."""
from typing import Dict, List
from api_clients.llm_api import LLMAPIClient
from logger import setup_logger

logger = setup_logger(__name__)


class Explainability:
    """Generate explanations for predictions."""

    def __init__(self):
        """Initialize explainability module."""
        self.llm = LLMAPIClient()

    def explain_prediction(self, match_data: Dict, prediction: Dict,
                          features: Dict = None, articles: List[Dict] = None) -> str:
        """Generate comprehensive explanation for a prediction."""
        try:
            # Get LLM explanation
            explanation = self.llm.generate_explanation(match_data, prediction)
            return explanation
        except Exception as e:
            logger.error(f"Failed to explain prediction: {e}")
            return self._get_default_explanation(match_data, prediction)

    def _get_default_explanation(self, match_data: Dict, prediction: Dict) -> str:
        """Generate default explanation."""
        home = match_data.get('home_team', 'Home')
        away = match_data.get('away_team', 'Away')
        score = prediction.get('predicted_score', '1-1')
        confidence = prediction.get('confidence', 0) * 100
        home_prob = prediction.get('home_probability', 0) * 100

        return (f"Our model predicts {home} vs {away} will end {score}. "
                f"The home team has a {home_prob:.0f}% chance of winning, "
                f"with {confidence:.0f}% confidence based on recent form and statistics.")
