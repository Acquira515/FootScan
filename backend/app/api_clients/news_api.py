"""News API client for fetching team news."""
import requests
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from config import Config
from cache import Cache
from logger import setup_logger

logger = setup_logger(__name__)


class NewsAPIClient:
    """Client for fetching sports news."""

    def __init__(self, api_key: str = None):
        """Initialize client."""
        self.api_key = api_key or Config.NEWS_API_KEY
        self.base_url = Config.NEWS_API_BASE_URL
        self.cache = Cache()
        self.timeout = Config.REQUEST_TIMEOUT

    def get_team_news(self, team_name: str, days: int = 7) -> Optional[List[Dict]]:
        """Get recent news about a team."""
        cache_key = f"team_news_{team_name}_{days}"
        cached = self.cache.get_cache(cache_key)
        if cached:
            return cached

        try:
            from_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
            
            # Using NewsAPI if available, otherwise use mock data
            if not self.api_key:
                logger.warning("NewsAPI key not configured, using mock data")
                return self._get_mock_news(team_name)

            url = f"{self.base_url}/everything"
            params = {
                "q": f"{team_name} football",
                "sortBy": "publishedAt",
                "language": "en",
                "from": from_date,
                "apiKey": self.api_key,
                "pageSize": 20
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            news = []
            if data.get("articles"):
                for article in data["articles"][:20]:
                    news.append({
                        "title": article.get("title"),
                        "description": article.get("description"),
                        "url": article.get("url"),
                        "source": article.get("source", {}).get("name"),
                        "published_at": article.get("publishedAt"),
                        "content": article.get("content")[:200] if article.get("content") else ""
                    })

            self.cache.set_cache(cache_key, news, Config.CACHE_TTL_SECONDS)
            return news
        except Exception as e:
            logger.error(f"Failed to get team news: {e}")
            return self._get_mock_news(team_name)

    def _get_mock_news(self, team_name: str) -> List[Dict]:
        """Return mock news data for demonstration."""
        return [
            {
                "title": f"{team_name} secures important victory",
                "description": f"In a thrilling match, {team_name} defeated their opponents",
                "source": "Mock Sports News",
                "published_at": datetime.now().isoformat(),
                "content": "Mock news content for demonstration purposes"
            },
            {
                "title": f"{team_name} stars shine in recent performance",
                "description": f"Key players of {team_name} delivered outstanding performances",
                "source": "Mock Sports News",
                "published_at": (datetime.now() - timedelta(days=1)).isoformat(),
                "content": "Mock news content for demonstration purposes"
            }
        ]

    def analyze_sentiment(self, articles: List[Dict]) -> float:
        """Analyze sentiment from news articles (basic)."""
        if not articles:
            return 0.5

        try:
            # Simple sentiment analysis - count positive/negative keywords
            positive_keywords = ["win", "victory", "strong", "excellent", "brilliant", "great"]
            negative_keywords = ["loss", "defeat", "poor", "weak", "injured", "suspension"]

            positive_count = 0
            negative_count = 0

            for article in articles:
                text = (article.get("title", "") + " " + 
                       article.get("description", "")).lower()
                
                for keyword in positive_keywords:
                    positive_count += text.count(keyword)
                for keyword in negative_keywords:
                    negative_count += text.count(keyword)

            total = positive_count + negative_count
            if total == 0:
                return 0.5

            sentiment = positive_count / total
            return min(max(sentiment, 0.0), 1.0)  # Clamp between 0 and 1
        except Exception as e:
            logger.error(f"Failed to analyze sentiment: {e}")
            return 0.5
