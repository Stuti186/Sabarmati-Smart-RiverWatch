# How to Run the LSTM Project

This guide explains how to run the LSTM rainfall-runoff modeling project for Sabarmati River.

## Prerequisites

1. **Virtual Environment**: Already created at `.venv`
2. **Dependencies**: Already installed
3. **Data**: Sabarmati dataset is available in `ML/basins/sabarmati/`

## Quick Start

### 1. Activate Virtual Environment

```bash
cd /home/deepak/Sabarmati_river_watch/Sabarmati/lstm-master
source .venv/bin/activate
```

### 2. Set Up Environment Variables (Optional)

If you want to use WandB for experiment tracking, create a `.env` file in the root directory:

```bash
echo "WANDB_ENTITY=your-wandb-entity" > .env
```

**Note**: WandB is optional. You can run without it.

## Running the Project

### Option 1: Simple Training (CPU Mode)

Since we installed CPU-only PyTorch, you can run training on CPU. However, the current scripts require GPU. Here's how to modify for CPU:

**For Sabarmati dataset**, you can use a simplified approach:

```bash
cd ML
python -c "
from neuralhydrology.utils.config import Config
import yaml
import os

# Load base config
with open('conf/base.yaml', 'r') as f:
    base_config = yaml.safe_load(f)

# Load model config
with open('conf/models/lstm.yaml', 'r') as f:
    model_config = yaml.safe_load(f)

# Load Sabarmati dataset config
with open('conf/sabarmati.yaml', 'r') as f:
    sabarmati_config = yaml.safe_load(f)

# Merge configs
config_dict = {**base_config, **model_config, **sabarmati_config}
config_dict['device'] = 'cpu'  # Force CPU
config_dict['basin_id'] = 'sabarmati'
config_dict['data_dir'] = 'basins/sabarmati'
config_dict['target_variables'] = ['discharge_m3s']
config_dict['dynamic_inputs'] = ['rainfall_mm']

# Create config object
cfg = Config(config_dict)

# Import and run
from nh_run import start_training
start_training(cfg, wandb_log=False, wandb_entity=None)
"
```

### Option 2: Using NeuralHydrology CLI (Recommended)

The easiest way is to use NeuralHydrology's built-in CLI. First, you need to prepare a proper config file:

```bash
cd ML
```

Create a config file `conf/sabarmati_lstm.yaml`:

```yaml
# Copy from conf/models/lstm.yaml and modify:
experiment_name: sabarmati_lstm
model: cudalstm
device: cpu  # Change from cuda:0 to cpu
basin_id: sabarmati
data_dir: basins/sabarmati
target_variables:
  - discharge_m3s
dynamic_inputs:
  - rainfall_mm
seq_length: 168
forecast_horizon: 24
epochs: 10  # Start with fewer epochs for testing
batch_size: 32  # Smaller batch for CPU
```

Then run:

```bash
python -m neuralhydrology.nh_run --config conf/sabarmati_lstm.yaml
```

### Option 3: Evaluation Only

If you have a trained model, you can evaluate it:

```bash
cd ML
python eval.py --run_dir /path/to/run --epoch 30 --gpu -1  # -1 for CPU
```

### Option 4: Hindcast (Plot Predictions)

To visualize predictions vs observations:

```bash
cd ML
python hindcast.py --run_dir /path/to/run --epoch 30 --gpu -1  # -1 for CPU
```

## Sabarmati-Specific Configuration

The Sabarmati dataset is located at: `ML/basins/sabarmati/`

**Data files:**
- `discharge.csv` - Discharge data
- `rainfall.csv` - Rainfall data  
- `attributes.json` - Basin attributes
- `time_series/sabarmati.nc` - NetCDF time series data

**Configuration file:** `ML/conf/sabarmati.yaml`

## Important Notes

### CPU vs GPU

- **Current Setup**: CPU-only PyTorch installed (saves disk space)
- **For GPU**: You would need to reinstall PyTorch with CUDA support:
  ```bash
  pip uninstall torch
  pip install torch --index-url https://download.pytorch.org/whl/cu118
  ```

### Modifying Scripts for CPU

The scripts `multirun.py` and `run_bash.py` currently require GPU. To use CPU:

1. Modify `multirun.py` line 28-31 to allow CPU:
   ```python
   # Change from:
   if torch.cuda.is_available():
       pass
   else:
       raise Exception("No GPU found!")
   
   # To:
   if torch.cuda.is_available():
       print("GPU available, using GPU")
   else:
       print("No GPU found, using CPU")
   ```

2. Pass `gpu=-1` to use CPU in `nh_run.py`:
   ```python
   start_run(config, wandb_log=False, wandb_entity=None, gpu=-1)
   ```

## Example: Simple Training Script

Create a file `train_sabarmati.py` in the `ML/` directory:

```python
#!/usr/bin/env python3
"""Simple training script for Sabarmati dataset on CPU."""

import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from neuralhydrology.utils.config import Config
from nh_run import start_training
import yaml

def main():
    # Load configurations
    base_path = Path(__file__).parent / "conf"
    
    with open(base_path / "base.yaml", 'r') as f:
        base_config = yaml.safe_load(f)
    
    with open(base_path / "models" / "lstm.yaml", 'r') as f:
        model_config = yaml.safe_load(f)
    
    with open(base_path / "sabarmati.yaml", 'r') as f:
        sabarmati_config = yaml.safe_load(f)
    
    # Merge and customize
    config_dict = {**base_config, **model_config, **sabarmati_config}
    config_dict['device'] = 'cpu'  # Use CPU
    config_dict['basin_id'] = 'sabarmati'
    config_dict['data_dir'] = 'basins/sabarmati'
    config_dict['target_variables'] = ['discharge_m3s']
    config_dict['dynamic_inputs'] = ['rainfall_mm']
    config_dict['epochs'] = 10  # Start small
    config_dict['batch_size'] = 32  # Smaller for CPU
    config_dict['experiment_name'] = 'sabarmati_cpu_test'
    
    # Create config
    cfg = Config(config_dict)
    
    # Start training
    print("Starting training on CPU...")
    start_training(cfg, wandb_log=False, wandb_entity=None)
    print("Training completed!")

if __name__ == "__main__":
    main()
```

Then run:

```bash
cd ML
python train_sabarmati.py
```

## Troubleshooting

### Issue: "No GPU found" error
**Solution**: Modify the scripts to allow CPU (see "Modifying Scripts for CPU" above) or pass `gpu=-1`.

### Issue: "Module not found" errors
**Solution**: Make sure virtual environment is activated:
```bash
source .venv/bin/activate
```

### Issue: Data file not found
**Solution**: Check that data files exist in `ML/basins/sabarmati/` and paths in config are correct.

### Issue: Out of memory
**Solution**: Reduce `batch_size` in config (try 16, 8, or even 4 for CPU).

## Next Steps

1. **Start with small epochs**: Use `epochs: 5` or `epochs: 10` for initial testing
2. **Monitor training**: Check the `runs/` directory for logs and results
3. **Evaluate**: Use `eval.py` after training to see metrics
4. **Visualize**: Use `hindcast.py` to plot predictions

## Additional Resources

- NeuralHydrology Documentation: https://neuralhydrology.readthedocs.io/
- Project README: `README.md`
- ML README: `ML/README.md`

