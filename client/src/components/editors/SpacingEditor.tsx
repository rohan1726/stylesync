import { useState } from 'react';
import { useTokenStore } from '../../store/tokenStore';

const spacingOrder = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

export function SpacingEditor() {
  const { spacing, borderRadius, lockedPaths, updateToken, toggleLock } = useTokenStore();

  const maxSpacing = Math.max(...Object.values(spacing.values), 64);

  return (
    <>
      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">📐 Spacing Scale</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--ds-text-tertiary)' }}>Base unit:</span>
            <span className="type-scale__detail-chip">{spacing.unit}px</span>
          </div>
        </div>
        <div className="panel__body">
          <div className="spacing-grid">
            {spacingOrder.map((key) => {
              const value = spacing.values[key];
              if (value === undefined) return null;
              const path = `spacing.values.${key}`;
              const isLocked = lockedPaths.has(path);
              const barWidth = (value / maxSpacing) * 100;

              return (
                <div key={key} className="spacing-item">
                  <span className="spacing-item__name">{key}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      className="spacing-item__bar"
                      style={{ width: `${Math.max(barWidth, 2)}%` }}
                    />
                  </div>
                  <SpacingInput
                    value={value}
                    onChange={(newVal) => updateToken(path, newVal)}
                  />
                  <span className="spacing-item__value">{value}px</span>
                  <button
                    className={`lock-toggle ${isLocked ? 'lock-toggle--locked' : ''}`}
                    onClick={() => toggleLock(path)}
                  >
                    {isLocked ? '🔒' : '🔓'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">⬜ Border Radius</h2>
        </div>
        <div className="panel__body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {(['sm', 'md', 'lg', 'xl'] as const).map((key) => {
              const value = borderRadius[key];
              const path = `borderRadius.${key}`;
              const isLocked = lockedPaths.has(path);

              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      border: '2px solid var(--ds-accent)',
                      borderRadius: `${value}px`,
                      transition: 'border-radius var(--ds-transition)',
                    }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ds-text-secondary)' }}>
                    {key}
                  </span>
                  <span className="type-scale__detail-chip">{value}px</span>
                  <button
                    className={`lock-toggle ${isLocked ? 'lock-toggle--locked' : ''}`}
                    onClick={() => toggleLock(path)}
                    style={{ transform: 'scale(0.85)' }}
                  >
                    {isLocked ? '🔒' : '🔓'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function SpacingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(value));

  if (editing) {
    return (
      <input
        className="spacing-item__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={() => {
          setEditing(false);
          const num = parseInt(input);
          if (!isNaN(num) && num >= 0) onChange(num);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditing(false);
            const num = parseInt(input);
            if (!isNaN(num) && num >= 0) onChange(num);
          }
        }}
        autoFocus
      />
    );
  }

  return (
    <input
      type="range"
      min="0"
      max="128"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      style={{ width: 80, accentColor: 'var(--ds-accent)' }}
      onDoubleClick={() => {
        setInput(String(value));
        setEditing(true);
      }}
    />
  );
}
