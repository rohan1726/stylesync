export function PreviewGrid() {
  return (
    <>
      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">🧩 Component Preview</h2>
          <span style={{ fontSize: 12, color: 'var(--ds-text-tertiary)' }}>
            Live preview • CSS custom properties
          </span>
        </div>
      </div>

      <div className="preview-grid">
        <ButtonPreview />
        <InputPreview />
        <CardPreview />
        <TypeScalePreview />
      </div>
    </>
  );
}

function ButtonPreview() {
  return (
    <div className="preview-card">
      <div className="preview-card__header">Buttons</div>
      <div className="preview-card__body">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="preview-btn preview-btn--primary">Primary</button>
          <button className="preview-btn preview-btn--secondary">Secondary</button>
          <button className="preview-btn preview-btn--ghost">Ghost</button>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="preview-btn preview-btn--primary" style={{ fontSize: 12, padding: '6px 12px' }}>
            Small
          </button>
          <button className="preview-btn preview-btn--primary preview-btn--disabled">
            Disabled
          </button>
        </div>
      </div>
    </div>
  );
}

function InputPreview() {
  return (
    <div className="preview-card">
      <div className="preview-card__header">Input Fields</div>
      <div className="preview-card__body">
        <div className="preview-input-group">
          <label className="preview-input-group__label">Email address</label>
          <input
            className="preview-input"
            type="text"
            placeholder="you@example.com"
            readOnly
          />
        </div>
        <div className="preview-input-group">
          <label className="preview-input-group__label">Password</label>
          <input
            className="preview-input preview-input--error"
            type="text"
            defaultValue="short"
            readOnly
          />
          <span className="preview-input-error-text">
            Password must be at least 8 characters
          </span>
        </div>
      </div>
    </div>
  );
}

function CardPreview() {
  return (
    <div className="preview-card">
      <div className="preview-card__header">Card Component</div>
      <div className="preview-card__body" style={{ padding: 'var(--ds-gap-md)' }}>
        <div className="preview-demo-card">
          <div className="preview-demo-card__image" />
          <div className="preview-demo-card__content">
            <h4 className="preview-demo-card__title">Card Title</h4>
            <p className="preview-demo-card__text">
              This card uses your extracted tokens for colors, typography, spacing,
              shadows, and border radius.
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <button className="preview-btn preview-btn--primary" style={{ fontSize: 12, padding: '6px 16px' }}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeScalePreview() {
  return (
    <div className="preview-card">
      <div className="preview-card__header">Type Scale</div>
      <div className="preview-card__body" style={{ gap: 8 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-h1)', lineHeight: 'var(--line-height-h1)', color: 'var(--color-text)' }}>
          H1 Heading
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-h2)', lineHeight: 'var(--line-height-h2)', color: 'var(--color-text)' }}>
          H2 Heading
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-h3)', lineHeight: 'var(--line-height-h3)', color: 'var(--color-text)' }}>
          H3 Heading
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h4)', fontWeight: 'var(--font-weight-h4)', lineHeight: 'var(--line-height-h4)', color: 'var(--color-text)' }}>
          H4 Heading
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h5)', fontWeight: 'var(--font-weight-h5)', lineHeight: 'var(--line-height-h5)', color: 'var(--color-text)' }}>
          H5 Heading
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h6)', fontWeight: 'var(--font-weight-h6)', lineHeight: 'var(--line-height-h6)', color: 'var(--color-text)' }}>
          H6 Heading
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-body)', lineHeight: 'var(--line-height-body)', color: 'var(--color-text)' }}>
          Body text — The quick brown fox jumps over the lazy dog.
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-caption)', lineHeight: 'var(--line-height-caption)', color: 'var(--color-text-secondary)' }}>
          Caption text — Supplementary information in smaller size.
        </div>
      </div>
    </div>
  );
}
