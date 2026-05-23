import React from "react";

import SectionCard from "../components/SectionCard";
import StatusCard from "../components/StatusCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";
import usePurpleAirData from "../hooks/usePurpleAirData";
export default function Dashboard({ theme }) {
  const [operationalPeriod] = useStoredState(
    "operationalPeriod",
    "Operational Period 1"
  );

  const [incidentObjectives] = useStoredState(
    "serdcIncidentObjectives",
    []
  );

  const [actionLog] = useStoredState("serdcActionLog", []);
  const [resources] = useStoredState("serdcResources", []);
  const [evacuations] = useStoredState("serdcEvacuations", []);
  const {
    airQualityData,
    airQualityStatus,
    airQualityLastLoaded,
    loadAirQuality,
  } = usePurpleAirData();
  const activeObjectives = incidentObjectives.filter(
    (objective) => !objective.archived
  );

  const openActions = actionLog.filter(
    (entry) => !entry.archived && entry.status !== "Completed"
  );

  const deployedResources = resources.filter(
    (resource) =>
      !resource.archived &&
      (resource.status === "Assigned" ||
        resource.status === "Deployed" ||
        resource.status === "Requested")
  );

  const activeEvacuations = evacuations.filter(
    (record) => !record.archived && record.status !== "Normal"
  );

  const communityRiskMap = {};

  activeEvacuations.forEach((record) => {
    if (!communityRiskMap[record.community]) {
      communityRiskMap[record.community] = {
        community: record.community,
        evacuations: 0,
        resources: 0,
        objectives: 0,
        statuses: [],
      };
    }

    communityRiskMap[record.community].evacuations += 1;
    communityRiskMap[record.community].statuses.push(record.status);
  });

  deployedResources.forEach((resource) => {
    if (!communityRiskMap[resource.community]) {
      communityRiskMap[resource.community] = {
        community: resource.community,
        evacuations: 0,
        resources: 0,
        objectives: 0,
        statuses: [],
      };
    }

    communityRiskMap[resource.community].resources += 1;
  });

  activeObjectives.forEach((objective) => {
    communities.forEach((community) => {
      if (
        objective.text &&
        objective.text.toLowerCase().includes(community.name.toLowerCase())
      ) {
        if (!communityRiskMap[community.name]) {
          communityRiskMap[community.name] = {
            community: community.name,
            evacuations: 0,
            resources: 0,
            objectives: 0,
            statuses: [],
          };
        }

        communityRiskMap[community.name].objectives += 1;
      }
    });
  });

  const priorityCommunities = Object.values(communityRiskMap);

  const highestRiskCommunity =
    priorityCommunities.length > 0
      ? [...priorityCommunities].sort((a, b) => {
          const aScore =
            a.evacuations * 50 + a.resources * 20 + a.objectives * 15;

          const bScore =
            b.evacuations * 50 + b.resources * 20 + b.objectives * 15;

          return bScore - aScore;
        })[0]
      : null;

  const wildfireConcernCommunities = priorityCommunities.filter(
    (community) =>
      community.evacuations > 0 ||
      community.resources > 0 ||
      community.objectives > 0
  );

  const criticalCommunities = wildfireConcernCommunities.filter(
    (community) => community.evacuations >= 1
  );

  const elevatedCommunities = wildfireConcernCommunities.filter(
    (community) =>
      community.evacuations === 0 &&
      (community.resources > 0 || community.objectives > 0)
  );
  const aqhiColourMap = {
    Low: "#22c55e",
    Moderate: "#facc15",
    High: "#f97316",
    "Very High": "#dc2626",
  };
  
  const highestSmokeImpact =
  airQualityData.length > 0
      ? [...airQualityData].sort((a, b) => b.aqhi - a.aqhi)[0]
      : null;
  
  const highSmokeCommunities = airQualityData.filter(
    (record) =>
      record.category === "High" ||
      record.category === "Very High"
  );
  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          background:
            activeEvacuations.length > 0
              ? "#7f1d1d"
              : openActions.length > 0
              ? "#92400e"
              : "#065f46",
          color: "white",
          padding: "16px 20px",
          borderRadius: "14px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        <div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            Operational Status:{" "}
            {activeEvacuations.length > 0
              ? "Active Evacuation Monitoring"
              : openActions.length > 0
              ? "Enhanced Monitoring"
              : "Routine Monitoring"}
          </div>

          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            {operationalPeriod} | {new Date().toLocaleString()}
          </div>
        </div>

        <div style={{ fontSize: "14px", textAlign: "right" }}>
          <strong>{openActions.length}</strong> open actions
          <br />
          <strong>{activeEvacuations.length}</strong> evacuation records
        </div>
      </div>

      {highestRiskCommunity && (
        <div
          style={{
            background: "#991b1b",
            color: "white",
            padding: "14px 20px",
            borderRadius: "14px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            Highest Priority Community: {highestRiskCommunity.community}
          </div>

          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            Evacuation records: {highestRiskCommunity.evacuations} | Resources:{" "}
            {highestRiskCommunity.resources} | Objectives:{" "}
            {highestRiskCommunity.objectives}
          </div>
        </div>
      )}
{highestSmokeImpact && highestSmokeImpact.aqhi >= 7 && (
  <div
    style={{
      background: "#7f1d1d",
      color: "white",
      padding: "14px 20px",
      borderRadius: "14px",
      marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
    }}
  >
    <div
      style={{
        fontSize: "20px",
        fontWeight: "bold",
      }}
    >
      Highest Smoke Impact:{" "}
      {highestSmokeImpact.community}
    </div>

    <div style={{ fontSize: "14px", opacity: 0.9 }}>
      AQHI: {highestSmokeImpact.aqhi} | Category:{" "}
      {highestSmokeImpact.category}
    </div>
  </div>
)}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Critical Communities</h2>

          {criticalCommunities.length === 0 && (
            <div style={{ color: theme.muted }}>
              No critical communities identified.
            </div>
          )}

          {criticalCommunities.map((community) => (
            <div
              key={community.community}
              style={{
                background: "#7f1d1d",
                color: "white",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            >
              <strong>{community.community}</strong>

              <div style={{ marginTop: "6px" }}>
                Evacuation Records: {community.evacuations}
              </div>

              <div>Resources Assigned: {community.resources}</div>

              <div>Objectives: {community.objectives}</div>
            </div>
          ))}
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Elevated Monitoring Communities</h2>

          {elevatedCommunities.length === 0 && (
            <div style={{ color: theme.muted }}>
              No elevated monitoring communities identified.
            </div>
          )}

          {elevatedCommunities.map((community) => (
            <div
              key={community.community}
              style={{
                background: "#92400e",
                color: "white",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            >
              <strong>{community.community}</strong>

              <div style={{ marginTop: "6px" }}>
                Resources Assigned: {community.resources}
              </div>

              <div>Objectives: {community.objectives}</div>
            </div>
          ))}
        </SectionCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <StatusCard
          title="Operational Period"
          value={operationalPeriod}
          subtitle="Current planning period"
          color={theme.accent}
          theme={theme}
        />

        <StatusCard
          title="SERDC Communities"
          value={communities.length}
          subtitle="Communities monitored"
          color={theme.secondary}
          theme={theme}
        />

        <StatusCard
          title="Active Objectives"
          value={activeObjectives.length}
          subtitle="Open incident objectives"
          color="#0ea5e9"
          theme={theme}
        />

        <StatusCard
          title="Open Actions"
          value={openActions.length}
          subtitle="Action log entries not completed"
          color="#f97316"
          theme={theme}
        />

        <StatusCard
          title="Resources in Use"
          value={deployedResources.length}
          subtitle="Requested, assigned, or deployed"
          color="#8b5cf6"
          theme={theme}
        />

        <StatusCard
          title="Evacuation Records"
          value={activeEvacuations.length}
          subtitle="Active evacuation/monitoring entries"
          color="#dc2626"
          theme={theme}
        />
        <StatusCard
  title="High Smoke Communities"
  value={highSmokeCommunities.length}
  subtitle="AQHI High or Very High"
  color="#7f1d1d"
  theme={theme}
/>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Current Incident Objectives</h2>

          {activeObjectives.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active incident objectives entered.
            </div>
          )}

          {activeObjectives.slice(0, 6).map((objective) => (
            <div
              key={objective.id}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                marginBottom: "8px",
                background: theme.background,
              }}
            >
              <strong>{objective.status || "Active"}:</strong> {objective.text}
            </div>
          ))}
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Open Operational Actions</h2>

          {openActions.length === 0 && (
            <div style={{ color: theme.muted }}>No open action log entries.</div>
          )}

          {openActions.slice(0, 6).map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                marginBottom: "8px",
                background: theme.background,
              }}
            >
              <strong>{entry.status || "Open"}:</strong> {entry.text}
            </div>
          ))}
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Resource Snapshot</h2>

          {deployedResources.length === 0 && (
            <div style={{ color: theme.muted }}>
              No requested, assigned, or deployed resources.
            </div>
          )}

          {deployedResources.slice(0, 6).map((resource) => (
            <div
              key={resource.id}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                marginBottom: "8px",
                background: theme.background,
              }}
            >
              <strong>{resource.status}:</strong> {resource.category} |{" "}
              {resource.name || "Unnamed Resource"} | {resource.community}
            </div>
          ))}
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Evacuation Snapshot</h2>

          {activeEvacuations.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active evacuation or monitoring records.
            </div>
          )}

          {activeEvacuations.slice(0, 6).map((record) => (
            <div
              key={record.id}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                marginBottom: "8px",
                background: theme.background,
              }}
            >
              <strong>{record.status}:</strong> {record.community} | Evacuees:{" "}
              {record.evacuees || "0"}
            </div>
          ))}
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Priority Communities at Risk</h2>

          {priorityCommunities.length === 0 && (
            <div style={{ color: theme.muted }}>
              No communities currently flagged.
            </div>
          )}

          {priorityCommunities.map((community) => (
            <div
              key={community.community}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: `1px solid ${theme.border}`,
                marginBottom: "10px",
                background: theme.background,
              }}
            >
              <strong>{community.community}</strong>

              <div style={{ marginTop: "6px" }}>
                Evacuation Records: {community.evacuations}
              </div>

              <div>Resources Assigned/Requested: {community.resources}</div>

              <div>Related Objectives: {community.objectives}</div>

              {community.statuses.length > 0 && (
                <div>Statuses: {community.statuses.join(", ")}</div>
              )}
            </div>
          ))}
        </SectionCard>
        <SectionCard theme={theme}>
  <h2 style={{ marginTop: 0 }}>
    Smoke / AQHI Intelligence
  </h2>
  <div style={{ color: theme.muted, marginBottom: "12px" }}>
  Status: {airQualityStatus}
  <br />
  Last Loaded: {airQualityLastLoaded}
</div>

<button
  onClick={loadAirQuality}
  style={{
    padding: "10px 14px",
    background: theme.accent,
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "14px",
  }}
>
  Refresh Air Quality
</button>
  {airQualityData.map((record) => (
    <div
      key={record.community}
      style={{
        padding: "12px",
        borderRadius: "10px",
        border: `1px solid ${theme.border}`,
        borderLeft: `8px solid ${
          aqhiColourMap[record.category] || theme.accent
        }`,
        marginBottom: "10px",
        background: theme.background,
      }}
    >
      <strong>{record.community}</strong>

      <div style={{ marginTop: "6px" }}>
      AQHI: {record.aqhi}
<br />
PM2.5: {record.pm25 ?? "No Data"}
      </div>

      <div>
        Category: {record.category}
      </div>
    </div>
  ))}
</SectionCard>
      </div>
    </div>
  );
}