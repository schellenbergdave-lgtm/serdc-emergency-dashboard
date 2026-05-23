import { useEffect, useState } from "react";
import purpleAirSensors from "../data/purpleAirSensors";

const PURPLEAIR_API_KEY = "65DFFBAB-4B0D-11F1-B596-4201AC1DC123";

function getAQHICategory(pm25) {
  const value = Number(pm25);

  if (!Number.isFinite(value)) {
    return {
      aqhi: "N/A",
      category: "No Data",
      color: "#6b7280",
    };
  }

  if (value <= 12) {
    return { aqhi: 2, category: "Low", color: "#22c55e" };
  }

  if (value <= 35) {
    return { aqhi: 5, category: "Moderate", color: "#facc15" };
  }

  if (value <= 55) {
    return { aqhi: 7, category: "High", color: "#f97316" };
  }

  return { aqhi: 10, category: "Very High", color: "#dc2626" };
}

export default function usePurpleAirData() {
  const [airQualityData, setAirQualityData] = useState([]);
  const [airQualityStatus, setAirQualityStatus] =
    useState("Not loaded");
  const [airQualityLastLoaded, setAirQualityLastLoaded] =
    useState("Not loaded");

  async function loadAirQuality() {
    try {
      setAirQualityStatus("Loading PurpleAir sensors...");

      const validSensors = purpleAirSensors.filter(
        (sensor) => sensor.sensorId && sensor.sensorId !== 0
      );

      if (validSensors.length === 0) {
        setAirQualityStatus("No PurpleAir sensor IDs entered.");
        setAirQualityData([]);
        return;
      }

      const results = await Promise.all(
        validSensors.map(async (sensor) => {
          const url =
            `https://api.purpleair.com/v1/sensors/${sensor.sensorId}` +
            "?fields=name,latitude,longitude,pm2.5_atm";

          const response = await fetch(url, {
            headers: {
              "X-API-Key": PURPLEAIR_API_KEY,
            },
          });

          if (!response.ok) {
            return {
              ...sensor,
              pm25: null,
              aqhi: "N/A",
              category: "No Data",
              color: "#6b7280",
              error: `Request failed: ${response.status}`,
            };
          }

          const data = await response.json();
          const pm25 = data?.sensor?.["pm2.5_atm"];
          const aq = getAQHICategory(pm25);

          return {
            ...sensor,
            pm25,
            aqhi: aq.aqhi,
            category: aq.category,
            color: aq.color,
            error: null,
          };
        })
      );

      setAirQualityData(results);
      setAirQualityStatus(`Loaded ${results.length} sensors`);
      setAirQualityLastLoaded(
        new Date().toLocaleTimeString("en-CA")
      );
    } catch (error) {
      setAirQualityStatus(`Error: ${error.message}`);
    }
  }

  useEffect(() => {
    loadAirQuality();

    const interval = setInterval(
      loadAirQuality,
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  return {
    airQualityData,
    airQualityStatus,
    airQualityLastLoaded,
    loadAirQuality,
  };
}