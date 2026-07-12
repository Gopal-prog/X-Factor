import pandas as pd
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import IsolationForest

# -----------------------------
# Load Dataset
# -----------------------------

df = pd.read_csv("../datasets/change_events.csv")

# -----------------------------
# Encode Features
# -----------------------------

categorical_columns = [
    "domain",
    "parameter",
    "severity",
    "actor",
    "environment"
]

encoders = {}

for col in categorical_columns:
    encoder = LabelEncoder()
    df[col] = encoder.fit_transform(df[col])
    encoders[col] = encoder

# -----------------------------
# Features
# -----------------------------

X = df[
    [
        "domain",
        "parameter",
        "severity",
        "approved",
        "maintenance_window",
        "actor",
        "environment",
        "drift",
        "risk_score"
    ]
]

# -----------------------------
# Train Isolation Forest
# -----------------------------

model = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)

model.fit(X)

# -----------------------------
# Predict
# -----------------------------

pred = model.predict(X)

# Convert
# 1 = Normal
# -1 = Anomaly

df["anomaly_prediction"] = pred

print(df.head())

print("\nIsolation Forest Trained Successfully!")

# -----------------------------
# Save
# -----------------------------

joblib.dump(model, "isolation_forest.pkl")

print("Model Saved!")