import { apiClient } from './apiClient.js'

export async function createOrder({ userId, items }) {
  return apiClient.post('/orders', { userId, items })
}

export async function fetchActiveOrder(userId) {
  try {
    return await apiClient.get(`/orders/active?userId=${encodeURIComponent(userId)}`)
  } catch {
    return null
  }
}

export async function cancelOrder(orderId) {
  return apiClient.post(`/orders/${orderId}/cancel`, {})
}

export async function fetchOrderHistory(userId) {
  try {
    return await apiClient.get(`/orders/history?userId=${encodeURIComponent(userId)}`)
  } catch {
    return []
  }
}

