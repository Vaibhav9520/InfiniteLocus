import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { cancelOrder, createOrder, fetchActiveOrder } from '../services/orderAPI.js'
import { useCart } from '../context/CartContext.jsx'
import OrderTimer from '../components/OrderTimer.jsx'

export default function OrdersPage({ orders, completeOrder }) {
  const { userId } = useAuth()
  const { cart, clearCart, getCartTotal, getCartCount } = useCart()
  const [activeOrder, setActiveOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadActive() {
    if (!userId) return
    try {
      const order = await fetchActiveOrder(userId)
      setActiveOrder(order)
    } catch (error) {
      console.error('Failed to load active order:', error)
    }
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
      const items = cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }))
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Orders</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Current Orders */}
      {orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">Rs {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: Rs {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </div>
                  {order.status === 'active' && (
                    <button
                      onClick={() => completeOrder(order.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart</h2>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">Rs {item.price} × {item.quantity}</p>
                </div>
                <span className="font-medium text-gray-900">
                  Rs {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-gray-900">Rs {getCartTotal().toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600">
              {getCartCount()} item{getCartCount() !== 1 ? 's' : ''}
            </div>
          </div>
          
          <button
            disabled={loading || cart.length === 0}
            onClick={placeOrder}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      )}

      {/* Active Order from API */}
      {activeOrder && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Order</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span className="text-gray-900">{activeOrder.id}</span>
            </div>
            {activeOrder.expiresAt && (
              <div className="flex justify-between">
                <span className="font-medium">Expires in:</span>
                <OrderTimer expiresAt={activeOrder.expiresAt} onExpired={loadActive} />
              </div>
            )}
            <button
              disabled={loading}
              onClick={() => onCancel(activeOrder.id)}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && cart.length === 0 && !activeOrder && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>No orders yet</p>
          <p className="text-sm">Add items to your cart and place an order to get started!</p>
        </div>
      )}
    </div>
  )
}
