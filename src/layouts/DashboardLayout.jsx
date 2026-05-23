import React from "react";
import Header from "../components/Header";

export default function DashboardLayout({
  children,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  theme,
}) {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: theme.background,
        color: theme.text,
        fontFamily: "Arial",
        overflow: "hidden",
      }}
    >
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        theme={theme}
      />

      <main
        style={{
          height: "calc(100vh - 122px)",
          width: "100%",
          overflow: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}