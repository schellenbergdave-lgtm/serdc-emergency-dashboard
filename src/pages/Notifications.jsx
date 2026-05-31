import React, { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";

export default function Notifications({ theme }) {
  const [notifications, setNotifications] = useStoredState(
    "serdcNotifications",
    []
  );

  const [communityFilter, setCommunityFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  const filteredNotifications = notifications.filter((item) => {
    const matchesCommunity =
      communityFilter === "All" || item.community === communityFilter;

    const matchesSeverity =
      severityFilter === "All" || item.level === severityFilter;

    return matchesCommunity && matchesSeverity;
  });

  const unreadCount = notifications.filter((item) => !item.read).length;

  const criticalCount = notifications.filter(
    (item) => !item.read && item.level === "Critical"
  ).length;

  const elevatedCount = notifications.filter(
    (item) => !item.read && item.level === "Elevated"
  ).length;

  function markRead(id) {
    setNotifications(
      notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }

  function markAllRead() {
    setNotifications(
      notifications.map((item) => ({
        ...item,
        read: true,
      }))
    );
  }

  function clearAll() {
    if (!window.confirm("Clear all notifications?")) return;
    setNotifications([]);
  }

  function severityColor(level) {
    if (level === "Critical") return "#dc2626";
    if (level === "Elevated") return "#f97316";
    return "#facc15";
  }

  return (
    <div style={{ padding: "24px" }}>
      <SectionCard theme={theme}>
        <h2 style={{ marginTop: 0 }}>Notification Center</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <SummaryBox label="Unread" value={unreadCount} theme={theme} />
          <SummaryBox label="Critical" value={criticalCount} theme={theme} />
          <SummaryBox label="Elevated" value={elevatedCount} theme={theme} />
          <SummaryBox
            label="Total Stored"
            value={notifications.length}
            theme={theme}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label>Community Filter</label>
            <select
              value={communityFilter}
              onChange={(e) => setCommunityFilter(e.target.value)}
              style={inputStyle(theme)}
            >
              <option>All</option>
              {communities.map((community) => (
                <option key={community.name}>{community.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Severity Filter</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={inputStyle(theme)}
            >
              <option>All</option>
              <option>Critical</option>
              <option>Elevated</option>
              <option>Monitor</option>
              <option>High</option>
              <option>Very High</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <button onClick={markAllRead} style={buttonStyle("#2563eb")}>
            Mark All Read
          </button>

          <button onClick={clearAll} style={buttonStyle("#64748b")}>
            Clear Notifications
          </button>
        </div>
      </SectionCard>

      <SectionCard theme={theme}>
        <h2 style={{ marginTop: 0 }}>Notification History</h2>

        {filteredNotifications.length === 0 && (
          <div style={{ color: theme.muted }}>
            No notifications match the selected filters.
          </div>
        )}

        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => markRead(notification.id)}
            style={{
              borderLeft: `8px solid ${severityColor(notification.level)}`,
              padding: "12px",
              borderRadius: "10px",
              border: `1px solid ${theme.border}`,
              background: notification.read ? theme.background : theme.surface,
              marginBottom: "10px",
              cursor: "pointer",
              opacity: notification.read ? 0.75 : 1,
            }}
          >
            <strong>
              {notification.read ? "" : "NEW - "}
              {notification.level}: {notification.title}
            </strong>

            <div style={{ marginTop: "6px" }}>{notification.message}</div>

            <div
              style={{
                color: theme.muted,
                fontSize: "13px",
                marginTop: "6px",
              }}
            >
              Community: {notification.community || "Regional"}
              <br />
              Received: {timeAgo(notification.created)}
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

function timeAgo(value) {
  if (!value) return "Time not listed";

  const created = new Date(value);

  if (Number.isNaN(created.getTime())) {
    return value;
  }

  const now = new Date();
  const diffMinutes = Math.floor((now - created) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute(s) ago`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours} hour(s) ago`;

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day(s) ago`;
}

function SummaryBox({ label, value, theme }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: "10px",
        padding: "12px",
        background: theme.background,
      }}
    >
      <div style={{ color: theme.muted }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function inputStyle(theme) {
  return {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    marginTop: "5px",
    boxSizing: "border-box",
  };
}

function buttonStyle(background) {
  return {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  };
}