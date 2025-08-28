import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchOrderHistory } from '../services/orderAPI.js'

export default function HistoryPage() {
  const { userId } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!userId) return
      const data = await fetchOrderHistory(userId)
      if (mounted) setOrders(data)
    }
    load()
    const id = setInterval(load, 10000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [userId])

  return (
    <div>
      <h1>Order History</h1>
      {orders.length === 0 ? (
        <div>No past orders</div>
      ) : (
        <ul style={{ textAlign: 'left' }}>
          {orders.map((o) => (
            <li key={o.id}>
              <div>
                <strong>#{o.id}</strong> — {o.status} — {new Date(o.createdAt).toLocaleString()}
              </div>
              <ul>
                {o.items?.map((it) => (
                  <li key={it.id}>
                    {it.name || it.id} × {it.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

