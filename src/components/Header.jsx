import React, { useEffect, useState } from "react";
import TabButton from "./TabButton";

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  theme,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const mapTabs = [
    "Dashboard",
    "Situation Map",
    "Fire Danger",
    "Wind Forecast",
    "Weather Forecast",
    "Smoke Forecast",
    "Hydro Outages",
    "Road Conditions",
  ];

  const operationsTabs = [
    "Operations",
    "Resources",
    "Evacuation",
    "Reports",
  ];

  return (
    <div
      style={{
        height: "122px",
        background: theme.header,
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: `4px solid ${theme.accent}`,
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                height: "56px",
                width: "56px",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, #06b6d4, #22c55e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "22px",
                color: "white",
              }}
            >
              S
            </div>

            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                SERDC Emergency Management Dashboard
              </div>

              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.82,
                }}
              >
                Southeast Resource Development Council
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: darkMode ? "#020617" : "#f8fafc",
                border: `1px solid ${theme.border}`,
                padding: "10px 16px",
                borderRadius: "10px",
                fontSize: "22px",
                fontWeight: "bold",
                color: darkMode ? "#f8fafc" : "#111827",
                minWidth: "155px",
                textAlign: "center",
              }}
            >
              {currentTime.toLocaleTimeString("en-CA", {
                hour12: false,
              })}
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                background: darkMode ? "#facc15" : "#111827",
                color: darkMode ? "#111827" : "white",
              }}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "6px",
            flexWrap: "wrap",
          }}
        >
          {mapTabs.map((tab) => (
            <TabButton
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              color={theme.accent}
            >
              {tab}
            </TabButton>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginLeft: "150px",
            flexWrap: "wrap",
          }}
        >
          {operationsTabs.map((tab) => (
            <TabButton
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              color={theme.secondary}
            >
              {tab}
            </TabButton>
          ))}
        </div>
      </div>
    </div>
  );
}