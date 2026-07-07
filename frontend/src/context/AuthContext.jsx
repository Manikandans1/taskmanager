import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/tasks";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore the session from localStorage so a page refresh
  // doesn't log the user out.
  useEffect(() => {
    const token = localStorage.getItem("tm_token");
    const storedUser = localStorage.getItem("tm_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("tm_user");
      }
    }
    setLoading(false);
  }, []);

  function persistSession(authResponse) {
    const { token, userId, name, email } = authResponse;
    localStorage.setItem("tm_token", token);
    const sessionUser = { id: userId, name, email };
    localStorage.setItem("tm_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
  }

  async function login(email, password) {
    const response = await authApi.login(email, password);
    persistSession(response);
  }

  async function register(name, email, password) {
    const response = await authApi.register(name, email, password);
    persistSession(response);
  }

  function logout() {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
