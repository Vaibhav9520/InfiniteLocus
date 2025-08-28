import React, { useState } from "react";
import MenuPage from "./pages/MenuPage";
import OrdersPage from "./pages/OrdersPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  const [page, setPage] = useState("menu");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const placeOrder = () => {
    const newOrder = {
      id: Date.now(),
      items: cart,
      status: "active",
      createdAt: new Date(),
    };
    setOrders([...orders, newOrder]);
    setCart([]);
  };

  const completeOrder = (id) => {
    const updatedOrders = orders.map((o) =>
      o.id === id ? { ...o, status: "completed" } : o
    );
    setOrders(updatedOrders);
    setHistory([...history, { ...orders.find((o) => o.id === id), status: "completed" }]);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-orange-600">🍴 InfiniteLocus Canteen</h1>
        <nav className="space-x-4">
          <button onClick={() => setPage("menu")} className={`px-3 py-1 rounded ${page==="menu" ? "bg-orange-100" : ""}`}>Menu</button>
          <button onClick={() => setPage("orders")} className={`px-3 py-1 rounded ${page==="orders" ? "bg-orange-100" : ""}`}>Orders</button>
          <button onClick={() => setPage("history")} className={`px-3 py-1 rounded ${page==="history" ? "bg-orange-100" : ""}`}>History</button>
        </nav>
      </header>

      {/* Pages */}
      <main className="p-6">
        {page === "menu" && <MenuPage cart={cart} addToCart={addToCart} placeOrder={placeOrder} />}
        {page === "orders" && <OrdersPage orders={orders} completeOrder={completeOrder} />}
        {page === "history" && <HistoryPage history={history} />}
      </main>
    </div>
  );
}
