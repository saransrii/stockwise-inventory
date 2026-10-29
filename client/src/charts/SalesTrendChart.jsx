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

export default function SalesTrendChart({ trendData = [] }) {
  if (!trendData || trendData.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No sales trend data available yet</div>;
  }

  const labels = trendData.map((t) => t.month);
  const revenueValues = trendData.map((t) => t.revenue);
  const orderCounts = trendData.map((t) => t.orders);

  const data = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueValues,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.35,
        yAxisID: 'y',
        borderWidth: 2.5,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Orders',
        data: orderCounts,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y1',
        pointBackgroundColor: '#10b981',
        pointRadius: 3,
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
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700' },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
        callbacks: {
          label: (context) => {
            if (context.dataset.label.includes('Revenue')) {
              return ` Revenue: $${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            return ` Orders: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: '#f1f5f9' },
        ticks: {
          callback: (value) => `$${value}`,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { display: false },
        ticks: {
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          precision: 0,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
