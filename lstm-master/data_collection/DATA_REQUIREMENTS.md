# 📋 Data Requirements for Sabarmati River Flood Prediction

## 🎯 What Data You Need

### For Hackathon Demo (Minimum):
- ✅ **Sample data provided** - Already in `ML/basins/sabarmati/`
- ✅ **Demo script works** - No additional data needed
- ✅ **Visualization ready** - Can present immediately

### For Production Model (Recommended):

#### 1. **Discharge Data** (Primary - Most Important)
**Source**: Central Water Commission (CWC) / India-WRIS
- **Minimum**: 2-3 years of hourly/daily data
- **Ideal**: 5+ years for better model performance
- **Format**: CSV with columns: `date`, `discharge`
- **Stations**: 
  - Dharoi Dam
  - Ahmedabad (Sabarmati River)
  - Other gauge stations in basin

**How to Get**:
1. Visit: https://indiawris.gov.in/wris/
2. Navigate: Data Download > Hydro-meteorological > Discharge
3. Select: Sabarmati River basin stations
4. Download: Annual CSV files (2000-2024)
5. Save in: `data/cwc/raw/`
6. Run: `python fetch_cwc_data.py`

#### 2. **Rainfall Data** (Critical Input)
**Sources** (choose one or combine):
- **IMD** (India Meteorological Department)
- **NASA GPM** (Global Precipitation Measurement)
- **India Water Portal**

**Minimum**: Same time period as discharge data
**Format**: CSV with columns: `date`, `rainfall_mm`

**How to Get**:
- **IMD**: https://mausam.imd.gov.in/ (manual download)
- **NASA GPM**: https://gpm.nasa.gov/data/directory (requires registration)
- Run: `python fetch_imd_data.py` or `python fetch_nasa_gpm.py`

#### 3. **Water Level Data** (Optional but useful)
**Source**: CWC / India-WRIS
- River water levels
- Reservoir levels
- Format: CSV

#### 4. **Meteorological Data** (Optional)
- Temperature (max/min)
- Humidity
- Wind speed
- Evapotranspiration

## 🔗 API Keys & Access

### Required (for real-time data):

1. **OpenWeatherMap API** (Backup for rainfall)
   - Sign up: https://openweathermap.org/api
   - Free tier: 60 calls/minute
   - Set environment variable: `export OPENWEATHER_API_KEY=your_key`

2. **NASA Earthdata** (For GPM data)
   - Register: https://urs.earthdata.nasa.gov/
   - Free account
   - Use credentials in API calls

### Not Required (manual download):
- **CWC/India-WRIS**: No API, manual download only
- **IMD**: Limited API, mostly manual download

## 📥 Quick Data Collection Workflow

### Option 1: Use Sample Data (Hackathon)
```bash
# Already available - no action needed
cd ML
python demo_sabarmati.py
```

### Option 2: Collect Real Data
```bash
# Step 1: Download CWC discharge data manually
# Save to: data/cwc/raw/

# Step 2: Download IMD/NASA rainfall data
# Save to: data/imd/ or data/nasa_gpm/

# Step 3: Process and integrate
python data_collection/integrate_all_data.py
```

## 📊 Data Format Requirements

### Discharge CSV Format:
```csv
date,discharge
2006-08-19 00:00,713.89
2006-08-19 01:00,715.23
...
```

### Rainfall CSV Format:
```csv
date,rainfall_mm
2000-01-01,0.0
2000-01-02,5.2
...
```

### NetCDF Format (Auto-generated):
- Created automatically by `integrate_all_data.py`
- Saved to: `ML/basins/sabarmati/time_series/sabarmati.nc`

## ✅ Checklist

### For Hackathon Demo:
- [x] Sample data available
- [x] Demo script ready
- [x] Visualization working
- [x] No additional data needed

### For Production:
- [ ] CWC discharge data downloaded (2+ years)
- [ ] IMD/NASA rainfall data downloaded
- [ ] Data processed and integrated
- [ ] NetCDF file generated
- [ ] Model trained on real data

## 💡 Tips

1. **Start with sample data** for hackathon demo
2. **Download real data** after hackathon for production
3. **Use provided scripts** to process downloaded data
4. **Check data quality** before training model
5. **Document data sources** for attribution

## 🆘 Troubleshooting

### "No data files found"
- Check file paths in scripts
- Verify data files are in correct directories
- Use sample data generators if needed

### "API key not found"
- Set environment variables
- Or use manual download option
- Sample data works without API keys

### "NetCDF conversion failed"
- Install: `pip install xarray netCDF4`
- Check data format matches requirements
- CSV format also works for demo

---

**For hackathon**: Use sample data - everything is ready! 🚀
**For production**: Follow data collection scripts above 📊

