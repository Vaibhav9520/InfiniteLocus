import { apiClient } from './apiClient.js'

export async function fetchMenu() {
  try {
    return await apiClient.get('/menu')
  } catch {
    return []
  }
}

export function subscribeMenu({ intervalMs = 5000, onData }) {
  let isActive = true
  async function poll() {
    if (!isActive) return
    const data = await fetchMenu()
    if (isActive) onData(data)
    if (isActive) setTimeout(poll, intervalMs)
  }
  poll()
  return () => {
    isActive = false
  }
}

