#!/usr/bin/env python3
"""
Hackathon Training Script for Sabarmati Flood Prediction Model
Optimized for quick demo with minimal data and fast training.
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
    print("=" * 70)
    print("🌊 Sabarmati LSTM Training - Hackathon Mode")
    print("=" * 70)
    print("\n⚡ Optimized for quick demo with minimal data")
    print("📊 Training flood prediction model for Sabarmati River\n")
    
    # Load configurations
    base_path = Path(__file__).parent / "conf"
    
    print("[1/4] Loading base configuration...")
    try:
        with open(base_path / "base.yaml", 'r') as f:
            base_config = yaml.safe_load(f)
        print("   ✓ Base config loaded")
    except Exception as e:
        print(f"   ✗ Error loading base config: {e}")
        base_config = {}
    
    print("[2/4] Loading model configuration...")
    try:
        with open(base_path / "models" / "lstm.yaml", 'r') as f:
            model_config = yaml.safe_load(f)
        print("   ✓ Model config loaded")
    except Exception as e:
        print(f"   ✗ Error loading model config: {e}")
        model_config = {}
    
    print("[3/4] Loading Sabarmati dataset configuration...")
    try:
        with open(base_path / "sabarmati.yaml", 'r') as f:
            sabarmati_config = yaml.safe_load(f)
        print("   ✓ Sabarmati config loaded")
    except Exception as e:
        print(f"   ⚠ Sabarmati config not found, using defaults: {e}")
        sabarmati_config = {}
    
    # Merge and customize for Sabarmati Hackathon
    print("[4/4] Merging configurations for hackathon...")
    config_dict = {**base_config, **model_config}
    
    # Remove non-standard keys that NeuralHydrology doesn't recognize
    sabarmati_clean = {k: v for k, v in sabarmati_config.items() 
                      if k not in ['path', 'forecast_horizon', 'variables', 'basin_id', 
                                   'wandb', 'discharge', 'gpu', 'defaults', 'hydra']}
    config_dict.update(sabarmati_clean)
    
    # Remove non-standard keys from model_config
    for key in ['wandb', 'discharge', 'gpu', 'defaults', 'hydra']:
        config_dict.pop(key, None)
    
    # ============================================
    # HACKATHON-SPECIFIC SETTINGS
    # ============================================
    
    # Device configuration
    config_dict['device'] = 'cpu'  # Use CPU (change to 'cuda:0' if GPU available)
    
    # Data directory configuration
    config_dict['data_dir'] = 'basins/sabarmati'
    config_dict['train_basin_file'] = 'basins/sabarmati/basins.txt'
    config_dict['validation_basin_file'] = 'basins/sabarmati/basins.txt'
    config_dict['test_basin_file'] = 'basins/sabarmati/basins.txt'
    config_dict['validate_n_random_basins'] = 1  # Only 1 basin (Sabarmati)
    config_dict['dataset'] = 'generic'  # Use generic dataset format
    
    # Input/Output variables
    config_dict['target_variables'] = ['discharge']  # Column name in CSV is 'discharge'
    config_dict['dynamic_inputs'] = ['rainfall_mm']
    
    # Date ranges for Sabarmati data
    # Discharge data: 2006-08-19 to 2006-08-21 (very limited - only 3 days!)
    # Rainfall data: 2000-01-01 onwards
    # For hackathon: Use all available data for training (no split)
    config_dict['train_start_date'] = '19/08/2006'
    config_dict['train_end_date'] = '21/08/2006'
    config_dict['validation_start_date'] = '21/08/2006'
    config_dict['validation_end_date'] = '21/08/2006'
    config_dict['test_start_date'] = '21/08/2006'
    config_dict['test_end_date'] = '21/08/2006'
    
    # ============================================
    # HACKATHON TRAINING SETTINGS (Minimal for Demo)
    # ============================================
    
    # Very minimal settings for prototype demo
    config_dict['epochs'] = 5  # Only 5 epochs for quick demo
    config_dict['batch_size'] = 2  # Very small batch size for limited data
    config_dict['seq_length'] = 6  # 6 hours sequence length (fits available data)
    config_dict['predict_last_n'] = 1  # Predict next hour
    
    # Model architecture (simplified for hackathon)
    config_dict['model'] = 'lstm'  # Use standard LSTM (not cudalstm for CPU compatibility)
    config_dict['hidden_size'] = 64  # Smaller hidden size for faster training
    config_dict['head'] = 'regression'
    config_dict['output_activation'] = 'linear'
    config_dict['output_dropout'] = 0.2
    
    # Training optimization
    config_dict['optimizer'] = 'Adam'
    config_dict['learning_rate'] = 0.001
    config_dict['loss'] = 'MSE'  # Mean Squared Error for simplicity
    
    # Experiment naming
    config_dict['experiment_name'] = 'sabarmati_hackathon_demo'
    config_dict['run_dir'] = 'runs/sabarmati_hackathon_demo'
    
    # Validation settings
    config_dict['validate_every'] = 1  # Validate every epoch
    config_dict['num_workers'] = 0  # No multiprocessing for stability
    
    # Metrics to track
    config_dict['metrics'] = ['NSE', 'RMSE', 'KGE']  # Standard hydrological metrics
    
    # ============================================
    # CREATE CONFIG AND VALIDATE
    # ============================================
    
    print("\n" + "=" * 70)
    print("📋 Configuration Summary")
    print("=" * 70)
    
    # Create config object
    try:
        cfg = Config(config_dict)
        print("✓ Configuration loaded successfully!")
        print(f"\n🔧 Training Settings:")
        print(f"   - Device: {cfg.device}")
        print(f"   - Epochs: {cfg.epochs}")
        print(f"   - Batch size: {cfg.batch_size}")
        print(f"   - Sequence length: {cfg.seq_length} hours")
        print(f"   - Model: {cfg.model}")
        print(f"   - Hidden size: {cfg.hidden_size}")
        print(f"\n📁 Data Settings:")
        print(f"   - Data directory: {cfg.data_dir}")
        print(f"   - Training period: {cfg.train_start_date} to {cfg.train_end_date}")
        print(f"   - Target variable: {cfg.target_variables}")
        print(f"   - Input variables: {cfg.dynamic_inputs}")
        print(f"\n💾 Output:")
        print(f"   - Experiment: {cfg.experiment_name}")
        print(f"   - Run directory: {cfg.run_dir}")
    except Exception as e:
        print(f"\n✗ Error creating config: {e}")
        import traceback
        traceback.print_exc()
        print("\n⚠ Trying to continue with minimal config...")
        # Try to create minimal config
        try:
            cfg = Config(config_dict)
        except Exception as e2:
            print(f"✗ Failed to create config: {e2}")
            sys.exit(1)
    
    # Check if data directory exists
    data_dir = Path(__file__).parent / config_dict['data_dir']
    if not data_dir.exists():
        print(f"\n⚠ Warning: Data directory not found: {data_dir}")
        print("   Please ensure the Sabarmati data is in the correct location.")
        print("   Expected structure:")
        print("     basins/sabarmati/")
        print("       ├── basins.txt")
        print("       ├── discharge.csv")
        print("       ├── rainfall.csv")
        print("       └── time_series/")
        print("           └── sabarmati.nc")
        return
    
    # Check for required data files
    required_files = [
        data_dir / "basins.txt",
        data_dir / "discharge.csv",
        data_dir / "rainfall.csv",
    ]
    missing_files = [f for f in required_files if not f.exists()]
    if missing_files:
        print(f"\n⚠ Warning: Missing data files:")
        for f in missing_files:
            print(f"   - {f}")
        print("\n   Training may fail. Please ensure all data files are present.")
    
    # ============================================
    # START TRAINING
    # ============================================
    
    print("\n" + "=" * 70)
    print("🚀 Starting Training...")
    print("=" * 70)
    print("\n⏱  This is a quick demo training (5 epochs)")
    print("   For production, increase epochs and adjust hyperparameters.\n")
    
    try:
        # Start training without wandb logging for hackathon
        start_training(cfg, wandb_log=False, wandb_entity=None)
        
        print("\n" + "=" * 70)
        print("✅ Training Completed Successfully!")
        print("=" * 70)
        print(f"\n📊 Results saved in: {cfg.run_dir}")
        print(f"\n📈 Model Performance:")
        print(f"   - Check metrics in: {cfg.run_dir}/metrics.json")
        print(f"   - Model weights: {cfg.run_dir}/model_epoch{cfg.epochs}.pt")
        print(f"\n🔍 To evaluate the model:")
        print(f"   python eval.py --run_dir {cfg.run_dir} --epoch {cfg.epochs} --gpu -1")
        print(f"\n🎯 To run demo visualization:")
        print(f"   python demo_sabarmati.py")
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"\n✗ Error during training: {e}")
        import traceback
        traceback.print_exc()
        print("\n💡 Troubleshooting:")
        print("   1. Check that all data files are present")
        print("   2. Verify data format matches expected structure")
        print("   3. Ensure PyTorch and NeuralHydrology are installed")
        print("   4. Check available memory (training requires sufficient RAM)")
        sys.exit(1)

if __name__ == "__main__":
    main()
