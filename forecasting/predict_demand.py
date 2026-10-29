"""
StockWise Demand Forecasting Module - Demand Predictor CLI
Generates future sales demand forecasts and replenishment recommendations.
"""

import sys
import json
import os
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

from data_processing import clean_and_aggregate_sales, engineer_time_features
from train_model import train_demand_model

def forecast_future_demand(daily_df, model_bundle, horizon_days=30):
    """
    Simulates demand for the upcoming horizon_days sequentially.
    """
    if daily_df.empty:
        return [1.0] * horizon_days

    last_date = daily_df['date'].max()
    predictions = []
    
    current_df = daily_df.copy()

    for step in range(1, horizon_days + 1):
        next_date = last_date + timedelta(days=step)
        
        # Calculate features dynamically based on latest historical + projected window
        rolling_7 = current_df['quantity'].iloc[-7:].mean() if len(current_df) >= 7 else current_df['quantity'].mean()
        lag_1 = current_df['quantity'].iloc[-1]

        row_feat = {
            'day_of_week': next_date.weekday(),
            'day_of_month': next_date.day,
            'month': next_date.month,
            'is_weekend': 1 if next_date.weekday() in [5, 6] else 0,
            'rolling_7_mean': rolling_7,
            'lag_1': lag_1
        }

        if model_bundle.get('model_type') == 'baseline_mean' or 'model' not in model_bundle:
            pred_val = model_bundle.get('mean_value', 1.0)
        else:
            feature_cols = model_bundle['feature_cols']
            X_input = np.array([[row_feat[c] for c in feature_cols]])
            pred_val = float(model_bundle['model'].predict(X_input)[0])

        # Ensure demand cannot be negative
        pred_val = max(0.0, round(pred_val, 2))
        predictions.append({
            'date': next_date.strftime('%Y-%m-%d'),
            'predicted_demand': pred_val
        })

        # Append simulated row for future lags
        new_row = pd.DataFrame([{
            'date': next_date,
            'quantity': pred_val,
            'revenue': 0
        }])
        current_df = pd.concat([current_df, new_row], ignore_index=True)

    return predictions

def main():
    """
    Entry point for CLI or child process execution.
    Expects JSON payload with:
    {
      "product": { "id": "...", "name": "...", "currentStock": 20, "costPrice": 15 },
      "sales": [ ... ],
      "horizon": 30
    }
    """
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            # Demo run if executed without stdin
            print(json.dumps({
                "status": "ready",
                "message": "StockWise Demand Forecasting Service Ready",
                "version": "1.0.0"
            }))
            return

        payload = json.loads(raw_input)
        product = payload.get('product', {})
        sales = payload.get('sales', [])
        horizon = payload.get('horizon', 30)

        daily_df = clean_and_aggregate_sales(sales, product.get('id'))
        featured_df = engineer_time_features(daily_df)
        model_bundle = train_demand_model(featured_df)

        future_predictions = forecast_future_demand(daily_df, model_bundle, horizon)

        total_predicted_demand = sum(p['predicted_demand'] for p in future_predictions)
        avg_daily_rate = total_predicted_demand / horizon if horizon > 0 else 0
        current_stock = product.get('currentStock', 0)

        # Safety stock & reorder
        safety_stock = int(np.ceil(avg_daily_rate * 7 * 1.5))
        suggested_reorder = max(0, int(np.ceil(total_predicted_demand + safety_stock - current_stock)))
        days_runway = int(current_stock // avg_daily_rate) if avg_daily_rate > 0 else 999

        risk_level = "OPTIMAL"
        if current_stock == 0 or days_runway <= 3:
            risk_level = "CRITICAL"
        elif days_runway <= 7:
            risk_level = "HIGH"
        elif days_runway <= 15:
            risk_level = "MODERATE"

        output = {
            "success": True,
            "modelUsed": model_bundle.get('model_type', 'StatisticalRegression'),
            "mae": model_bundle.get('mae', 0),
            "forecastHorizonDays": horizon,
            "averageDailyDemand": round(avg_daily_rate, 2),
            "totalPredictedDemand": round(total_predicted_demand, 1),
            "daysOfStockRemaining": days_runway,
            "safetyStock": safety_stock,
            "suggestedReorderQuantity": suggested_reorder,
            "riskLevel": risk_level,
            "predictions": future_predictions
        }

        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
