import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="p-4 bg-blue-600 text-white flex gap-4">
      <Link to="/" className="hover:underline">Menu</Link>
      <Link to="/orders" className="hover:underline">Orders</Link>
      <Link to="/history" className="hover:underline">History</Link>
    </nav>
  );
}
