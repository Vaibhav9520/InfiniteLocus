import { useEffect, useState } from 'react'
import { subscribeMenu } from '../services/menuAPI.js'
import { useCart } from '../context/CartContext.jsx'
import MenuCard from '../components/MenuCard.jsx'

export default function MenuPage() {
  const [menu, setMenu] = useState([])
  const { addToCart } = useCart()

  useEffect(() => {
    const unsubscribe = subscribeMenu({ intervalMs: 5000, onData: setMenu })
    return unsubscribe
  }, [])

  return (
    <div>
      <h1>Menu</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {menu.map((item) => (
          <MenuCard key={item.id} item={item} onAdd={addToCart} disabled={(item.stock ?? 0) <= 0} />
        ))}
      </div>
    </div>
  )
}

