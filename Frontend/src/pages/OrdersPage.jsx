import React, { useEffect, useState } from "react";

export default function OrdersPage({ orders, completeOrder }) {
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers = {};
      orders.forEach((o) => {
        const elapsed = (new Date() - new Date(o.createdAt)) / 1000;
        const remaining = Math.max(60 - Math.floor(elapsed), 0);
        updatedTimers[o.id] = remaining;
      });
      setTimers(updatedTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📦 Active Orders</h2>
      {orders.length === 0 && <p>No active orders</p>}
      {orders.map((o) => (
        <div key={o.id} className="bg-white rounded shadow p-4 mb-3">
          <h3 className="font-bold">Order #{o.id}</h3>
          <ul className="mb-2">
            {o.items.map((i, idx) => (
              <li key={idx}>{i.name} - ₹{i.price}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-600">⏳ Time left: {timers[o.id] || 60}s</p>
          <button
            onClick={() => completeOrder(o.id)}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Mark Completed
          </button>
        </div>
      ))}
    </div>
  );
}
