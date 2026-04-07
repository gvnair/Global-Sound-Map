import { useState, useEffect } from "react";

const STORAGE_KEY = "soundmap_username";

export function useUsername() {
  const [username, setUsernameState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  const setUsername = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setUsernameState(trimmed);
  };

  const clearUsername = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsernameState(null);
  };

  return { username, setUsername, clearUsername };
}
