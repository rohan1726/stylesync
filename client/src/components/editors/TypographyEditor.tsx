import { useState } from 'react';
import { useTokenStore } from '../../store/tokenStore';

const scaleOrder = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'caption'];

export function TypographyEditor() {
  const { typography, lockedPaths, updateToken, toggleLock } = useTokenStore();

  return (
    <>
      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">✏️ Font Families</h2>
        </div>
        <div className="panel__body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FontFamilyRow
              label="Heading"
              value={typography.headingFont}
              path="typography.headingFont"
              isLocked={lockedPaths.has('typography.headingFont')}
              onUpdate={updateToken}
              onToggleLock={toggleLock}
            />
            <FontFamilyRow
              label="Body"
              value={typography.bodyFont}
              path="typography.bodyFont"
              isLocked={lockedPaths.has('typography.bodyFont')}
              onUpdate={updateToken}
              onToggleLock={toggleLock}
            />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <DetailChip label="Base Size" value={`${typography.baseSize}px`} />
              <DetailChip label="Scale Ratio" value={`${typography.scaleRatio}`} />
              <DetailChip label="Weights" value={typography.weights.join(', ')} />
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">📏 Type Scale</h2>
        </div>
        <div className="panel__body">
          <div className="type-scale">
            {scaleOrder.map((key) => {
              const entry = typography.scale[key];
              if (!entry) return null;
              const path = `typography.scale.${key}`;
              const isLocked = lockedPaths.has(`${path}.size`);

              return (
                <div key={key} className="type-scale__item">
                  <span className="type-scale__label">{key}</span>
                  <span
                    className="type-scale__specimen"
                    style={{
                      fontFamily: key === 'body' || key === 'caption'
                        ? `var(--font-body)`
                        : `var(--font-heading)`,
                      fontSize: `${entry.size}px`,
                      fontWeight: entry.weight,
                      lineHeight: entry.lineHeight,
                      color: 'var(--ds-text)',
                    }}
                  >
                    The quick brown fox
                  </span>
                  <div className="type-scale__details">
                    <EditableChip
                      value={String(entry.size)}
                      suffix="px"
                      onChange={(val) => {
                        const num = parseInt(val);
                        if (!isNaN(num) && num > 0) {
                          updateToken(`${path}.size`, num);
                        }
                      }}
                    />
                    <span className="type-scale__detail-chip">{entry.weight}</span>
                    <span className="type-scale__detail-chip">{entry.lineHeight}</span>
                    <button
                      className={`lock-toggle ${isLocked ? 'lock-toggle--locked' : ''}`}
                      onClick={() => toggleLock(`${path}.size`)}
                      style={{ marginLeft: 4 }}
                    >
                      {isLocked ? '🔒' : '🔓'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function FontFamilyRow({
  label,
  value,
  path,
  isLocked,
  onUpdate,
  onToggleLock,
}: {
  label: string;
  value: string;
  path: string;
  isLocked: boolean;
  onUpdate: (path: string, value: any) => void;
  onToggleLock: (path: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ minWidth: 60, fontSize: 12, fontWeight: 600, color: 'var(--ds-text-secondary)' }}>
        {label}
      </span>
      <div style={{ flex: 1 }}>
        {editing ? (
          <input
            className="editable-field__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (input.trim()) onUpdate(path, input.trim());
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditing(false);
                if (input.trim()) onUpdate(path, input.trim());
              }
            }}
            autoFocus
            style={{ width: '100%' }}
          />
        ) : (
          <span
            className="editable-field"
            onClick={() => setEditing(true)}
            style={{ fontFamily: `'${value}', sans-serif`, fontSize: 16 }}
          >
            {value}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: `'${value}', sans-serif`,
          fontSize: 13,
          color: 'var(--ds-text-tertiary)',
        }}
      >
        Aa Bb Cc 123
      </span>
      <button
        className={`lock-toggle ${isLocked ? 'lock-toggle--locked' : ''}`}
        onClick={() => onToggleLock(path)}
      >
        {isLocked ? '🔒' : '🔓'}
      </button>
    </div>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--ds-text-tertiary)' }}>{label}:</span>
      <span className="type-scale__detail-chip">{value}</span>
    </div>
  );
}

function EditableChip({
  value,
  suffix,
  onChange,
}: {
  value: string;
  suffix: string;
  onChange: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value);

  if (editing) {
    return (
      <input
        className="spacing-item__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(input);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditing(false);
            onChange(input);
          }
        }}
        autoFocus
        style={{ width: 50 }}
      />
    );
  }

  return (
    <span
      className="type-scale__detail-chip"
      style={{ cursor: 'pointer' }}
      onClick={() => setEditing(true)}
    >
      {value}{suffix}
    </span>
  );
}
