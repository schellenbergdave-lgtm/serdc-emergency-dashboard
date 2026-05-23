import React from "react";
export default function HydroOutages({ theme }) {
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
        <h2>Hydro Outages</h2>

        <p style={{ color: theme.muted }}>
          Manitoba Hydro does not allow its outage map to be embedded directly
          in the dashboard. Use the button below to open the live outage map in
          a new browser tab.
        </p>

        <button
          onClick={() =>
            window.open(
              "https://account.hydro.mb.ca/portal/outeroutage.aspx",
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
          Open Manitoba Hydro Outage Map
        </button>
      </div>
    </div>
  );
}