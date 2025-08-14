# flask_app.py
from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

model = joblib.load("best_credit_pool_model.joblib")
scaler = joblib.load("scaler.joblib")
feature_columns = joblib.load("feature_columns.joblib")
selector = joblib.load("feature_selector.joblib")

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()

    user_features = data["user"]         
    credit_pools = data["credit_pools"] 
    top_k = data.get("top_k", 4)

    recommendations = []

    for pool in credit_pools:
        combined = {**user_features, **pool}

        df_input = pd.DataFrame([combined])
        df_input = pd.get_dummies(df_input, drop_first=True)

        for col in feature_columns:
            if col not in df_input.columns:
                df_input[col] = 0

        df_input = df_input[feature_columns]

        scaled = scaler.transform(df_input)
        selected = selector.transform(scaled)
        prob = model.predict_proba(selected)[0][1]

        recommendations.append({
            "creditPoolId": pool["creditPoolId"],
            "score": float(prob)
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return jsonify(recommendations[:top_k])

if __name__ == "__main__":
    app.run(port=5001, debug=True)
