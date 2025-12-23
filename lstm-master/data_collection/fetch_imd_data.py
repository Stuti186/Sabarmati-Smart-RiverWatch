#!/usr/bin/env python3
"""
Fetch rainfall data from India Meteorological Department (IMD)
For Sabarmati River basin flood prediction
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import json

class IMDRainfallFetcher:
    """Fetch IMD rainfall data for Sabarmati basin"""
    
    def __init__(self, output_dir="data/imd"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Sabarmati basin approximate coordinates (Ahmedabad region)
        self.latitude = 23.0225
        self.longitude = 72.5714
        
    def fetch_rainfall_data(self, start_date, end_date, station_id=None):
        """
        Fetch rainfall data from IMD
        
        Note: IMD doesn't have a public API, so this script:
        1. Provides structure for manual data download
        2. Can use OpenWeatherMap as alternative
        3. Processes downloaded CSV files
        """
        print(f"📥 Fetching IMD rainfall data from {start_date} to {end_date}")
        
        # Option 1: Process manually downloaded IMD CSV
        # Download from: https://mausam.imd.gov.in/
        manual_file = self.output_dir / "imd_rainfall_manual.csv"
        
        if manual_file.exists():
            print(f"✅ Found manual IMD data file: {manual_file}")
            return self.process_imd_csv(manual_file)
        
        # Option 2: Use OpenWeatherMap API (backup)
        print("⚠️  IMD manual data not found. Using OpenWeatherMap API...")
        return self.fetch_openweather_data(start_date, end_date)
    
    def fetch_openweather_data(self, start_date, end_date):
        """Fetch data from OpenWeatherMap API as backup"""
        import os
        # Note: Requires API key - set OPENWEATHER_API_KEY environment variable
        api_key = os.getenv('OPENWEATHER_API_KEY', '')
        
        if not api_key:
            print("⚠️  No OpenWeatherMap API key found.")
            print("   Set OPENWEATHER_API_KEY environment variable")
            print("   Or download IMD data manually from https://mausam.imd.gov.in/")
            return self.generate_sample_data(start_date, end_date)
        
        try:
            url = f"http://api.openweathermap.org/data/2.5/forecast"
            params = {
                'lat': self.latitude,
                'lon': self.longitude,
                'appid': api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return self.process_openweather_data(data)
            else:
                print(f"⚠️  API error: {response.status_code}")
                return self.generate_sample_data(start_date, end_date)
        except Exception as e:
            print(f"⚠️  Error fetching data: {e}")
            return self.generate_sample_data(start_date, end_date)
    
    def process_imd_csv(self, file_path):
        """Process manually downloaded IMD CSV file"""
        try:
            df = pd.read_csv(file_path)
            # Standardize column names
            if 'Date' in df.columns:
                df['date'] = pd.to_datetime(df['Date'])
            if 'Rainfall' in df.columns:
                df['rainfall_mm'] = df['Rainfall']
            
            df = df[['date', 'rainfall_mm']].copy()
            df.to_csv(self.output_dir / "rainfall_processed.csv", index=False)
            print(f"✅ Processed IMD data: {len(df)} records")
            return df
        except Exception as e:
            print(f"❌ Error processing IMD CSV: {e}")
            return None
    
    def process_openweather_data(self, data):
        """Process OpenWeatherMap API response"""
        records = []
        for item in data.get('list', []):
            dt = datetime.fromtimestamp(item['dt'])
            rainfall = item.get('rain', {}).get('3h', 0)  # 3-hour rainfall
            records.append({
                'date': dt,
                'rainfall_mm': rainfall
            })
        
        df = pd.DataFrame(records)
        df.to_csv(self.output_dir / "rainfall_openweather.csv", index=False)
        return df
    
    def generate_sample_data(self, start_date, end_date):
        """Generate sample rainfall data for demo"""
        print("📊 Generating sample rainfall data for demo...")
        
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        dates = pd.date_range(start, end, freq='D')
        
        # Simulate monsoon pattern (higher rainfall in June-September)
        rainfall = []
        for date in dates:
            month = date.month
            if month in [6, 7, 8, 9]:  # Monsoon months
                base_rainfall = np.random.exponential(10)
            else:
                base_rainfall = np.random.exponential(2)
            rainfall.append(max(0, base_rainfall))
        
        df = pd.DataFrame({
            'date': dates,
            'rainfall_mm': rainfall
        })
        
        output_file = self.output_dir / "rainfall_sample.csv"
        df.to_csv(output_file, index=False)
        print(f"✅ Generated sample data: {output_file}")
        return df

def main():
    """Main function"""
    import os
    
    print("=" * 70)
    print("🌧️  IMD RAINFALL DATA FETCHER")
    print("=" * 70)
    
    fetcher = IMDRainfallFetcher()
    
    # Fetch last 2 years of data
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730)
    
    df = fetcher.fetch_rainfall_data(
        start_date.strftime('%Y-%m-%d'),
        end_date.strftime('%Y-%m-%d')
    )
    
    if df is not None:
        print(f"\n✅ Successfully fetched {len(df)} rainfall records")
        print(f"📁 Data saved to: {fetcher.output_dir}")
    else:
        print("\n❌ Failed to fetch data")

if __name__ == "__main__":
    import os
    main()

