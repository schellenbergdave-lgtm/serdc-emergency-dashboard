import React from "react";

import SectionCard from "../components/SectionCard";
import StatusCard from "../components/StatusCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";
import usePurpleAirData from "../hooks/usePurpleAirData";
import useRegionalWeatherSummary from "../hooks/useRegionalWeatherSummary";
import useRegionalSmokeSummary from "../hooks/useRegionalSmokeSummary";
import useCommunityRiskScoring from "../hooks/useCommunityRiskScoring";
import useOperationalAlerts from "../hooks/useOperationalAlerts";
import useRiskTrends from "../hooks/useRiskTrends";
import useNotificationEngine from "../hooks/useNotificationEngine";

export default function Dashboard({ theme, setActiveTab }) {
  const [incidentObjectives] = useStoredState("serdcIncidentObjectives", []);
  const [actionLog] = useStoredState("serdcActionLog", []);
  const [planningRecords] = useStoredState("serdcPlanningRecords", []);
  const [logisticsResources] = useStoredState("serdcLogisticsResources", []);
  const [financeExpenses] = useStoredState("serdcFinanceExpenses", []);
  const [evacuations] = useStoredState("serdcEvacuations", []);
  const [receptionCentres] = useStoredState("serdcReceptionCentres", []);
  const [communityStatus] = useStoredState("serdcCommunityStatus", []);
  const [firmsHotspots] = useStoredState("serdcFirmsHotspots", []);
  const [incidents] = useStoredState("serdcIncidents", []);

  const [watchList, setWatchList] = useStoredState(
    "serdcWatchList",
    communities.map((community) => community.name)
  );

  const activeIncidentIds = incidents
    .filter((incident) => !incident.archived)
    .map((incident) => incident.id);

  function belongsToActiveIncident(item) {
    return activeIncidentIds.includes(item.incidentId);
  }

  const { airQualityData, airQualityLastLoaded, loadAirQuality } =
    usePurpleAirData();

  const {
    regionalWeather,
    regionalWeatherStatus,
    regionalWeatherLastLoaded,
    loadRegionalWeather,
  } = useRegionalWeatherSummary();

  const regionalSmoke = useRegionalSmokeSummary(airQualityData);

  const scopedEvacuations = evacuations.filter((item) =>
    belongsToActiveIncident(item)
  );

  const scopedReceptionCentres = receptionCentres.filter((item) =>
    belongsToActiveIncident(item)
  );

  const scopedFinanceExpenses = financeExpenses.filter((item) =>
    belongsToActiveIncident(item)
  );

  const communityRiskScores = useCommunityRiskScoring({
    communities,
    communityStatus,
    firmsHotspots,
    airQualityData,
    regionalWeather,
    evacuations: scopedEvacuations,
    logisticsResources,
    receptionCentres: scopedReceptionCentres,
  });

  const operationalAlerts = useOperationalAlerts({
    communityRiskScores,
    airQualityData,
    communityStatus,
    firmsHotspots,
    evacuations: scopedEvacuations,
    receptionCentres: scopedReceptionCentres,
    financeExpenses: scopedFinanceExpenses,
  });

  const { notifications, unreadNotifications } = useNotificationEngine({
    incidents,
    watchList,
    communityRiskScores,
    airQualityData,
    communityStatus,
    evacuations: scopedEvacuations,
  });

  const EOC_COLORS = {
    command: "#16a34a",
    operations: "#dc2626",
    planning: "#2563eb",
    logistics: "#eab308",
    finance: "#6b7280",
    evacuation: "#ea580c",
    reception: "#9333ea",
    intelligence: "#1d4ed8",
    smoke: "#7f1d1d",
  };

  const activeObjectives = incidentObjectives.filter(
    (item) => belongsToActiveIncident(item) && !item.archived
  );

  const openActions = actionLog.filter(
    (item) =>
      belongsToActiveIncident(item) &&
      !item.archived &&
      item.status !== "Completed"
  );

  const activePlanningRecords = planningRecords.filter(
    (item) =>
      belongsToActiveIncident(item) &&
      !item.archived &&
      item.status !== "Implemented" &&
      item.status !== "Deferred"
  );

  const activeLogisticsResources = logisticsResources.filter(
    (item) => belongsToActiveIncident(item) && !item.archived
  );

  const assignedOrDeployedLogistics = activeLogisticsResources.filter(
    (item) => item.status === "Assigned" || item.status === "Deployed"
  );

  const activeFinanceExpenses = financeExpenses.filter(
    (item) => belongsToActiveIncident(item) && !item.archived
  );

  const pendingFinanceItems = activeFinanceExpenses.filter(
    (item) =>
      item.approvalStatus === "Pending" ||
      item.approvalStatus === "Needs Review"
  );

  const financeTotal = activeFinanceExpenses.reduce((total, item) => {
    const amount = Number(String(item.amount || "").replace(/[^0-9.-]+/g, ""));
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const activeEvacuations = evacuations.filter(
    (item) =>
      belongsToActiveIncident(item) &&
      !item.archived &&
      item.status !== "Normal"
  );

  const activeReceptionCentres = receptionCentres.filter(
    (item) =>
      belongsToActiveIncident(item) &&
      !item.archived &&
      item.status !== "Closed"
  );

  const openReceptionCentres = activeReceptionCentres.filter(
    (item) =>
      item.status === "Open" ||
      item.status === "Near Capacity" ||
      item.status === "Full"
  );

  const totalReceptionCapacity = activeReceptionCentres.reduce(
    (total, item) => total + (Number(item.capacity) || 0),
    0
  );

  const totalReceptionEvacuees = activeReceptionCentres.reduce(
    (total, item) => total + (Number(item.evacuees) || 0),
    0
  );

  const { trends: communityRiskTrends, saveRiskSnapshot } =
    useRiskTrends(communityRiskScores);

  const highestRisk = communityRiskTrends[0];
  const regionalStatus = highestRisk?.severity || "Normal";
  const regionalStatusColor = highestRisk?.color || EOC_COLORS.command;

  const criticalUnreadCount = unreadNotifications.filter(
    (item) => item.level === "Critical"
  ).length;

  return (
    <div style={{ padding: "24px" }}>
      <SectionCard theme={theme}>
        <div
          style={{
            borderLeft: `10px solid ${regionalStatusColor}`,
            paddingLeft: "16px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Regional Operational Summary</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <SummaryItem title="Regional Status" value={regionalStatus} />

            <SummaryItem
              title="Highest Risk Community"
              value={
                highestRisk
                  ? `${highestRisk.community} (${highestRisk.score}/100)`
                  : "No score available"
              }
            />

            <SummaryItem
              title="Operational Alerts"
              value={operationalAlerts.length}
            />
            <SummaryItem
              title="Active Evacuations"
              value={activeEvacuations.length}
            />
            <SummaryItem
              title="Reception Centres"
              value={activeReceptionCentres.length}
            />

            <SummaryItem
              title="Regional Weather"
              value={regionalWeather?.concern?.level || "Not Loaded"}
            />

            <SummaryItem
              title="Regional Smoke"
              value={regionalSmoke?.concern?.level || "Not Loaded"}
            />

            <SummaryItem title="FIRMS Hotspots" value={firmsHotspots.length} />
          </div>

          {highestRisk?.drivers?.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <strong>Top Risk Drivers:</strong>
              {highestRisk.drivers.slice(0, 4).map((driver, index) => (
                <div key={index}>- {driver}</div>
              ))}
            </div>
          )}

          <button onClick={saveRiskSnapshot} style={smallButton("#2563eb")}>
            Save Risk Snapshot
          </button>
        </div>
      </SectionCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <StatusCard
          title="Community Risk"
          value={highestRisk ? highestRisk.community : "Not Loaded"}
          subtitle={
            highestRisk
              ? `${highestRisk.severity} | ${highestRisk.score}/100`
              : "No score available"
          }
          color={highestRisk?.color || "#64748b"}
          theme={theme}
        />

        <StatusCard
          title="Alerts"
          value={operationalAlerts.length}
          subtitle={
            operationalAlerts[0]
              ? `${operationalAlerts[0].level}: ${operationalAlerts[0].title}`
              : "No active alerts"
          }
          color={operationalAlerts[0]?.color || "#22c55e"}
          theme={theme}
        />

        <StatusCard
          title="Notifications"
          value={unreadNotifications.length}
          subtitle={
            unreadNotifications[0]
              ? `${unreadNotifications[0].title} | ${timeAgo(
                  unreadNotifications[0].created
                )}`
              : "No unread notifications"
          }
          color={unreadNotifications.length > 0 ? "#dc2626" : "#22c55e"}
          theme={theme}
        />

        <StatusCard
          title="Operations"
          value={openActions.length}
          subtitle={`${activeObjectives.length} objectives`}
          color={EOC_COLORS.operations}
          theme={theme}
        />

        <StatusCard
          title="Planning"
          value={activePlanningRecords.length}
          subtitle="Active planning records"
          color={EOC_COLORS.planning}
          theme={theme}
        />

        <StatusCard
          title="Logistics"
          value={assignedOrDeployedLogistics.length}
          subtitle={`${activeLogisticsResources.length} total resources`}
          color={EOC_COLORS.logistics}
          theme={theme}
        />

        <StatusCard
          title="Finance"
          value={`$${financeTotal.toLocaleString("en-CA", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          subtitle={`${pendingFinanceItems.length} pending/review`}
          color={EOC_COLORS.finance}
          theme={theme}
        />

        <StatusCard
          title="Evacuations"
          value={activeEvacuations.length}
          subtitle="Active records"
          color={EOC_COLORS.evacuation}
          theme={theme}
        />

        <StatusCard
          title="Reception"
          value={openReceptionCentres.length}
          subtitle={`${totalReceptionEvacuees}/${totalReceptionCapacity} capacity`}
          color={EOC_COLORS.reception}
          theme={theme}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <SectionCard theme={theme}>
          <SectionHeader
            title="Operational Alerts"
            color={operationalAlerts[0]?.color || "#22c55e"}
          />

          {operationalAlerts.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active operational alerts.
            </div>
          )}

          {operationalAlerts.slice(0, 8).map((alert) => (
            <CompactRecord
              key={alert.id}
              color={alert.color}
              theme={theme}
              title={`${alert.level}: ${alert.title}`}
              lines={[alert.message]}
            />
          ))}
        </SectionCard>

        <SectionCard theme={theme}>
          <div
            onClick={() => setActiveTab("Notifications")}
            style={{
              borderLeft: `8px solid ${
                criticalUnreadCount > 0
                  ? "#dc2626"
                  : unreadNotifications.length > 0
                  ? "#f97316"
                  : "#22c55e"
              }`,
              paddingLeft: "12px",
              cursor: "pointer",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Notifications</h2>

            <div>
              <strong>Unread:</strong> {unreadNotifications.length}
            </div>

            <div>
              <strong>Critical:</strong> {criticalUnreadCount}
            </div>

            <div style={{ marginTop: "10px", color: theme.muted }}>
              {unreadNotifications[0]
                ? unreadNotifications[0].title
                : "No unread notifications."}
            </div>

            {unreadNotifications[0] && (
              <div style={{ marginTop: "6px", color: theme.muted }}>
                {timeAgo(unreadNotifications[0].created)}
              </div>
            )}

            <div
              style={{
                marginTop: "12px",
                fontWeight: "bold",
                color: theme.accent,
              }}
            >
              Open Notification Center
            </div>
          </div>
        </SectionCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <SectionCard theme={theme}>
          <SectionHeader title="Community Watch List" color="#2563eb" />

          {communities.map((community) => {
            const checked = watchList.includes(community.name);

            return (
              <label
                key={community.name}
                style={{
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    if (checked) {
                      setWatchList(
                        watchList.filter((item) => item !== community.name)
                      );
                    } else {
                      setWatchList([...watchList, community.name]);
                    }
                  }}
                />{" "}
                {community.name}
              </label>
            );
          })}
        </SectionCard>

        <SectionCard theme={theme}>
          <SectionHeader
            title="Weather & Smoke Intelligence"
            color={regionalSmoke?.concern?.color || EOC_COLORS.intelligence}
          />

          <div style={{ marginBottom: "10px" }}>
            <strong>Weather:</strong>{" "}
            {regionalWeather?.concern?.level || "Not Loaded"}
            <br />
            <span style={{ color: theme.muted }}>
              {regionalWeather
                ? `Max gust ${regionalWeather.maxWindGust} km/h | Lowest RH ${regionalWeather.lowestHumidity}%`
                : regionalWeatherStatus}
            </span>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>Smoke:</strong> {regionalSmoke.concern.level}
            <br />
            <span style={{ color: theme.muted }}>
              {regionalSmoke.highestSmoke
                ? `${regionalSmoke.highestSmoke.community} AQHI ${regionalSmoke.highestSmoke.aqhi}`
                : regionalSmoke.concern.reason}
            </span>
          </div>

          <div style={{ color: theme.muted, fontSize: "13px" }}>
            Weather loaded: {regionalWeatherLastLoaded}
            <br />
            AQHI loaded: {airQualityLastLoaded}
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={loadRegionalWeather} style={smallButton("#2563eb")}>
              Refresh Weather
            </button>

            <button onClick={loadAirQuality} style={smallButton(EOC_COLORS.smoke)}>
              Refresh AQHI
            </button>
          </div>
        </SectionCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <DashboardSection
          title="Operations"
          color={EOC_COLORS.operations}
          theme={theme}
          items={openActions}
          emptyMessage="No open actions."
          render={(item) => (
            <>
              <strong>{item.status || "Open"}:</strong> {item.text}
            </>
          )}
        />

        <DashboardSection
          title="Planning"
          color={EOC_COLORS.planning}
          theme={theme}
          items={activePlanningRecords}
          emptyMessage="No active planning records."
          render={(item) => (
            <>
              <strong>{item.status || "Active"}:</strong>{" "}
              {item.title || item.type}
            </>
          )}
        />

        <DashboardSection
          title="Logistics / Finance"
          color={EOC_COLORS.logistics}
          theme={theme}
          items={assignedOrDeployedLogistics}
          emptyMessage="No logistics resources deployed."
          render={(item) => (
            <>
              <strong>{item.status}:</strong> {item.resourceName}
            </>
          )}
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
          <SectionHeader
            title="Priority Communities"
            color={highestRisk?.color || "#64748b"}
          />

          {communityRiskTrends.slice(0, 8).map((record, index) => (
            <CompactRecord
              key={record.community}
              color={record.color}
              theme={theme}
              title={`${index + 1}. ${record.community}`}
              lines={[
                `${record.severity} | Score ${record.score}/100 ${
                  record.arrow
                } ${record.change > 0 ? "+" : ""}${record.change}`,
                `AQHI: ${record.aqhi} (${record.aqhiCategory})`,
                `FIRMS within 50 km: ${record.nearbyHotspots}`,
                record.drivers.length > 0
                  ? `Drivers: ${record.drivers.slice(0, 2).join("; ")}`
                  : "No active risk drivers",
              ]}
            />
          ))}
        </SectionCard>

        <SectionCard theme={theme}>
          <SectionHeader
            title="Evacuation & Reception"
            color={EOC_COLORS.evacuation}
          />

          <QuickMetric
            label="Active Evacuation Records"
            value={activeEvacuations.length}
          />

          <QuickMetric
            label="Open Reception Centres"
            value={openReceptionCentres.length}
          />

          <QuickMetric
            label="Reception Capacity"
            value={`${totalReceptionEvacuees}/${totalReceptionCapacity}`}
          />

          <div style={{ marginTop: "12px" }}>
            {activeEvacuations.slice(0, 5).map((record) => (
              <CompactRecord
                key={record.id}
                color={EOC_COLORS.evacuation}
                theme={theme}
                title={record.community}
                lines={[
                  `Status: ${record.status}`,
                  `Evacuees: ${record.evacuees || "0"}`,
                  `Reception: ${record.receptionCentre || "Not listed"}`,
                ]}
              />
            ))}

            {activeEvacuations.length === 0 && (
              <div style={{ color: theme.muted }}>
                No active evacuation records.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SummaryItem({ title, value }) {
  return (
    <div>
      <strong>{title}:</strong>
      <br />
      {value}
    </div>
  );
}

function SectionHeader({ title, color }) {
  return (
    <div
      style={{
        borderLeft: `8px solid ${color}`,
        paddingLeft: "12px",
        marginBottom: "16px",
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
    </div>
  );
}

function QuickMetric({ label, value }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <strong>{label}:</strong> {value}
    </div>
  );
}

function CompactRecord({ title, lines, color, theme }) {
  return (
    <div
      style={{
        borderLeft: `8px solid ${color}`,
        padding: "10px",
        borderRadius: "10px",
        border: `1px solid ${theme.border}`,
        background: theme.background,
        marginBottom: "10px",
      }}
    >
      <strong>{title}</strong>
      {lines.map((line, index) => (
        <div
          key={index}
          style={{ color: index === 0 ? theme.text : theme.muted }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

function DashboardSection({
  title,
  color,
  theme,
  items,
  emptyMessage,
  render,
}) {
  return (
    <SectionCard theme={theme}>
      <SectionHeader title={title} color={color} />

      {items.length === 0 && (
        <div style={{ color: theme.muted }}>{emptyMessage}</div>
      )}

      {items.slice(0, 6).map((item) => (
        <div
          key={item.id}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: `1px solid ${theme.border}`,
            marginBottom: "8px",
            background: theme.background,
          }}
        >
          {render(item)}
        </div>
      ))}
    </SectionCard>
  );
}

function timeAgo(value) {
  if (!value) return "Time not listed";

  const created = new Date(value);

  if (Number.isNaN(created.getTime())) {
    return value;
  }

  const now = new Date();
  const diffMinutes = Math.floor((now - created) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute(s) ago`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours} hour(s) ago`;

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day(s) ago`;
}

function smallButton(background) {
  return {
    marginTop: "14px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  };
}
