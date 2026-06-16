import React, { createContext, useContext, useMemo, useState } from "react";
import { authApi, usersApi } from "../api/resources.js";
import { setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "project5.currentUser";

function readStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function persistUser(user) {
  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  async function login(username, password) {
    const cleanUsername = username.trim();
    const { token, user } = await authApi.login(cleanUsername, password);

    setAuthToken(token);
    setCurrentUser(user);
    persistUser(user);
    return user;
  }

  async function register(credentials, profile) {
    const cleanUsername = credentials.username.trim();
    const existingUser = await usersApi.getByUsername(cleanUsername);

    if (existingUser) {
      throw new Error("This username is already taken.");
    }

    await usersApi.create({
      name: profile.name.trim(),
      username: cleanUsername,
      password: credentials.password,
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      address: {
        street: profile.street.trim(),
        suite: profile.suite.trim(),
        city: profile.city.trim(),
        zipcode: profile.zipcode.trim()
      },
      company: {
        name: profile.company.trim(),
        catchPhrase: "",
        bs: ""
      }
    });

    return login(cleanUsername, credentials.password);
  }

  function logout() {
    setAuthToken(null);
    setCurrentUser(null);
    persistUser(null);
  }

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      register
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
