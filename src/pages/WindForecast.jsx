import React from "react";
export default function WindForecast() {
  return (
    <iframe
      title="Wind Forecast"
      src="https://embed.windy.com/embed2.html?lat=51.9&lon=-96.5&zoom=6&level=surface&overlay=wind"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
      }}
    />
  );
}