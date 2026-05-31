import { useEffect, useState } from "react";
import communities from "../data/communities";

function getConcernLevel(lowestHumidity, maxWindGust) {
  if (lowestHumidity <= 20 || maxWindGust >= 50) {
    return {
      level: "Critical",
      color: "#dc2626",
      reason:
        "Critical fire weather concern due to very low humidity and/or strong wind gusts.",
    };
  }

  if (lowestHumidity <= 30 || maxWindGust >= 35) {
    return {
      level: "Elevated",
      color: "#f97316",
      reason:
        "Elevated fire weather concern due to low humidity and/or gusty winds.",
    };
  }

  if (lowestHumidity <= 40 || maxWindGust >= 25) {
    return {
      level: "Monitor",
      color: "#facc15",
      reason:
        "Monitoring recommended due to moderate humidity or wind conditions.",
    };
  }

  return {
    level: "Normal",
    color: "#22c55e",
    reason:
      "No significant regional fire weather concern identified from the 72-hour forecast.",
  };
}

export default function useRegionalWeatherSummary() {
  const [regionalWeather, setRegionalWeather] = useState(null);
  const [regionalWeatherStatus, setRegionalWeatherStatus] =
    useState("Not loaded");
  const [regionalWeatherLastLoaded, setRegionalWeatherLastLoaded] =
    useState("Not loaded");

  async function loadRegionalWeather() {
    try {
      setRegionalWeatherStatus("Loading regional weather summary...");

      const results = await Promise.all(
        communities.map(async (community) => {
          const [latitude, longitude] = community.position;

          const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            "&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m" +
            "&forecast_hours=72" +
            "&timezone=America%2FWinnipeg";

          const response = await fetch(url);

          if (!response.ok) {
            return {
              community: community.name,
              error: `Request failed: ${response.status}`,
            };
          }

          const data = await response.json();
          const hourly = data.hourly || {};

          const rows = (hourly.time || []).map((time, index) => ({
            time,
            temperature: hourly.temperature_2m?.[index],
            humidity: hourly.relative_humidity_2m?.[index],
            precipitation: hourly.precipitation?.[index],
            windSpeed: hourly.wind_speed_10m?.[index],
            windGusts: hourly.wind_gusts_10m?.[index],
            windDirection: hourly.wind_direction_10m?.[index],
          }));

          const temps = rows.map((row) => Number(row.temperature)).filter(Number.isFinite);
          const humidity = rows.map((row) => Number(row.humidity)).filter(Number.isFinite);
          const precip = rows.map((row) => Number(row.precipitation)).filter(Number.isFinite);
          const gusts = rows.map((row) => Number(row.windGusts)).filter(Number.isFinite);

          return {
            community: community.name,
            averageTemperature:
              temps.length > 0
                ? temps.reduce((a, b) => a + b, 0) / temps.length
                : null,
            lowestHumidity:
              humidity.length > 0 ? Math.min(...humidity) : null,
            totalPrecipitation:
              precip.length > 0 ? precip.reduce((a, b) => a + b, 0) : null,
            maxWindGust: gusts.length > 0 ? Math.max(...gusts) : null,
            error: null,
          };
        })
      );

      const validResults = results.filter((item) => !item.error);

      const averageTemperature =
        validResults.reduce(
          (total, item) => total + (Number(item.averageTemperature) || 0),
          0
        ) / (validResults.length || 1);

      const averagePrecipitation =
        validResults.reduce(
          (total, item) => total + (Number(item.totalPrecipitation) || 0),
          0
        ) / (validResults.length || 1);

      const driestCommunity = [...validResults].sort(
        (a, b) =>
          (Number(a.lowestHumidity) || 100) -
          (Number(b.lowestHumidity) || 100)
      )[0];

      const windiestCommunity = [...validResults].sort(
        (a, b) =>
          (Number(b.maxWindGust) || 0) - (Number(a.maxWindGust) || 0)
      )[0];

      const lowestHumidity = driestCommunity?.lowestHumidity ?? null;
      const maxWindGust = windiestCommunity?.maxWindGust ?? null;

      const concern = getConcernLevel(
        Number(lowestHumidity) || 100,
        Number(maxWindGust) || 0
      );

      setRegionalWeather({
        communities: validResults,
        averageTemperature,
        averagePrecipitation,
        driestCommunity,
        windiestCommunity,
        lowestHumidity,
        maxWindGust,
        concern,
      });

      setRegionalWeatherStatus(`Loaded ${validResults.length} communities`);
      setRegionalWeatherLastLoaded(new Date().toLocaleString("en-CA"));
    } catch (error) {
      setRegionalWeatherStatus(`Error: ${error.message}`);
    }
  }

  useEffect(() => {
    loadRegionalWeather();
  }, []);

  return {
    regionalWeather,
    regionalWeatherStatus,
    regionalWeatherLastLoaded,
    loadRegionalWeather,
  };
}