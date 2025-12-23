# Data Collection Guide for Sabarmati River Flood Prediction

## 📊 Required Datasets

### 1. **Discharge Data (Primary)**
**Source**: Central Water Commission (CWC) / India-WRIS
- **Portal**: https://indiawris.gov.in/wris/
- **What to download**: 
  - Hourly/Daily discharge data for Sabarmati River stations
  - Station IDs: Check CWC website for Sabarmati basin stations
  - Format: CSV or Excel
  - Time period: Minimum 2-3 years for training

**Key Stations for Sabarmati**:
- Dharoi Dam (Station ID: Check CWC portal)
- Ahmedabad (Sabarmati River)
- Other gauge stations in the basin

### 2. **Rainfall Data**
**Source**: India Meteorological Department (IMD) / NASA GPM
- **IMD Portal**: https://mausam.imd.gov.in/
- **NASA GPM**: https://gpm.nasa.gov/data/directory
- **What to download**:
  - Daily/Hourly rainfall data
  - Gridded rainfall data for Sabarmati basin
  - Format: CSV or NetCDF

### 3. **Water Level Data**
**Source**: CWC / India-WRIS
- **What to download**:
  - River water level measurements
  - Reservoir levels (Dharoi, etc.)
  - Format: CSV

### 4. **Meteorological Data**
**Source**: IMD / NASA
- **What to download**:
  - Temperature (max/min)
  - Humidity
  - Wind speed
  - Evapotranspiration

## 🔗 Data Sources & APIs

### Available APIs (Public):

1. **NASA GPM (Global Precipitation Measurement)**
   - API: https://gpm.nasa.gov/data/directory
   - Access: Public, requires registration
   - Format: NetCDF, HDF5
   - Coverage: Global, high resolution

2. **IMD (India Meteorological Department)**
   - Portal: https://mausam.imd.gov.in/
   - API: Limited public API
   - Format: CSV, JSON
   - Coverage: India

3. **OpenWeatherMap** (Backup)
   - API: https://openweathermap.org/api
   - Access: Free tier available
   - Format: JSON
   - Coverage: Global

### Manual Download Sources:

1. **India-WRIS Portal**
   - URL: https://indiawris.gov.in/wris/
   - Process: Manual download required
   - Data: Comprehensive hydrological data

2. **CWC Data Portal**
   - URL: https://www.cwc.gov.in/
   - Process: Request/download through portal
   - Data: Real-time and historical discharge

## 📥 Data Collection Scripts

Use the provided scripts in this directory:

1. `download_wris_data.py` - Guide for WRIS data download
2. `fetch_imd_data.py` - IMD rainfall data fetcher
3. `fetch_nasa_gpm.py` - NASA GPM data downloader
4. `process_cwc_data.py` - CWC discharge data processor
5. `integrate_all_data.py` - Combine all data sources

## 🚀 Quick Start

### Option 1: Use Provided Sample Data (Hackathon Demo)
```bash
# Sample data is already in ML/basins/sabarmati/
# Use demo_sabarmati.py for hackathon presentation
```

### Option 2: Collect Real Data
```bash
# Follow scripts in data_collection/ directory
# See individual script documentation
```

## 📋 Data Requirements Checklist

- [ ] Discharge data: Minimum 2 years, hourly/daily
- [ ] Rainfall data: Same time period, daily/hourly
- [ ] Station coordinates: Latitude/Longitude
- [ ] Basin boundaries: Shapefile or coordinates
- [ ] Data format: CSV or NetCDF compatible

## 💡 For Hackathon Demo

**You can use**:
- Sample data provided in `ML/basins/sabarmati/`
- Synthetic data generation (see `generate_synthetic_data.py`)
- Mock API responses (see `mock_data_generator.py`)

**For Production**:
- Download real data from CWC/WRIS portals
- Use API integrations for real-time data
- Follow data collection scripts

