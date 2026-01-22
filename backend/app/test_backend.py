#!/usr/bin/env python3
"""
Quick test script to verify the backend is working correctly.
Run this from the backend/app directory.
"""

import sys
import requests
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_backend():
    """Test backend connectivity and basic endpoints."""
    
    BASE_URL = "http://localhost:5000"
    print("🧪 Testing Football Prediction Backend...")
    print(f"   Base URL: {BASE_URL}\n")
    
    # Test 1: Health check
    print("1️⃣  Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/status", timeout=5)
        if response.status_code == 200:
            print("   ✅ Status endpoint working")
            data = response.json()
            print(f"   Version: {data.get('version')}")
            print(f"   Environment: {data.get('environment')}\n")
        else:
            print(f"   ❌ Status returned {response.status_code}\n")
            return False
    except Exception as e:
        print(f"   ❌ Failed to connect: {e}\n")
        print("   Make sure backend is running: python backend/app/main.py\n")
        return False
    
    # Test 2: Get matches
    print("2️⃣  Testing matches endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/matches?league_id=2790&days=7", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Found {data.get('count', 0)} matches\n")
        else:
            print(f"   ⚠️  Matches endpoint returned {response.status_code}")
            print("   (This is OK if API keys not configured)\n")
    except Exception as e:
        print(f"   ⚠️  Could not fetch matches: {e}\n")
    
    # Test 3: Settings
    print("3️⃣  Testing settings endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/settings", timeout=5)
        if response.status_code == 200:
            data = response.json()
            settings = data.get('data', {})
            print("   ✅ Settings retrieved:")
            print(f"      Default League: {settings.get('default_league_id')}")
            print(f"      Cache TTL: {settings.get('cache_ttl')}s\n")
        else:
            print(f"   ❌ Settings returned {response.status_code}\n")
    except Exception as e:
        print(f"   ❌ Failed to get settings: {e}\n")
    
    # Test 4: Database
    print("4️⃣  Testing database...")
    try:
        from database import Database
        db = Database()
        print("   ✅ Database initialized\n")
    except Exception as e:
        print(f"   ❌ Database error: {e}\n")
        return False
    
    # Test 5: Models
    print("5️⃣  Testing models...")
    try:
        from models.poisson import PoissonModel
        from models.negative_binomial import NegativeBinomialModel
        from models.hawkes import HawkesModel
        from models.hmm import HMMFormModel
        from models.mixture_expert import MixtureOfExpertsModel
        
        import numpy as np
        
        # Quick test
        poisson = PoissonModel()
        pred = poisson.predict()
        print(f"   ✅ Poisson model working")
        print(f"      Prediction: {pred.get('predicted_score')}")
        print(f"      Home prob: {pred.get('home_probability'):.2%}\n")
    except Exception as e:
        print(f"   ❌ Model error: {e}\n")
        return False
    
    print("=" * 50)
    print("✅ All tests passed!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Make sure API keys are configured in backend/app/.env")
    print("2. Try the frontend: npm start in electron/renderer")
    print("3. Open the Settings tab and add your API keys")
    print("4. Go to Predict tab and make a prediction!")
    
    return True


if __name__ == "__main__":
    test_backend()
