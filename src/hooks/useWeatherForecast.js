import { useEffect, useState } from "react";

export default function useWeatherForecast(location) {
  const [forecastData, setForecastData] = useState([]);
  const [forecastStatus, setForecastStatus] = useState("Not loaded");
  const [forecastLastLoaded, setForecastLastLoaded] = useState("Not loaded");

  async function loadForecast() {
    if (!location?.position) {
      setForecastStatus("No community selected.");
      setForecastData([]);
      return;
    }

    try {
      setForecastStatus("Loading 72-hour weather forecast...");

      const [latitude, longitude] = location.position;

      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        "&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m" +
        "&forecast_hours=72" +
        "&timezone=America%2FWinnipeg";

      const response = await fetch(url);

      if (!response.ok) {
        setForecastStatus(`Weather request failed: ${response.status}`);
        return;
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

      setForecastData(rows);
      setForecastStatus(`Loaded ${rows.length} forecast hours`);
      setForecastLastLoaded(new Date().toLocaleString("en-CA"));
    } catch (error) {
      setForecastStatus(`Error: ${error.message}`);
    }
  }

  useEffect(() => {
    loadForecast();
  }, [location?.name]);

  return {
    forecastData,
    forecastStatus,
    forecastLastLoaded,
    loadForecast,
  };
}