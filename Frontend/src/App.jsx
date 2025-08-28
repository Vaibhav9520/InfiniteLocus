import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import MenuPage from './pages/MenuPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
