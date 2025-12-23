import pandas as pd
import numpy as np
import xarray as xr
import os
from datetime import datetime

# Paths
rainfall_csv = os.path.join(os.path.dirname(__file__), "rainfall.csv")
discharge_csv = os.path.join(os.path.dirname(__file__), "discharge.csv")
out_nc = os.path.join(os.path.dirname(__file__), "time_series", "sabarmati.nc")

# Read CSVs
rain = pd.read_csv(rainfall_csv)
discharge = pd.read_csv(discharge_csv)

# Parse date columns
rain['date'] = pd.to_datetime(rain['date'])
discharge['date'] = pd.to_datetime(discharge['date'])

# Merge on date
df = pd.merge(rain, discharge, on='date', how='inner')

# Prepare time index
dates = df['date'].values.astype('datetime64[ns]')

# Prepare data variables
rainfall = df['rainfall_mm'].values.astype(np.float32)
discharge_vals = df[df.columns[-1]].values.astype(np.float32)  # last column is discharge

# Create xarray Dataset with 'date' as coordinate
xrds = xr.Dataset(
    {
        'rainfall_mm': (['date'], rainfall),
        'discharge': (['date'], discharge_vals)
    },
    coords={
        'date': dates
    }
)

# Save to NetCDF
os.makedirs(os.path.join(os.path.dirname(__file__), "time_series"), exist_ok=True)
xrds.to_netcdf(out_nc)
print(f"NetCDF file written to {out_nc}")
