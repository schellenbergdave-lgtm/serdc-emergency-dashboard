import React from "react";
export default function SectionCard({
  children,
  theme,
}) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: "14px",
        padding: "16px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {children}
    </div>
  );
}