import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopProductsChart({ products = [] }) {
  if (!products || products.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No sales data available yet</div>;
  }

  const labels = products.map((p) => (p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name));
  const unitsSold = products.map((p) => p.totalQuantitySold || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Units Sold',
        data: unitsSold,
        backgroundColor: [
          '#3b82f6',
          '#60a5fa',
          '#93c5fd',
          '#10b981',
          '#34d399',
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700' },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          precision: 0,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        },
      },
    },
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
