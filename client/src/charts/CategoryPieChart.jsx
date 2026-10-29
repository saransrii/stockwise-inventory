import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ categoryData = [] }) {
  if (!categoryData || categoryData.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No category data available</div>;
  }

  const labels = categoryData.map((c) => c.category);
  const stockCounts = categoryData.map((c) => c.stock || c.count || 0);

  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#64748b',
  ];

  const data = {
    labels,
    datasets: [
      {
        data: stockCounts,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.parsed} units in stock`,
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
