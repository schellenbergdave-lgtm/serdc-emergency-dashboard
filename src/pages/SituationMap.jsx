import React from "react";
import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Circle,
  
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import communities from "../data/communities";
import wildfireColours from "../data/wildfireColours";
import SectionCard from "../components/SectionCard";
import StatusCard from "../components/StatusCard";



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

  if (cleanStatus === "OC" || cleanStatus.includes("OUT")) {
    return "Out of Control";
  }

  if (cleanStatus === "BH" || cleanStatus.includes("BEING HELD")) {
    return "Being Held";
  }

  if (cleanStatus === "UC" || cleanStatus.includes("UNDER")) {
    return "Under Control";
  }

  if (cleanStatus.includes("MONITOR")) {
    return "Monitored";
  }

  return "Monitored";
}
function calculateCommunityRisk(closestFire, closestDistance) {
  if (!closestFire || !Number.isFinite(Number(closestDistance))) {
    return {
      level: "Normal",
      score: 0,
      label: "No active fire nearby",
    };
  }

  const distance = Number(closestDistance);
  let score = 0;

  if (distance <= 20) score += 70;
  else if (distance <= 30) score += 50;
  else if (distance <= 40) score += 35;
  else if (distance <= 100) score += 15;

  if (closestFire.stage === "Out of Control") score += 25;
  else if (closestFire.stage === "Being Held") score += 15;
  else if (closestFire.stage === "Monitored") score += 8;

  if (score >= 80) {
    return {
      level: "Critical",
      score,
      label: "Critical wildfire proximity",
    };
  }

  if (score >= 55) {
    return {
      level: "Elevated",
      score,
      label: "Elevated wildfire concern",
    };
  }

  if (score >= 25) {
    return {
      level: "Monitor",
      score,
      label: "Monitor conditions",
    };
  }

  return {
    level: "Normal",
    score,
    label: "No immediate wildfire concern",
  };
}
function formatDate(value) {
  if (!value) return "Not listed";

  try {
    return new Date(value).toLocaleDateString("en-CA");
  } catch {
    return "Not listed";
  }
}

