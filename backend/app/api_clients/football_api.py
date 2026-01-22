"""Football API client for fetching match and team data."""
import requests
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from config import Config
from cache import Cache
from logger import setup_logger

logger = setup_logger(__name__)


class FootballAPIClient:
    """Client for football-data.org API."""

    def __init__(self, api_key: str = None):
        """Initialize client."""
        self.api_key = api_key or Config.FOOTBALL_API_KEY
        self.base_url = Config.FOOTBALL_API_BASE_URL
        self.headers = {"X-Auth-Token": self.api_key}
        self.cache = Cache()
        self.timeout = Config.REQUEST_TIMEOUT

    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make API request with error handling."""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return None

    def get_upcoming_matches(self, league_id: int, days: int = 7) -> Optional[List[Dict]]:
        """Get upcoming matches for a league."""
        cache_key = f"upcoming_matches_{league_id}_{days}"
        cached = self.cache.get_cache(cache_key)
        if cached:
            return cached

        try:
            # Calculate date range
            today = datetime.now()
            future_date = today + timedelta(days=days)

            data = self._make_request(
                f"/competitions/{league_id}/matches",
                params={
                    "status": "SCHEDULED",
                    "dateFrom": today.strftime("%Y-%m-%d"),
                    "dateTo": future_date.strftime("%Y-%m-%d")
                }
            )

            if data and "matches" in data:
                matches = []
                for match in data["matches"]:
                    matches.append({
                        "id": match.get("id"),
                        "external_id": match.get("id"),
                        "home_team": match.get("homeTeam", {}).get("name"),
                        "home_team_id": match.get("homeTeam", {}).get("id"),
                        "away_team": match.get("awayTeam", {}).get("name"),
                        "away_team_id": match.get("awayTeam", {}).get("id"),
                        "date": match.get("utcDate"),
                        "status": match.get("status"),
                        "odds": match.get("odds", {})
                    })
                self.cache.set_cache(cache_key, matches, Config.CACHE_TTL_SECONDS)
                return matches
        except Exception as e:
            logger.error(f"Failed to get upcoming matches: {e}")
        return None

    def get_match_stats(self, match_id: int) -> Optional[Dict]:
        """Get detailed match statistics."""
        cache_key = f"match_stats_{match_id}"
        cached = self.cache.get_cache(cache_key)
        if cached:
            return cached

        try:
            data = self._make_request(f"/matches/{match_id}")
            if data:
                stats = {
                    "id": data.get("id"),
                    "home_team": data.get("homeTeam", {}).get("name"),
                    "away_team": data.get("awayTeam", {}).get("name"),
                    "date": data.get("utcDate"),
                    "status": data.get("status"),
                    "home_score": data.get("score", {}).get("fullTime", {}).get("home"),
                    "away_score": data.get("score", {}).get("fullTime", {}).get("away"),
                    "referees": [r.get("name") for r in data.get("referees", [])]
                }
                self.cache.set_cache(cache_key, stats, Config.CACHE_TTL_SECONDS)
                return stats
        except Exception as e:
            logger.error(f"Failed to get match stats: {e}")
        return None

    def get_team_stats(self, team_id: int) -> Optional[Dict]:
        """Get team statistics."""
        cache_key = f"team_stats_{team_id}"
        cached = self.cache.get_cache(cache_key)
        if cached:
            return cached

        try:
            data = self._make_request(f"/teams/{team_id}")
            if data:
                stats = {
                    "id": data.get("id"),
                    "name": data.get("name"),
                    "country": data.get("area", {}).get("name"),
                    "founded": data.get("founded"),
                    "crest": data.get("crest"),
                    "venue": data.get("venue"),
                    "coach": data.get("coach", {}).get("name") if data.get("coach") else None,
                    "squad": [
                        {
                            "id": p.get("id"),
                            "name": p.get("name"),
                            "position": p.get("position"),
                            "nation": p.get("nationality")
                        }
                        for p in data.get("squad", [])
                    ]
                }
                self.cache.set_cache(cache_key, stats, Config.CACHE_TTL_SECONDS)
                return stats
        except Exception as e:
            logger.error(f"Failed to get team stats: {e}")
        return None

    def get_head_to_head(self, home_team_id: int, away_team_id: int, 
                        matches: int = 10) -> Optional[Dict]:
        """Get head-to-head statistics between two teams."""
        cache_key = f"h2h_{home_team_id}_{away_team_id}_{matches}"
        cached = self.cache.get_cache(cache_key)
        if cached:
            return cached

        try:
            # This endpoint may vary by API provider
            # Using a generic approach
            data = self._make_request(
                f"/matches",
                params={
                    "competitions": Config.DEFAULT_LEAGUE_ID
                }
            )

            if data and "matches" in data:
                h2h_matches = [
                    m for m in data["matches"]
                    if ((m.get("homeTeam", {}).get("id") == home_team_id and 
                         m.get("awayTeam", {}).get("id") == away_team_id) or
                        (m.get("homeTeam", {}).get("id") == away_team_id and 
                         m.get("awayTeam", {}).get("id") == home_team_id))
                ][:matches]

                h2h_stats = {
                    "home_wins": 0,
                    "draws": 0,
                    "away_wins": 0,
                    "recent_matches": []
                }

                for match in h2h_matches:
                    home_score = match.get("score", {}).get("fullTime", {}).get("home")
                    away_score = match.get("score", {}).get("fullTime", {}).get("away")

                    if home_score is not None and away_score is not None:
                        if home_score > away_score:
                            if match.get("homeTeam", {}).get("id") == home_team_id:
                                h2h_stats["home_wins"] += 1
                            else:
                                h2h_stats["away_wins"] += 1
                        elif home_score < away_score:
                            if match.get("homeTeam", {}).get("id") == home_team_id:
                                h2h_stats["away_wins"] += 1
                            else:
                                h2h_stats["home_wins"] += 1
                        else:
                            h2h_stats["draws"] += 1

                    h2h_stats["recent_matches"].append({
                        "home_team": match.get("homeTeam", {}).get("name"),
                        "away_team": match.get("awayTeam", {}).get("name"),
                        "home_score": home_score,
                        "away_score": away_score,
                        "date": match.get("utcDate")
                    })

                self.cache.set_cache(cache_key, h2h_stats, Config.CACHE_TTL_SECONDS)
                return h2h_stats
        except Exception as e:
            logger.error(f"Failed to get H2H stats: {e}")
        return None

    def get_injuries(self, team_id: int) -> Optional[List[Dict]]:
        """Get team injury information if available."""
        cache_key = f"injuries_{team_id}"
        cached = self.cache.get_cache(cache_key)
        if cached:
            return cached

        try:
            # Note: injury data is typically not available from free APIs
            # This is a placeholder for when using premium services
            data = self._make_request(f"/teams/{team_id}")
            if data:
                injuries = []
                # Parse injury data if available in response
                # This depends on the specific API being used
                self.cache.set_cache(cache_key, injuries, 3600)  # 1 hour
                return injuries
        except Exception as e:
            logger.error(f"Failed to get injuries: {e}")
        return []
