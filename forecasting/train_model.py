"""
StockWise Demand Forecasting Module - Model Training Pipeline
Trains time-series regression models using Scikit-Learn.
"""

import sys
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

def train_demand_model(featured_df):
    """
    Trains regression models on historical engineered features and selects the best performer.
    """
    if featured_df.empty or len(featured_df) < 5:
        # Fallback to simple mean if insufficient data points
        mean_demand = featured_df['quantity'].mean() if not featured_df.empty else 1.0
        return {
            'model_type': 'baseline_mean',
            'mean_value': max(0.1, mean_demand),
            'mae': 0.0,
            'rmse': 0.0
        }

    feature_cols = ['day_of_week', 'day_of_month', 'month', 'is_weekend', 'rolling_7_mean', 'lag_1']
    X = featured_df[feature_cols].values
    y = featured_df['quantity'].values

    # Train / Test split (80/20 temporal split)
    split_idx = max(1, int(len(featured_df) * 0.8))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    models = {
        'LinearRegression': LinearRegression(),
        'Ridge': Ridge(alpha=1.0),
        'RandomForest': RandomForestRegressor(n_estimators=50, random_state=42)
    }

    best_model_name = None
    best_model = None
    best_mae = float('inf')

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test) if len(X_test) > 0 else model.predict(X_train)
        eval_y = y_test if len(y_test) > 0 else y_train
        mae = mean_absolute_error(eval_y, preds)

        if mae < best_mae:
            best_mae = mae
            best_model_name = name
            best_model = model

    # Retrain on full historical dataset for future deployment
    best_model.fit(X, y)

    return {
        'model_type': best_model_name,
        'model': best_model,
        'mae': round(best_mae, 3),
        'rmse': round(np.sqrt(mean_squared_error(eval_y, preds)), 3),
        'feature_cols': feature_cols
    }

if __name__ == '__main__':
    print("StockWise Demand Model Training module initialized.")
