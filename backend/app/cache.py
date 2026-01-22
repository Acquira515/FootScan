"""Caching system for the football prediction app."""
import json
from datetime import datetime, timedelta
from typing import Optional, Any
from database import Database
from logger import setup_logger

logger = setup_logger(__name__)


class Cache:
    """Cache manager using SQLite backend."""

    def __init__(self, db: Database = None):
        """Initialize cache."""
        self.db = db or Database()

    def get_cache(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT cache_value FROM cache 
            WHERE cache_key = ? 
            AND (expires_at IS NULL OR expires_at > datetime('now'))
        """, (key,))
        row = cursor.fetchone()
        conn.close()

        if row:
            try:
                return json.loads(row[0])
            except (json.JSONDecodeError, TypeError):
                logger.error(f"Failed to decode cache for key: {key}")
                return None
        return None

    def set_cache(self, key: str, value: Any, ttl_seconds: int = None) -> bool:
        """Set cache value."""
        try:
            cache_value = json.dumps(value)
            conn = self.db.get_connection()
            cursor = conn.cursor()

            expires_at = None
            if ttl_seconds and ttl_seconds > 0:
                expires_at = (datetime.now() + 
                             timedelta(seconds=ttl_seconds)).isoformat()

            cursor.execute("""
                INSERT OR REPLACE INTO cache 
                (cache_key, cache_value, ttl_seconds, expires_at)
                VALUES (?, ?, ?, ?)
            """, (key, cache_value, ttl_seconds, expires_at))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Failed to set cache: {e}")
            return False

    def delete_cache(self, key: str) -> bool:
        """Delete cache entry."""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM cache WHERE cache_key = ?", (key,))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Failed to delete cache: {e}")
            return False

    def clear_all_cache(self) -> bool:
        """Clear all cache entries."""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM cache")
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            return False

    def cleanup_expired(self):
        """Clean up expired cache entries."""
        try:
            self.db.clean_expired_cache()
            logger.info("Cache cleanup completed")
        except Exception as e:
            logger.error(f"Failed to cleanup cache: {e}")
