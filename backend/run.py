#!/usr/bin/env python3
"""
Development utility for running backend outside of Electron.
Useful for testing API endpoints independently.
"""

import os
import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent / "app"))

def main():
    print("🚀 Football Prediction Backend - Development Mode")
    print("=" * 60)
    
    # Check if .env exists
    env_file = Path(__file__).parent / "app" / ".env"
    if not env_file.exists():
        print("⚠️  .env file not found!")
        print(f"   Expected: {env_file}")
        print("   Creating from example...")
        example_file = Path(__file__).parent / "app" / ".env.example"
        if example_file.exists():
            import shutil
            shutil.copy(example_file, env_file)
            print(f"   ✅ Created {env_file}")
            print("   📝 Please edit the .env file with your API keys")
        else:
            print("   ❌ .env.example not found either!")
            return 1
    else:
        print("✅ Configuration loaded from .env")
    
    # Import and run
    try:
        from app.config import Config
        from app.logger import setup_logger
        from app.database import Database
        
        logger = setup_logger(__name__)
        
        print(f"\n📋 Configuration:")
        print(f"   API Port: {Config.API_PORT}")
        print(f"   API Host: {Config.API_HOST}")
        print(f"   Database: {Config.DATABASE_PATH}")
        print(f"   Environment: {Config.ENVIRONMENT}")
        print(f"   Debug: {Config.DEBUG}")
        
        # Initialize database
        print(f"\n💾 Initializing database...")
        db = Database()
        print(f"   ✅ Database ready: {Config.DATABASE_PATH}")
        
        # Run server
        print(f"\n🌐 Starting backend server...")
        print(f"   http://{Config.API_HOST}:{Config.API_PORT}")
        print(f"   Status endpoint: http://{Config.API_HOST}:{Config.API_PORT}/status")
        print("\n📌 Press Ctrl+C to stop server\n")
        
        from app.main import run_server
        run_server()
        
    except KeyboardInterrupt:
        print("\n\n👋 Backend stopped by user")
        return 0
    except Exception as e:
        print(f"\n❌ Error: {e}")
        logger.exception("Backend error")
        return 1

if __name__ == "__main__":
    sys.exit(main())
