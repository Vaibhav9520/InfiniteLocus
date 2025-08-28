import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#646cff' : '#fff',
    textDecoration: 'none',
  });

  return (
    <nav
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        justifyContent: 'center',
      }}
    >
      <NavLink to="/" style={linkStyle}>
        Menu
      </NavLink>
      <NavLink to="/orders" style={linkStyle}>
        Orders
      </NavLink>
      <NavLink to="/history" style={linkStyle}>
        History
      </NavLink>
    </nav>
  );
}
