import React from "react";
import { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";

const communityPrefixes = {
  "Brokenhead Ojibway Nation": "BON",
  "Black River First Nation": "BLKRVR",
  "Hollow Water First Nation": "HW",
  "Bloodvein River First Nation": "BVFN",
  "Berens River First Nation": "BER",
  "Poplar River First Nation": "POP",
  "Pauingassi First Nation": "PAU",
  "Little Grand Rapids First Nation": "LGR",
  "Regional / Multiple Communities": "SERDC",
};

const incidentTypePrefixes = {
  Wildfire: "WF",
  Flood: "FLOOD",
  "Severe Weather": "WX",
  "Power Outage": "POWER",
  Evacuation: "EVAC",
  "Infrastructure Failure": "INFRA",
  "Public Health": "PH",
  "Search and Rescue": "SAR",
  Other: "OTHER",
};

export default function Incidents({ theme }) {
  const [incidents, setIncidents] = useStoredState("serdcIncidents", []);
  const [activeIncidentId, setActiveIncidentId] = useStoredState(
    "serdcActiveIncidentId",
    null
  );

  const [form, setForm] = useState({
    name: "",
    type: "Wildfire",
    status: "Monitoring",
    priority: "Medium",
    leadCommunity: "Regional / Multiple Communities",
    leadAgency: "",
    incidentCommander: "",
    operationalPeriod: "",
    startDate: new Date().toLocaleDateString("en-CA"),
    notes: "",
  });

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }

  function generateIncidentNumber(type, leadCommunity) {
    const year = new Date().getFullYear();

    const communityPrefix =
      communityPrefixes[leadCommunity] || "SERDC";

    const typePrefix = incidentTypePrefixes[type] || "OTHER";

    const existingSameSeries = incidents.filter((incident) => {
      const expectedStart = `${communityPrefix}-${typePrefix}-${year}-`;
      return incident.incidentNumber?.startsWith(expectedStart);
    });

    const sequence = String(existingSameSeries.length + 1).padStart(3, "0");

    return `${communityPrefix}-${typePrefix}-${year}-${sequence}`;
  }

  function addIncident() {
    if (!form.name.trim()) return;

    const incidentNumber = generateIncidentNumber(
      form.type,
      form.leadCommunity
    );

    const newIncident = {
      ...form,
      incidentNumber,
      id: Date.now(),
      archived: false,
      created: new Date().toLocaleString(),
    };

    setIncidents([newIncident, ...incidents]);
    setActiveIncidentId(newIncident.id);

    setForm({
      name: "",
      type: "Wildfire",
      status: "Monitoring",
      priority: "Medium",
      leadCommunity: "Regional / Multiple Communities",
      leadAgency: "",
      incidentCommander: "",
      operationalPeriod: "",
      startDate: new Date().toLocaleDateString("en-CA"),
      notes: "",
    });
  }

  function updateIncident(id, updates) {
    setIncidents(
      incidents.map((incident) =>
        incident.id === id
          ? {
              ...incident,
              ...updates,
              updated: new Date().toLocaleString(),
            }
          : incident
      )
    );
  }

  function deleteIncident(id) {
    if (!window.confirm("Delete this incident?")) return;

    const updated = incidents.filter((incident) => incident.id !== id);
    setIncidents(updated);

    if (activeIncidentId === id) {
      setActiveIncidentId(updated[0]?.id || null);
    }
  }

  const activeIncidents = incidents.filter((incident) => !incident.archived);
  const archivedIncidents = incidents.filter((incident) => incident.archived);

  const selectedIncident = incidents.find(
    (incident) => incident.id === activeIncidentId
  );

  const statusColours = {
    Monitoring: "#2563eb",
    Active: "#dc2626",
    "Enhanced Monitoring": "#f97316",
    Stabilizing: "#eab308",
    Closed: "#6b7280",
  };

  const priorityColours = {
    Low: "#22c55e",
    Medium: "#eab308",
    High: "#f97316",
    Critical: "#dc2626",
  };

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
          <h2 style={{ marginTop: 0 }}>Create Incident</h2>

          <label>Incident Name</label>
          <input
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Example: 2026 Wildfire Season"
            style={inputStyle(theme)}
          />

          <label>Incident Type</label>
          <select
            value={form.type}
            onChange={(e) => updateForm("type", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Wildfire</option>
            <option>Flood</option>
            <option>Severe Weather</option>
            <option>Power Outage</option>
            <option>Evacuation</option>
            <option>Infrastructure Failure</option>
            <option>Public Health</option>
            <option>Search and Rescue</option>
            <option>Other</option>
          </select>

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => updateForm("status", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Monitoring</option>
            <option>Enhanced Monitoring</option>
            <option>Active</option>
            <option>Stabilizing</option>
            <option>Closed</option>
          </select>

          <label>Priority</label>
          <select
            value={form.priority}
            onChange={(e) => updateForm("priority", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <label>Lead Community</label>
          <select
            value={form.leadCommunity}
            onChange={(e) => updateForm("leadCommunity", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Regional / Multiple Communities</option>
            {communities.map((community) => (
              <option key={community.name}>{community.name}</option>
            ))}
          </select>

          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: theme.background,
              border: `1px solid ${theme.border}`,
              color: theme.muted,
              marginBottom: "12px",
            }}
          >
            Incident number will be generated as:
            <br />
            <strong>
              {generateIncidentNumber(form.type, form.leadCommunity)}
            </strong>
          </div>

          <label>Lead Agency</label>
          <input
            value={form.leadAgency}
            onChange={(e) => updateForm("leadAgency", e.target.value)}
            placeholder="Example: SERDC, Community EOC, Manitoba EMO"
            style={inputStyle(theme)}
          />

          <label>Incident Commander / Lead</label>
          <input
            value={form.incidentCommander}
            onChange={(e) =>
              updateForm("incidentCommander", e.target.value)
            }
            placeholder="Incident lead or coordinator"
            style={inputStyle(theme)}
          />

          <label>Operational Period</label>
          <input
            value={form.operationalPeriod}
            onChange={(e) => updateForm("operationalPeriod", e.target.value)}
            placeholder="Example: OP 1, May 24 0800-2000"
            style={inputStyle(theme)}
          />

          <label>Start Date</label>
          <input
            value={form.startDate}
            onChange={(e) => updateForm("startDate", e.target.value)}
            style={inputStyle(theme)}
          />

          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            placeholder="Incident notes..."
            style={{
              ...inputStyle(theme),
              minHeight: "110px",
            }}
          />

          <button
            onClick={addIncident}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#16a34a",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Create Incident
          </button>
        </SectionCard>
      </div>

      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Active Incident</h2>

          {activeIncidents.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active incidents created.
            </div>
          )}

          {activeIncidents.length > 0 && (
            <>
              <label>Select Active Incident</label>
              <select
                value={activeIncidentId || ""}
                onChange={(e) =>
                  setActiveIncidentId(Number(e.target.value))
                }
                style={inputStyle(theme)}
              >
                {activeIncidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.incidentNumber || "NO-ID"} | {incident.name}
                  </option>
                ))}
              </select>

              {selectedIncident && (
                <div
                  style={{
                    borderLeft: `8px solid ${
                      priorityColours[selectedIncident.priority] || "#16a34a"
                    }`,
                    background: theme.background,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "10px",
                    padding: "12px",
                    marginTop: "12px",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>
                    {selectedIncident.name}
                  </h3>

                  <div>
                    <strong>Incident Number:</strong>{" "}
                    {selectedIncident.incidentNumber || "Not assigned"}
                  </div>

                  <div>
                    <strong>Type:</strong> {selectedIncident.type}
                  </div>

                  <div>
                    <strong>Status:</strong> {selectedIncident.status}
                  </div>

                  <div>
                    <strong>Priority:</strong> {selectedIncident.priority}
                  </div>

                  <div>
                    <strong>Lead Community:</strong>{" "}
                    {selectedIncident.leadCommunity}
                  </div>

                  <div>
                    <strong>Lead Agency:</strong>{" "}
                    {selectedIncident.leadAgency || "Not listed"}
                  </div>

                  <div>
                    <strong>Incident Lead:</strong>{" "}
                    {selectedIncident.incidentCommander || "Not listed"}
                  </div>

                  <div>
                    <strong>Operational Period:</strong>{" "}
                    {selectedIncident.operationalPeriod || "Not set"}
                  </div>

                  <div>
                    <strong>Start Date:</strong>{" "}
                    {selectedIncident.startDate || "Not listed"}
                  </div>
                </div>
              )}
            </>
          )}
        </SectionCard>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Incident Board</h2>

          {activeIncidents.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active incidents.
            </div>
          )}

          {activeIncidents.map((incident) => (
            <div
              key={incident.id}
              style={{
                borderLeft: `8px solid ${
                  statusColours[incident.status] || "#16a34a"
                }`,
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "12px",
              }}
            >
              <label>Incident Number</label>
              <input
                value={incident.incidentNumber || ""}
                onChange={(e) =>
                  updateIncident(incident.id, {
                    incidentNumber: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Incident Name</label>
              <input
                value={incident.name || ""}
                onChange={(e) =>
                  updateIncident(incident.id, { name: e.target.value })
                }
                style={inputStyle(theme)}
              />

              <label>Status</label>
              <select
                value={incident.status}
                onChange={(e) =>
                  updateIncident(incident.id, { status: e.target.value })
                }
                style={inputStyle(theme)}
              >
                <option>Monitoring</option>
                <option>Enhanced Monitoring</option>
                <option>Active</option>
                <option>Stabilizing</option>
                <option>Closed</option>
              </select>

              <label>Priority</label>
              <select
                value={incident.priority}
                onChange={(e) =>
                  updateIncident(incident.id, { priority: e.target.value })
                }
                style={inputStyle(theme)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <label>Operational Period</label>
              <input
                value={incident.operationalPeriod || ""}
                onChange={(e) =>
                  updateIncident(incident.id, {
                    operationalPeriod: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Notes</label>
              <textarea
                value={incident.notes || ""}
                onChange={(e) =>
                  updateIncident(incident.id, { notes: e.target.value })
                }
                style={{
                  ...inputStyle(theme),
                  minHeight: "90px",
                }}
              />

              <div style={{ color: theme.muted, fontSize: "13px" }}>
                Created: {incident.created || "Not listed"}
                {incident.updated && <> | Updated: {incident.updated}</>}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => setActiveIncidentId(incident.id)}
                  style={secondaryButton("#16a34a")}
                >
                  Set Active
                </button>

                <button
                  onClick={() =>
                    updateIncident(incident.id, { archived: true })
                  }
                  style={secondaryButton("#475569")}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteIncident(incident.id)}
                  style={secondaryButton("#dc2626")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        {archivedIncidents.length > 0 && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archived Incidents</h2>

            {archivedIncidents.map((incident) => (
              <div
                key={incident.id}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: theme.background,
                  marginBottom: "12px",
                  border: `1px dashed ${theme.border}`,
                  opacity: 0.85,
                }}
              >
                <strong>
                  {incident.incidentNumber || "NO-ID"} | {incident.name}
                </strong>
                <br />
                Status: {incident.status}
                <br />
                Priority: {incident.priority}

                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() =>
                      updateIncident(incident.id, { archived: false })
                    }
                    style={secondaryButton("#475569")}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => deleteIncident(incident.id)}
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