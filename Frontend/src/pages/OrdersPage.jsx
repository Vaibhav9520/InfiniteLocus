import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { cancelOrder, createOrder, fetchActiveOrder } from '../services/orderAPI.js'
import { useCart } from '../context/CartContext.jsx'
import OrderTimer from '../components/OrderTimer.jsx'

export default function OrdersPage() {
  const { userId } = useAuth()
  const { summary, clearCart } = useCart()
  const [activeOrder, setActiveOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadActive() {
    if (!userId) return
    const order = await fetchActiveOrder(userId)
    setActiveOrder(order)
  }

  useEffect(() => {
    loadActive()
    const id = setInterval(loadActive, 5000)
    return () => clearInterval(id)
  }, [userId])

  async function placeOrder() {
    try {
      setLoading(true)
      setError('')
      const items = summary.entries.map((e) => ({ id: e.item.id, quantity: e.quantity }))
      const created = await createOrder({ userId, items })
      setActiveOrder(created)
      clearCart()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCancel(orderId) {
    try {
      setLoading(true)
      await cancelOrder(orderId)
      await loadActive()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Orders</h1>
      {error && <div style={{ color: 'salmon' }}>{error}</div>}
      {!activeOrder && (
        <div>
          <h3>Cart</h3>
          {summary.entries.length === 0 ? (
            <div>No items in cart</div>
          ) : (
            <ul style={{ textAlign: 'left' }}>
              {summary.entries.map((e) => (
                <li key={e.item.id}>
                  {e.item.name} × {e.quantity} — ₹{(e.item.price * e.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: 12, fontWeight: 600 }}>Total: ₹{summary.total.toFixed(2)}</div>
          <button disabled={loading || summary.entries.length === 0} onClick={placeOrder} style={{ marginTop: 12 }}>
            {loading ? 'Placing...' : 'Place order'}
          </button>
        </div>
      )}
      {activeOrder && (
        <div style={{ marginTop: 16 }}>
          <h3>Active order</h3>
          <div>Order ID: {activeOrder.id}</div>
          <div>
            Expires in: <OrderTimer expiresAt={activeOrder.expiresAt} onExpired={loadActive} />
          </div>
          <button disabled={loading} onClick={() => onCancel(activeOrder.id)} style={{ marginTop: 12 }}>
            {loading ? 'Cancelling...' : 'Cancel order'}
          </button>
        </div>
      )}
    </div>
  )
}

