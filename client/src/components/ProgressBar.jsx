import React from 'react';

export default function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100);
  return (
    <div style={{ margin: '16px 0' }}>
      <div style={{ background: '#eee', borderRadius: 8, height: 20 }}>
        <div style={{ width: percent + '%', background: '#3b82f6', height: 20, borderRadius: 8 }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: 12 }}>{current} / {total}</div>
    </div>
  );
}
