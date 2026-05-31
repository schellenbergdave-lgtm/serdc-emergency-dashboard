import React, { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";

export default function Archives({ theme }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const [incidents, setIncidents] = useStoredState("serdcIncidents", []);
  const [objectives, setObjectives] = useStoredState(
    "serdcIncidentObjectives",
    []
  );
  const [actionLog, setActionLog] = useStoredState("serdcActionLog", []);
  const [planningRecords, setPlanningRecords] = useStoredState(
    "serdcPlanningRecords",
    []
  );
  const [logisticsResources, setLogisticsResources] = useStoredState(
    "serdcLogisticsResources",
    []
  );
  const [financeExpenses, setFinanceExpenses] = useStoredState(
    "serdcFinanceExpenses",
    []
  );
  const [evacuations, setEvacuations] = useStoredState("serdcEvacuations", []);
  const [receptionCentres, setReceptionCentres] = useStoredState(
    "serdcReceptionCentres",
    []
  );

  const archivedIncidents = incidents.filter((incident) => incident.archived);

  const selectedIncident =
    archivedIncidents.find((incident) => incident.id === selectedIncidentId) ||
    archivedIncidents[0] ||
    null;

  function recordsForIncident(records) {
    if (!selectedIncident) return [];
    return records.filter((record) => record.incidentId === selectedIncident.id);
  }

  const incidentObjectives = recordsForIncident(objectives);
  const incidentActions = recordsForIncident(actionLog);
  const incidentPlanning = recordsForIncident(planningRecords);
  const incidentLogistics = recordsForIncident(logisticsResources);
  const incidentFinance = recordsForIncident(financeExpenses);
  const incidentEvacuations = recordsForIncident(evacuations);
  const incidentReception = recordsForIncident(receptionCentres);

  function deleteArchivedIncidentFolder(incidentId) {
    const incident = archivedIncidents.find((item) => item.id === incidentId);

    if (!incident) return;

    const confirmed = window.confirm(
      `Permanently delete archived folder for ${incident.incidentNumber || ""} ${
        incident.name || ""
      } and all linked records? This cannot be undone.`
    );

    if (!confirmed) return;

    setIncidents(incidents.filter((item) => item.id !== incidentId));
    setObjectives(objectives.filter((item) => item.incidentId !== incidentId));
    setActionLog(actionLog.filter((item) => item.incidentId !== incidentId));
    setPlanningRecords(
      planningRecords.filter((item) => item.incidentId !== incidentId)
    );
    setLogisticsResources(
      logisticsResources.filter((item) => item.incidentId !== incidentId)
    );
    setFinanceExpenses(
      financeExpenses.filter((item) => item.incidentId !== incidentId)
    );
    setEvacuations(evacuations.filter((item) => item.incidentId !== incidentId));
    setReceptionCentres(
      receptionCentres.filter((item) => item.incidentId !== incidentId)
    );

    setSelectedIncidentId(null);
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
          <h2 style={{ marginTop: 0 }}>Archived Incident Folders</h2>

          {archivedIncidents.length === 0 && (
            <div style={{ color: theme.muted }}>
              No archived incidents available.
            </div>
          )}

          {archivedIncidents.map((incident) => (
            <button
              key={incident.id}
              onClick={() => setSelectedIncidentId(incident.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px",
                borderRadius: "10px",
                border: `1px solid ${
                  selectedIncident?.id === incident.id
                    ? theme.accent
                    : theme.border
                }`,
                background:
                  selectedIncident?.id === incident.id
                    ? theme.background
                    : theme.surface,
                color: theme.text,
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              <strong>{incident.incidentNumber || "No Number"}</strong>
              <br />
              {incident.name || "Unnamed Incident"}
              <br />
              <span style={{ color: theme.muted }}>
                {incident.status || "Archived"} |{" "}
                {incident.operationalPeriod || "No operational period"}
              </span>
            </button>
          ))}
        </SectionCard>
      </div>

      <div>
        {!selectedIncident && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archive Details</h2>
            <div style={{ color: theme.muted }}>
              Select an archived incident folder to view records.
            </div>
          </SectionCard>
        )}

        {selectedIncident && (
          <>
            <SectionCard theme={theme}>
              <div
                style={{
                  borderLeft: "8px solid #64748b",
                  paddingLeft: "12px",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ margin: 0 }}>
                  {selectedIncident.incidentNumber || "Archived Incident"}
                </h2>
                <div style={{ color: theme.muted }}>
                  {selectedIncident.name || "Unnamed Incident"}
                </div>
              </div>

              <ArchiveField label="Status" value={selectedIncident.status} />
              <ArchiveField
                label="Priority"
                value={selectedIncident.priority}
              />
              <ArchiveField
                label="Operational Period"
                value={selectedIncident.operationalPeriod}
              />
              <ArchiveField
                label="Created"
                value={selectedIncident.created}
              />

              <button
                onClick={() => deleteArchivedIncidentFolder(selectedIncident.id)}
                style={{
                  marginTop: "16px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc2626",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Delete Archived Folder
              </button>
            </SectionCard>

            <ArchiveSection
              title="Objectives"
              theme={theme}
              records={incidentObjectives}
              render={(item) => (
                <>
                  <strong>{item.status || "Status not listed"}:</strong>{" "}
                  {item.text || "No objective text"}
                </>
              )}
            />

            <ArchiveSection
              title="Action Logs"
              theme={theme}
              records={incidentActions}
              render={(item) => (
                <>
                  <strong>{item.status || "Status not listed"}:</strong>{" "}
                  {item.text || "No action text"}
                </>
              )}
            />

            <ArchiveSection
              title="Planning"
              theme={theme}
              records={incidentPlanning}
              render={(item) => (
                <>
                  <strong>{item.status || "Status not listed"}:</strong>{" "}
                  {item.title || item.type || "Planning Record"}
                  <br />
                  Community: {item.community || "Not listed"}
                  <br />
                  Priority: {item.priority || "Not listed"}
                </>
              )}
            />

            <ArchiveSection
              title="Logistics"
              theme={theme}
              records={incidentLogistics}
              render={(item) => (
                <>
                  <strong>{item.status || "Status not listed"}:</strong>{" "}
                  {item.resourceName || "Logistics Resource"}
                  <br />
                  Category: {item.category || "Not listed"}
                  <br />
                  Community: {item.assignedCommunity || "Not listed"}
                </>
              )}
            />

            <ArchiveSection
              title="Finance"
              theme={theme}
              records={incidentFinance}
              render={(item) => (
                <>
                  <strong>{item.approvalStatus || "Status not listed"}:</strong>{" "}
                  {item.description || "Finance Entry"}
                  <br />
                  Amount: {item.amount || "$0"}
                  <br />
                  PO: {item.poNumber || "N/A"} | Invoice:{" "}
                  {item.invoiceNumber || "N/A"}
                </>
              )}
            />

            <ArchiveSection
              title="Evacuations"
              theme={theme}
              records={incidentEvacuations}
              render={(item) => (
                <>
                  <strong>{item.status || "Status not listed"}:</strong>{" "}
                  {item.community || "Community not listed"}
                  <br />
                  Evacuees: {item.evacuees || "0"}
                  <br />
                  Reception Centre: {item.receptionCentre || "Not listed"}
                </>
              )}
            />

            <ArchiveSection
              title="Reception Centres"
              theme={theme}
              records={incidentReception}
              render={(item) => (
                <>
                  <strong>{item.status || "Status not listed"}:</strong>{" "}
                  {item.name || "Reception Centre"}
                  <br />
                  Location: {item.location || "Not listed"}
                  <br />
                  Capacity: {item.evacuees || "0"}/{item.capacity || "0"}
                </>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ArchiveField({ label, value }) {
  return (
    <div style={{ marginBottom: "6px" }}>
      <strong>{label}:</strong> {value || "Not listed"}
    </div>
  );
}

function ArchiveSection({ title, theme, records, render }) {
  return (
    <SectionCard theme={theme}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>

      {records.length === 0 && (
        <div style={{ color: theme.muted }}>No records in this section.</div>
      )}

      {records.map((record) => (
        <div
          key={record.id}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: `1px solid ${theme.border}`,
            background: theme.background,
            marginBottom: "8px",
          }}
        >
          {render(record)}
        </div>
      ))}
    </SectionCard>
  );
}