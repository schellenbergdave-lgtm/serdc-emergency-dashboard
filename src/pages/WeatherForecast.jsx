import React from "react";
export default function WeatherForecast() {
  return (
    <iframe
      title="Weather Forecast"
      src="https://weather.gc.ca/?layers=radar&center=52,-96&zoom=6"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
      }}
    />
  );
}