/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ql_session"));
      if (saved?.user) setUser(saved.user);
    } finally {
      setReady(true);
    }
  }, []);
  const login = async (data) => {
    const result = await api.auth(data);
    setUser(result.user);
    localStorage.setItem("ql_session", JSON.stringify(result));
    return result.user;
  };
  const logout = () => {
    localStorage.removeItem("ql_session");
    setUser(null);
  };
  const updateProfile = (details) => {
    const updated = { ...user, ...details };
    setUser(updated);
    const session = JSON.parse(localStorage.getItem("ql_session") || "{}");
    localStorage.setItem("ql_session", JSON.stringify({ ...session, user: updated }));
  };
  return (
    <AuthContext.Provider value={{ user, ready, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
