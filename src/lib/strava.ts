// Klientsidan av Strava-anslutningen. Själva token-hanteringen sker på servern (api/strava-*.ts).
export const connectStrava = async (personId: string, getToken: () => Promise<string | undefined>) => {
  const token = await getToken()
  const r = await fetch('/api/strava-connect', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ personId }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok || !data.url) throw new Error(data.error ?? 'error')
  window.location.href = data.url as string
}

export const disconnectStrava = async (personId: string, getToken: () => Promise<string | undefined>) => {
  const token = await getToken()
  const r = await fetch('/api/strava-disconnect', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ personId }),
  })
  if (!r.ok) throw new Error('error')
}
