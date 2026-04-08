import { useTokenStore } from '../../store/tokenStore';
import { UrlInput } from '../UrlInput';

export function Header() {
  const { extractionStatus, siteUrl, siteTitle, reset } = useTokenStore();
  const isDashboard = extractionStatus === 'complete' || extractionStatus === 'error';

  return (
    <header className="header">
      <a className="header__logo" href="#" onClick={(e) => { e.preventDefault(); reset(); }}>
        <div className="header__logo-icon">✦</div>
        <span>StyleSync</span>
      </a>

      {isDashboard && (
        <div className="header__url-bar">
          <UrlInput compact />
        </div>
      )}

      <div className="header__actions">
        {isDashboard && (
          <>
            <span style={{ fontSize: 12, color: 'var(--ds-text-tertiary)', marginRight: 8 }}>
              {siteTitle || siteUrl}
            </span>
            <button className="btn btn--secondary btn--sm" onClick={reset}>
              New
            </button>
          </>
        )}
      </div>
    </header>
  );
}
