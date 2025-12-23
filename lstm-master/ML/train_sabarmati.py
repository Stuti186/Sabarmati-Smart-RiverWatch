#!/usr/bin/env python3
"""
Simple training script for Sabarmati dataset.
Works with CPU-only PyTorch installation.
"""

import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from neuralhydrology.utils.config import Config
from nh_run import start_training
import yaml

def main():
    print("=" * 60)
    print("Sabarmati LSTM Training Script")
    print("=" * 60)
    
    # Load configurations
    base_path = Path(__file__).parent / "conf"
    
    print("\n[1/4] Loading base configuration...")
    with open(base_path / "base.yaml", 'r') as f:
        base_config = yaml.safe_load(f)
    
    print("[2/4] Loading model configuration...")
    with open(base_path / "models" / "lstm.yaml", 'r') as f:
        model_config = yaml.safe_load(f)
    
    print("[3/4] Loading Sabarmati dataset configuration...")
    with open(base_path / "sabarmati.yaml", 'r') as f:
        sabarmati_config = yaml.safe_load(f)
    
    # Merge and customize for Sabarmati
    print("[4/4] Merging configurations...")
    config_dict = {**base_config, **model_config}
    
    # Remove non-standard keys from sabarmati_config that NeuralHydrology doesn't recognize
    sabarmati_clean = {k: v for k, v in sabarmati_config.items() 
                      if k not in ['path', 'forecast_horizon', 'variables', 'basin_id']}
    config_dict.update(sabarmati_clean)
    
    # Remove non-standard keys from model_config
    for key in ['wandb', 'discharge', 'gpu', 'defaults', 'hydra']:
        config_dict.pop(key, None)
    
    # Override for Sabarmati-specific settings
    config_dict['device'] = 'cpu'  # Use CPU (change to 'cuda:0' if GPU available)
    config_dict['data_dir'] = 'basins/sabarmati'  # NetCDF files should be in time_series subdirectory, NeuralHydrology will look there
    config_dict['train_basin_file'] = 'basins/sabarmati/basins.txt'
    config_dict['validation_basin_file'] = 'basins/sabarmati/basins.txt'
    config_dict['test_basin_file'] = 'basins/sabarmati/basins.txt'
    config_dict['validate_n_random_basins'] = 1  # Only 1 basin (Sabarmati)
    config_dict['dataset'] = 'generic'  # Use generic dataset format
    config_dict['target_variables'] = ['discharge']  # Column name in CSV is 'discharge'
    config_dict['dynamic_inputs'] = ['rainfall_mm']
    
    # Adjust date ranges for Sabarmati data
    # Discharge data: 2006-08-19 to 2006-08-21 (very limited - only 3 days!)
    # Rainfall data: 2000-01-01 onwards
    # Using dates that match available discharge data
    # NOTE: With only 3 days of discharge data, training will be very limited
    config_dict['train_start_date'] = '19/08/2006'
    config_dict['train_end_date'] = '20/08/2006'
    config_dict['validation_start_date'] = '21/08/2006'
    config_dict['validation_end_date'] = '21/08/2006'
    config_dict['test_start_date'] = '21/08/2006'
    config_dict['test_end_date'] = '21/08/2006'
    
    # Training settings (adjust as needed)
    # NOTE: With only ~65 hours of discharge data, we must use a very short sequence length
    config_dict['epochs'] = 10  # Start with 10 epochs for testing
    config_dict['batch_size'] = 4  # Very small batch size for limited data
    config_dict['seq_length'] = 12  # Reduced to 12 hours (half day) to fit available data
    config_dict['experiment_name'] = 'sabarmati_cpu_test'
    config_dict['run_dir'] = 'runs/sabarmati_cpu_test'
    
    # Validation settings
    config_dict['validate_every'] = 2  # Validate every 2 epochs
    config_dict['num_workers'] = 2  # Reduce workers for CPU
    
    # Create config object
    try:
        cfg = Config(config_dict)
        print("\n✓ Configuration loaded successfully!")
        print(f"  - Device: {cfg.device}")
        print(f"  - Epochs: {cfg.epochs}")
        print(f"  - Batch size: {cfg.batch_size}")
        print(f"  - Sequence length: {cfg.seq_length}")
        print(f"  - Data directory: {cfg.data_dir}")
    except Exception as e:
        print(f"\n✗ Error creating config: {e}")
        print("\nTrying with minimal config...")
        # Fallback: create minimal config
        cfg = Config(config_dict)
    
    # Check if data directory exists
    data_dir = Path(__file__).parent / config_dict['data_dir']
    if not data_dir.exists():
        print(f"\n⚠ Warning: Data directory not found: {data_dir}")
        print("Please ensure the Sabarmati data is in the correct location.")
        return
    
    # Start training
    print("\n" + "=" * 60)
    print("Starting training...")
    print("=" * 60 + "\n")
    
    try:
        start_training(cfg, wandb_log=False, wandb_entity=None)
        print("\n" + "=" * 60)
        print("✓ Training completed successfully!")
        print("=" * 60)
        print(f"\nResults saved in: {cfg.run_dir}")
        print("\nTo evaluate the model, run:")
        print(f"  python eval.py --run_dir {cfg.run_dir} --epoch {cfg.epochs} --gpu -1")
    except Exception as e:
        print(f"\n✗ Error during training: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

