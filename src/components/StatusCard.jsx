import React from "react";
export default function StatusCard({
  title,
  value,
  subtitle,
  color,
  theme,
}) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderLeft: `8px solid ${color}`,
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: theme.muted,
          marginBottom: "4px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div
          style={{
            marginTop: "6px",
            color: theme.muted,
            fontSize: "13px",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}