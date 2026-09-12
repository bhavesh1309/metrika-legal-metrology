import { createContext, useState } from "react";

export const AuthContext = createContext(null);

function getUserFromToken(token) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      throw new Error("Invalid token");
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decoded = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (char) =>
            "%" +
            ("00" + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    const data = JSON.parse(decoded);

    return {
      id: Number(data.sub),
      role: data.role,
    };
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const tokenUser = getUserFromToken(token);

    if (!tokenUser) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      return null;
    }

    const savedName = localStorage.getItem("user_name");

    return {
      ...tokenUser,
      name: savedName || null,
    };
  });

  const login = (token, name = null) => {
    localStorage.setItem("token", token);

    if (name) {
      localStorage.setItem("user_name", name);
    }

    const tokenUser = getUserFromToken(token);

    if (tokenUser) {
      setUser({
        ...tokenUser,
        name: name || localStorage.getItem("user_name") || null,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}