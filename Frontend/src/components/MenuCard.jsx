import { useCart } from "../context/CartContext";

export default function MenuCard({ item }) {
  const { addToCart } = useCart();

  return (
    <div className="border p-4 rounded-2xl shadow-md flex flex-col items-center">
      <h2 className="text-lg font-semibold">{item.name}</h2>
      <p className="text-gray-600">₹{item.price}</p>
      <p className={`mt-2 ${item.stock > 0 ? "text-green-600" : "text-red-500"}`}>
        {item.stock > 0 ? `In Stock: ${item.stock}` : "Out of Stock"}
      </p>
      <button
        onClick={() => addToCart(item)}
        disabled={item.stock === 0}
        className={`mt-3 px-4 py-2 rounded-lg text-white ${
          item.stock === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        Add to Cart
      </button>
    </div>
  );
}
