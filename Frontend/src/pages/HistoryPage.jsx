import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchOrderHistory } from '../services/orderAPI.js'

export default function HistoryPage({ history }) {
  const { userId } = useAuth()
  const [apiOrders, setApiOrders] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!userId) return
      try {
        setLoading(true)
        const data = await fetchOrderHistory(userId)
        if (mounted) setApiOrders(data)
      } catch (error) {
        console.error('Failed to load order history:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 10000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [userId])

  // Combine local history with API orders
  const allOrders = [...history, ...apiOrders]
  const uniqueOrders = allOrders.filter((order, index, self) => 
    index === self.findIndex(o => o.id === order.id)
  )

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Order History</h1>
      
      {loading && (
        <div className="text-center py-4 text-gray-600">
          Loading order history...
        </div>
      )}

      {uniqueOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">📚</div>
          <p>No order history yet</p>
          <p className="text-sm">Your completed orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniqueOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              {order.items && order.items.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-gray-900">Items:</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.name || `Item ${item.id}`} × {item.quantity}
                        </span>
                        {item.price && (
                          <span className="font-medium text-gray-900">
                            Rs {(item.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {order.items && order.items.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      Rs {order.items.reduce((sum, item) => 
                        sum + ((item.price || 0) * item.quantity), 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
