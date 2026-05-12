import React, { useEffect, useRef, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Circle,
  ImageOverlay,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const PURPLEAIR_API_KEY = "65DFFBAB-4B0D-11F1-B596-4201AC1DC123";

const FIRMS_MAP_KEY = "e0b279fd958f3f71022f538f2f55bb00";


const communities = [
  { name: "Brokenhead Ojibway Nation", position: [50.366194, -96.614033] },
  { name: "Black River First Nation", position: [50.831031, -96.314694] },
  { name: "Hollow Water First Nation", position: [51.183925, -96.297547] },
  { name: "Bloodvein River First Nation", position: [51.780181, -96.692592] },
  { name: "Berens River First Nation", position: [52.341778, -96.974906] },
  { name: "Poplar River First Nation", position: [52.991733, -97.265672] },
  { name: "Pauingassi First Nation", position: [52.155972, -95.37455] },
  { name: "Little Grand Rapids First Nation", position: [52.016794, -95.456975] },
];

const brokenheadSensor = {
  id: 306468,
  communityName: "Brokenhead Ojibway Nation",
  name: "Brokenhead Health Center",
  position: [50.362938, -96.62372],
};

const fireColours = {
  "Out of Control": "#dc2626",
  "Being Held": "#facc15",
  Monitored: "#9333ea",
  "Under Control": "#22c55e",
  Prescribed: "#64748b",
  Unknown: "#9333ea",
};

const priorityColours = {
  Info: "#2563eb",
  Watch: "#facc15",
  Action: "#f97316",
  Critical: "#dc2626",
};

const communityStatusColours = {
  Normal: "#22c55e",
  Monitoring: "#9333ea",
  Preparedness: "#facc15",
  "Partial Evacuation": "#f97316",
  "Full Evacuation": "#dc2626",
  "Re-entry": "#0ea5e9",
};

const smokeOverlayBounds = [
  [20, -170],
  [75, -40],
];

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function nowTime() {
  return new Date().toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nowDate() {
  return new Date().toLocaleDateString("en-CA");
}

function formatFireDate(value) {
  if (!value) return "Not listed";
  try {
    return new Date(value).toLocaleDateString("en-CA");
  } catch {
    return "Not listed";
  }
}

function formatSmokeTimestamp(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  return `${year}${month}${day}${hour}00`;
}

function getRoundedSmokeBaseTime() {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  return now;
}

function buildSmokeForecastUrl(offsetHours) {
  const smokeTime = getRoundedSmokeBaseTime();
  smokeTime.setUTCHours(smokeTime.getUTCHours() + offsetHours);
  return `https://firesmoke.ca/forecasts/current/images/hourly_${formatSmokeTimestamp(smokeTime)}.png`;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function convertCWFISStatus(status) {
  const cleanStatus = String(status || "").trim().toUpperCase();

  if (cleanStatus === "OC" || cleanStatus.includes("OUT")) return "Out of Control";
  if (cleanStatus === "BH" || cleanStatus.includes("BEING HELD")) return "Being Held";
  if (cleanStatus === "UC" || cleanStatus.includes("UNDER")) return "Under Control";
  if (cleanStatus.includes("PRESCRIBED")) return "Prescribed";
  if (cleanStatus.includes("MONITOR")) return "Monitored";

  return "Unknown";
}

function getAirQuality(pm) {
  if (pm === null || pm === undefined || Number.isNaN(Number(pm))) {
    return { label: "No Data", color: "#6b7280" };
  }

  const value = Number(pm);

  if (value <= 12) return { label: "Good", color: "#22c55e" };
  if (value <= 35) return { label: "Moderate", color: "#facc15" };
  if (value <= 55) return { label: "Unhealthy for Sensitive Groups", color: "#f97316" };
  if (value <= 150) return { label: "Unhealthy", color: "#dc2626" };

  return { label: "Very Unhealthy", color: "#7e22ce" };
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function buttonStyle(background = "#111827") {
  return {
    padding: "8px 10px",
    background,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "8px",
  };
}

function DataSection({
  title,
  description,
  records,
  setRecords,
  fields,
  defaultRecord,
  colourField,
  colourMap,
}) {
  const [form, setForm] = useState(defaultRecord);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(defaultRecord);

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }

  function updateEditForm(field, value) {
    setEditForm({ ...editForm, [field]: value });
  }

  function addRecord() {
    const newRecord = {
      ...form,
      id: Date.now(),
      date: nowDate(),
      time: nowTime(),
    };

    setRecords([newRecord, ...records]);
    setForm(defaultRecord);
  }

  function startEdit(record) {
    setEditingId(record.id);
    setEditForm(record);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(defaultRecord);
  }

  function saveEdit(recordId) {
    setRecords(
      records.map((record) =>
        record.id === recordId
          ? {
              ...editForm,
              editedDate: nowDate(),
              editedTime: nowTime(),
            }
          : record
      )
    );

    cancelEdit();
  }

  function deleteRecord(recordId) {
    const confirmed = window.confirm(`Delete this ${title.toLowerCase()} record?`);
    if (!confirmed) return;
    setRecords(records.filter((record) => record.id !== recordId));
  }

  return (
    <div
      style={{
        padding: "24px",
        background: "#f3f4f6",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <h2>{title}</h2>
      <p style={{ color: "#4b5563", maxWidth: "900px" }}>{description}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <Card>
          <h3>Add Record</h3>

          {fields.map((field) => (
            <div key={field.name} style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: "bold" }}>{field.label}</label>

              {field.type === "select" ? (
                <select
                  value={form[field.name] || ""}
                  onChange={(event) => updateForm(field.name, event.target.value)}
                  style={{ width: "100%", padding: "10px", marginTop: "4px" }}
                >
                  {field.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={form[field.name] || ""}
                  onChange={(event) => updateForm(field.name, event.target.value)}
                  placeholder={field.placeholder || ""}
                  style={{
                    width: "100%",
                    minHeight: "110px",
                    padding: "10px",
                    marginTop: "4px",
                  }}
                />
              ) : (
                <input
                  value={form[field.name] || ""}
                  onChange={(event) => updateForm(field.name, event.target.value)}
                  placeholder={field.placeholder || ""}
                  style={{ width: "100%", padding: "10px", marginTop: "4px" }}
                />
              )}
            </div>
          ))}

          <button
            onClick={addRecord}
            style={{ ...buttonStyle("#111827"), width: "100%" }}
          >
            Add Record
          </button>
        </Card>

        <Card>
          <h3>{title} Log</h3>

          {records.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No records entered yet.</p>
          ) : (
            records.map((record) => {
              const isEditing = editingId === record.id;
              const borderColour =
                colourField && colourMap
                  ? colourMap[record[colourField]] || "#2563eb"
                  : "#2563eb";

              return (
                <div
                  key={record.id}
                  style={{
                    borderLeft: `8px solid ${borderColour}`,
                    background: "#f9fafb",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                >
                  {isEditing ? (
                    <>
                      {fields.map((field) => (
                        <div key={field.name} style={{ marginBottom: "8px" }}>
                          <label style={{ fontWeight: "bold" }}>{field.label}</label>

                          {field.type === "select" ? (
                            <select
                              value={editForm[field.name] || ""}
                              onChange={(event) =>
                                updateEditForm(field.name, event.target.value)
                              }
                              style={{
                                width: "100%",
                                padding: "8px",
                                marginTop: "4px",
                              }}
                            >
                              {field.options.map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          ) : field.type === "textarea" ? (
                            <textarea
                              value={editForm[field.name] || ""}
                              onChange={(event) =>
                                updateEditForm(field.name, event.target.value)
                              }
                              style={{
                                width: "100%",
                                minHeight: "90px",
                                padding: "8px",
                                marginTop: "4px",
                              }}
                            />
                          ) : (
                            <input
                              value={editForm[field.name] || ""}
                              onChange={(event) =>
                                updateEditForm(field.name, event.target.value)
                              }
                              style={{
                                width: "100%",
                                padding: "8px",
                                marginTop: "4px",
                              }}
                            />
                          )}
                        </div>
                      ))}

                      <button onClick={() => saveEdit(record.id)} style={buttonStyle("#15803d")}>
                        Save
                      </button>
                      <button onClick={cancelEdit} style={buttonStyle("#6b7280")}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <strong>
                        {record.priority ||
                          record.status ||
                          record.type ||
                          record.category ||
                          title}
                        {record.community ? ` | ${record.community}` : ""}
                      </strong>

                      <div style={{ color: "#6b7280", fontSize: "13px" }}>
                        Created: {record.date} at {record.time}
                      </div>

                      {record.editedTime && (
                        <div style={{ color: "#6b7280", fontSize: "13px" }}>
                          Last edited: {record.editedDate} at {record.editedTime}
                        </div>
                      )}

                      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                        {fields.map((field) => (
                          <div key={field.name}>
                            <strong>{field.label}:</strong> {record[field.name]}
                          </div>
                        ))}
                      </div>

                      <button onClick={() => startEdit(record)} style={buttonStyle("#0369a1")}>
                        Edit
                      </button>
                      <button onClick={() => deleteRecord(record.id)} style={buttonStyle("#dc2626")}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Situation Map");
  

  const [operationNotes, setOperationNotes] = useStoredState("operationNotes", []);
  const [resources, setResources] = useStoredState("resources", []);
  const [evacuations, setEvacuations] = useStoredState("evacuations", []);
  const [reports, setReports] = useStoredState("reports", []);

  const [showCommunities, setShowCommunities] = useState(true);
  const [showCWFIS, setShowCWFIS] = useState(true);
  const [showBuffers, setShowBuffers] = useState(true);
  const [showAirQuality, setShowAirQuality] = useState(true);
  const [showFIRMS, setShowFIRMS] = useState(true);
  const [showSmokeForecast, setShowSmokeForecast] = useState(true);

  const [selectedCommunityName, setSelectedCommunityName] = useState("Poplar River First Nation");

  const [airQualityData, setAirQualityData] = useState(null);
  const [airQualityStatus, setAirQualityStatus] = useState("Not loaded");
  const [airQualityLastLoaded, setAirQualityLastLoaded] = useState("Not loaded");

  const [firmsHotspots, setFirmsHotspots] = useState([]);
  const [firmsStatus, setFirmsStatus] = useState("Not loaded");
  const [firmsLastLoaded, setFirmsLastLoaded] = useState("Not loaded");

  const [cwfisWildfires, setCwfisWildfires] = useState([]);
  const [cwfisStatus, setCwfisStatus] = useState("Not loaded");
  const [cwfisLastLoaded, setCwfisLastLoaded] = useState("Not loaded");

  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [weatherStatus, setWeatherStatus] = useState("Not loaded");
  const [weatherLastLoaded, setWeatherLastLoaded] = useState("Not loaded");

  const [smokeHourOffset, setSmokeHourOffset] = useState(0);

  const initialLoadDone = useRef(false);
  const windyStartedRef = useRef(false);

  const smokeForecastUrl = buildSmokeForecastUrl(smokeHourOffset);

  const officialWildfireData = cwfisWildfires.map((fire) => ({
    fireNumber: fire.fireName,
    position: [fire.latitude, fire.longitude],
    status: fire.stage,
    size: `${fire.hectares} ha`,
    response: fire.agency,
  }));

  function getCommunityData(community) {
    let closestDistance = 9999;
    let closestFire = null;

    officialWildfireData.forEach((fire) => {
      const distance = getDistanceKm(
        community.position[0],
        community.position[1],
        fire.position[0],
        fire.position[1]
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestFire = fire;
      }
    });

    let status = "Under Control";

    if (closestDistance <= 20) status = "Out of Control";
    else if (closestDistance <= 30) status = "Being Held";
    else if (closestDistance <= 40) status = "Monitored";

    return {
      ...community,
      status,
      closestDistance: closestFire ? closestDistance.toFixed(1) : "N/A",
      closestFire,
    };
  }

  const communityData = communities.map(getCommunityData);

  const selectedCommunity =
    communityData.find((community) => community.name === selectedCommunityName) ||
    communityData[0];

  const selectedCommunityAirQuality =
    selectedCommunity.name === brokenheadSensor.communityName ? airQualityData : null;

  const selectedCommunityAQ = selectedCommunityAirQuality
    ? getAirQuality(selectedCommunityAirQuality["pm2.5_atm"])
    : null;

  const communitiesOfConcern = [...communityData]
    .filter(
      (community) =>
        community.closestFire &&
        Number(community.closestDistance) <= 100
    )
    .sort((a, b) => Number(a.closestDistance) - Number(b.closestDistance));

  async function loadAirQuality() {
    try {
      setAirQualityStatus("Loading PurpleAir sensor...");

      const url =
        `https://api.purpleair.com/v1/sensors/${brokenheadSensor.id}` +
        "?fields=name,latitude,longitude,pm2.5_atm";

      const response = await fetch(url, {
        headers: {
          "X-API-Key": PURPLEAIR_API_KEY,
        },
      });

      if (!response.ok) {
        setAirQualityStatus(`PurpleAir request failed: ${response.status}`);
        return;
      }

      const data = await response.json();

      setAirQualityData(data.sensor);
      setAirQualityStatus("Loaded");
      setAirQualityLastLoaded(nowTime());
    } catch (error) {
      setAirQualityStatus(`Error: ${error.message}`);
    }
  }

  async function loadFIRMS() {
    try {
      setFirmsStatus("Loading FIRMS hotspots...");

      const url =
        `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
        `${FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/-98,49,-94,54/1`;

      const response = await fetch(url);

      if (!response.ok) {
        setFirmsStatus(`FIRMS request failed: ${response.status}`);
        return;
      }

      const text = await response.text();
      const lines = text.split("\n").slice(1);

      const hotspots = lines
        .filter((line) => line.trim() !== "")
        .map((line, index) => {
          const parts = line.split(",");

          return {
            id: index,
            latitude: Number(parts[0]),
            longitude: Number(parts[1]),
            brightness: parts[2],
            scan: parts[3],
            track: parts[4],
            acqDate: parts[5],
            acqTime: parts[6],
            satellite: parts[7],
            instrument: parts[8],
            confidence: parts[9],
            version: parts[10],
            brightT31: parts[11],
            frp: parts[12],
            daynight: parts[13],
          };
        })
        .filter(
          (hotspot) =>
            Number.isFinite(hotspot.latitude) &&
            Number.isFinite(hotspot.longitude)
        );

      setFirmsHotspots(hotspots);
      setFirmsStatus(`Loaded ${hotspots.length} hotspots`);
      setFirmsLastLoaded(nowTime());
    } catch (error) {
      setFirmsStatus(`Error: ${error.message}`);
    }
  }

  async function loadCWFISWildfires() {
    try {
      setCwfisStatus("Loading CWFIS active wildfire data...");

      const url =
        "https://geoserver.cwfif.nrcan.gc.ca/geoserver/wfs?" +
        "service=WFS&" +
        "version=2.0.1&" +
        "request=GetFeature&" +
        "typeName=public:cwfif_national_activefires&" +
        "outputFormat=application/json&" +
        "srsName=EPSG:4326&" +
        "sortBy=agency_code+A,record_start+D&" +
        "CQL_FILTER=now()%3E=record_start%20AND%20now()%3C=record_end";

      const response = await fetch(url);

      if (!response.ok) {
        setCwfisStatus(`CWFIS request failed: ${response.status}`);
        return;
      }

      const data = await response.json();
      const features = data.features || [];

      const fires = features
        .map((feature, index) => {
          const p = feature.properties || {};

          return {
            id: feature.id || p.id || index,
            fireName: p.agency_fire_id || p.national_fire_id || "Unnamed Fire",
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
            hectares: p.fire_size || 0,
            stage: convertCWFISStatus(p.stage_of_control_status),
            agency: p.agency_code || "Unknown",
            startDate: p.record_start || null,
            responseType: p.response_type || "Not listed",
            cause: p.national_fire_cause || "Not listed",
            percentContained: p.percent_contained,
          };
        })
        .filter(
          (fire) =>
            Number.isFinite(fire.latitude) &&
            Number.isFinite(fire.longitude) &&
            fire.latitude >= 40 &&
            fire.latitude <= 85 &&
            fire.longitude >= -150 &&
            fire.longitude <= -40
        );

      setCwfisWildfires(fires);
      setCwfisStatus(`Loaded ${fires.length} active fires`);
      setCwfisLastLoaded(nowTime());
    } catch (error) {
      setCwfisStatus(`Error: ${error.message}`);
    }
  }

  async function loadWeatherAlerts() {
    try {
      setWeatherStatus("Loading Environment Canada alerts...");

      const url =
        "https://api.weather.gc.ca/collections/weather-alerts/items" +
        "?lang=en&f=json&bbox=-102,49,-88,60&limit=500";

      const response = await fetch(url);

      if (!response.ok) {
        setWeatherStatus(`Weather alert request failed: ${response.status}`);
        return;
      }

      const data = await response.json();
      const features = data.features || [];

      setWeatherAlerts(features);
      setWeatherStatus(`Loaded ${features.length} alerts`);
      setWeatherLastLoaded(nowTime());
    } catch (error) {
      setWeatherStatus(`Error: ${error.message}`);
    }
  }

  async function refreshAllLiveData() {
    await loadAirQuality();
    await loadFIRMS();
    await loadCWFISWildfires();
    await loadWeatherAlerts();
  }

  useEffect(() => {
    if (initialLoadDone.current) return;

    initialLoadDone.current = true;

    refreshAllLiveData();

    const airQualityInterval = setInterval(loadAirQuality, 5 * 60 * 1000);
    const firmsInterval = setInterval(loadFIRMS, 15 * 60 * 1000);
    const cwfisInterval = setInterval(loadCWFISWildfires, 15 * 60 * 1000);
    const weatherInterval = setInterval(loadWeatherAlerts, 15 * 60 * 1000);

    return () => {
      clearInterval(airQualityInterval);
      clearInterval(firmsInterval);
      clearInterval(cwfisInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  
  const aq = airQualityData ? getAirQuality(airQualityData["pm2.5_atm"]) : null;

  const tabs = [
    "Situation Map",
    "Wind Forecast",
    "Operations",
    "Resources",
    "Evacuation",
    "Reports",
  ];

  function generateReportSummary() {
    const criticalNotes = operationNotes.filter(
      (note) => note.priority === "Critical"
    );

    const actionNotes = operationNotes.filter(
      (note) => note.priority === "Action"
    );

    return `SERDC Operational Briefing
Date: ${nowDate()}
Time: ${nowTime()}

Live Systems:
- Air Quality: ${airQualityStatus}
- Last AQ Update: ${airQualityLastLoaded}
${
  airQualityData && aq
    ? `- Brokenhead PM2.5: ${airQualityData["pm2.5_atm"]}
- PM-Based Air Quality: ${aq.label}`
    : "- No air quality values loaded"
}

- FIRMS Hotspots: ${firmsStatus}
- Last FIRMS Update: ${firmsLastLoaded}

- CWFIS Wildfires: ${cwfisStatus}
- Last CWFIS Update: ${cwfisLastLoaded}

- Weather Alerts: ${weatherStatus}
- Last Weather Update: ${weatherLastLoaded}

Communities of Concern:
${
  communitiesOfConcern.length === 0
    ? "- No communities currently flagged."
    : communitiesOfConcern
        .map(
          (community) =>
            `- ${community.name}: ${community.status} (${community.closestDistance} km from ${community.closestFire?.fireNumber})`
        )
        .join("\n")
}

Critical Notes:
${
  criticalNotes.length === 0
    ? "- None"
    : criticalNotes.map((note) => `- ${note.community}: ${note.details}`).join("\n")
}

Action Items:
${
  actionNotes.length === 0
    ? "- None"
    : actionNotes.map((note) => `- ${note.community}: ${note.details}`).join("\n")
}
`;
  }

  return (
    <div style={{ height: "100vh", width: "100%", fontFamily: "Arial" }}>
      <div
        style={{
          height: "56px",
          background: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
          borderBottom: "3px solid #0369a1",
        }}
      >
        <strong style={{ marginRight: "16px" }}>SERDC Emergency Dashboard</strong>

        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              background: activeTab === tab ? "#0ea5e9" : "#374151",
              color: "white",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Situation Map" && (
        <div
          style={{
            display: "flex",
            height: "calc(100vh - 56px)",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "410px",
              background: "#ffffff",
              borderRight: "1px solid #d1d5db",
              overflowY: "auto",
              padding: "16px",
            }}
          >
            <h2>Situation Map</h2>

            <button
              onClick={refreshAllLiveData}
              style={{
                width: "100%",
                padding: "12px",
                background: "#111827",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              Refresh All Live Data
            </button>

            <Card
              style={{
                border: `3px solid ${fireColours[selectedCommunity.status]}`,
                marginBottom: "16px",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Selected Community</h3>

              <strong>{selectedCommunity.name}</strong>

              <div>
                Wildfire Status:{" "}
                <span
                  style={{
                    color: fireColours[selectedCommunity.status],
                    fontWeight: "bold",
                  }}
                >
                  {selectedCommunity.status}
                </span>
              </div>

              <div>Closest Fire: {selectedCommunity.closestFire?.fireNumber || "No active fire loaded"}</div>
              <div>Distance: {selectedCommunity.closestDistance} km</div>

              {selectedCommunityAQ && (
                <div style={{ marginTop: "10px" }}>
                  Air Quality:{" "}
                  <span
                    style={{
                      color: selectedCommunityAQ.color,
                      fontWeight: "bold",
                    }}
                  >
                    {selectedCommunityAQ.label}
                  </span>
                  <div>PM2.5: {selectedCommunityAirQuality["pm2.5_atm"]}</div>
                </div>
              )}
            </Card>

            <h3>Live Data</h3>

            <button
              onClick={loadAirQuality}
              style={{
                width: "100%",
                padding: "10px",
                background: "#0369a1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Load Air Quality
            </button>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
              <strong>Air Quality:</strong> {airQualityStatus}
              <br />
              <strong>Last Loaded:</strong> {airQualityLastLoaded}
              <br />
              {airQualityData && aq && (
                <>
                  <strong>PM2.5:</strong> {airQualityData["pm2.5_atm"]}
                  <br />
                  <strong>Air Quality:</strong>{" "}
                  <span style={{ color: aq.color, fontWeight: "bold" }}>
                    {aq.label}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={loadFIRMS}
              style={{
                width: "100%",
                padding: "10px",
                background: "#c2410c",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Load FIRMS Hotspots
            </button>

            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
              <strong>FIRMS:</strong> {firmsStatus}
              <br />
              <strong>Last Loaded:</strong> {firmsLastLoaded}
            </div>

            <button
              onClick={loadCWFISWildfires}
              style={{
                width: "100%",
                padding: "10px",
                background: "#991b1b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Load Wildfire Information
            </button>

            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
              <strong>Wildfires:</strong> {cwfisStatus}
              <br />
              <strong>Last Loaded:</strong> {cwfisLastLoaded}
            </div>

            <button
              onClick={loadWeatherAlerts}
              style={{
                width: "100%",
                padding: "10px",
                background: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Load Weather Alerts
            </button>

            <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
              <strong>Weather Alerts:</strong> {weatherStatus}
              <br />
              <strong>Last Loaded:</strong> {weatherLastLoaded}
            </div>

            <div style={{ background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: "8px", padding: "10px", marginBottom: "16px" }}>
              <strong>Smoke Forecast:</strong>{" "}
              {smokeHourOffset === 0
                ? "Current forecast hour"
                : `${smokeHourOffset > 0 ? "+" : ""}${smokeHourOffset} hours`}
              <br />
              <strong>Image:</strong> hourly_
              {formatSmokeTimestamp(
                new Date(
                  getRoundedSmokeBaseTime().getTime() +
                    smokeHourOffset * 60 * 60 * 1000
                )
              )}
              .png

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => setSmokeHourOffset(smokeHourOffset - 1)}
                  style={{
                    padding: "8px 10px",
                    background: "#475569",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    marginRight: "8px",
                    cursor: "pointer",
                  }}
                >
                  Previous Hour
                </button>

                <button
                  onClick={() => setSmokeHourOffset(smokeHourOffset + 1)}
                  style={{
                    padding: "8px 10px",
                    background: "#0f766e",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Next Hour
                </button>

                <button
                  onClick={() => setSmokeHourOffset(0)}
                  style={{
                    padding: "8px 10px",
                    background: "#111827",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    marginLeft: "8px",
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            <h3>Communities of Concern</h3>

            {communitiesOfConcern.length === 0 ? (
              <p>No communities currently within 100 km of a loaded active wildfire.</p>
            ) : (
              communitiesOfConcern.map((community) => {
                const isSelected = community.name === selectedCommunity.name;

                return (
                  <button
                    key={community.name}
                    onClick={() => setSelectedCommunityName(community.name)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: `2px solid ${
                        isSelected ? "#111827" : fireColours[community.status]
                      }`,
                      borderRadius: "10px",
                      padding: "10px",
                      marginBottom: "10px",
                      background: isSelected ? "#e5e7eb" : "#f9fafb",
                      cursor: "pointer",
                    }}
                  >
                    <strong>{community.name}</strong>
                    <div>Status: {community.status}</div>
                    <div>Closest Fire: {community.closestFire?.fireNumber}</div>
                    <div>Distance: {community.closestDistance} km</div>
                  </button>
                );
              })
            )}

            <hr />

            <h3>All Communities</h3>

            {communityData.map((community) => {
              const isSelected = community.name === selectedCommunity.name;

              return (
                <button
                  key={community.name}
                  onClick={() => setSelectedCommunityName(community.name)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: isSelected ? "2px solid #111827" : "1px solid #d1d5db",
                    borderRadius: "10px",
                    padding: "10px",
                    marginBottom: "10px",
                    background: isSelected ? "#e5e7eb" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <strong>{community.name}</strong>
                  <div>Status: {community.status}</div>
                  <div>Closest Fire: {community.closestFire?.fireNumber || "None loaded"}</div>
                  <div>Distance: {community.closestDistance} km</div>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <MapContainer
              center={[51.9, -96.5]}
              zoom={6}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {showSmokeForecast && (
                <ImageOverlay
                  url={smokeForecastUrl}
                  bounds={smokeOverlayBounds}
                  opacity={0.55}
                />
              )}

              {showCWFIS &&
                cwfisWildfires.map((fire) => (
                  <React.Fragment key={fire.id}>
                    {showBuffers && (
                      <>
                        <Circle
                          center={[fire.latitude, fire.longitude]}
                          radius={40000}
                          pathOptions={{
                            color: "#facc15",
                            fillColor: "#facc15",
                            fillOpacity: 0.08,
                            weight: 1,
                          }}
                        />
                        <Circle
                          center={[fire.latitude, fire.longitude]}
                          radius={30000}
                          pathOptions={{
                            color: "#f97316",
                            fillColor: "#f97316",
                            fillOpacity: 0.1,
                            weight: 1,
                          }}
                        />
                        <Circle
                          center={[fire.latitude, fire.longitude]}
                          radius={20000}
                          pathOptions={{
                            color: "#dc2626",
                            fillColor: "#dc2626",
                            fillOpacity: 0.12,
                            weight: 1,
                          }}
                        />
                      </>
                    )}

                    <CircleMarker
                      center={[fire.latitude, fire.longitude]}
                      radius={10}
                      pathOptions={{
                        color: "#111827",
                        weight: 2,
                        fillColor: fireColours[fire.stage] || "#9333ea",
                        fillOpacity: 0.95,
                      }}
                    >
                      <Popup>
                        <strong>{fire.fireName}</strong>
                        <br />
                        Agency: {fire.agency}
                        <br />
                        Status: {fire.stage}
                        <br />
                        Size: {fire.hectares} ha
                        <br />
                        Response: {fire.responseType}
                        <br />
                        Cause: {fire.cause}
                        <br />
                        Containment:{" "}
                        {fire.percentContained >= 0
                          ? `${fire.percentContained}%`
                          : "Not listed"}
                        <br />
                        Start Date: {formatFireDate(fire.startDate)}
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                ))}

              {showCommunities &&
                communityData.map((community) => {
                  const isSelected = community.name === selectedCommunity.name;

                  return (
                    <CircleMarker
                      key={community.name}
                      center={community.position}
                      radius={isSelected ? 14 : 9}
                      pathOptions={{
                        color: isSelected ? "#0369a1" : "#0f172a",
                        weight: isSelected ? 4 : 2,
                        fillColor: "#7dd3fc",
                        fillOpacity: 0.9,
                      }}
                      eventHandlers={{
                        click: () => setSelectedCommunityName(community.name),
                      }}
                    >
                      <Popup>
                        <strong>{community.name}</strong>
                        <br />
                        Wildfire Status: {community.status}
                        <br />
                        Closest Fire: {community.closestFire?.fireNumber || "None loaded"}
                        <br />
                        Distance: {community.closestDistance} km
                      </Popup>
                    </CircleMarker>
                  );
                })}

              {showAirQuality && airQualityData && aq && (
                <CircleMarker
                  center={brokenheadSensor.position}
                  radius={11}
                  pathOptions={{
                    color: "#111827",
                    weight: 2,
                    fillColor: aq.color,
                    fillOpacity: 0.95,
                  }}
                >
                  <Popup>
                    <strong>{airQualityData.name}</strong>
                    <br />
                    PM2.5: {airQualityData["pm2.5_atm"]}
                    <br />
                    Air Quality: {aq.label}
                  </Popup>
                </CircleMarker>
              )}

              {showFIRMS &&
                firmsHotspots.map((hotspot) => (
                  <CircleMarker
                    key={hotspot.id}
                    center={[hotspot.latitude, hotspot.longitude]}
                    radius={7}
                    pathOptions={{
                      color: "#7c2d12",
                      weight: 2,
                      fillColor: "#fb923c",
                      fillOpacity: 0.95,
                    }}
                  >
                    <Popup>
                      <strong>NASA FIRMS Hotspot</strong>
                      <br />
                      Confidence: {hotspot.confidence}
                      <br />
                      Brightness: {hotspot.brightness}
                      <br />
                      FRP: {hotspot.frp}
                      <br />
                      Date: {hotspot.acqDate}
                      <br />
                      Time: {hotspot.acqTime}
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>

            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 1000,
                background: "white",
                padding: "12px",
                borderRadius: "10px",
                width: "255px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                fontSize: "14px",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Map Legend</h3>
              <div>🔴 Out of Control</div>
              <div>🟡 Being Held</div>
              <div>🟣 Monitored / Unknown</div>
              <div>🟢 Under Control</div>
              <div>🔵 Community</div>
              <div>🟠 FIRMS Hotspot</div>

              <hr />

              <h4>Operational Layers</h4>

              <label>
                <input
                  type="checkbox"
                  checked={showCommunities}
                  onChange={() => setShowCommunities(!showCommunities)}
                />{" "}
                Communities
              </label>

              <br />

              <label>
                <input
                  type="checkbox"
                  checked={showCWFIS}
                  onChange={() => setShowCWFIS(!showCWFIS)}
                />{" "}
                Active Wildfires
              </label>

              <br />

              <label>
                <input
                  type="checkbox"
                  checked={showBuffers}
                  onChange={() => setShowBuffers(!showBuffers)}
                />{" "}
                Wildfire Threat Buffers
              </label>

              <br />

              <label>
                <input
                  type="checkbox"
                  checked={showFIRMS}
                  onChange={() => setShowFIRMS(!showFIRMS)}
                />{" "}
                FIRMS Hotspots
              </label>

              <br />

              <label>
                <input
                  type="checkbox"
                  checked={showSmokeForecast}
                  onChange={() => setShowSmokeForecast(!showSmokeForecast)}
                />{" "}
                Smoke Forecast
              </label>

              <br />

              <label>
                <input
                  type="checkbox"
                  checked={showAirQuality}
                  onChange={() => setShowAirQuality(!showAirQuality)}
                />{" "}
                Air Quality Sensors
              </label>
            </div>
          </div>
        </div>
      )}

{activeTab === "Wind Forecast" && (
  <div
    style={{
      height: "calc(100vh - 56px)",
      width: "100%",
      position: "relative",
      background: "#0f172a",
    }}
  >
    <iframe
      title="Wind Forecast"
      src="https://embed.windy.com/embed2.html?lat=51.9&lon=-96.5&detailLat=51.9&detailLon=-96.5&width=650&height=450&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
      }}
    />
  </div>
)}

      {activeTab === "Operations" && (
        <DataSection
          title="Operations"
          description="Operational notes, decisions, tasks, and community updates."
          records={operationNotes}
          setRecords={setOperationNotes}
          colourField="priority"
          colourMap={priorityColours}
          defaultRecord={{
            community: "Poplar River First Nation",
            priority: "Info",
            type: "Operational Note",
            details: "",
          }}
          fields={[
            {
              name: "community",
              label: "Community",
              type: "select",
              options: communities.map((community) => community.name),
            },
            {
              name: "priority",
              label: "Priority",
              type: "select",
              options: ["Info", "Watch", "Action", "Critical"],
            },
            {
              name: "type",
              label: "Type",
              type: "select",
              options: [
                "Operational Note",
                "Decision",
                "Task",
                "Community Update",
                "Incident Log",
              ],
            },
            {
              name: "details",
              label: "Details",
              type: "textarea",
              placeholder: "Enter operational update, decision, or task...",
            },
          ]}
        />
      )}

      {activeTab === "Resources" && (
        <DataSection
          title="Resources"
          description="Track available, requested, assigned, and deployed resources."
          records={resources}
          setRecords={setResources}
          colourField="status"
          colourMap={{
            Available: "#22c55e",
            Requested: "#facc15",
            Assigned: "#0ea5e9",
            Deployed: "#f97316",
            Unavailable: "#dc2626",
          }}
          defaultRecord={{
            category: "Crew",
            name: "",
            community: "Poplar River First Nation",
            status: "Available",
            quantity: "",
            notes: "",
          }}
          fields={[
            {
              name: "category",
              label: "Category",
              type: "select",
              options: [
                "Crew",
                "Equipment",
                "Generator",
                "Fuel",
                "Aircraft",
                "Bus",
                "Reception Capacity",
                "Other",
              ],
            },
            {
              name: "name",
              label: "Resource Name",
              type: "text",
            },
            {
              name: "community",
              label: "Community / Location",
              type: "select",
              options: communities.map((community) => community.name),
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: [
                "Available",
                "Requested",
                "Assigned",
                "Deployed",
                "Unavailable",
              ],
            },
            {
              name: "quantity",
              label: "Quantity / Capacity",
              type: "text",
            },
            {
              name: "notes",
              label: "Notes",
              type: "textarea",
            },
          ]}
        />
      )}

      {activeTab === "Evacuation" && (
        <DataSection
          title="Evacuation"
          description="Track evacuation readiness, transportation, and reception."
          records={evacuations}
          setRecords={setEvacuations}
          colourField="status"
          colourMap={communityStatusColours}
          defaultRecord={{
            community: "Poplar River First Nation",
            status: "Normal",
            priorityEvacuees: "",
            transportation: "",
            receptionSite: "",
            notes: "",
          }}
          fields={[
            {
              name: "community",
              label: "Community",
              type: "select",
              options: communities.map((community) => community.name),
            },
            {
              name: "status",
              label: "Evacuation Status",
              type: "select",
              options: [
                "Normal",
                "Monitoring",
                "Preparedness",
                "Partial Evacuation",
                "Full Evacuation",
                "Re-entry",
              ],
            },
            {
              name: "priorityEvacuees",
              label: "Priority Evacuees",
              type: "text",
            },
            {
              name: "transportation",
              label: "Transportation",
              type: "text",
            },
            {
              name: "receptionSite",
              label: "Reception Site",
              type: "text",
            },
            {
              name: "notes",
              label: "Notes",
              type: "textarea",
            },
          ]}
        />
      )}

      {activeTab === "Reports" && (
        <div
          style={{
            padding: "24px",
            background: "#f3f4f6",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          <h2>Reports</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <Card>
              <h3>Generated Operational Briefing</h3>

              <textarea
                readOnly
                value={generateReportSummary()}
                style={{
                  width: "100%",
                  minHeight: "520px",
                  padding: "12px",
                  fontFamily: "Arial",
                  whiteSpace: "pre-wrap",
                }}
              />

              <button
                onClick={() => navigator.clipboard.writeText(generateReportSummary())}
                style={{
                  ...buttonStyle("#111827"),
                  marginTop: "12px",
                }}
              >
                Copy Briefing
              </button>
            </Card>

            <DataSection
              title="Saved Reports"
              description="Save report drafts, SITREPs, and briefings."
              records={reports}
              setRecords={setReports}
              colourField="type"
              colourMap={{
                SITREP: "#0369a1",
                Briefing: "#15803d",
                "Leadership Update": "#7c3aed",
                "Community Summary": "#f97316",
              }}
              defaultRecord={{
                type: "SITREP",
                title: "",
                summary: "",
              }}
              fields={[
                {
                  name: "type",
                  label: "Report Type",
                  type: "select",
                  options: [
                    "SITREP",
                    "Briefing",
                    "Leadership Update",
                    "Community Summary",
                  ],
                },
                {
                  name: "title",
                  label: "Title",
                  type: "text",
                },
                {
                  name: "summary",
                  label: "Summary",
                  type: "textarea",
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}