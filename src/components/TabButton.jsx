import React from "react";
export default function TabButton({
  active,
  onClick,
  color,
  children,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        background: active ? color : "#475569",
        color: "white",
        transition: "0.2s",
      }}
    >
      {children}
    </button>
  );
}