import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# -----------------------------
# Load Dataset
# -----------------------------

df = pd.read_csv("../datasets/change_events.csv")

# -----------------------------
# Encode Categorical Features
# -----------------------------

encoders = {}

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
        "drift"
    ]
]

# -----------------------------
# Target
# -----------------------------

y = df["label"]

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# -----------------------------
# Train/Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# -----------------------------
# Train Model
# -----------------------------

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# Prediction
# -----------------------------

predictions = model.predict(X_test)

print("\nAccuracy")

print(accuracy_score(y_test, predictions))

print("\nClassification Report")

print(classification_report(y_test, predictions))

# -----------------------------
# Save Model
# -----------------------------

joblib.dump(model, "random_forest.pkl")

joblib.dump(encoders, "encoders.pkl")

joblib.dump(label_encoder, "label_encoder.pkl")

print("\nRandom Forest Model Saved Successfully!")