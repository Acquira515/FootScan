"""LLM API client for explanations and analysis."""
import requests
import json
from typing import Optional, Dict, List, Any
from config import Config
from cache import Cache
from logger import setup_logger

logger = setup_logger(__name__)


class LLMAPIClient:
    """Client for LLM-based explanations and analysis."""

    def __init__(self, api_key: str = None, base_url: str = None):
        """Initialize client."""
        self.api_key = api_key or Config.LLM_API_KEY
        self.base_url = base_url or Config.LLM_API_BASE_URL
        self.model = Config.LLM_MODEL
        self.cache = Cache()
        self.timeout = Config.REQUEST_TIMEOUT

    def generate_explanation(self, match_data: Dict, prediction: Dict) -> str:
        """Generate human-readable explanation for prediction."""
        cache_key = f"explanation_{match_data.get('id')}_{prediction.get('model_type', 'ensemble')}"
        cached = self.cache.get_cache(cache_key)
        if cached:
            return cached

        try:
            if not self.api_key:
                return self._get_default_explanation(match_data, prediction)

            prompt = self._build_explanation_prompt(match_data, prediction)
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 200
                },
                timeout=self.timeout
            )

            response.raise_for_status()
            data = response.json()
            
            if data.get("choices") and len(data["choices"]) > 0:
                explanation = data["choices"][0].get("message", {}).get("content", "")
                self.cache.set_cache(cache_key, explanation, Config.CACHE_TTL_SECONDS)
                return explanation
        except Exception as e:
            logger.error(f"Failed to generate explanation: {e}")
        
        return self._get_default_explanation(match_data, prediction)

    def extract_news_insights(self, articles: List[Dict]) -> Dict[str, Any]:
        """Extract structured insights from news articles."""
        if not articles:
            return {"key_insights": [], "sentiment": 0.5}

        try:
            if not self.api_key:
                return self._get_default_news_insights(articles)

            articles_text = "\n".join([
                f"- {a.get('title')}: {a.get('description', '')}"
                for a in articles[:5]
            ])

            prompt = f"""Analyze the following football news and provide:
1. Key injury information
2. Team form assessment
3. Overall sentiment (positive/negative/neutral)
4. Key factors affecting upcoming matches

News:
{articles_text}

Provide a JSON response with keys: injuries, form, sentiment, key_factors"""

            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 300
                },
                timeout=self.timeout
            )

            response.raise_for_status()
            data = response.json()
            
            if data.get("choices") and len(data["choices"]) > 0:
                content = data["choices"][0].get("message", {}).get("content", "")
                try:
                    # Extract JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', content, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group())
                except:
                    pass

            return self._get_default_news_insights(articles)
        except Exception as e:
            logger.error(f"Failed to extract news insights: {e}")
            return self._get_default_news_insights(articles)

    def _build_explanation_prompt(self, match_data: Dict, prediction: Dict) -> str:
        """Build prompt for explanation generation."""
        return f"""Provide a brief, engaging explanation for this football match prediction:

Home Team: {match_data.get('home_team')}
Away Team: {match_data.get('away_team')}

Prediction: {prediction.get('predicted_score')}
Confidence: {prediction.get('confidence', 0) * 100:.1f}%
Home Win Probability: {prediction.get('home_probability', 0) * 100:.1f}%
Draw Probability: {prediction.get('draw_probability', 0) * 100:.1f}%
Away Win Probability: {prediction.get('away_probability', 0) * 100:.1f}%

Key Factors:
- Home advantage: {'Yes' if match_data.get('home_advantage') else 'No'}
- Recent form: {match_data.get('recent_form', 'Unknown')}
- Injuries: {match_data.get('injuries', 'None reported')}
- Head-to-head: {match_data.get('h2h_record', 'First time meeting')}

Provide 2-3 sentences explaining the prediction in simple terms."""

    def _get_default_explanation(self, match_data: Dict, prediction: Dict) -> str:
        """Generate default explanation when LLM is unavailable."""
        home_team = match_data.get('home_team', 'Home Team')
        away_team = match_data.get('away_team', 'Away Team')
        predicted_score = prediction.get('predicted_score', '1-1')
        home_prob = prediction.get('home_probability', 0.33) * 100
        confidence = prediction.get('confidence', 0) * 100

        explanation = f"Based on recent form and statistics, we predict {home_team} vs {away_team} will end "
        explanation += f"{predicted_score}. The model gives {home_prob:.0f}% chance of a home win "
        explanation += f"with {confidence:.0f}% confidence."
        
        return explanation

    def _get_default_news_insights(self, articles: List[Dict]) -> Dict[str, Any]:
        """Generate default news insights when LLM is unavailable."""
        return {
            "injuries": "No major injuries reported",
            "form": "Mixed recent form",
            "sentiment": 0.5,
            "key_factors": [
                "Recent performance trend",
                "Historical head-to-head record",
                "Home/away advantage"
            ]
        }
