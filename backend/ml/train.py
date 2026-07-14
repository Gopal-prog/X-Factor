import os
import sys
import subprocess
from datetime import datetime

# Path to the ml directory
ML_DIR = os.path.dirname(os.path.abspath(__file__))

def retrain_models():
    """
    Triggers retraining of the Isolation Forest and Random Forest models.
    In a real scenario, this would query the DB for the latest `DriftDetection` and `RiskAnalysis` data 
    instead of relying on static CSV files, and then fit the models.
    """
    
    metrics = {
        "isolation_forest_status": "Failed",
        "random_forest_status": "Failed",
        "accuracy": 0.0,
        "training_samples": 0,
        "last_trained": datetime.now().strftime("%d %b %Y %H:%M:%S")
    }
    
    try:
        # Run Isolation Forest Training
        subprocess.run([sys.executable, os.path.join(ML_DIR, "train_isolationforest.py")], cwd=ML_DIR, check=True)
        metrics["isolation_forest_status"] = "Success"
        
        # Run Random Forest Training (which outputs accuracy)
        result = subprocess.run(
            [sys.executable, os.path.join(ML_DIR, "train_randomforest.py")], 
            cwd=ML_DIR, 
            capture_output=True, 
            text=True, 
            check=True
        )
        metrics["random_forest_status"] = "Success"
        
        # Parse accuracy from the output
        for line in result.stdout.split('\n'):
            # Basic parsing of the sklearn accuracy score output
            try:
                if 0 < float(line.strip()) < 1:
                    metrics["accuracy"] = float(line.strip()) * 100
                    break
            except ValueError:
                continue
                
        # Mock number of samples for now (since we use the static CSV in this script)
        metrics["training_samples"] = 12540 
        
    except Exception as e:
        print(f"Error during model retraining: {e}")
        
    return metrics
