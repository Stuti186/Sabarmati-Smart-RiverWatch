#!/usr/bin/env python3
"""
Fetch rainfall data from NASA GPM (Global Precipitation Measurement)
For Sabarmati River basin flood prediction

NASA GPM provides high-resolution global precipitation data
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import os

class NASAGPMFetcher:
    """Fetch NASA GPM precipitation data"""
    
    def __init__(self, output_dir="data/nasa_gpm"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Sabarmati basin coordinates (Ahmedabad region)
        self.latitude = 23.0225
        self.longitude = 72.5714
        
        # NASA GPM data portal
        self.gpm_portal = "https://gpm.nasa.gov/data/directory"
        
    def download_instructions(self):
        """Print instructions for downloading NASA GPM data"""
        print("\n" + "=" * 70)
        print("📋 INSTRUCTIONS FOR NASA GPM DATA")
        print("=" * 70)
        print("\n1. Visit NASA GPM Portal: https://gpm.nasa.gov/data/directory")
        print("2. Register for free account (if needed)")
        print("3. Navigate to: GPM IMERG Final Run")
        print("4. Select: Daily/Hourly precipitation")
        print("5. Choose region: India (23°N, 72°E)")
        print("6. Download NetCDF files for required dates")
        print("7. Use Python script to extract data:")
        print("   python extract_gpm_netcdf.py")
        print("\nAlternative: Use NASA Earthdata API")
        print("  - Register at: https://urs.earthdata.nasa.gov/")
        print("  - Use API credentials")
        print("\n" + "=" * 70)
    
    def extract_from_netcdf(self, netcdf_file, output_csv=None):
        """
        Extract rainfall data from downloaded GPM NetCDF file
        
        Requires: xarray, netCDF4
        """
        try:
            import xarray as xr
            
            print(f"📥 Extracting data from: {netcdf_file}")
            
            # Open NetCDF file
            ds = xr.open_dataset(netcdf_file)
            
            # Extract precipitation data
            # GPM variable names may vary
            if 'precipitation' in ds.variables:
                precip = ds['precipitation']
            elif 'precip' in ds.variables:
                precip = ds['precip']
            else:
                print("⚠️  Could not find precipitation variable")
                print(f"   Available variables: {list(ds.variables)}")
                return None
            
            # Extract for Sabarmati coordinates
            # Select nearest grid point
            precip_point = precip.sel(
                lat=self.latitude,
                lon=self.longitude,
                method='nearest'
            )
            
            # Convert to DataFrame
            df = precip_point.to_dataframe().reset_index()
            
            if output_csv is None:
                output_csv = self.output_dir / "gpm_rainfall.csv"
            
            df.to_csv(output_csv, index=False)
            print(f"✅ Extracted {len(df)} records")
            print(f"📁 Saved to: {output_csv}")
            
            return df
            
        except ImportError:
            print("❌ xarray not installed. Install with: pip install xarray")
            return None
        except Exception as e:
            print(f"❌ Error extracting NetCDF: {e}")
            return None
    
    def generate_sample_gpm_data(self, start_date, end_date):
        """Generate sample GPM-like data for demo"""
        print("📊 Generating sample GPM rainfall data...")
        
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        dates = pd.date_range(start, end, freq='D')
        
        # Simulate GPM precipitation pattern
        rainfall = []
        for date in dates:
            month = date.month
            # Higher rainfall in monsoon (June-September)
            if month in [6, 7, 8, 9]:
                base = np.random.exponential(15)
            else:
                base = np.random.exponential(3)
            rainfall.append(max(0, base))
        
        df = pd.DataFrame({
            'date': dates,
            'rainfall_mm': rainfall,
            'source': 'NASA_GPM_SAMPLE'
        })
        
        output_file = self.output_dir / "gpm_sample.csv"
        df.to_csv(output_file, index=False)
        print(f"✅ Generated sample GPM data: {len(df)} records")
        return df

def main():
    """Main function"""
    print("=" * 70)
    print("🌍 NASA GPM PRECIPITATION DATA FETCHER")
    print("=" * 70)
    
    fetcher = NASAGPMFetcher()
    
    # Check for downloaded NetCDF files
    netcdf_files = list(fetcher.output_dir.glob("*.nc"))
    netcdf_files.extend(list(fetcher.output_dir.glob("*.nc4")))
    
    if netcdf_files:
        print(f"\n✅ Found {len(netcdf_files)} GPM NetCDF file(s)")
        for nc_file in netcdf_files:
            fetcher.extract_from_netcdf(nc_file)
    else:
        print("\n⚠️  No GPM NetCDF files found")
        fetcher.download_instructions()
        
        # Generate sample data
        print("\n📊 Generating sample data for demo...")
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        fetcher.generate_sample_gpm_data(
            start_date.strftime('%Y-%m-%d'),
            end_date.strftime('%Y-%m-%d')
        )

if __name__ == "__main__":
    main()

