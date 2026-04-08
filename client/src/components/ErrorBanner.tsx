import { useTokenStore } from '../store/tokenStore';

export function ErrorBanner() {
  const { errorMessage, siteUrl, reset, submitUrl } = useTokenStore();

  const isBlockedSite = errorMessage.toLowerCase().includes('cors') ||
    errorMessage.toLowerCase().includes('blocked') ||
    errorMessage.toLowerCase().includes('forbidden');

  return (
    <div className="error-banner">
      <div className="error-banner__icon">
        {isBlockedSite ? '🛡️' : '⚠️'}
      </div>
      <h3 className="error-banner__title">
        {isBlockedSite
          ? 'This site blocks automated scanners'
          : 'Extraction encountered an issue'}
      </h3>
      <p className="error-banner__message">
        {errorMessage}
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="error-banner__action" onClick={() => submitUrl(siteUrl)}>
          Retry
        </button>
        <button
          className="error-banner__action"
          style={{ background: 'var(--ds-surface)', color: 'var(--ds-text)' }}
          onClick={reset}
        >
          Try Another URL
        </button>
      </div>
    </div>
  );
}
