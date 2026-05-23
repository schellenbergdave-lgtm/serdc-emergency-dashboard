import React from "react";
export default function RoadConditions({ theme }) {
  return (
    <div style={{ padding: "32px" }}>
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: "14px",
          padding: "24px",
          maxWidth: "850px",
        }}
      >
        <h2>Road Conditions</h2>

        <p style={{ color: theme.muted }}>
          Manitoba 511 does not allow its road conditions map to be embedded
          directly in the dashboard. Use the button below to open the live
          Manitoba 511 road conditions map in a new browser tab.
        </p>

        <button
          onClick={() =>
            window.open("https://www.manitoba511.ca/", "_blank")
          }
          style={{
            padding: "14px 18px",
            background: theme.accent,
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Open Manitoba 511
        </button>
      </div>
    </div>
  );
}