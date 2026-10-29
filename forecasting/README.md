# 🧠 StockWise Demand Forecasting Module

This module implements AI and machine-learning-based product demand forecasting for the StockWise inventory system.

## 📊 Capabilities
- **Temporal Aggregation**: Resamples raw sales transaction logs into continuous daily and weekly time series.
- **Feature Engineering**: Calculates day of week, day of month, weekend flag, rolling 7-day and 14-day moving averages, and lag terms ($t-1, t-7$).
- **Model Evaluation**: Fits and compares Linear Regression, Ridge Regularization, and Random Forest Regressors, choosing the best estimator by MAE.
- **Inventory Replenishment**: Computes safety stock buffers, days of inventory remaining (runway), recommended order quantities, and stockout risk urgency classifications.

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
cd forecasting
pip install -r requirements.txt
```

### 2. Run Demand Prediction
```bash
python predict_demand.py
```
*(The module accepts JSON payloads containing product and historical sales records via standard input or API invocation from the StockWise Node.js backend).*
