# 📊 Data Sources Summary - Sabarmati River Flood Prediction

## 🎯 What APIs & Datasets You Need

### ✅ **For Hackathon Demo (Ready Now)**
**No additional data needed!** Sample data is already provided and demo works.

### 📥 **For Production Model (Optional)**

## Required Data Sources:

### 1. **Central Water Commission (CWC) - Discharge Data** ⭐ PRIMARY
- **What**: River discharge measurements (m³/s)
- **Source**: India-WRIS Portal
- **URL**: https://indiawris.gov.in/wris/
- **Access**: Manual download (no public API)
- **Format**: CSV files
- **Process**: 
  1. Visit portal → Data Download → Hydro-meteorological → Discharge
  2. Select Sabarmati River basin stations
  3. Download annual CSV files (2000-2024)
  4. Save to: `data/cwc/raw/`
  5. Run: `python data_collection/fetch_cwc_data.py`

**Script Provided**: `data_collection/fetch_cwc_data.py`

---

### 2. **India Meteorological Department (IMD) - Rainfall Data** ⭐ PRIMARY
- **What**: Daily/hourly rainfall measurements (mm)
- **Source**: IMD Portal
- **URL**: https://mausam.imd.gov.in/
- **Access**: Limited API, mostly manual download
- **Format**: CSV files
- **Process**:
  1. Visit IMD portal
  2. Navigate to rainfall data section
  3. Select Sabarmati basin region
  4. Download CSV files
  5. Save to: `data/imd/`
  6. Run: `python data_collection/fetch_imd_data.py`

**Script Provided**: `data_collection/fetch_imd_data.py`

**Alternative**: OpenWeatherMap API (backup)
- **API Key**: Sign up at https://openweathermap.org/api
- **Set**: `export OPENWEATHER_API_KEY=your_key`
- **Free tier**: 60 calls/minute

---

### 3. **NASA GPM (Global Precipitation Measurement)** - Rainfall Data
- **What**: High-resolution global precipitation data
- **Source**: NASA GPM Portal
- **URL**: https://gpm.nasa.gov/data/directory
- **Access**: Registration required (free)
- **Format**: NetCDF files
- **Process**:
  1. Register at NASA Earthdata: https://urs.earthdata.nasa.gov/
  2. Download GPM IMERG data
  3. Select India region (23°N, 72°E)
  4. Download NetCDF files
  5. Save to: `data/nasa_gpm/`
  6. Run: `python data_collection/fetch_nasa_gpm.py`

**Script Provided**: `data_collection/fetch_nasa_gpm.py`

---

### 4. **India-WRIS (Water Resource Information System)**
- **What**: Comprehensive water resources data
- **Source**: India-WRIS Portal
- **URL**: https://indiawris.gov.in/wris/
- **Access**: Manual download (no public API)
- **Includes**:
  - Discharge data (from CWC)
  - Water level data
  - Reservoir data
  - Basin characteristics

**Note**: Same portal as CWC data, comprehensive source

---

## 🔑 API Keys Needed (Optional)

### For Real-time Data:
1. **OpenWeatherMap API**
   - Sign up: https://openweathermap.org/api
   - Free tier available
   - Set: `export OPENWEATHER_API_KEY=your_key`

2. **NASA Earthdata**
   - Register: https://urs.earthdata.nasa.gov/
   - Free account
   - Use credentials in API calls

### Not Needed:
- CWC/India-WRIS: No API, manual download
- IMD: Limited API, mostly manual

---

## 📋 Quick Reference

### Minimum Data for Training:
- ✅ **Discharge**: 2-3 years minimum
- ✅ **Rainfall**: Same time period
- ✅ **Format**: CSV with `date` column

### Ideal Data for Production:
- ✅ **Discharge**: 5+ years
- ✅ **Rainfall**: 5+ years
- ✅ **Multiple stations**: Better coverage
- ✅ **Hourly data**: Higher resolution

---

## 🚀 Quick Start Commands

### Option 1: Use Sample Data (Hackathon)
```bash
cd ML
python demo_sabarmati.py
# ✅ Works immediately, no data needed
```

### Option 2: Collect Real Data
```bash
# Download data manually from portals above
# Then run:
python data_collection/collect_all_data.py
```

### Option 3: Process Downloaded Data
```bash
# If you have CSV files:
python data_collection/integrate_all_data.py
```

---

## 📁 Data File Locations

### Input (Download Here):
- `data/cwc/raw/` - CWC discharge CSV files
- `data/imd/` - IMD rainfall CSV files
- `data/nasa_gpm/` - NASA GPM NetCDF files

### Output (Generated):
- `ML/basins/sabarmati/discharge.csv`
- `ML/basins/sabarmati/rainfall.csv`
- `ML/basins/sabarmati/time_series/sabarmati.nc`

---

## ✅ Checklist

### For Hackathon:
- [x] Sample data available
- [x] Demo script ready
- [x] No API keys needed
- [x] Everything works!

### For Production:
- [ ] CWC discharge data downloaded
- [ ] IMD/NASA rainfall data downloaded
- [ ] Data processed with scripts
- [ ] NetCDF file generated
- [ ] Model trained on real data

---

## 💡 Summary

**For Hackathon**: 
- ✅ **Nothing needed** - Sample data works perfectly
- ✅ **Demo ready** - Run `python demo_sabarmati.py`

**For Production**:
- 📥 Download from: CWC/India-WRIS, IMD, NASA GPM
- 🔧 Process with: Provided Python scripts
- 🚀 Train model: With real data

**All scripts are ready** - Just download data and run! 🎉

