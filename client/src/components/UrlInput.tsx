import { useState, FormEvent } from 'react';
import { useTokenStore } from '../store/tokenStore';

interface UrlInputProps {
  compact?: boolean;
}

export function UrlInput({ compact }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const { submitUrl, extractionStatus } = useTokenStore();
  const isLoading = extractionStatus === 'scraping';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    submitUrl(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="url-input-wrapper">
      <span className="url-input__icon">🔗</span>
      <input
        id="url-input"
        type="text"
        className="url-input"
        placeholder={compact ? 'Paste a new URL...' : 'Paste any website URL — e.g., https://stripe.com'}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
        autoComplete="off"
      />
      <button
        type="submit"
        className="url-input__submit"
        disabled={!url.trim() || isLoading}
        id="url-submit-btn"
      >
        {isLoading ? 'Analyzing...' : compact ? 'Scan' : 'Extract Design'}
      </button>
    </form>
  );
}
