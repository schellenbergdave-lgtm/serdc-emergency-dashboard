import React from "react";
export default function SmokeForecast({ theme }) {
  return (
    <div
      style={{
        padding: "32px",
      }}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: "14px",
          padding: "24px",
          maxWidth: "850px",
        }}
      >
        <h2>Smoke Forecast</h2>

        <p style={{ color: theme.muted }}>
          FireSmoke.ca does not allow its smoke forecast map to be embedded
          directly in the dashboard. Use the button below to open the current
          smoke forecast in a new browser tab.
        </p>

        <button
          onClick={() =>
            window.open(
              "https://firesmoke.ca/forecasts/current/",
              "_blank"
            )
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
          Open FireSmoke Forecast
        </button>
      </div>
    </div>
  );
}