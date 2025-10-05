export async function saveDailySales(
  rows: Array<{ ord?: string; time?: string; amount?: string | number; payment?: string; covers?: string | number }>,
  sheet?: string
) {
  const url = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!url) {
    throw new Error('VITE_APPS_SCRIPT_URL is not set. Deploy your Apps Script as a Web App and set the URL in an .env file.');
  }
  const form = new URLSearchParams();
  form.set('rows', JSON.stringify(rows));
  if (sheet) form.set('sheet', sheet);
  // Use URL-encoded form to avoid CORS preflight on Apps Script
  const res = await fetch(url, { method: 'POST', body: form });
  return res;
}

export async function fetchSheetRange(sheet: string, range: string) {
  const base = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!base) {
    throw new Error('VITE_APPS_SCRIPT_URL is not set.');
  }
  const params = new URLSearchParams();
  if (sheet) params.set('sheet', sheet);
  params.set('range', range);
  const res = await fetch(`${base}?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch range: ${res.status} ${text}`);
  }
  return res.json() as Promise<{ ok: boolean; values?: string[][]; sheet?: string; range?: string; error?: string }>;
}
