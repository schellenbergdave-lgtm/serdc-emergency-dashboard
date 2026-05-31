import React from "react";
import { useState } from "react";

import DashboardLayout from "./layouts/DashboardLayout";
import Incidents from "./pages/Incidents";
import SituationMap from "./pages/SituationMap";
import WindForecast from "./pages/WindForecast";
import WeatherForecast from "./pages/WeatherForecast";
import SmokeForecast from "./pages/SmokeForecast";
import HydroOutages from "./pages/HydroOutages";
import RoadConditions from "./pages/RoadConditions";
import Operations from "./pages/Operations";
import Planning from "./pages/Planning";
import Logistics from "./pages/Logistics";
import Finance from "./pages/Finance";
import Resources from "./pages/Resources";
import Evacuation from "./pages/Evacuation";
import ReceptionCenter from "./pages/ReceptionCenter";
import Reports from "./pages/Reports";
import Dashboard from "./pages/Dashboard";
import useStoredState from "./hooks/useStoredState";
import { lightTheme, darkTheme } from "./styles/theme";
import FireDanger from "./pages/FireDanger";
import Archives from "./pages/Archives";
import Notifications from "./pages/Notifications";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [darkMode, setDarkMode] = useStoredState("darkMode", false);

  const theme = darkMode ? darkTheme : lightTheme;

  function renderPage() {
    switch (activeTab) {
      case "Dashboard":
        return <Dashboard theme={theme} setActiveTab={setActiveTab} />;
      case "Situation Map":
        return <SituationMap theme={theme} darkMode={darkMode} />;

      case "Wind Forecast":
        return <WindForecast />;

        case "Weather Forecast":
          return <WeatherForecast theme={theme} />;

      case "Smoke Forecast":
        return <SmokeForecast theme={theme} />;
        case "Fire Danger":
          return <FireDanger theme={theme} />;
      case "Hydro Outages":
        return <HydroOutages theme={theme} />;

      case "Road Conditions":
        return <RoadConditions theme={theme} />;
        case "Incidents":
          return <Incidents theme={theme} />;
      case "Operations":
        return <Operations theme={theme} />;

        case "Logistics":
  return <Logistics theme={theme} />;

      case "Evacuation":
        return <Evacuation theme={theme} />;
        case "Planning":
  return <Planning theme={theme} />;
          
        
  case "Finance":
    return <Finance theme={theme} />;
        
    case "Reception Center":
      return <ReceptionCenter theme={theme} />;
          
      case "Reports":
        return <Reports theme={theme} />;

        case "Archives":
          return <Archives theme={theme} />;

          case "Notifications":
            return <Notifications theme={theme} />;

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