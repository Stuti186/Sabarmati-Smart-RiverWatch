#!/usr/bin/env python3
"""
Complete Presentation Demo for Hackathon
Combines all visualizations and metrics into a single presentation-ready output
"""

import sys
from pathlib import Path
import subprocess

def run_demo():
    """Run the enhanced demo script"""
    print("=" * 80)
    print("🎬 SMART RIVER WATCH - COMPLETE PRESENTATION DEMO")
    print("=" * 80)
    print("\nThis script will:")
    print("  1. Load Sabarmati River data")
    print("  2. Generate LSTM predictions")
    print("  3. Calculate comprehensive metrics")
    print("  4. Create presentation-ready visualizations")
    print("  5. Generate summary report")
    print("\n" + "=" * 80 + "\n")
    
    demo_script = Path(__file__).parent / "demo_sabarmati_enhanced.py"
    
    if not demo_script.exists():
        print(f"❌ Error: {demo_script} not found!")
        print("   Please ensure demo_sabarmati_enhanced.py exists.")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, str(demo_script)],
            cwd=str(Path(__file__).parent),
            check=True,
            capture_output=False
        )
        print("\n" + "=" * 80)
        print("✅ Presentation demo completed successfully!")
        print("=" * 80)
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error running demo: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = run_demo()
    sys.exit(0 if success else 1)

