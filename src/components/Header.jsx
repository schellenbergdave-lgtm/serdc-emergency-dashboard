import React, { useEffect, useState } from "react";
import TabButton from "./TabButton";
import useStoredState from "../hooks/useStoredState";

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  theme,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [notifications, setNotifications] = useState([]);

useEffect(() => {
  function loadNotifications() {
    const stored = localStorage.getItem("serdcNotifications");

    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications([]);
    }
  }

  loadNotifications();

  const interval = setInterval(loadNotifications, 1000);

  return () => clearInterval(interval);
}, []);

  const unreadNotifications = notifications.filter((item) => !item.read);
  
  const criticalUnreadNotifications = unreadNotifications.filter(
    (item) => item.level === "Critical"
  );

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
    "Incidents",
    "Operations",
    "Planning",
    "Logistics",
    "Finance",
    "Evacuation",
    "Reception Center",
    "Reports",
    "Archives",
    "Notifications",
  ];

  function getTabColor(tab) {
    if (tab === "Dashboard") return theme.accent;
    if (tab === "Situation Map") return theme.accent;
    if (tab === "Fire Danger") return theme.accent;
    if (tab === "Wind Forecast") return theme.accent;
    if (tab === "Weather Forecast") return theme.accent;
    if (tab === "Smoke Forecast") return theme.accent;
    if (tab === "Hydro Outages") return theme.accent;
    if (tab === "Road Conditions") return theme.accent;

    if (tab === "Incidents") return "#16a34a";
    if (tab === "Operations") return "#dc2626";
    if (tab === "Planning") return "#2563eb";
    if (tab === "Logistics") return "#eab308";
    if (tab === "Finance") return "#6b7280";
    if (tab === "Evacuation") return "#ea580c";
    if (tab === "Reception Center") return "#9333ea";
    if (tab === "Reports") return "#1d4ed8";
    if (tab === "Archives") return "#64748b";
if (tab === "Notifications") {
  return criticalUnreadNotifications.length > 0 ? "#dc2626" : "#2563eb";
}

    return theme.accent;
  }

  return (
    <div
      style={{
        height: "132px",
        background: theme.header,
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "18px 20px 0 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: "white",
                lineHeight: 1.1,
              }}
            >
              SERDC Emergency Management Dashboard
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
            marginBottom: "8px",
            flexWrap: "wrap",
          }}
        >
          {mapTabs.map((tab) => (
            <TabButton
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              color={getTabColor(tab)}
            >
              {tab}
            </TabButton>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {operationsTabs.map((tab) => (
            <TabButton
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              color={getTabColor(tab)}
            >
             {tab === "Notifications" && unreadNotifications.length > 0
  ? `Notifications (${unreadNotifications.length})`
  : tab}
            </TabButton>
          ))}
        </div>

        <div
          style={{
            height: "4px",
            background: theme.accent,
            marginTop: "10px",
            marginLeft: "-20px",
            marginRight: "-20px",
          }}
        />
      </div>
    </div>
  );
}