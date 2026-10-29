"""
StockWise Demand Forecasting Module - Data Processing
Cleans, aggregates, and engineers features from historical sales transactions.
"""

import sys
import json
import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

def clean_and_aggregate_sales(sales_records, product_id=None):
    """
    Transforms raw sales transaction records into a daily aggregated time series.
    """
    if not sales_records:
        return pd.DataFrame(columns=['date', 'quantity', 'revenue'])

    rows = []
    for sale in sales_records:
      sale_date = sale.get('saleDate') or sale.get('createdAt')
      if isinstance(sale_date, str):
        # Parse ISO date string
        dt = pd.to_datetime(sale_date).tz_localize(None).floor('D')
      else:
        dt = pd.to_datetime(sale_date).floor('D')

      for item in sale.get('items', []):
        p_id = str(item.get('product', ''))
        if product_id and p_id != str(product_id):
          continue

        qty = item.get('quantity', 0)
        subtotal = item.get('subtotal', 0)
        rows.append({
            'date': dt,
            'product_id': p_id,
            'product_name': item.get('name', 'Unknown'),
            'quantity': qty,
            'revenue': subtotal
        })

    if not rows:
        return pd.DataFrame(columns=['date', 'quantity', 'revenue'])

    df = pd.DataFrame(rows)

    # Group by date and sum quantity
    daily_df = df.groupby('date').agg({
        'quantity': 'sum',
        'revenue': 'sum'
    }).reset_index()

    # Fill missing dates with 0 sales for accurate time series
    daily_df = daily_df.sort_values('date')
    full_idx = pd.date_range(start=daily_df['date'].min(), end=daily_df['date'].max(), freq='D')
    daily_df = daily_df.set_index('date').reindex(full_idx, fill_value=0)
    daily_df.index.name = 'date'
    daily_df = daily_df.reset_index()

    return daily_df

def engineer_time_features(df):
    """
    Creates temporal and lag features for machine learning demand estimation.
    """
    if df.empty or len(df) < 2:
        return df

    df = df.copy()
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

    # Rolling window averages
    df['rolling_7_mean'] = df['quantity'].rolling(window=7, min_periods=1).mean()
    df['rolling_14_mean'] = df['quantity'].rolling(window=14, min_periods=1).mean()

    # Lag features
    df['lag_1'] = df['quantity'].shift(1).fillna(0)
    df['lag_7'] = df['quantity'].shift(7).fillna(0)

    return df

if __name__ == '__main__':
    print("StockWise Data Processing module loaded successfully.")
