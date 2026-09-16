export function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [pathPart, queryPart = ''] = raw.split('?')
  const parts = pathPart.replace(/^\/+/, '').split('/').filter(Boolean)
  const params = Object.fromEntries(new URLSearchParams(queryPart))
  return { view: parts[0] || 'home', id: parts[1] || '', q: params.q || '', from: params.from || '' }
}

export function href(view, extra = {}) {
  if (!view || view === 'home') return '#/'
  if (view === 'search') {
    const usp = new URLSearchParams()
    if (extra.q) usp.set('q', extra.q)
    const qs = usp.toString()
    return qs ? `#/search?${qs}` : '#/search'
  }
  const path = extra.id ? `#/${view}/${extra.id}` : `#/${view}`
  const usp = new URLSearchParams()
  if (extra.q) usp.set('q', extra.q)
  if (extra.from) usp.set('from', extra.from)
  const qs = usp.toString()
  return qs ? `${path}?${qs}` : path
}

export function go(view, extra) {
  const next = href(view, extra)
  if (window.location.hash === next || (next === '#/' && !window.location.hash)) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = next
}
