import { useState, useRef, useEffect } from 'react';
import { useTokenStore } from '../../store/tokenStore';

const colorKeys = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'text', label: 'Text' },
  { key: 'textSecondary', label: 'Text Secondary' },
  { key: 'border', label: 'Border' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'error', label: 'Error' },
];

export function ColorEditor() {
  const { colors, lockedPaths, updateToken, toggleLock } = useTokenStore();
  const [activePickerKey, setActivePickerKey] = useState<string | null>(null);

  return (
    <>
      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">
            🎨 Color Palette
          </h2>
          <span style={{ fontSize: 12, color: 'var(--ds-text-tertiary)' }}>
            {colorKeys.length} tokens
          </span>
        </div>
        <div className="panel__body">
          <div className="color-grid">
            {colorKeys.map(({ key, label }) => {
              const path = `colors.${key}`;
              const isLocked = lockedPaths.has(path);
              const value = (colors as any)[key] as string;

              return (
                <ColorSwatch
                  key={key}
                  id={`color-${key}`}
                  label={label}
                  value={value}
                  isLocked={isLocked}
                  isPickerOpen={activePickerKey === key}
                  onTogglePicker={() => setActivePickerKey(activePickerKey === key ? null : key)}
                  onChange={(newVal) => updateToken(path, newVal)}
                  onToggleLock={() => toggleLock(path)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {colors.neutrals && colors.neutrals.length > 0 && (
        <div className="panel">
          <div className="panel__header">
            <h2 className="panel__title">🔘 Neutrals</h2>
          </div>
          <div className="panel__body">
            <div style={{ display: 'flex', gap: 8 }}>
              {colors.neutrals.map((n, i) => (
                <div
                  key={i}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--ds-radius-md)',
                    background: n,
                    border: '1px solid var(--ds-border)',
                  }}
                  title={n}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ColorSwatch({
  id,
  label,
  value,
  isLocked,
  isPickerOpen,
  onTogglePicker,
  onChange,
  onToggleLock,
}: {
  id: string;
  label: string;
  value: string;
  isLocked: boolean;
  isPickerOpen: boolean;
  onTogglePicker: () => void;
  onChange: (val: string) => void;
  onToggleLock: () => void;
}) {
  const swatchRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={swatchRef}
      className={`color-swatch ${isLocked ? 'color-swatch--locked' : ''}`}
      onClick={onTogglePicker}
      id={id}
      style={{ position: 'relative' }}
    >
      <div className="color-swatch__preview" style={{ backgroundColor: value }} />
      <div className="color-swatch__info">
        <div>
          <div className="color-swatch__name">{label}</div>
          <div className="color-swatch__value">{value}</div>
        </div>
        <button
          className={`lock-toggle ${isLocked ? 'lock-toggle--locked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          title={isLocked ? 'Unlock this token' : 'Lock this token'}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>
      </div>

      {isPickerOpen && (
        <ColorPickerPopup
          value={value}
          onChange={onChange}
          onClose={onTogglePicker}
        />
      )}
    </div>
  );
}

function ColorPickerPopup({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}) {
  const [hexInput, setHexInput] = useState(value);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="color-picker-popup"
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4 }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHexInput(e.target.value);
        }}
        style={{
          width: '100%',
          height: 120,
          border: 'none',
          borderRadius: 'var(--ds-radius-md)',
          cursor: 'pointer',
          background: 'none',
          padding: 0,
        }}
      />
      <div className="color-picker-popup__input-row">
        <input
          type="text"
          className="color-picker-popup__hex-input"
          value={hexInput}
          onChange={(e) => {
            setHexInput(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
