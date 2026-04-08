import { useTokenStore } from '../../store/tokenStore';

const sections = [
  { key: 'colors', icon: '🎨', label: 'Colors', count: 11 },
  { key: 'typography', icon: '✏️', label: 'Typography', count: 8 },
  { key: 'spacing', icon: '📐', label: 'Spacing', count: 8 },
  { key: 'preview', icon: '🧩', label: 'Preview', count: null },
  { key: 'history', icon: '🕐', label: 'History', count: null },
  { key: 'export', icon: '📦', label: 'Export', count: null },
] as const;

export function Sidebar() {
  const { activeSection, setActiveSection, colors, lockedPaths } = useTokenStore();

  const lockedCount = lockedPaths.size;

  return (
    <aside className="sidebar">
      <div className="sidebar__section-title">Design Tokens</div>

      {sections.slice(0, 3).map((s) => (
        <button
          key={s.key}
          className={`sidebar__item ${activeSection === s.key ? 'sidebar__item--active' : ''}`}
          onClick={() => setActiveSection(s.key)}
        >
          <span className="sidebar__item-icon">{s.icon}</span>
          {s.label}
          {s.count && <span className="sidebar__item-count">{s.count}</span>}
        </button>
      ))}

      <div className="sidebar__section-title">Preview & Output</div>

      {sections.slice(3).map((s) => (
        <button
          key={s.key}
          className={`sidebar__item ${activeSection === s.key ? 'sidebar__item--active' : ''}`}
          onClick={() => setActiveSection(s.key)}
        >
          <span className="sidebar__item-icon">{s.icon}</span>
          {s.label}
        </button>
      ))}

      {lockedCount > 0 && (
        <>
          <div className="sidebar__section-title">Status</div>
          <div className="sidebar__item" style={{ cursor: 'default' }}>
            <span className="sidebar__item-icon">🔒</span>
            Locked
            <span className="sidebar__item-count" style={{ background: 'var(--ds-locked-glow)', color: 'var(--ds-locked)' }}>
              {lockedCount}
            </span>
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ padding: '12px', borderTop: '1px solid var(--ds-border-subtle)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            }}
          />
          <div>
            <div style={{ fontSize: 11, color: 'var(--ds-text-tertiary)' }}>Active Theme</div>
            <div style={{ fontSize: 12, fontFamily: 'var(--ds-font-mono)', color: 'var(--ds-text-secondary)' }}>
              {colors.primary}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
