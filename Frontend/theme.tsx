import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useMemo, useState } from "react";

type ThemeCtx = { darkMode: boolean; toggleDarkMode: (next?: boolean) => void };
export const ThemeContext = createContext<ThemeCtx>({ darkMode: false, toggleDarkMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { (async () => {
    const v = await AsyncStorage.getItem("dark-mode");
    if (v != null) setDarkMode(v === "true");
  })(); }, []);

  const toggleDarkMode = (next?: boolean) => {
    setDarkMode(prev => {
      const val = typeof next === "boolean" ? next : !prev;
      AsyncStorage.setItem("dark-mode", String(val));
      return val;
    });
  };

  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}