export default function SituationMap({ theme, darkMode }) {
  const [showCommunities, setShowCommunities] = useState(true);
  const [showBuffers, setShowBuffers] = useState(true);
  
  const [showCWFIS, setShowCWFIS] = useState(true);

  const [wildfires, setWildfires] = useState([]);
  const [wildfireStatus, setWildfireStatus] = useState("Not loaded");
  const [lastLoaded, setLastLoaded] = useState("Not loaded");

  async function loadWildfires() {
    try {
      setWildfireStatus("Loading CWFIS active wildfire data...");

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
        setWildfireStatus(`CWFIS request failed: ${response.status}`);
        return;
      }

      const data = await response.json();
      const features = data.features || [];

      const fires = features
        .map((feature, index) => {
          const p = feature.properties || {};

          return {
            id: feature.id || p.id || index,
            fireName:
              p.agency_fire_id ||
              p.national_fire_id ||
              "Unnamed Fire",
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

      setWildfires(fires);
      setWildfireStatus(`Loaded ${fires.length} active fires`);
      setLastLoaded(new Date().toLocaleTimeString("en-CA"));
    } catch (error) {
      setWildfireStatus(`Error: ${error.message}`);
    }
  }

  const communityStatus = useMemo(() => {
    return communities.map((community) => {
      let closestDistance = 9999;
      let closestFire = null;

      wildfires.forEach((fire) => {
        const distance = getDistanceKm(
          community.position[0],
          community.position[1],
          fire.latitude,
          fire.longitude
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestFire = fire;
        }
      });

      const risk = calculateCommunityRisk(
        closestFire,
        closestFire ? closestDistance : null
      );
      
      return {
        ...community,
        status: risk.level,
        riskScore: risk.score,
        riskLabel: risk.label,
        closestFire,
        closestDistance: closestFire
          ? closestDistance.toFixed(1)
          : "N/A",
      };
    });
  }, [wildfires]);

  const communitiesOfConcern = communityStatus
    .filter(
      (community) =>
        community.closestFire &&
        Number(community.closestDistance) <= 100
    )
    .sort((a, b) => b.riskScore - a.riskScore);

  const riskColours = {
    Critical: "#dc2626",
    Elevated: "#f97316",
    Monitor: "#facc15",
    "No Active Fire Nearby": "#22c55e",
  };

  useMemo(() => {
    if (wildfireStatus === "Not loaded") {
      loadWildfires();
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "420px",
          background: theme.sidebar,
          borderRight: `1px solid ${theme.border}`,
          overflowY: "auto",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <StatusCard
          title="Dashboard Status"
          value="Operational"
          subtitle="SERDC emergency intelligence platform"
          color={theme.accent}
          theme={theme}
        />

        <StatusCard
          title="Active Wildfires Loaded"
          value={wildfires.length}
          subtitle={wildfireStatus}
          color="#dc2626"
          theme={theme}
        />

        <StatusCard
          title="Communities of Concern"
          value={communitiesOfConcern.length}
          subtitle="Within 100 km of a loaded wildfire"
          color="#f97316"
          theme={theme}
        />

        <SectionCard theme={theme}>
          <h3 style={{ marginTop: 0 }}>Live Wildfire Data</h3>

          <button
            onClick={loadWildfires}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: theme.accent,
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            Load Wildfire Information
          </button>

          <div style={{ color: theme.muted, fontSize: "14px" }}>
            <strong>Status:</strong> {wildfireStatus}
            <br />
            <strong>Last Loaded:</strong> {lastLoaded}
          </div>
        </SectionCard>

        <SectionCard theme={theme}>
          <h3 style={{ marginTop: 0 }}>Operational Layers</h3>

          <label>
            <input
              type="checkbox"
              checked={showCommunities}
              onChange={() => setShowCommunities(!showCommunities)}
            />{" "}
            Communities
          </label>

          <br />
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
          <br />

          <label>
            <input
              type="checkbox"
              checked={showBuffers}
              onChange={() => setShowBuffers(!showBuffers)}
            />{" "}
            40 / 30 / 20 km Wildfire Buffers
          </label>

          <br />
          <br />

          
        </SectionCard>

        
      </div>

      <div style={{ flex: 1 }}>
        <MapContainer
          center={[52, -96]}
          zoom={6}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

         

          {showCWFIS &&
            wildfires.map((fire) => (
              <React.Fragment key={fire.id}>
                {showBuffers && (
                  <>
                    <Circle
                      center={[fire.latitude, fire.longitude]}
                      radius={40000}
                      pathOptions={{
                        color: "#facc15",
                        fillColor: "#facc15",
                        fillOpacity: 0.07,
                        weight: 1,
                      }}
                    />

                    <Circle
                      center={[fire.latitude, fire.longitude]}
                      radius={30000}
                      pathOptions={{
                        color: "#f97316",
                        fillColor: "#f97316",
                        fillOpacity: 0.09,
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
                    fillColor:
                      wildfireColours[fire.stage] || "#9333ea",
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
                    Start Date: {formatDate(fire.startDate)}
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            ))}

          {showCommunities &&
            communityStatus.map((community) => (
              <CircleMarker
                key={community.name}
                center={community.position}
                radius={10}
                pathOptions={{
                  color: "#111827",
                  weight: 2,
                  fillColor:
                    riskColours[community.status] || theme.accent,
                  fillOpacity: 0.95,
                }}
              >
                <Popup>
                  <strong>{community.name}</strong>
                  <br />
                  Risk Status: {community.status}
                  <br />
Risk Score: {community.riskScore}
<br />
Risk Basis: {community.riskLabel}
                  <br />
                  Closest Fire:{" "}
                  {community.closestFire?.fireName || "None loaded"}
                  <br />
                  Distance: {community.closestDistance} km
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}