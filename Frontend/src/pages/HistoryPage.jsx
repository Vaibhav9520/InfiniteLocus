import React from "react";

export default function HistoryPage({ history }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📜 Order History</h2>
      {history.length === 0 && <p>No past orders</p>}
      {history.map((h) => (
        <div key={h.id} className="bg-white rounded shadow p-4 mb-3">
          <h3 className="font-bold">Order #{h.id}</h3>
          <ul>
            {h.items.map((i, idx) => (
              <li key={idx}>{i.name} - ₹{i.price}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">Status: {h.status}</p>
        </div>
      ))}
    </div>
  );
}
