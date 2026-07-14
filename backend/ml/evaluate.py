import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.preprocessing import LabelEncoder
import joblib

# Load dataset
df = pd.read_csv('E:/SG_HACK/SecureTwinAI/backend/datasets/change_events.csv')

# The true label is in 'label', where 'Risky' means anomaly
y_true = (df['label'] == 'Risky').astype(int)

# Re-run the IsolationForest prediction to get predicted anomalies
# We need to load the model and encoders
# Actually, train_isolationforest.py just trains and saves isolation_forest.pkl
# But it does not save the encoders! So we have to re-encode using the exact same logic.
categorical_columns = [
    "domain",
    "parameter",
    "severity",
    "actor",
    "environment"
]

for col in categorical_columns:
    encoder = LabelEncoder()
    df[col] = encoder.fit_transform(df[col])

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

# Load model
model = joblib.load('E:/SG_HACK/SecureTwinAI/backend/ml/isolation_forest.pkl')

pred = model.predict(X)
# Convert IsolationForest output: 1 = Normal, -1 = Anomaly
# To align with our True/False: -1 (Anomaly) -> 1, 1 (Normal) -> 0
y_pred = (pred == -1).astype(int)

print(f"Precision: {precision_score(y_true, y_pred, zero_division=0):.2%}")
print(f"Recall:    {recall_score(y_true, y_pred, zero_division=0):.2%}")
print(f"F1 Score:  {f1_score(y_true, y_pred, zero_division=0):.2f}")
