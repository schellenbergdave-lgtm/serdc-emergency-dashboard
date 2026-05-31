import React from "react";
import { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";

export default function ReceptionCenter({ theme }) {
  const [incidents] = useStoredState("serdcIncidents", []);
  const [activeIncidentId] = useStoredState("serdcActiveIncidentId", null);

  const activeIncident = incidents.find(
    (incident) => incident.id === activeIncidentId
  );

  const [centres, setCentres] = useStoredState("serdcReceptionCentres", []);

  const [form, setForm] = useState({
    name: "",
    location: "",
    status: "Standby",
    assignedCommunity: "Regional / Multiple Communities",
    capacity: "",
    evacuees: "",
    leadAgency: "",
    contact: "",
    services: "",
    notes: "",
  });

  const scopedCentres = centres.filter(
    (centre) => centre.incidentId === activeIncidentId
  );

  const activeCentres = scopedCentres.filter((centre) => !centre.archived);
  const archivedCentres = scopedCentres.filter((centre) => centre.archived);

  const totalCapacity = activeCentres.reduce(
    (total, centre) => total + (Number(centre.capacity) || 0),
    0
  );

  const totalEvacuees = activeCentres.reduce(
    (total, centre) => total + (Number(centre.evacuees) || 0),
    0
  );

  const statusColours = {
    Standby: "#64748b",
    Opening: "#facc15",
    Open: "#22c55e",
    "Near Capacity": "#f97316",
    Full: "#dc2626",
    Closed: "#475569",
  };

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }

  function addCentre() {
    if (!activeIncidentId) {
      alert("Please create or select an active incident first.");
      return;
    }

    if (!form.name.trim()) return;

    setCentres([
      {
        ...form,
        id: Date.now(),
        incidentId: activeIncidentId,
        incidentNumber: activeIncident?.incidentNumber || "",
        archived: false,
        created: new Date().toLocaleString(),
      },
      ...centres,
    ]);

    setForm({
      name: "",
      location: "",
      status: "Standby",
      assignedCommunity: "Regional / Multiple Communities",
      capacity: "",
      evacuees: "",
      leadAgency: "",
      contact: "",
      services: "",
      notes: "",
    });
  }

  function updateCentre(id, updates) {
    setCentres(
      centres.map((centre) =>
        centre.id === id
          ? {
              ...centre,
              ...updates,
              updated: new Date().toLocaleString(),
            }
          : centre
      )
    );
  }

  function deleteCentre(id) {
    if (!window.confirm("Delete this reception centre?")) return;

    setCentres(centres.filter((centre) => centre.id !== id));
  }

  if (!activeIncidentId || !activeIncident) {
    return (
      <div style={{ padding: "24px" }}>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Reception Centre</h2>
          <p style={{ color: theme.muted }}>
            No active incident selected. Go to the Incidents tab and create or
            select an active incident before adding reception centre records.
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
          <h2 style={{ marginTop: 0 }}>Add Reception Centre</h2>

          <label>Reception Centre Name</label>
          <input
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Example: Winnipeg Reception Centre"
            style={inputStyle(theme)}
          />

          <label>Location</label>
          <input
            value={form.location}
            onChange={(e) => updateForm("location", e.target.value)}
            placeholder="Address or location"
            style={inputStyle(theme)}
          />

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => updateForm("status", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Standby</option>
            <option>Opening</option>
            <option>Open</option>
            <option>Near Capacity</option>
            <option>Full</option>
            <option>Closed</option>
          </select>

          <label>Assigned Community</label>
          <select
            value={form.assignedCommunity}
            onChange={(e) =>
              updateForm("assignedCommunity", e.target.value)
            }
            style={inputStyle(theme)}
          >
            <option>Regional / Multiple Communities</option>
            {communities.map((community) => (
              <option key={community.name}>{community.name}</option>
            ))}
          </select>

          <label>Capacity</label>
          <input
            value={form.capacity}
            onChange={(e) => updateForm("capacity", e.target.value)}
            placeholder="Maximum capacity"
            style={inputStyle(theme)}
          />

          <label>Current Evacuees</label>
          <input
            value={form.evacuees}
            onChange={(e) => updateForm("evacuees", e.target.value)}
            placeholder="Current evacuee count"
            style={inputStyle(theme)}
          />

          <label>Lead Agency</label>
          <input
            value={form.leadAgency}
            onChange={(e) => updateForm("leadAgency", e.target.value)}
            placeholder="Lead agency or organization"
            style={inputStyle(theme)}
          />

          <label>Primary Contact</label>
          <input
            value={form.contact}
            onChange={(e) => updateForm("contact", e.target.value)}
            placeholder="Reception centre contact"
            style={inputStyle(theme)}
          />

          <label>Services Available</label>
          <textarea
            value={form.services}
            onChange={(e) => updateForm("services", e.target.value)}
            placeholder="Food, shelter, health, security, registration, etc."
            style={{
              ...inputStyle(theme),
              minHeight: "90px",
            }}
          />

          <label>Operational Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            placeholder="Operational notes..."
            style={{
              ...inputStyle(theme),
              minHeight: "100px",
            }}
          />

          <button
            onClick={addCentre}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#9333ea",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Add Reception Centre
          </button>
        </SectionCard>
      </div>

      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <SummaryCard
            title="Active Centres"
            value={activeCentres.length}
            color="#9333ea"
            theme={theme}
          />

          <SummaryCard
            title="Total Capacity"
            value={totalCapacity}
            color="#22c55e"
            theme={theme}
          />

          <SummaryCard
            title="Current Evacuees"
            value={totalEvacuees}
            color="#f97316"
            theme={theme}
          />

          <SummaryCard
            title="Available Space"
            value={totalCapacity - totalEvacuees}
            color="#0ea5e9"
            theme={theme}
          />
        </div>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Reception Centre Board</h2>

          {activeCentres.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active reception centres for this incident.
            </div>
          )}

          {activeCentres.map((centre) => (
            <div
              key={centre.id}
              style={{
                borderLeft: `8px solid ${
                  statusColours[centre.status] || "#9333ea"
                }`,
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ color: theme.muted, fontSize: "13px" }}>
                {centre.incidentNumber}
              </div>

              <label>Reception Centre Name</label>
              <input
                value={centre.name || ""}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    name: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Location</label>
              <input
                value={centre.location || ""}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    location: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Status</label>
              <select
                value={centre.status}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    status: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>Standby</option>
                <option>Opening</option>
                <option>Open</option>
                <option>Near Capacity</option>
                <option>Full</option>
                <option>Closed</option>
              </select>

              <label>Assigned Community</label>
              <select
                value={centre.assignedCommunity}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    assignedCommunity: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>Regional / Multiple Communities</option>
                {communities.map((community) => (
                  <option key={community.name}>{community.name}</option>
                ))}
              </select>

              <label>Capacity</label>
              <input
                value={centre.capacity || ""}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    capacity: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Current Evacuees</label>
              <input
                value={centre.evacuees || ""}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    evacuees: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Lead Agency</label>
              <input
                value={centre.leadAgency || ""}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    leadAgency: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Primary Contact</label>
              <input
                value={centre.contact || ""}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    contact: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Services Available</label>
              <textarea
                value={centre.services || ""}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    services: e.target.value,
                  })
                }
                style={{
                  ...inputStyle(theme),
                  minHeight: "90px",
                }}
              />

              <label>Operational Notes</label>
              <textarea
                value={centre.notes || ""}
                onChange={(e) =>
                  updateCentre(centre.id, {
                    notes: e.target.value,
                  })
                }
                style={{
                  ...inputStyle(theme),
                  minHeight: "100px",
                }}
              />

              <div style={{ color: theme.muted, fontSize: "13px" }}>
                Created: {centre.created || "Not listed"}
                {centre.updated && <> | Updated: {centre.updated}</>}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() =>
                    updateCentre(centre.id, {
                      archived: true,
                    })
                  }
                  style={secondaryButton("#475569")}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteCentre(centre.id)}
                  style={secondaryButton("#dc2626")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        {archivedCentres.length > 0 && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archived Reception Centres</h2>

            {archivedCentres.map((centre) => (
              <div key={centre.id} style={archivedCard(theme)}>
                <strong>{centre.name}</strong>
                <br />
                Incident: {centre.incidentNumber}
                <br />
                Status: {centre.status}
                <br />
                Assigned Community: {centre.assignedCommunity}

                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() =>
                      updateCentre(centre.id, {
                        archived: false,
                      })
                    }
                    style={secondaryButton("#475569")}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => deleteCentre(centre.id)}
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

function SummaryCard({ title, value, theme, color }) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderLeft: `8px solid ${color}`,
        borderRadius: "12px",
        padding: "14px",
      }}
    >
      <div style={{ color: theme.muted, fontSize: "13px" }}>{title}</div>
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</div>
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