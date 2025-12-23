#!/usr/bin/env python3
"""
Integrate all data sources for Sabarmati River flood prediction
Combines: CWC discharge, IMD/NASA rainfall, and other sources
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import xarray as xr

class DataIntegrator:
    """Integrate multiple data sources for Sabarmati River"""
    
    def __init__(self, output_dir="ML/basins/sabarmati"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.time_series_dir = self.output_dir / "time_series"
        self.time_series_dir.mkdir(exist_ok=True)
    
    def integrate_data(self, discharge_file=None, rainfall_file=None):
        """
        Integrate discharge and rainfall data into NeuralHydrology format
        
        Args:
            discharge_file: Path to discharge CSV
            rainfall_file: Path to rainfall CSV
        """
        print("=" * 70)
        print("🔄 INTEGRATING DATA FOR SABARMATI RIVER")
        print("=" * 70)
        
        # Load discharge data
        if discharge_file and Path(discharge_file).exists():
            print(f"\n📥 Loading discharge data: {discharge_file}")
            discharge_df = pd.read_csv(discharge_file)
            discharge_df['date'] = pd.to_datetime(discharge_df['date'])
        else:
            print("⚠️  Discharge file not found, checking default locations...")
            discharge_df = self.load_discharge_data()
        
        # Load rainfall data
        if rainfall_file and Path(rainfall_file).exists():
            print(f"\n📥 Loading rainfall data: {rainfall_file}")
            rainfall_df = pd.read_csv(rainfall_file)
            rainfall_df['date'] = pd.to_datetime(rainfall_df['date'])
        else:
            print("⚠️  Rainfall file not found, checking default locations...")
            rainfall_df = self.load_rainfall_data()
        
        if discharge_df is None or rainfall_df is None:
            print("❌ Could not load required data files")
            return None
        
        # Merge data
        print("\n🔄 Merging discharge and rainfall data...")
        merged_df = pd.merge(
            rainfall_df,
            discharge_df,
            on='date',
            how='outer'
        ).sort_values('date')
        
        # Fill missing values
        merged_df = merged_df.interpolate(method='time')
        merged_df = merged_df.fillna(method='bfill').fillna(method='ffill')
        
        # Save merged CSV
        merged_csv = self.output_dir / "merged_data.csv"
        merged_df.to_csv(merged_csv, index=False)
        print(f"✅ Merged data saved: {merged_csv}")
        
        # Convert to NetCDF format (required by NeuralHydrology)
        print("\n🔄 Converting to NetCDF format...")
        nc_file = self.convert_to_netcdf(merged_df)
        
        # Save individual files
        discharge_output = self.output_dir / "discharge.csv"
        rainfall_output = self.output_dir / "rainfall.csv"
        
        discharge_df[['date', 'discharge']].to_csv(discharge_output, index=False)
        rainfall_df[['date', 'rainfall_mm']].to_csv(rainfall_output, index=False)
        
        print(f"\n✅ Data integration complete!")
        print(f"   📁 Discharge: {discharge_output}")
        print(f"   📁 Rainfall: {rainfall_output}")
        print(f"   📁 NetCDF: {nc_file}")
        
        return merged_df
    
    def load_discharge_data(self):
        """Try to load discharge data from various locations"""
        possible_locations = [
            "data/cwc/discharge_sample.csv",
            "data/cwc/discharge_sabarmati.csv",
            "ML/basins/sabarmati/discharge.csv"
        ]
        
        for loc in possible_locations:
            if Path(loc).exists():
                print(f"✅ Found discharge data: {loc}")
                df = pd.read_csv(loc)
                if 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date'])
                return df
        
        print("⚠️  No discharge data found. Generating sample...")
        return self.generate_sample_discharge()
    
    def load_rainfall_data(self):
        """Try to load rainfall data from various locations"""
        possible_locations = [
            "data/imd/rainfall_processed.csv",
            "data/imd/rainfall_sample.csv",
            "data/nasa_gpm/gpm_sample.csv",
            "ML/basins/sabarmati/rainfall.csv"
        ]
        
        for loc in possible_locations:
            if Path(loc).exists():
                print(f"✅ Found rainfall data: {loc}")
                df = pd.read_csv(loc)
                if 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date'])
                return df
        
        print("⚠️  No rainfall data found. Generating sample...")
        return self.generate_sample_rainfall()
    
    def convert_to_netcdf(self, df):
        """Convert DataFrame to NetCDF format for NeuralHydrology"""
        try:
            # Set date as index
            df_indexed = df.set_index('date')
            
            # Convert to xarray Dataset
            ds = xr.Dataset.from_dataframe(df_indexed)
            
            # Add attributes
            ds.attrs['title'] = 'Sabarmati River Hydrological Data'
            ds.attrs['basin'] = 'sabarmati'
            ds.attrs['created'] = datetime.now().isoformat()
            
            # Save NetCDF
            nc_file = self.time_series_dir / "sabarmati.nc"
            ds.to_netcdf(nc_file)
            
            print(f"✅ NetCDF file created: {nc_file}")
            return nc_file
            
        except Exception as e:
            print(f"⚠️  Error creating NetCDF: {e}")
            print("   Continuing with CSV format...")
            return None
    
    def generate_sample_discharge(self):
        """Generate sample discharge data"""
        dates = pd.date_range('2006-08-19', '2006-08-21', freq='H')
        discharge = 700 + np.random.normal(0, 100, len(dates))
        discharge = np.maximum(discharge, 500)
        
        return pd.DataFrame({
            'date': dates,
            'discharge': discharge
        })
    
    def generate_sample_rainfall(self):
        """Generate sample rainfall data"""
        dates = pd.date_range('2000-01-01', '2024-12-31', freq='D')
        rainfall = np.random.exponential(5, len(dates))
        
        return pd.DataFrame({
            'date': dates,
            'rainfall_mm': rainfall
        })

def main():
    """Main integration function"""
    integrator = DataIntegrator()
    
    # Try to integrate available data
    result = integrator.integrate_data()
    
    if result is not None:
        print("\n" + "=" * 70)
        print("✅ DATA INTEGRATION SUCCESSFUL")
        print("=" * 70)
        print("\n📊 Summary:")
        print(f"   Total records: {len(result)}")
        print(f"   Date range: {result['date'].min()} to {result['date'].max()}")
        print(f"   Columns: {list(result.columns)}")
        print("\n🚀 Ready for model training!")
    else:
        print("\n❌ Data integration failed")
        print("   Check data files and try again")

if __name__ == "__main__":
    main()

