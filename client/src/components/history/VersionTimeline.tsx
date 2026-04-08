import { useEffect } from 'react';
import { useTokenStore } from '../../store/tokenStore';

export function VersionTimeline() {
  const { versionHistory, loadHistory } = useTokenStore();

  useEffect(() => {
    loadHistory();
  }, []);

  if (versionHistory.length === 0) {
    return (
      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">🕐 Version History</h2>
        </div>
        <div className="panel__body">
          <div className="empty-state">
            <div className="empty-state__icon">📜</div>
            <div className="empty-state__text">
              No changes recorded yet. Edit a token to start tracking history.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel__header">
        <h2 className="panel__title">🕐 Version History</h2>
        <span style={{ fontSize: 12, color: 'var(--ds-text-tertiary)' }}>
          {versionHistory.length} changes
        </span>
      </div>
      <div className="panel__body" style={{ padding: 'var(--ds-gap-sm)' }}>
        <div className="timeline">
          {versionHistory.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineEntry({ entry }: { entry: any }) {
  const dotClass =
    entry.changeType === 'locked' || entry.changeType === 'unlocked'
      ? 'timeline__dot--lock'
      : entry.changeType === 'extracted'
      ? 'timeline__dot--extract'
      : 'timeline__dot--edit';

  const actionLabel =
    entry.changeType === 'locked'
      ? '🔒 Locked'
      : entry.changeType === 'unlocked'
      ? '🔓 Unlocked'
      : entry.changeType === 'extracted'
      ? '📥 Extracted'
      : '✏️ Edited';

  const time = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isColor = entry.tokenPath.startsWith('colors.');

  return (
    <div className="timeline__item">
      <div className={`timeline__dot ${dotClass}`} />
      <div className="timeline__detail">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12 }}>{actionLabel}</span>
          <span className="timeline__path">{entry.tokenPath}</span>
        </div>
        {entry.previousValue && entry.newValue && (
          <div className="timeline__change">
            {isColor && entry.previousValue && (
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: entry.previousValue,
                  border: '1px solid var(--ds-border)',
                  display: 'inline-block',
                }}
              />
            )}
            <span className="timeline__value--old">{entry.previousValue}</span>
            <span style={{ color: 'var(--ds-text-tertiary)' }}>→</span>
            {isColor && entry.newValue && (
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: entry.newValue,
                  border: '1px solid var(--ds-border)',
                  display: 'inline-block',
                }}
              />
            )}
            <span className="timeline__value--new">{entry.newValue}</span>
          </div>
        )}
      </div>
      <span className="timeline__time">{time}</span>
    </div>
  );
}
