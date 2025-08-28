import React, { useState } from "react";

export default function AdminPage() {
  const [menu, setMenu] = useState([
    { id: 1, name: "Burger", price: 100, stock: 10 },
    { id: 2, name: "Pizza", price: 200, stock: 5 },
  ]);

  const [newItem, setNewItem] = useState({ name: "", price: "", stock: "" });

  const addItem = () => {
    setMenu([...menu, { id: Date.now(), ...newItem }]);
    setNewItem({ name: "", price: "", stock: "" });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Item Name"
          className="p-2 border rounded"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          className="p-2 border rounded"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          className="p-2 border rounded"
          value={newItem.stock}
          onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
        />
        <button
          className="bg-green-600 text-white px-4 rounded"
          onClick={addItem}
        >
          Add
        </button>
      </div>

      <ul>
        {menu.map((item) => (
          <li key={item.id} className="flex justify-between p-2 border rounded mb-2">
            <span>{item.name} - ₹{item.price} ({item.stock} left)</span>
            <button className="text-red-500">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
