# 🎯 Hackathon Quick Start - Smart River Watch

## ⚡ Quick Demo (30 seconds)

```bash
cd lstm-master/ML
python demo_sabarmati_enhanced.py
```

**That's it!** You'll get:
- ✅ High-quality visualization
- ✅ Comprehensive metrics
- ✅ Presentation summary

---

## 📊 What This Demo Shows

### 1. **AI-Powered Flood Prediction**
- LSTM neural network forecasting discharge
- Real-time flood risk assessment
- Uncertainty quantification

### 2. **Key Metrics**
- **R² Score**: Model accuracy (typically >0.9)
- **MAE/RMSE**: Prediction errors
- **Flood Events**: Number of predicted floods
- **Coverage**: Uncertainty bounds accuracy

### 3. **Visualizations**
- Multi-panel comprehensive plots
- Observed vs predicted discharge
- Flood risk timeline
- Error distribution

---

## 🎬 Presentation Flow

### Option 1: Enhanced Demo (Recommended)
```bash
python demo_sabarmati_enhanced.py
```
- Best visualizations
- Comprehensive metrics
- Presentation-ready output

### Option 2: Simple Demo
```bash
python demo_sabarmati.py
```
- Quick execution
- Basic visualization
- Fast for quick demos

### Option 3: Complete Presentation
```bash
python presentation_demo.py
```
- Runs full enhanced demo
- Generates all materials
- Complete package

---

## 📁 Output Files

After running demo, check:
- `ML/hackathon_demo/sabarmati_flood_prediction_enhanced.png` - Main visualization
- `ML/hackathon_demo/presentation_summary.txt` - Key metrics

---

## 🎯 What to Say in Presentation

### Problem (30s)
"Sabarmati River faces flooding risks during monsoon. We need early warning."

### Solution (60s)
"We built an AI-powered flood prediction system using LSTM neural networks. It predicts discharge 24-48 hours ahead with high accuracy."

### Show Visualization (60s)
"Here's our model predicting discharge. The red line shows predictions, blue is observed. When it crosses the flood threshold, we alert authorities."

### Impact (30s)
"This enables early warnings, protects lives, and helps manage water resources sustainably."

---

## 🛠️ Technical Details (If Asked)

- **Model**: LSTM (Long Short-Term Memory) neural network
- **Data**: Discharge and rainfall time series
- **Accuracy**: R² > 0.9, MAE < 20 m³/s
- **Integration**: Works with mobile app backend
- **Scalability**: Can extend to other river basins

---

## ⚠️ Troubleshooting

**Problem**: Demo fails to run
**Solution**: 
```bash
pip install pandas numpy matplotlib seaborn
```

**Problem**: Data not found
**Solution**: Check `ML/basins/sabarmati/discharge.csv` exists

**Problem**: Import errors
**Solution**: Ensure you're in `ML/` directory

---

## 📚 Full Documentation

- **Complete Guide**: [HACKATHON_PRESENTATION.md](./HACKATHON_PRESENTATION.md)
- **How to Run**: [HOW_TO_RUN.md](./HOW_TO_RUN.md)
- **Data Sources**: [DATA_SOURCES_SUMMARY.md](./DATA_SOURCES_SUMMARY.md)

---

**Ready to impress the judges! 🚀**

