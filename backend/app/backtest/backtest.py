"""Backtesting module for evaluating model performance."""
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from database import Database
from logger import setup_logger

logger = setup_logger(__name__)


class Backtester:
    """Backtest models on historical data."""

    def __init__(self):
        """Initialize backtester."""
        self.db = Database()

    def backtest_models(self, league_id: int, start_date: str, end_date: str,
                       models: List[str] = None) -> Dict[str, Dict]:
        """Backtest multiple models over a period."""
        try:
            if models is None:
                models = ['poisson', 'negative_binomial', 'hawkes', 'hmm', 'ensemble']

            results = {}
            for model in models:
                results[model] = self._backtest_single_model(
                    league_id, start_date, end_date, model
                )

            return results
        except Exception as e:
            logger.error(f"Backtest failed: {e}")
            return {}

    def _backtest_single_model(self, league_id: int, start_date: str,
                              end_date: str, model_type: str) -> Dict:
        """Backtest a single model."""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()

            # Get predictions and results
            cursor.execute("""
                SELECT p.home_probability, p.draw_probability, p.away_probability,
                       p.predicted_score, m.home_score, m.away_score
                FROM predictions p
                JOIN matches m ON p.match_id = m.id
                WHERE p.model_type = ? AND m.league_id = ?
                AND m.match_date BETWEEN ? AND ?
                AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL
            """, (model_type, league_id, start_date, end_date))

            rows = cursor.fetchall()
            conn.close()

            if not rows:
                return {
                    'accuracy': 0.0,
                    'log_loss': 0.0,
                    'brier_score': 0.0,
                    'count': 0
                }

            # Calculate metrics
            accuracy = self._calculate_accuracy(rows)
            log_loss = self._calculate_log_loss(rows)
            brier_score = self._calculate_brier_score(rows)

            return {
                'accuracy': accuracy,
                'log_loss': log_loss,
                'brier_score': brier_score,
                'count': len(rows),
                'model': model_type
            }
        except Exception as e:
            logger.error(f"Failed to backtest {model_type}: {e}")
            return {'accuracy': 0.0, 'log_loss': 0.0, 'brier_score': 0.0, 'count': 0}

    def _calculate_accuracy(self, rows: List[Tuple]) -> float:
        """Calculate prediction accuracy."""
        try:
            correct = 0
            for row in rows:
                home_prob, draw_prob, away_prob = row[:3]
                home_score, away_score = row[4:]

                # Actual result
                if home_score > away_score:
                    actual = 'home'
                elif home_score == away_score:
                    actual = 'draw'
                else:
                    actual = 'away'

                # Predicted result
                probs = {'home': home_prob, 'draw': draw_prob, 'away': away_prob}
                predicted = max(probs, key=probs.get)

                if actual == predicted:
                    correct += 1

            return correct / len(rows) if rows else 0.0
        except Exception as e:
            logger.error(f"Failed to calculate accuracy: {e}")
            return 0.0

    def _calculate_log_loss(self, rows: List[Tuple]) -> float:
        """Calculate log loss."""
        try:
            total_loss = 0.0
            epsilon = 1e-15

            for row in rows:
                home_prob, draw_prob, away_prob = row[:3]
                home_score, away_score = row[4:]

                # Actual probability
                if home_score > away_score:
                    actual_prob = home_prob
                elif home_score == away_score:
                    actual_prob = draw_prob
                else:
                    actual_prob = away_prob

                # Clamp to avoid log(0)
                actual_prob = max(min(actual_prob, 1.0 - epsilon), epsilon)
                total_loss += -np.log(actual_prob)

            return total_loss / len(rows) if rows else 0.0
        except Exception as e:
            logger.error(f"Failed to calculate log loss: {e}")
            return 0.0

    def _calculate_brier_score(self, rows: List[Tuple]) -> float:
        """Calculate Brier score."""
        try:
            total_score = 0.0

            for row in rows:
                home_prob, draw_prob, away_prob = row[:3]
                home_score, away_score = row[4:]

                # Actual result (one-hot)
                actual = np.zeros(3)
                if home_score > away_score:
                    actual[0] = 1
                elif home_score == away_score:
                    actual[1] = 1
                else:
                    actual[2] = 1

                # Predicted probabilities
                predicted = np.array([home_prob, draw_prob, away_prob])

                # Brier score for this prediction
                total_score += np.mean((predicted - actual) ** 2)

            return total_score / len(rows) if rows else 0.0
        except Exception as e:
            logger.error(f"Failed to calculate Brier score: {e}")
            return 0.0

    def get_calibration_data(self, league_id: int, model_type: str,
                            bins: int = 10) -> Dict[str, List[float]]:
        """Get calibration curve data."""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT p.home_probability, m.home_score, m.away_score
                FROM predictions p
                JOIN matches m ON p.match_id = m.id
                WHERE p.model_type = ? AND m.league_id = ?
                AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL
            """, (model_type, league_id))

            rows = cursor.fetchall()
            conn.close()

            bin_edges = np.linspace(0, 1, bins + 1)
            bin_accuracy = []
            bin_confidence = []

            for i in range(bins):
                mask = [(bin_edges[i] <= row[0] <= bin_edges[i + 1]) for row in rows]
                bin_rows = [row for row, m in zip(rows, mask) if m]

                if bin_rows:
                    accuracy = sum(1 for row in bin_rows if row[1] > row[2]) / len(bin_rows)
                    confidence = np.mean([row[0] for row in bin_rows])
                    bin_accuracy.append(accuracy)
                    bin_confidence.append(confidence)

            return {
                'confidence': bin_confidence,
                'accuracy': bin_accuracy,
                'bin_edges': bin_edges.tolist()
            }
        except Exception as e:
            logger.error(f"Failed to get calibration data: {e}")
            return {'confidence': [], 'accuracy': [], 'bin_edges': []}
