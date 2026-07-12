import random
import pandas as pd

domains = [
    "Cloud",
    "Firewall",
    "Identity",
    "Database",
    "Endpoint",
    "Logging"
]

parameters = {
    "Cloud": [
        "CloudTrail",
        "IAM MFA",
        "S3 Public Access",
        "Security Group"
    ],
    "Firewall": [
        "SSH Port",
        "HTTPS Port",
        "RDP",
        "ICMP"
    ],
    "Identity": [
        "Password Length",
        "MFA",
        "Conditional Access"
    ],
    "Database": [
        "Encryption",
        "Audit Logging",
        "Remote Access"
    ],
    "Endpoint": [
        "Firewall",
        "USB Access",
        "Real Time Protection"
    ],
    "Logging": [
        "Log Retention",
        "Log Integrity",
        "System Logging"
    ]
}

severity_levels = [
    "Low",
    "Medium",
    "High",
    "Critical"
]

actors = [
    "Engineer",
    "Administrator",
    "CI/CD"
]

environments = [
    "Development",
    "Staging",
    "Production"
]

rows = []

for event in range(1,501):

    domain = random.choice(domains)

    parameter = random.choice(parameters[domain])

    severity = random.choice(severity_levels)

    approved = random.choice([0,1])

    maintenance = random.choice([0,1])

    actor = random.choice(actors)

    environment = random.choice(environments)

    baseline = random.choice([
        "TRUE",
        "FALSE",
        "Enabled",
        "Disabled",
        "Internal",
        "VPN",
        "AES256"
    ])

    new = random.choice([
        "TRUE",
        "FALSE",
        "Enabled",
        "Disabled",
        "Public",
        "Internal",
        "AES128"
    ])

    drift = 0

    if baseline != new:
        drift = 1

    risk = 0

    if severity=="Critical":
        risk+=40

    elif severity=="High":
        risk+=25

    elif severity=="Medium":
        risk+=15

    else:
        risk+=5

    if environment=="Production":
        risk+=25

    elif environment=="Staging":
        risk+=10

    if approved==0:
        risk+=15

    if drift==1:
        risk+=10

    if maintenance==1:
        risk-=5

    risk=max(0,min(risk,100))

    label="Safe"

    if risk>=50:
        label="Risky"

    rows.append({

        "event_id":event,

        "project_id":random.randint(1,3),

        "control_id":random.randint(1,20),

        "domain":domain,

        "parameter":parameter,

        "severity":severity,

        "approved":approved,

        "maintenance_window":maintenance,

        "actor":actor,

        "environment":environment,

        "baseline_value":baseline,

        "new_value":new,

        "drift":drift,

        "risk_score":risk,

        "label":label

    })

df=pd.DataFrame(rows)

df.to_csv(
    "../datasets/change_events.csv",
    index=False
)

print(df.head())

print("\nDataset Generated Successfully!")

print("Rows :",len(df))