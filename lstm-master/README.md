# Rainfall–Runoff Modeling for Sabarmati River

Rainfall–Runoff Modeling for Sabarmati River Basin using LSTM and Deep Learning approaches for flood prediction and water resource management.

![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)
![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![NeuralHydrology](https://img.shields.io/badge/NeuralHydrology-Model-blue?style=for-the-badge)
![India](https://img.shields.io/badge/India-Sabarmati%20River-green?style=for-the-badge)

# Description

The **Sabarmati River** is one of the major west-flowing rivers in India, flowing through the states of Rajasthan and Gujarat. It plays a crucial role in the water supply for Ahmedabad and surrounding regions. Flooding and water resource management in the Sabarmati basin are critical concerns, especially during the monsoon season when heavy rainfall can lead to significant discharge variations and potential flooding events.

This repository provides a **machine-learning ready hydrological dataset and flood-prediction system** specifically developed for the Sabarmati River basin. The project integrates streamflow observations, meteorological forcings (rainfall), and catchment characteristics to enable data-driven flood forecasting and water resource planning.

The modeling workflow builds upon *NeuralHydrology*, a state-of-the-art deep learning framework for rainfall–runoff and hydrological prediction tasks (Kratzert et al., 2022). NeuralHydrology provides a modular pipeline for training LSTM-based and related architectures using simple YAML-based configuration files rather than bespoke implementations. More information on the framework is available at the project's official page: [Neural Hydrology](https://research.google/pubs/neuralhydrology-a-python-library-for-deep-learning-research-in-hydrology/)

To ensure full compatibility with NeuralHydrology's data loaders, extensive preprocessing was conducted. Local hydrological records (discharge data from river gauge stations) were combined with meteorological data (rainfall from NASA/IMD datasets) and catchment characteristics. These inputs were standardized, temporally aligned, and formatted following established rainfall–runoff modeling conventions.

This project contributes to **sustainable water resource management** in several ways:

* It provides a **comprehensive ML-ready hydrological dataset for the Sabarmati River basin**, integrating in-situ observations with meteorological and geospatial data sources.
* It enables the application of contemporary deep learning–based flood forecasting approaches for early warning systems in the Sabarmati region.
* It establishes a foundation for operational flood prediction, water resource planning, and sustainable management of the Sabarmati River basin.
* It supports research on hydrological extremes and climate change impacts on river discharge patterns.


# Data

This dataset consists of meteorological (time series) and geophysical (catchment attributes) data for the **Sabarmati River basin**. The dataset is designed for flood prediction, discharge forecasting, and water resource management applications.

## Dataset Overview

The Sabarmati River basin dataset includes:

* **Temporal Data**:
  - **Rainfall**: Daily rainfall data (mm) from 2000 onwards, sourced from NASA/IMD rainfall datasets
  - **Discharge**: Hourly river discharge data (m³/s) from 2006 onwards, measured at river gauge stations along the Sabarmati River

* **Spatial Attributes** (Static):
  - Elevation (meters) - from DEM/SRTM 30m
  - Slope (degrees) - derived from DEM
  - Distance from river (meters) - Euclidean distance from river centerline
  - Land use classification (urban, forest, agriculture, barren, water)
  - Soil type (clay, silt, sand, loam)
  - Sub-basin identification

## Data Location

The Sabarmati dataset is located in: `ML/basins/sabarmati/`

**Key Files**:
- `discharge.csv` - Hourly discharge time series
- `rainfall.csv` - Daily rainfall time series  
- `attributes.json` - Basin attributes and metadata
- `time_series/sabarmati.nc` - NetCDF format time series data
- `basins.txt` - Basin identifier list

## Data Sources

* **Discharge Data**: Sabarmati River discharge stations (Gujarat Water Resources Department, Central Water Commission)
* **Rainfall Data**: NASA GPM/IMD (India Meteorological Department) rainfall datasets
* **Geospatial Data**: SRTM DEM, Land use/land cover GIS datasets, Soil maps
* **Basin Boundaries**: Sabarmati River basin shapefiles


# Project Structure

## Dataset Collection

The Sabarmati River dataset was compiled from multiple sources:

### Discharge Data

River discharge data is collected from gauge stations along the Sabarmati River. The data includes:
- Hourly discharge measurements (m³/s)
- Time series from 2006 onwards
- Data sourced from Gujarat Water Resources Department and Central Water Commission (CWC)

The discharge data is stored in `ML/basins/sabarmati/discharge.csv` with columns:
- `date`: Timestamp (hourly)
- `discharge`: Discharge value in m³/s

### Rainfall Data

Rainfall data is obtained from:
- **NASA GPM** (Global Precipitation Measurement) datasets
- **IMD** (India Meteorological Department) rainfall records
- Daily rainfall measurements (mm) from 2000 onwards

The rainfall data is stored in `ML/basins/sabarmati/rainfall.csv` with columns:
- `date`: Date (daily)
- `rainfall_mm`: Rainfall amount in millimeters

### Basin Attributes

Static basin characteristics are extracted from:
- **Elevation**: SRTM 30m Digital Elevation Model
- **Slope**: Derived from DEM using GIS tools
- **Land Use**: Land use/land cover classification datasets
- **Soil Type**: Soil maps of the Sabarmati basin
- **River Network**: Sabarmati River shapefiles for distance calculations

All attributes are documented in `ML/basins/sabarmati/attributes.json`.

### Data Preprocessing

The dataset has been preprocessed to:
- Align temporal data to consistent timestamps
- Handle missing values appropriately
- Convert to NeuralHydrology-compatible format (NetCDF)
- Standardize units and coordinate systems

Conversion scripts are available in `ML/basins/sabarmati/`:
- `convert_to_nc.py` - Converts CSV data to NetCDF format
- `convert_power_to_rainfall.py` - Utility for rainfall data conversion


# Setup

## Virtual environment

Create a python virtual environment to install all the necessary packages:

```bash
python -m venv .venv
```

Alternatively, you can use conda:

```bash
conda create -n sabarmati_proj python=3.10.12
```

## Installation

Install the required packages into the created virtual environment:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

**Note**: The installation includes CPU-only PyTorch by default to save disk space. For GPU support, see [HOW_TO_RUN.md](./HOW_TO_RUN.md).

## WandB Logging (Optional)

Create `.env` file in the root directory and add `WANDB_ENTITY` entry if you want to use WandB for experiment tracking:

```bash
echo "WANDB_ENTITY=your-wandb-entity" > .env
```


# Training

[NeuralHydrology](https://github.com/neuralhydrology/neuralhydrology) library is used underneath this repo. Directory [ML](./ML/) contains training, evaluation, finetuning and other scripts related to ML models.

For details, see the ML [README](./ML/README.md) file.


# Quick Start Guide

## 1. Setup

```bash
# Activate virtual environment
source .venv/bin/activate

# Verify installation
python -c "import torch; import neuralhydrology; print('Setup complete!')"
```

## 2. Run Demo (Hackathon Prototype)

For quick hackathon demonstration:

```bash
cd ML
python demo_sabarmati.py
```

This generates a visualization and statistics ready for presentation!

**For Training**: See [HOW_TO_RUN.md](./HOW_TO_RUN.md)  
**For Hackathon Demo**: See [HACKATHON_DEMO.md](./HACKATHON_DEMO.md) or [QUICK_START_HACKATHON.md](./QUICK_START_HACKATHON.md)

## 3. Configuration

The Sabarmati-specific configuration is in `ML/conf/sabarmati.yaml`:
- Basin ID: `sabarmati`
- Sequence length: 168 hours (7 days)
- Forecast horizon: 24 hours
- Variables: `rainfall_mm`, `discharge_m3s`

# Data Availability

## Licensing and Use

* The **processed dataset** for Sabarmati River is available for research, educational, and non-commercial purposes with proper attribution.
* **Raw discharge data** from government sources (Gujarat Water Resources Department, CWC) should be accessed through official channels.
* **Rainfall data** from NASA GPM and IMD are publicly available datasets.

## Attribution

When using this dataset, please cite:

1. This repository and the processed Sabarmati River dataset
2. Original data sources:
   - NASA GPM for rainfall data
   - IMD (India Meteorological Department) for meteorological data
   - Gujarat Water Resources Department / CWC for discharge data
   - NeuralHydrology framework (Kratzert et al., 2022)

## Reproducibility

* The repository includes preprocessing scripts in `ML/basins/sabarmati/` that document data transformation steps.
* Researchers can reproduce the processed dataset by following the conversion scripts.
* All preprocessing steps are documented and reproducible.

# Applications

This model can be used for:

1. **Flood Prediction**: Forecast discharge levels during monsoon season
2. **Water Resource Management**: Plan water allocation and reservoir operations
3. **Early Warning Systems**: Provide advance notice of potential flooding
4. **Climate Impact Studies**: Analyze how changing rainfall patterns affect river discharge
5. **Operational Forecasting**: Real-time discharge predictions for decision-making

# Sabarmati River Context

The Sabarmati River originates in the Aravalli Range of Rajasthan and flows through Gujarat before emptying into the Gulf of Khambhat. The river basin covers approximately 21,674 km² and is crucial for:

- **Water Supply**: Primary water source for Ahmedabad city
- **Agriculture**: Irrigation for agricultural lands in the basin
- **Ecosystem Services**: Supporting local biodiversity and ecosystems
- **Flood Management**: Managing monsoon floods that affect downstream areas

This modeling project aims to support sustainable management of this vital water resource through data-driven flood prediction and discharge forecasting.

# Contact and Support

For questions, issues, or contributions related to the Sabarmati River modeling project, please refer to the project documentation or create an issue in the repository.
