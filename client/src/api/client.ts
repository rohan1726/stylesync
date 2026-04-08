const API_BASE = 'http://localhost:3001/api';

export async function submitUrl(url: string): Promise<{ siteId: string; status: string }> {
  const res = await fetch(`${API_BASE}/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getScrapeStatus(siteId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/scrape/${siteId}/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getTokens(siteId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tokens/${siteId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateToken(siteId: string, path: string, value: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tokens/${siteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, value }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function lockToken(siteId: string, path: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tokens/${siteId}/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function unlockToken(siteId: string, path: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tokens/${siteId}/lock`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getVersionHistory(siteId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/tokens/${siteId}/history`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getExportUrl(siteId: string, format: 'css' | 'json' | 'tailwind'): string {
  return `${API_BASE}/export/${siteId}?format=${format}`;
}
