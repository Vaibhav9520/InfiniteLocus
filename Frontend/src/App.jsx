import React, { useState } from "react";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import MenuPage from "./pages/MenuPage";
import OrdersPage from "./pages/OrdersPage";
import HistoryPage from "./pages/HistoryPage";

function AppContent() {
  const [page, setPage] = useState("menu");
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);

  const placeOrder = (cart) => {
    if (cart.length === 0) return; // prevent empty order
    const newOrder = {
      id: Date.now(),
      items: cart,
      status: "active",
      createdAt: new Date(),
    };
    setOrders([...orders, newOrder]);
  };

  const completeOrder = (id) => {
    const orderToComplete = orders.find((o) => o.id === id);
    if (!orderToComplete) return;
    const updatedOrders = orders.map((o) =>
      o.id === id ? { ...o, status: "completed" } : o
    );
    setOrders(updatedOrders);
    setHistory([
      ...history,
      { ...orderToComplete, status: "completed" },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-orange-600">
          🍴 InfiniteLocus Canteen
        </h1>
        <nav className="space-x-4">
          <button
            onClick={() => setPage("menu")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page === "menu" 
                ? "bg-orange-500 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setPage("orders")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page === "orders" 
                ? "bg-orange-500 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setPage("history")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page === "history" 
                ? "bg-orange-500 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            History
          </button>
        </nav>
      </header>

      {/* Pages */}
      <main className="p-6">
        {page === "menu" && (
          <MenuPage
            placeOrder={placeOrder}
          />
        )}
        {page === "orders" && (
          <OrdersPage
            orders={orders}
            completeOrder={completeOrder}
          />
        )}
        {page === "history" && <HistoryPage history={history} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
