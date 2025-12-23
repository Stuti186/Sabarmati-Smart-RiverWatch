import xarray as xr
import os

nc_path = os.path.join(os.path.dirname(__file__), "time_series", "sabarmati.nc")
ds = xr.open_dataset(nc_path)
print("First date:", str(ds['date'].values[0]))
print("Last date:", str(ds['date'].values[-1]))
print("Total samples:", len(ds['date'].values))
