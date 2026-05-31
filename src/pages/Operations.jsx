import React from "react";
import { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";

export default function Operations({ theme }) {
  const [incidents] = useStoredState("serdcIncidents", []);
  const [activeIncidentId] = useStoredState("serdcActiveIncidentId", null);

  const activeIncident = incidents.find(
    (incident) => incident.id === activeIncidentId
  );

  const [incidentObjectives, setIncidentObjectives] = useStoredState(
    "serdcIncidentObjectives",
    []
  );

  const [actionLog, setActionLog] = useStoredState("serdcActionLog", []);

  const [newObjective, setNewObjective] = useState("");
  const [newAction, setNewAction] = useState("");

  const scopedObjectives = incidentObjectives.filter(
    (objective) => objective.incidentId === activeIncidentId
  );

  const scopedActions = actionLog.filter(
    (entry) => entry.incidentId === activeIncidentId
  );

  const activeObjectives = scopedObjectives.filter(
    (objective) => !objective.archived
  );

  const archivedObjectives = scopedObjectives.filter(
    (objective) => objective.archived
  );

  const activeActions = scopedActions.filter((entry) => !entry.archived);
  const archivedActions = scopedActions.filter((entry) => entry.archived);

  function addObjective() {
    if (!activeIncidentId) {
      alert("Please create or select an active incident first.");
      return;
    }

    if (!newObjective.trim()) return;

    setIncidentObjectives([
      {
        id: Date.now(),
        incidentId: activeIncidentId,
        incidentNumber: activeIncident?.incidentNumber || "",
        text: newObjective,
        status: "Active",
        archived: false,
        created: new Date().toLocaleString(),
      },
      ...incidentObjectives,
    ]);

    setNewObjective("");
  }

  function addAction() {
    if (!activeIncidentId) {
      alert("Please create or select an active incident first.");
      return;
    }

    if (!newAction.trim()) return;

    setActionLog([
      {
        id: Date.now(),
        incidentId: activeIncidentId,
        incidentNumber: activeIncident?.incidentNumber || "",
        text: newAction,
        status: "Open",
        archived: false,
        time: new Date().toLocaleTimeString(),
        created: new Date().toLocaleString(),
      },
      ...actionLog,
    ]);

    setNewAction("");
  }

  function updateObjective(id, updates) {
    setIncidentObjectives(
      incidentObjectives.map((objective) =>
        objective.id === id
          ? {
              ...objective,
              ...updates,
              updated: new Date().toLocaleString(),
            }
          : objective
      )
    );
  }

  function updateAction(id, updates) {
    setActionLog(
      actionLog.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              ...updates,
              updated: new Date().toLocaleString(),
            }
          : entry
      )
    );
  }

  function deleteObjective(id) {
    if (!window.confirm("Delete this incident objective?")) return;

    setIncidentObjectives(
      incidentObjectives.filter((objective) => objective.id !== id)
    );
  }

  function deleteAction(id) {
    if (!window.confirm("Delete this action log entry?")) return;

    setActionLog(actionLog.filter((entry) => entry.id !== id));
  }

  if (!activeIncidentId || !activeIncident) {
    return (
      <div style={{ padding: "24px" }}>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Operations</h2>
          <p style={{ color: theme.muted }}>
            No active incident selected. Go to the Incidents tab and create or
            select an active incident before adding operational records.
          </p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        display: "grid",
        gridTemplateColumns: "420px 1fr",
        gap: "20px",
      }}
    >
      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Active Incident</h2>

          <div>
            <strong>{activeIncident.incidentNumber}</strong>
          </div>

          <div>{activeIncident.name}</div>

          <div style={{ color: theme.muted, marginTop: "6px" }}>
            Operational Period:{" "}
            {activeIncident.operationalPeriod || "Not set"}
          </div>
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Add Incident Objective</h2>

          <textarea
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder="Enter incident objective..."
            style={textareaStyle(theme)}
          />

          <button onClick={addObjective} style={primaryButton(theme)}>
            Add Objective
          </button>
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Add Action Log Entry</h2>

          <textarea
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="Enter operational action..."
            style={textareaStyle(theme)}
          />

          <button onClick={addAction} style={accentButton(theme)}>
            Add Action Log Entry
          </button>
        </SectionCard>
      </div>

      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Incident Objectives Board</h2>

          {activeObjectives.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active objectives for this incident.
            </div>
          )}

          {activeObjectives.map((objective) => (
            <div key={objective.id} style={recordCard(theme)}>
              <div style={{ color: theme.muted, fontSize: "13px" }}>
                {objective.incidentNumber}
              </div>

              <textarea
                value={objective.text}
                onChange={(e) =>
                  updateObjective(objective.id, {
                    text: e.target.value,
                  })
                }
                style={{
                  ...textareaStyle(theme),
                  minHeight: "80px",
                }}
              />

              <label>Status</label>
              <select
                value={objective.status || "Active"}
                onChange={(e) =>
                  updateObjective(objective.id, {
                    status: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>Active</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Deferred</option>
              </select>

              <div style={{ color: theme.muted, fontSize: "13px" }}>
                Created: {objective.created || "Not listed"}
                {objective.updated && <> | Updated: {objective.updated}</>}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() =>
                    updateObjective(objective.id, { archived: true })
                  }
                  style={secondaryButton()}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteObjective(objective.id)}
                  style={dangerButton()}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Operational Action Log</h2>

          {activeActions.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active action log entries for this incident.
            </div>
          )}

          {activeActions.map((entry) => (
            <div key={entry.id} style={recordCard(theme)}>
              <div style={{ color: theme.muted, fontSize: "13px" }}>
                {entry.incidentNumber}
              </div>

              <textarea
                value={entry.text}
                onChange={(e) =>
                  updateAction(entry.id, {
                    text: e.target.value,
                  })
                }
                style={{
                  ...textareaStyle(theme),
                  minHeight: "80px",
                }}
              />

              <label>Status</label>
              <select
                value={entry.status || "Open"}
                onChange={(e) =>
                  updateAction(entry.id, {
                    status: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Deferred</option>
              </select>

              <div style={{ color: theme.muted, fontSize: "13px" }}>
                Created: {entry.created || entry.time || "Not listed"}
                {entry.updated && <> | Updated: {entry.updated}</>}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => updateAction(entry.id, { archived: true })}
                  style={secondaryButton()}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteAction(entry.id)}
                  style={dangerButton()}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        {(archivedObjectives.length > 0 || archivedActions.length > 0) && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archived Operations</h2>

            {archivedObjectives.map((objective) => (
              <div key={objective.id} style={archivedCard(theme)}>
                <strong>Objective:</strong> {objective.text}
                <br />
                <strong>Status:</strong> {objective.status}
                <br />
                <button
                  onClick={() =>
                    updateObjective(objective.id, { archived: false })
                  }
                  style={secondaryButton()}
                >
                  Restore
                </button>

                <button
                  onClick={() => deleteObjective(objective.id)}
                  style={dangerButton()}
                >
                  Delete
                </button>
              </div>
            ))}

            {archivedActions.map((entry) => (
              <div key={entry.id} style={archivedCard(theme)}>
                <strong>Action:</strong> {entry.text}
                <br />
                <strong>Status:</strong> {entry.status}
                <br />
                <button
                  onClick={() => updateAction(entry.id, { archived: false })}
                  style={secondaryButton()}
                >
                  Restore
                </button>

                <button
                  onClick={() => deleteAction(entry.id)}
                  style={dangerButton()}
                >
                  Delete
                </button>
              </div>
            ))}
          </SectionCard>
        )}
      </div>
    </div>
  );
}

function inputStyle(theme) {
  return {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    marginTop: "5px",
    marginBottom: "12px",
    boxSizing: "border-box",
  };
}

function textareaStyle(theme) {
  return {
    ...inputStyle(theme),
    minHeight: "110px",
    resize: "vertical",
  };
}

function primaryButton(theme) {
  return {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#dc2626",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  };
}

function accentButton(theme) {
  return {
    ...primaryButton(theme),
    background: "#b91c1c",
  };
}

function secondaryButton() {
  return {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "none",
    background: "#475569",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "8px",
    marginTop: "8px",
  };
}

function dangerButton() {
  return {
    ...secondaryButton(),
    background: "#dc2626",
  };
}

function recordCard(theme) {
  return {
    padding: "12px",
    borderRadius: "10px",
    background: theme.background,
    marginBottom: "12px",
    border: `1px solid ${theme.border}`,
    borderLeft: "8px solid #dc2626",
  };
}

function archivedCard(theme) {
  return {
    padding: "12px",
    borderRadius: "10px",
    background: theme.background,
    marginBottom: "12px",
    border: `1px dashed ${theme.border}`,
    opacity: 0.85,
  };
}