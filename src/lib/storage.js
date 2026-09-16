const KEY = 'bb-memory.v2.user-memories'

export function loadUserMemories() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveUserMemories(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}
