import { UrlInput } from './UrlInput';

export function Landing() {
  return (
    <div className="landing">
      <div className="landing__badge">✦ Design System Extraction Engine</div>
      <h1 className="landing__title">
        Transform any website into a living design system
      </h1>
      <p className="landing__subtitle">
        Paste a URL and watch StyleSync extract colors, typography, and spacing into an
        interactive token editor with live preview components.
      </p>
      <div className="landing__url-form">
        <UrlInput />
      </div>
      <div className="landing__features">
        <div className="feature-card">
          <div className="feature-card__icon">🎨</div>
          <h3 className="feature-card__title">Intelligent Extraction</h3>
          <p className="feature-card__desc">
            Analyzes CSS, images, and DOM structure to build a comprehensive palette of design tokens.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon">🔒</div>
          <h3 className="feature-card__title">Lock & Version</h3>
          <p className="feature-card__desc">
            Lock tokens you love, edit freely, and track every change with full version history.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon">📦</div>
          <h3 className="feature-card__title">Export Anywhere</h3>
          <p className="feature-card__desc">
            Export as CSS variables, JSON tokens, or a Tailwind config — ready for production.
          </p>
        </div>
      </div>
    </div>
  );
}
