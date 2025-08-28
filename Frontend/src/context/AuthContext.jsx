import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Fake login (replace with API)
    if (email === "admin@canteen.com" && password === "admin123") {
      setUser({ email, role: "admin" });
    } else {
      setUser({ email, role: "user" });
    }
  };

  const signup = (email, password) => {
    setUser({ email, role: "user" });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
