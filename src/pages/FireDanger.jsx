import React from "react";

export default function FireDanger({ theme }) {
  return (
    <div style={{ padding: "32px" }}>
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: "14px",
          padding: "24px",
          maxWidth: "900px",
        }}
      >
        <h2>Fire Danger</h2>

        <p style={{ color: theme.muted }}>
          Manitoba's daily Fire Danger Forecast map cannot be embedded directly
          in the dashboard. Use the button below to open the official Manitoba
          Fire Danger Forecast page in a new browser tab.
        </p>

        <button
          onClick={() =>
            window.open(
              "https://www.gov.mb.ca/conservation_fire/Fire-Hazard/daily-fcst-firehazard.html",
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
          Open Manitoba Fire Danger Forecast
        </button>
      </div>
    </div>
  );
}