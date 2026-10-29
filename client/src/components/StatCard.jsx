import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#2563eb',
  bgColor = '#eff6ff',
}) {
  return (
    <div className="card">
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className="stat-icon" style={{ backgroundColor: bgColor, color }}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
