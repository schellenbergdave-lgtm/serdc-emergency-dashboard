import React from "react";
import { useState } from "react";

import DashboardLayout from "./layouts/DashboardLayout";

import SituationMap from "./pages/SituationMap";
import WindForecast from "./pages/WindForecast";
import WeatherForecast from "./pages/WeatherForecast";
import SmokeForecast from "./pages/SmokeForecast";
import HydroOutages from "./pages/HydroOutages";
import RoadConditions from "./pages/RoadConditions";
import Operations from "./pages/Operations";
import Resources from "./pages/Resources";
import Evacuation from "./pages/Evacuation";
import Reports from "./pages/Reports";
import Dashboard from "./pages/Dashboard";
import useStoredState from "./hooks/useStoredState";
import { lightTheme, darkTheme } from "./styles/theme";
import FireDanger from "./pages/FireDanger";
export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [darkMode, setDarkMode] = useStoredState("darkMode", false);

  const theme = darkMode ? darkTheme : lightTheme;

  function renderPage() {
    switch (activeTab) {
      case "Dashboard":
  return <Dashboard theme={theme} />;
      case "Situation Map":
        return <SituationMap theme={theme} darkMode={darkMode} />;

      case "Wind Forecast":
        return <WindForecast />;

      case "Weather Forecast":
        return <WeatherForecast />;

      case "Smoke Forecast":
        return <SmokeForecast theme={theme} />;
        case "Fire Danger":
          return <FireDanger theme={theme} />;
      case "Hydro Outages":
        return <HydroOutages theme={theme} />;

      case "Road Conditions":
        return <RoadConditions theme={theme} />;

      case "Operations":
        return <Operations theme={theme} />;

      case "Resources":
        return <Resources theme={theme} />;

      case "Evacuation":
        return <Evacuation theme={theme} />;

      case "Reports":
        return <Reports theme={theme} />;

      default:
        return <SituationMap theme={theme} darkMode={darkMode} />;
    }
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      theme={theme}
    >
      {renderPage()}
    </DashboardLayout>
  );
}