import React from 'react';

export default function Badge({ status, text }) {
  const normStatus = (status || '').toLowerCase().replace(/\s+/g, '_');
  const label = text || status;

  return (
    <span className={`badge badge-${normStatus}`}>
      {label}
    </span>
  );
}
