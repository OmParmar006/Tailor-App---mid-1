import React, { createContext, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightTheme = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#020617",
  subText: "#64748B",
  border: "#E5E7EB",
  primary: "#0F172A",
};

const darkTheme = {
  bg: "#020617",
  card: "#020617",
  text: "#F8FAFC",
  subText: "#94A3B8",
  border: "#1E293B",
  primary: "#FACC15",
};
