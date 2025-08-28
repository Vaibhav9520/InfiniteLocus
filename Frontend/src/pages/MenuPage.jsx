import React, { useState } from "react";

// Dummy Menu Items (replace with API data later)
const menu = [
  { id: 1, name: "Veg Burger", price: 120, image: "https://source.unsplash.com/300x200/?burger" },
  { id: 2, name: "Cheese Pizza", price: 250, image: "https://source.unsplash.com/300x200/?pizza" },
  { id: 3, name: "Pasta", price: 180, image: "https://source.unsplash.com/300x200/?pasta" },
  { id: 4, name: "Cold Coffee", price: 90, image: "https://source.unsplash.com/300x200/?coffee" },
  { id: 5, name: "French Fries", price: 100, image: "https://source.unsplash.com/300x200/?fries" },
];

// Menu Card Component
const MenuCard = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-40 object-cover rounded-lg mb-3"
      />
      <h2 className="text-lg font-semibold">{item.name}</h2>
      <p className="text-gray-600">₹{item.price}</p>
      <button className="mt-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
        Add to Cart
      </button>
    </div>
  );
};

const Menu = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">Our Menu</h1>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search food..."
        className="p-3 border border-gray-300 rounded-lg w-full mb-6 focus:ring-2 focus:ring-black outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Food Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menu
          .filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
      </div>

      {/* No Results Message */}
      {menu.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ).length === 0 && (
        <p className="text-center text-gray-500 mt-6">No food found</p>
      )}
    </div>
  );
};

export default Menu;
