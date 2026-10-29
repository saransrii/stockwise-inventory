import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DemandForecastChart({ timeline = [], productName = 'Product' }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
        No demand forecast data available for this product yet.
      </div>
    );
  }

  // Format dates: e.g. "Oct 24"
  const formatLabel = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const m = parseInt(parts[1], 10) - 1;
      return `${monthNames[m]} ${parseInt(parts[2], 10)}`;
    }
    return dateStr;
  };

  const labels = timeline.map((pt) => formatLabel(pt.date));

  // Actual sales dataset
  const actualData = timeline.map((pt) => (pt.actualSales !== null ? pt.actualSales : null));

  // Bridge connection: Connect the last actual point to the first forecast point so the line is continuous
  const forecastData = timeline.map((pt, i) => {
    if (pt.predictedDemand !== null) return pt.predictedDemand;
    // Check if next point is forecast, bridge from last actual
    if (timeline[i + 1] && timeline[i + 1].predictedDemand !== null) {
      return pt.actualSales;
    }
    return null;
  });

  // Confidence bounds for forecast
  const upperBound = timeline.map((pt) => (pt.upperBound !== undefined ? pt.upperBound : null));
  const lowerBound = timeline.map((pt) => (pt.lowerBound !== undefined ? pt.lowerBound : null));

  const data = {
    labels,
    datasets: [
      {
        label: 'Historical Actual Sales',
        data: actualData,
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        borderWidth: 2.5,
        tension: 0.2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'AI Predicted Demand',
        data: forecastData,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2.5,
        borderDash: [6, 4],
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#8b5cf6',
        pointHoverRadius: 6,
      },
      {
        label: 'Upper Bound (95% Confidence)',
        data: upperBound,
        borderColor: 'rgba(139, 92, 246, 0.25)',
        borderDash: [2, 2],
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Lower Bound (95% Confidence)',
        data: lowerBound,
        borderColor: 'rgba(139, 92, 246, 0.25)',
        borderDash: [2, 2],
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600', size: 12 },
          filter: (legendItem) => !legendItem.text.includes('Bound'), // Keep clean, show bounds in tooltip
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700' },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
        callbacks: {
          label: (context) => {
            if (context.parsed.y === null || isNaN(context.parsed.y)) return null;
            return ` ${context.dataset.label}: ${context.parsed.y} units`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: { color: '#f1f5f9' },
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        },
        title: {
          display: true,
          text: 'Quantity (Units)',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' },
        },
      },
    },
  };

  return (
    <div style={{ height: '360px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
