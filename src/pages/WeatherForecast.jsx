import React, { useState } from "react";

import SectionCard from "../components/SectionCard";
import communities from "../data/communities";
import useWeatherForecast from "../hooks/useWeatherForecast";

export default function WeatherForecast({ theme }) {
  const [selectedCommunity, setSelectedCommunity] = useState(communities[0]);

  const {
    forecastData,
    forecastStatus,
    forecastLastLoaded,
    loadForecast,
  } = useWeatherForecast(selectedCommunity);

  const next12Hours = forecastData.slice(0, 12);
  const next24Hours = forecastData.slice(0, 24);
  const next72Hours = forecastData.slice(0, 72);

  const maxWindGust = Math.max(
    ...next72Hours.map((hour) => Number(hour.windGusts) || 0)
  );

  const totalPrecip = next72Hours.reduce(
    (total, hour) => total + (Number(hour.precipitation) || 0),
    0
  );

  const minHumidity = Math.min(
    ...next72Hours.map((hour) => Number(hour.humidity) || 100)
  );

  const maxTemp = Math.max(
    ...next72Hours.map((hour) => Number(hour.temperature) || -100)
  );

  function windDirectionText(degrees) {
    const value = Number(degrees);

    if (!Number.isFinite(value)) return "N/A";

    const directions = [
      "N",
      "NE",
      "E",
      "SE",
      "S",
      "SW",
      "W",
      "NW",
    ];

    return directions[Math.round(value / 45) % 8];
  }

  return (
    <div
      style={{
        padding: "24px",
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: "20px",
      }}
    >
      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Weather Forecast</h2>

          <label>Community</label>
          <select
            value={selectedCommunity.name}
            onChange={(e) => {
              const community = communities.find(
                (item) => item.name === e.target.value
              );

              setSelectedCommunity(community);
            }}
            style={inputStyle(theme)}
          >
            {communities.map((community) => (
              <option key={community.name}>{community.name}</option>
            ))}
          </select>

          <button
            onClick={loadForecast}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Refresh Forecast
          </button>

          <div style={{ color: theme.muted, marginTop: "12px" }}>
            Status: {forecastStatus}
            <br />
            Last Loaded: {forecastLastLoaded}
          </div>
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>72-Hour Operational Summary</h2>

          <div>
            <strong>Community:</strong> {selectedCommunity.name}
          </div>

          <div>
            <strong>Max Temperature:</strong> {maxTemp} °C
          </div>

          <div>
            <strong>Lowest Humidity:</strong> {minHumidity} %
          </div>

          <div>
            <strong>Total Precipitation:</strong>{" "}
            {totalPrecip.toFixed(1)} mm
          </div>

          <div>
            <strong>Max Wind Gust:</strong> {maxWindGust} km/h
          </div>
        </SectionCard>
      </div>

      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Next 12 Hours</h2>

          {next12Hours.length === 0 && (
            <div style={{ color: theme.muted }}>No forecast data loaded.</div>
          )}

          {next12Hours.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle(theme)}>
                <thead>
                  <tr>
                    <th style={thStyle(theme)}>Time</th>
                    <th style={thStyle(theme)}>Temp</th>
                    <th style={thStyle(theme)}>RH</th>
                    <th style={thStyle(theme)}>Precip</th>
                    <th style={thStyle(theme)}>Wind</th>
                    <th style={thStyle(theme)}>Gust</th>
                    <th style={thStyle(theme)}>Dir</th>
                  </tr>
                </thead>

                <tbody>
                  {next12Hours.map((hour) => (
                    <tr key={hour.time}>
                      <td style={tdStyle(theme)}>
                        {new Date(hour.time).toLocaleString("en-CA", {
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td style={tdStyle(theme)}>{hour.temperature} °C</td>
                      <td style={tdStyle(theme)}>{hour.humidity} %</td>
                      <td style={tdStyle(theme)}>
                        {hour.precipitation} mm
                      </td>
                      <td style={tdStyle(theme)}>{hour.windSpeed} km/h</td>
                      <td style={tdStyle(theme)}>{hour.windGusts} km/h</td>
                      <td style={tdStyle(theme)}>
                        {windDirectionText(hour.windDirection)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>72-Hour Forecast</h2>

          {next24Hours.length === 0 && (
            <div style={{ color: theme.muted }}>No forecast data loaded.</div>
          )}

          {next24Hours.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle(theme)}>
                <thead>
                  <tr>
                    <th style={thStyle(theme)}>Time</th>
                    <th style={thStyle(theme)}>Temp</th>
                    <th style={thStyle(theme)}>RH</th>
                    <th style={thStyle(theme)}>Precip</th>
                    <th style={thStyle(theme)}>Wind</th>
                    <th style={thStyle(theme)}>Gust</th>
                    <th style={thStyle(theme)}>Dir</th>
                  </tr>
                </thead>

                <tbody>
                  {next72Hours.map((hour) => (
                    <tr key={hour.time}>
                      <td style={tdStyle(theme)}>
                        {new Date(hour.time).toLocaleString("en-CA", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td style={tdStyle(theme)}>{hour.temperature} °C</td>
                      <td style={tdStyle(theme)}>{hour.humidity} %</td>
                      <td style={tdStyle(theme)}>
                        {hour.precipitation} mm
                      </td>
                      <td style={tdStyle(theme)}>{hour.windSpeed} km/h</td>
                      <td style={tdStyle(theme)}>{hour.windGusts} km/h</td>
                      <td style={tdStyle(theme)}>
                        {windDirectionText(hour.windDirection)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function inputStyle(theme = {}) {
  return {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    border: `1px solid ${theme.border || "#cbd5e1"}`,
    background: theme.surface || "#ffffff",
    color: theme.text || "#111827",
    marginTop: "5px",
    marginBottom: "12px",
    boxSizing: "border-box",
  };
}

function tableStyle() {
  return {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  };
}

function thStyle() {
  return {
    textAlign: "left",
    padding: "8px",
    borderBottom: "2px solid #334155",
    background: "#f1f5f9",
    color: "#111827",
  };
}

function tdStyle() {
  return {
    padding: "8px",
    borderBottom: "1px solid #cbd5e1",
  };
}