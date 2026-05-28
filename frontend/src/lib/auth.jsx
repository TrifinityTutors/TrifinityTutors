import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeUser(user) {
  if (!user) return null;

  const photo = user.photo || user.profilePhoto || user.avatar || user.image || "";
  const role = user.role || (user.profileComplete || user.status || photo ? "tutor" : "student");

  return {
    ...user,
    role,
    name: user.name || user.fullName || user.firstName || user.displayName || "",
    photo,
    profilePhoto: user.profilePhoto || photo,
    avatar: user.avatar || photo,
    image: user.image || photo,
  };
}

export function getStoredAuth() {
  const token = localStorage.getItem("token");
  const user = parseJson(localStorage.getItem("user")) || parseJson(localStorage.getItem("student")) || parseJson(localStorage.getItem("tutor"));
  return { token, user };
}

export function setAuthSession(token, user) {
  if (!token || !user) return null;
  const normalizedUser = normalizeUser(user);

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(normalizedUser));
  if (normalizedUser.role === "student") {
    localStorage.setItem("student", JSON.stringify(normalizedUser));
    localStorage.removeItem("tutor");
  } else if (normalizedUser.role === "tutor") {
    localStorage.setItem("tutor", JSON.stringify(normalizedUser));
    localStorage.removeItem("student");
  }

  return normalizedUser;
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("student");
  localStorage.removeItem("tutor");
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => getStoredAuth().user || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function restore() {
      const { token: storedToken, user: storedUser } = getStoredAuth();
      if (!storedToken || !storedUser) return;
      setToken(storedToken);

      try {
        setLoading(true);
        const endpoint = storedUser.role === "tutor"
          ? `/api/tutors/profile/${storedUser.id || storedUser._id}`
          : "/api/students/me";

        const res = await fetch(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          const u = storedUser.role === "tutor"
            ? normalizeUser({
                role: "tutor",
                ...data,
                id: data.id || data._id || storedUser.id,
                _id: data._id || storedUser._id || storedUser.id,
              })
            : normalizeUser(data?.user || data?.profile || data);

          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          if (u.role === "student") localStorage.setItem("student", JSON.stringify(u));
          if (u.role === "tutor") localStorage.setItem("tutor", JSON.stringify(u));
        } else {
          clearAuthSession();
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Error restoring auth:", err);
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, []);

  function logout() {
    clearAuthSession();
    setToken(null);
    setUser(null);
    window.location.href = "/";
  }

  function setSession(t, u) {
    const normalizedUser = setAuthSession(t, u);
    setToken(t);
    setUser(normalizedUser || u);
  }

  async function refreshProfile() {
    if (!token) return;
    try {
      const storedUser = getStoredAuth().user;
      const endpoint = storedUser?.role === "tutor"
        ? `/api/tutors/profile/${storedUser.id || storedUser._id}`
        : "/api/students/me";

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;

      const data = await res.json();
      const u = storedUser?.role === "tutor"
        ? normalizeUser({
            role: "tutor",
            ...data,
            id: data.id || data._id || storedUser.id,
            _id: data._id || storedUser._id || storedUser.id,
          })
        : normalizeUser(data?.user || data?.profile || data);

      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      if (u.role === "student") localStorage.setItem("student", JSON.stringify(u));
      if (u.role === "tutor") localStorage.setItem("tutor", JSON.stringify(u));
      return u;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, setSession, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function dashboardPathFor(role) {
  switch (role) {
    case "tutor":
      return "/tutor-dashboard";
    case "student":
      return "/student-dashboard";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
