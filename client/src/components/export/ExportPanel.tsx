import { useState, useEffect } from 'react';
import { useTokenStore } from '../../store/tokenStore';
import { getExportUrl } from '../../api/client';

type ExportFormat = 'css' | 'json' | 'tailwind';

export function ExportPanel() {
  const { currentSiteId } = useTokenStore();
  const [format, setFormat] = useState<ExportFormat>('css');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentSiteId) return;
    setLoading(true);
    fetch(getExportUrl(currentSiteId, format))
      .then((res) => res.text())
      .then((text) => {
        setCode(text);
        setLoading(false);
      })
      .catch(() => {
        setCode('// Failed to generate export');
        setLoading(false);
      });
  }, [currentSiteId, format]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<ExportFormat, string> = {
      css: 'design-tokens.css',
      json: 'design-tokens.json',
      tailwind: 'tailwind.config.js',
    };
    const mimeTypes: Record<ExportFormat, string> = {
      css: 'text/css',
      json: 'application/json',
      tailwind: 'text/javascript',
    };
    const blob = new Blob([code], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = extensions[format];
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel">
      <div className="panel__header">
        <h2 className="panel__title">📦 Export Tokens</h2>
      </div>
      <div className="panel__body">
        <div className="export-panel">
          <div className="export-tabs">
            {(['css', 'json', 'tailwind'] as ExportFormat[]).map((f) => (
              <button
                key={f}
                className={`export-tab ${format === f ? 'export-tab--active' : ''}`}
                onClick={() => setFormat(f)}
              >
                {f === 'css' ? 'CSS Variables' : f === 'json' ? 'JSON Tokens' : 'Tailwind Config'}
              </button>
            ))}
          </div>

          <div className="export-code">
            {loading ? (
              <pre style={{ color: 'var(--ds-text-tertiary)' }}>Loading...</pre>
            ) : (
              <pre>{code}</pre>
            )}
          </div>

          <div className="export-actions">
            <button className="btn btn--primary" onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
            <button className="btn btn--secondary" onClick={handleDownload}>
              ⬇ Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
