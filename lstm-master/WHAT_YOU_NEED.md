# 🎯 What You Need - Complete Guide

## ✅ **FOR HACKATHON DEMO - YOU NEED NOTHING!**

Everything is ready! Just run:
```bash
cd ML
python demo_sabarmati.py
```

---

## 📊 **FOR PRODUCTION MODEL - Here's What You Need:**

### 1. **Discharge Data** (Most Important) ⭐

**Source**: Central Water Commission (CWC) via India-WRIS
- **Portal**: https://indiawris.gov.in/wris/
- **What to download**: 
  - Discharge data for Sabarmati River stations
  - Minimum: 2-3 years
  - Ideal: 5+ years
  - Format: CSV files
- **How**: 
  1. Visit portal
  2. Data Download → Hydro-meteorological → Discharge
  3. Select Sabarmati basin stations
  4. Download annual CSV files
  5. Save to: `data/cwc/raw/`
  6. Run: `python data_collection/fetch_cwc_data.py`

**Script Ready**: ✅ `data_collection/fetch_cwc_data.py`

---

### 2. **Rainfall Data** (Critical Input) ⭐

**Option A - IMD (India Meteorological Department)**:
- **Portal**: https://mausam.imd.gov.in/
- **What**: Daily/hourly rainfall (mm)
- **How**: Manual download from portal
- **Save to**: `data/imd/`
- **Script**: ✅ `data_collection/fetch_imd_data.py`

**Option B - NASA GPM** (Recommended):
- **Portal**: https://gpm.nasa.gov/data/directory
- **What**: High-resolution global precipitation
- **How**: 
  1. Register at https://urs.earthdata.nasa.gov/ (free)
  2. Download GPM IMERG data
  3. Select India region
  4. Save NetCDF files to: `data/nasa_gpm/`
- **Script**: ✅ `data_collection/fetch_nasa_gpm.py`

**Option C - OpenWeatherMap API** (Backup):
- **API**: https://openweathermap.org/api
- **Key**: Sign up (free tier available)
- **Set**: `export OPENWEATHER_API_KEY=your_key`
- **Script**: ✅ Uses `fetch_imd_data.py`

---

### 3. **Optional Data** (Nice to Have)

**Water Level Data**:
- **Source**: CWC/India-WRIS
- **What**: River water levels, reservoir levels
- **Same portal**: https://indiawris.gov.in/wris/

**Meteorological Data**:
- Temperature, humidity, wind speed
- **Source**: IMD or NASA

---

## 🔑 **API Keys** (Optional - Only for Real-time Data)

### Required Only If Using APIs:

1. **OpenWeatherMap** (Backup for rainfall)
   - Sign up: https://openweathermap.org/api
   - Free tier: 60 calls/minute
   - Set: `export OPENWEATHER_API_KEY=your_key`

2. **NASA Earthdata** (For GPM)
   - Register: https://urs.earthdata.nasa.gov/
   - Free account
   - Use credentials in scripts

### Not Required:
- ✅ CWC/India-WRIS: No API, manual download
- ✅ IMD: Limited API, mostly manual download
- ✅ **For hackathon**: No API keys needed!

---

## 🚀 **Quick Start Guide**

### For Hackathon (Right Now):
```bash
# Everything is ready!
cd ML
python demo_sabarmati.py
# ✅ Done! Visualization generated
```

### For Production (After Hackathon):
```bash
# Step 1: Download data manually from portals
# Step 2: Run collection script
python data_collection/collect_all_data.py

# Step 3: Integrate data
python data_collection/integrate_all_data.py

# Step 4: Train model
cd ML
python train_sabarmati_hackathon.py
```

---

## 📋 **Data Format Requirements**

### Discharge CSV:
```csv
date,discharge
2006-08-19 00:00,713.89
2006-08-19 01:00,715.23
```

### Rainfall CSV:
```csv
date,rainfall_mm
2000-01-01,0.0
2000-01-02,5.2
```

**Scripts handle conversion automatically!** ✅

---

## 📁 **File Structure**

```
lstm-master/
├── data_collection/          # Data collection scripts
│   ├── fetch_cwc_data.py     # CWC discharge fetcher
│   ├── fetch_imd_data.py     # IMD rainfall fetcher
│   ├── fetch_nasa_gpm.py     # NASA GPM fetcher
│   ├── integrate_all_data.py # Data integrator
│   └── collect_all_data.py   # Master script
├── data/                     # Downloaded data (create this)
│   ├── cwc/raw/              # CWC CSV files here
│   ├── imd/                  # IMD CSV files here
│   └── nasa_gpm/             # NASA NetCDF files here
└── ML/basins/sabarmati/      # Processed data (auto-generated)
    ├── discharge.csv
    ├── rainfall.csv
    └── time_series/sabarmati.nc
```

---

## ✅ **Summary**

### For Hackathon:
- ✅ **Nothing needed** - Sample data works!
- ✅ **No API keys** - Everything ready
- ✅ **Just run demo** - `python demo_sabarmati.py`

### For Production:
- 📥 **Download from**: CWC/India-WRIS, IMD, NASA GPM
- 🔧 **Process with**: Provided scripts
- 🚀 **Train model**: With real data

---

## 🆘 **Need Help?**

1. **See**: `DATA_SOURCES_SUMMARY.md` - Complete API details
2. **See**: `data_collection/README.md` - Detailed instructions
3. **See**: `HACKATHON_DEMO.md` - Presentation guide

**All scripts are ready - just download data and run!** 🎉

