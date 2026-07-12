from predict import predict_risk
from predict import detect_anomaly

sample = {

    "domain":"Cloud",

    "parameter":"CloudTrail",

    "severity":"Critical",

    "approved":0,

    "maintenance_window":0,

    "actor":"Engineer",

    "environment":"Production",

    "drift":1,

    "risk_score":90

}

print()

print("Random Forest Prediction")

print(predict_risk(sample))

print()

print("Isolation Forest")

print(detect_anomaly(sample))