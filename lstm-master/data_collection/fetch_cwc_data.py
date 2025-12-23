#!/usr/bin/env python3
"""
Fetch discharge data from Central Water Commission (CWC)
For Sabarmati River flood prediction

Note: CWC data is typically available through India-WRIS portal
This script provides structure for processing downloaded data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import requests
import json

class CWCDischargeFetcher:
    """Fetch CWC discharge data for Sabarmati River"""
    
    def __init__(self, output_dir="data/cwc"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Sabarmati River stations (update with actual station IDs from CWC)
        self.stations = {
            'dharoi': {
                'name': 'Dharoi Dam',
                'station_id': 'SABARMATI_DHAROI',  # Update with actual ID
                'lat': 23.8,
                'lon': 72.9
            },
            'ahmedabad': {
                'name': 'Ahmedabad',
                'station_id': 'SABARMATI_AHM',  # Update with actual ID
                'lat': 23.0225,
                'lon': 72.5714
            }
        }
    
    def process_cwc_csv(self, file_path, station_name='sabarmati'):
        """
        Process manually downloaded CWC discharge CSV
        
        Download from: https://indiawris.gov.in/wris/
        Navigate to: Data Download > Hydro-meteorological > Discharge
        Select: Sabarmati River stations
        """
        print(f"📥 Processing CWC discharge data from: {file_path}")
        
        try:
            # Try different possible formats
            df = pd.read_csv(file_path)
            
            # Standardize column names
            date_col = None
            discharge_col = None
            
            for col in df.columns:
                col_lower = col.lower()
                if 'date' in col_lower or 'time' in col_lower:
                    date_col = col
                if 'discharge' in col_lower or 'flow' in col_lower or 'q' == col_lower:
                    discharge_col = col
            
            if date_col and discharge_col:
                df_processed = pd.DataFrame({
                    'date': pd.to_datetime(df[date_col]),
                    'discharge': pd.to_numeric(df[discharge_col], errors='coerce')
                })
                
                # Remove invalid values
                df_processed = df_processed.dropna()
                
                output_file = self.output_dir / f"discharge_{station_name}.csv"
                df_processed.to_csv(output_file, index=False)
                
                print(f"✅ Processed {len(df_processed)} discharge records")
                print(f"📁 Saved to: {output_file}")
                
                return df_processed
            else:
                print("⚠️  Could not identify date/discharge columns")
                print(f"   Available columns: {list(df.columns)}")
                return None
                
        except Exception as e:
            print(f"❌ Error processing CWC CSV: {e}")
            return None
    
    def generate_sample_discharge(self, start_date, end_date, base_flow=700):
        """
        Generate sample discharge data for demo
        
        For hackathon: Use this if real CWC data is not available
        """
        print("📊 Generating sample discharge data for demo...")
        
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        
        # Hourly data
        dates = pd.date_range(start, end, freq='H')
        
        # Simulate discharge with some variation
        discharge = []
        for i, date in enumerate(dates):
            # Base flow with daily variation
            hour = date.hour
            day_of_year = date.timetuple().tm_yday
            
            # Simulate monsoon effect (higher discharge in monsoon months)
            month = date.month
            if month in [6, 7, 8, 9]:
                monsoon_factor = 1.5
            else:
                monsoon_factor = 0.8
            
            # Add some randomness
            variation = np.random.normal(0, 100)
            flow = base_flow * monsoon_factor + variation
            
            # Ensure positive values
            flow = max(500, flow)
            
            discharge.append(flow)
        
        df = pd.DataFrame({
            'date': dates,
            'discharge': discharge
        })
        
        output_file = self.output_dir / "discharge_sample.csv"
        df.to_csv(output_file, index=False)
        print(f"✅ Generated sample discharge data: {len(df)} records")
        print(f"📁 Saved to: {output_file}")
        
        return df
    
    def download_instructions(self):
        """Print instructions for downloading CWC data"""
        print("\n" + "=" * 70)
        print("📋 INSTRUCTIONS FOR DOWNLOADING CWC DATA")
        print("=" * 70)
        print("\n1. Visit India-WRIS Portal: https://indiawris.gov.in/wris/")
        print("2. Navigate to: Data Download > Hydro-meteorological Data")
        print("3. Select: Discharge Data")
        print("4. Choose: Sabarmati River basin")
        print("5. Select stations:")
        print("   - Dharoi Dam")
        print("   - Ahmedabad (Sabarmati)")
        print("   - Other stations in basin")
        print("6. Download data for each year (2000-2024)")
        print("7. Save CSV files in: data/cwc/raw/")
        print("8. Run: python process_cwc_data.py")
        print("\n" + "=" * 70)

def main():
    """Main function"""
    print("=" * 70)
    print("💧 CWC DISCHARGE DATA PROCESSOR")
    print("=" * 70)
    
    fetcher = CWCDischargeFetcher()
    
    # Check for manually downloaded files
    raw_dir = fetcher.output_dir / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    
    csv_files = list(raw_dir.glob("*.csv"))
    
    if csv_files:
        print(f"\n✅ Found {len(csv_files)} CWC data file(s)")
        for csv_file in csv_files:
            fetcher.process_cwc_csv(csv_file)
    else:
        print("\n⚠️  No CWC data files found in data/cwc/raw/")
        fetcher.download_instructions()
        
        # Generate sample data for demo
        print("\n📊 Generating sample data for hackathon demo...")
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        fetcher.generate_sample_discharge(
            start_date.strftime('%Y-%m-%d'),
            end_date.strftime('%Y-%m-%d')
        )

if __name__ == "__main__":
    main()

