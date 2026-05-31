import React from "react";

export default function TabButton({
  children,
  active,
  onClick,
  color,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: "10px",
        border: active
          ? "2px solid white"
          : "1px solid rgba(255,255,255,0.15)",
        background: color,
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
        transition: "0.2s ease",
        opacity: active ? 1 : 0.88,
        boxShadow: active
          ? "0 0 0 2px rgba(255,255,255,0.2)"
          : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = 1;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = active ? 1 : 0.88;
      }}
    >
      {children}
    </button>
  );
}