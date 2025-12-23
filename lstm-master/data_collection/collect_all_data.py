#!/usr/bin/env python3
"""
Master script to collect all data for Sabarmati River flood prediction
Runs all data collection scripts and integrates the data
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def main():
    print("=" * 70)
    print("🚀 SABARMATI RIVER DATA COLLECTION - MASTER SCRIPT")
    print("=" * 70)
    
    print("\n📋 This script will:")
    print("   1. Check for CWC discharge data")
    print("   2. Check for IMD/NASA rainfall data")
    print("   3. Process and integrate all data")
    print("   4. Generate NeuralHydrology-compatible format")
    
    print("\n" + "=" * 70)
    print("Step 1: CWC Discharge Data")
    print("=" * 70)
    try:
        from fetch_cwc_data import CWCDischargeFetcher
        cwc_fetcher = CWCDischargeFetcher()
        cwc_fetcher.download_instructions()
        
        # Check for existing data
        raw_dir = cwc_fetcher.output_dir / "raw"
        if raw_dir.exists() and list(raw_dir.glob("*.csv")):
            print("\n✅ Processing existing CWC data...")
            for csv_file in raw_dir.glob("*.csv"):
                cwc_fetcher.process_cwc_csv(csv_file)
        else:
            print("\n📊 Generating sample discharge data for demo...")
            from datetime import datetime, timedelta
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            cwc_fetcher.generate_sample_discharge(
                start_date.strftime('%Y-%m-%d'),
                end_date.strftime('%Y-%m-%d')
            )
    except Exception as e:
        print(f"⚠️  CWC data collection error: {e}")
    
    print("\n" + "=" * 70)
    print("Step 2: Rainfall Data (IMD/NASA)")
    print("=" * 70)
    try:
        from fetch_imd_data import IMDRainfallFetcher
        imd_fetcher = IMDRainfallFetcher()
        
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)
        
        imd_fetcher.fetch_rainfall_data(
            start_date.strftime('%Y-%m-%d'),
            end_date.strftime('%Y-%m-%d')
        )
    except Exception as e:
        print(f"⚠️  Rainfall data collection error: {e}")
    
    print("\n" + "=" * 70)
    print("Step 3: Integrate All Data")
    print("=" * 70)
    try:
        from integrate_all_data import DataIntegrator
        integrator = DataIntegrator()
        result = integrator.integrate_data()
        
        if result is not None:
            print("\n✅ Data integration successful!")
            print(f"   📊 Total records: {len(result)}")
            print(f"   📅 Date range: {result['date'].min()} to {result['date'].max()}")
        else:
            print("\n⚠️  Data integration completed with sample data")
    except Exception as e:
        print(f"⚠️  Data integration error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("✅ DATA COLLECTION COMPLETE")
    print("=" * 70)
    print("\n📁 Output files:")
    print("   • ML/basins/sabarmati/discharge.csv")
    print("   • ML/basins/sabarmati/rainfall.csv")
    print("   • ML/basins/sabarmati/time_series/sabarmati.nc")
    print("\n🚀 Ready for model training!")
    print("   Run: cd ML && python demo_sabarmati.py")

if __name__ == "__main__":
    main()

