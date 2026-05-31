import React from "react";
import { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";

export default function Evacuation({ theme }) {
  const [incidents] = useStoredState("serdcIncidents", []);
  const [activeIncidentId] = useStoredState("serdcActiveIncidentId", null);

  const activeIncident = incidents.find(
    (incident) => incident.id === activeIncidentId
  );

  const [evacuations, setEvacuations] = useStoredState(
    "serdcEvacuations",
    []
  );

  const [form, setForm] = useState({
    community: "Poplar River First Nation",
    status: "Monitoring",
    evacuees: "",
    priorityEvacuees: "",
    transportation: "",
    receptionCentre: "",
    leadAgency: "",
    notes: "",
  });

  const scopedRecords = evacuations.filter(
    (record) => record.incidentId === activeIncidentId
  );

  const activeRecords = scopedRecords.filter((record) => !record.archived);
  const archivedRecords = scopedRecords.filter((record) => record.archived);

  const latestByCommunity = communities
    .map((community) => {
      const latest = activeRecords.find(
        (record) => record.community === community.name
      );

      if (!latest) return null;
      return latest;
    })
    .filter(Boolean);

  function updateForm(field, value) {
    setForm({
      ...form,
      [field]: value,
    });
  }

  function addEvacuationRecord() {
    if (!activeIncidentId) {
      alert("Please create or select an active incident first.");
      return;
    }

    setEvacuations([
      {
        ...form,
        id: Date.now(),
        incidentId: activeIncidentId,
        incidentNumber: activeIncident?.incidentNumber || "",
        archived: false,
        created: new Date().toLocaleString(),
      },
      ...evacuations,
    ]);

    setForm({
      community: "Poplar River First Nation",
      status: "Monitoring",
      evacuees: "",
      priorityEvacuees: "",
      transportation: "",
      receptionCentre: "",
      leadAgency: "",
      notes: "",
    });
  }

  function updateRecord(id, updates) {
    setEvacuations(
      evacuations.map((record) =>
        record.id === id
          ? {
              ...record,
              ...updates,
              updated: new Date().toLocaleString(),
            }
          : record
      )
    );
  }

  function deleteRecord(id) {
    if (!window.confirm("Delete this evacuation record?")) return;

    setEvacuations(evacuations.filter((record) => record.id !== id));
  }

  const statusColours = {
    Normal: "#22c55e",
    Monitoring: "#9333ea",
    Preparedness: "#facc15",
    "Partial Evacuation": "#f97316",
    "Full Evacuation": "#dc2626",
    "Re-entry": "#0ea5e9",
  };

  if (!activeIncidentId || !activeIncident) {
    return (
      <div style={{ padding: "24px" }}>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Evacuation</h2>
          <p style={{ color: theme.muted }}>
            No active incident selected. Go to the Incidents tab and create or
            select an active incident before adding evacuation records.
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
            Operational Period: {activeIncident.operationalPeriod || "Not set"}
          </div>
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Add Evacuation Update</h2>

          <label>Community</label>
          <select
            value={form.community}
            onChange={(e) => updateForm("community", e.target.value)}
            style={inputStyle(theme)}
          >
            {communities.map((community) => (
              <option key={community.name}>{community.name}</option>
            ))}
          </select>

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => updateForm("status", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Monitoring</option>
            <option>Preparedness</option>
            <option>Partial Evacuation</option>
            <option>Full Evacuation</option>
            <option>Re-entry</option>
            <option>Normal</option>
          </select>

          <label>Total Evacuees</label>
          <input
            value={form.evacuees}
            onChange={(e) => updateForm("evacuees", e.target.value)}
            placeholder="Example: 125"
            style={inputStyle(theme)}
          />

          <label>Priority Evacuees</label>
          <input
            value={form.priorityEvacuees}
            onChange={(e) =>
              updateForm("priorityEvacuees", e.target.value)
            }
            placeholder="Example: 12 medical, 8 elders"
            style={inputStyle(theme)}
          />

          <label>Transportation</label>
          <input
            value={form.transportation}
            onChange={(e) => updateForm("transportation", e.target.value)}
            placeholder="Example: 2 buses requested"
            style={inputStyle(theme)}
          />

          <label>Reception Centre</label>
          <input
            value={form.receptionCentre}
            onChange={(e) => updateForm("receptionCentre", e.target.value)}
            placeholder="Example: Winnipeg Reception Centre"
            style={inputStyle(theme)}
          />

          <label>Lead Agency</label>
          <input
            value={form.leadAgency}
            onChange={(e) => updateForm("leadAgency", e.target.value)}
            placeholder="Example: CRC, ISC, Community EM Coordinator"
            style={inputStyle(theme)}
          />

          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            placeholder="Enter evacuation notes..."
            style={{
              ...inputStyle(theme),
              minHeight: "110px",
            }}
          />

          <button
            onClick={addEvacuationRecord}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#ea580c",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Add Evacuation Update
          </button>
        </SectionCard>
      </div>

      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Community Evacuation Status</h2>

          {latestByCommunity.length === 0 && (
            <div style={{ color: theme.muted }}>
              No communities are currently listed as evacuating or being
              monitored for this incident.
            </div>
          )}

          {latestByCommunity.map((record) => (
            <div
              key={record.id}
              style={{
                borderLeft: `8px solid ${
                  statusColours[record.status] || "#ea580c"
                }`,
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ color: theme.muted, fontSize: "13px" }}>
                {record.incidentNumber}
              </div>

              <strong>{record.community}</strong>

              <label>Status</label>
              <select
                value={record.status}
                onChange={(e) =>
                  updateRecord(record.id, { status: e.target.value })
                }
                style={inputStyle(theme)}
              >
                <option>Monitoring</option>
                <option>Preparedness</option>
                <option>Partial Evacuation</option>
                <option>Full Evacuation</option>
                <option>Re-entry</option>
                <option>Normal</option>
              </select>

              <label>Total Evacuees</label>
              <input
                value={record.evacuees || ""}
                onChange={(e) =>
                  updateRecord(record.id, { evacuees: e.target.value })
                }
                style={inputStyle(theme)}
              />

              <label>Priority Evacuees</label>
              <input
                value={record.priorityEvacuees || ""}
                onChange={(e) =>
                  updateRecord(record.id, {
                    priorityEvacuees: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Transportation</label>
              <input
                value={record.transportation || ""}
                onChange={(e) =>
                  updateRecord(record.id, {
                    transportation: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Reception Centre</label>
              <input
                value={record.receptionCentre || ""}
                onChange={(e) =>
                  updateRecord(record.id, {
                    receptionCentre: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Lead Agency</label>
              <input
                value={record.leadAgency || ""}
                onChange={(e) =>
                  updateRecord(record.id, {
                    leadAgency: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Notes</label>
              <textarea
                value={record.notes || ""}
                onChange={(e) =>
                  updateRecord(record.id, { notes: e.target.value })
                }
                style={{
                  ...inputStyle(theme),
                  minHeight: "90px",
                }}
              />

              <div style={{ color: theme.muted, fontSize: "13px" }}>
                Created: {record.created || "Not listed"}
                {record.updated && <> | Updated: {record.updated}</>}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => updateRecord(record.id, { archived: true })}
                  style={secondaryButton("#475569")}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteRecord(record.id)}
                  style={secondaryButton("#dc2626")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        {archivedRecords.length > 0 && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archived Evacuation Records</h2>

            {archivedRecords.map((record) => (
              <div key={record.id} style={archivedCard(theme)}>
                <strong>{record.community}</strong>
                <br />
                Incident: {record.incidentNumber}
                <br />
                Status: {record.status}
                <br />
                Evacuees: {record.evacuees || "0"}

                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() =>
                      updateRecord(record.id, { archived: false })
                    }
                    style={secondaryButton("#475569")}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => deleteRecord(record.id)}
                    style={secondaryButton("#dc2626")}
                  >
                    Delete
                  </button>
                </div>
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

function secondaryButton(background) {
  return {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "none",
    background,
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "8px",
    marginTop: "8px",
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