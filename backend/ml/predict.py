import os
import joblib
import pandas as pd

# -------------------------
# Load Models
# -------------------------

BASE_DIR = os.path.dirname(__file__)

rf_model = joblib.load(os.path.join(BASE_DIR, "random_forest.pkl"))

if_model = joblib.load(os.path.join(BASE_DIR, "isolation_forest.pkl"))

encoders = joblib.load(os.path.join(BASE_DIR, "encoders.pkl"))

label_encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))


# -------------------------
# Encode Input
# -------------------------

def encode_input(data):

    encoded = {}

    for col in [
        "domain",
        "parameter",
        "severity",
        "actor",
        "environment"
    ]:

        encoder = encoders[col]

        if data[col] in encoder.classes_:
            encoded[col] = encoder.transform([data[col]])[0]
        else:
            encoded[col] = 0

    encoded["approved"] = data["approved"]
    encoded["maintenance_window"] = data["maintenance_window"]
    encoded["drift"] = data["drift"]
    encoded["risk_score"] = data["risk_score"]

    return encoded


# -------------------------
# Random Forest
# -------------------------

def predict_risk(data):

    row = encode_input(data)

    X = pd.DataFrame([{
        "domain": row["domain"],
        "parameter": row["parameter"],
        "severity": row["severity"],
        "approved": row["approved"],
        "maintenance_window": row["maintenance_window"],
        "actor": row["actor"],
        "environment": row["environment"],
        "drift": row["drift"]
    }])

    prediction = rf_model.predict(X)

    return label_encoder.inverse_transform(prediction)[0]


# -------------------------
# Isolation Forest
# -------------------------

def detect_anomaly(data):

    row = encode_input(data)

    X = pd.DataFrame([{
        "domain": row["domain"],
        "parameter": row["parameter"],
        "severity": row["severity"],
        "approved": row["approved"],
        "maintenance_window": row["maintenance_window"],
        "actor": row["actor"],
        "environment": row["environment"],
        "drift": row["drift"],
        "risk_score": row["risk_score"]
    }])

    prediction = if_model.predict(X)[0]

    if prediction == -1:
        return "Anomaly"

    return "Normal"


# ---------------------------------------------
# Dynamic Prediction
# ---------------------------------------------

def predict_from_database(
        domain,
        parameter,
        severity,
        approved,
        maintenance_window,
        actor,
        environment,
        drift,
        risk_score
):

    sample = {

        "domain": domain,

        "parameter": parameter,

        "severity": severity,

        "approved": approved,

        "maintenance_window": maintenance_window,

        "actor": actor,

        "environment": environment,

        "drift": drift,

        "risk_score": risk_score

    }

    prediction = predict_risk(sample)

    anomaly = detect_anomaly(sample)

    return prediction, anomaly