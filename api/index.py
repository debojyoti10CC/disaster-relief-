#!/usr/bin/env python3
"""
Vercel API entry point for Disaster Management System
"""

import sys
import os

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, project_root)

# Import the Vercel-optimized Flask app
from frontend.vercel_app import app

# Vercel handler function
def handler(event, context):
    return app

# For local testing
if __name__ == "__main__":
    app.run(debug=True)