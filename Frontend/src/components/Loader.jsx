import React from "react";

export default function Loader() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            width: 28,
            height: 28,
            border: '3px solid #e5e7eb',
            borderTopColor: '#111827',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite'
          }}
        />
        <span style={{ fontWeight: 600, color: '#111827' }}>Loading...</span>
      </div>
      <style>{`@keyframes spin {from {transform: rotate(0deg)} to {transform: rotate(360deg)}}`}</style>
    </div>
  );
}
