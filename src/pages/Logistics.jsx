import React from "react";
import { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";

export default function Logistics({ theme }) {
  const [incidents] = useStoredState("serdcIncidents", []);
  const [activeIncidentId] = useStoredState("serdcActiveIncidentId", null);

  const activeIncident = incidents.find(
    (incident) => incident.id === activeIncidentId
  );

  const [resources, setResources] = useStoredState(
    "serdcLogisticsResources",
    []
  );

  const [form, setForm] = useState({
    resourceName: "",
    category: "Personnel",
    status: "Available",
    assignedCommunity: "Regional / Multiple Communities",
    assignedLocation: "",
    assignedTo: "",
    stagingArea: "",
    deploymentStart: "",
    deploymentEnd: "",
    agency: "",
    contact: "",
    quantity: "1",
    notes: "",
  });

  const scopedResources = resources.filter(
    (resource) => resource.incidentId === activeIncidentId
  );

  const activeResources = scopedResources.filter((resource) => !resource.archived);
  const archivedResources = scopedResources.filter((resource) => resource.archived);

  const deployedResources = activeResources.filter(
    (resource) => resource.status === "Assigned" || resource.status === "Deployed"
  );

  const availableResources = activeResources.filter(
    (resource) => resource.status === "Available"
  );

  const mutualAidResources = activeResources.filter(
    (resource) =>
      resource.category === "Mutual Aid" ||
      resource.category === "External Agency"
  );

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }

  function addResource() {
    if (!activeIncidentId) {
      alert("Please create or select an active incident first.");
      return;
    }

    if (!form.resourceName.trim()) return;

    setResources([
      {
        ...form,
        id: Date.now(),
        incidentId: activeIncidentId,
        incidentNumber: activeIncident?.incidentNumber || "",
        archived: false,
        created: new Date().toLocaleString(),
      },
      ...resources,
    ]);

    setForm({
      resourceName: "",
      category: "Personnel",
      status: "Available",
      assignedCommunity: "Regional / Multiple Communities",
      assignedLocation: "",
      assignedTo: "",
      stagingArea: "",
      deploymentStart: "",
      deploymentEnd: "",
      agency: "",
      contact: "",
      quantity: "1",
      notes: "",
    });
  }

  function updateResource(id, updates) {
    setResources(
      resources.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              ...updates,
              updated: new Date().toLocaleString(),
            }
          : resource
      )
    );
  }

  function deleteResource(id) {
    if (!window.confirm("Delete this logistics resource?")) return;

    setResources(resources.filter((resource) => resource.id !== id));
  }

  const statusColours = {
    Available: "#22c55e",
    Assigned: "#eab308",
    Deployed: "#f97316",
    OutOfService: "#dc2626",
    Demobilized: "#64748b",
  };

  if (!activeIncidentId || !activeIncident) {
    return (
      <div style={{ padding: "24px" }}>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Logistics</h2>
          <p style={{ color: theme.muted }}>
            No active incident selected. Go to the Incidents tab and create or
            select an active incident before adding logistics resources.
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
          <h2 style={{ marginTop: 0 }}>Add Logistics Resource</h2>

          <label>Resource Name</label>
          <input
            value={form.resourceName}
            onChange={(e) => updateForm("resourceName", e.target.value)}
            placeholder="Example: Rescue 1"
            style={inputStyle(theme)}
          />

          <label>Category</label>
          <select
            value={form.category}
            onChange={(e) => updateForm("category", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Personnel</option>
            <option>Vehicle</option>
            <option>Equipment</option>
            <option>Heavy Equipment</option>
            <option>Medical</option>
            <option>Communications</option>
            <option>Shelter</option>
            <option>Food Services</option>
            <option>Mutual Aid</option>
            <option>External Agency</option>
            <option>Other</option>
          </select>

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => updateForm("status", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Available</option>
            <option>Assigned</option>
            <option>Deployed</option>
            <option>OutOfService</option>
            <option>Demobilized</option>
          </select>

          <label>Assigned Community</label>
          <select
            value={form.assignedCommunity}
            onChange={(e) => updateForm("assignedCommunity", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Regional / Multiple Communities</option>
            {communities.map((community) => (
              <option key={community.name}>{community.name}</option>
            ))}
          </select>

          <label>Assigned Location</label>
          <input
            value={form.assignedLocation}
            onChange={(e) => updateForm("assignedLocation", e.target.value)}
            placeholder="Example: EOC, Fire Base, Reception Centre"
            style={inputStyle(theme)}
          />

          <label>Assigned To</label>
          <input
            value={form.assignedTo}
            onChange={(e) => updateForm("assignedTo", e.target.value)}
            placeholder="Supervisor or section"
            style={inputStyle(theme)}
          />

          <label>Staging Area</label>
          <input
            value={form.stagingArea}
            onChange={(e) => updateForm("stagingArea", e.target.value)}
            placeholder="Example: Bloodvein Staging Area"
            style={inputStyle(theme)}
          />

          <label>Deployment Start</label>
          <input
            value={form.deploymentStart}
            onChange={(e) => updateForm("deploymentStart", e.target.value)}
            placeholder="Date/time deployed"
            style={inputStyle(theme)}
          />

          <label>Deployment End</label>
          <input
            value={form.deploymentEnd}
            onChange={(e) => updateForm("deploymentEnd", e.target.value)}
            placeholder="Expected demobilization"
            style={inputStyle(theme)}
          />

          <label>Agency / Organization</label>
          <input
            value={form.agency}
            onChange={(e) => updateForm("agency", e.target.value)}
            placeholder="Organization or agency"
            style={inputStyle(theme)}
          />

          <label>Primary Contact</label>
          <input
            value={form.contact}
            onChange={(e) => updateForm("contact", e.target.value)}
            placeholder="Primary contact"
            style={inputStyle(theme)}
          />

          <label>Quantity</label>
          <input
            value={form.quantity}
            onChange={(e) => updateForm("quantity", e.target.value)}
            style={inputStyle(theme)}
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
            onClick={addResource}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#eab308",
              color: "#111827",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Add Logistics Resource
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
            title="Active Resources"
            value={activeResources.length}
            color="#eab308"
            theme={theme}
          />

          <SummaryCard
            title="Available"
            value={availableResources.length}
            color="#22c55e"
            theme={theme}
          />

          <SummaryCard
            title="Assigned / Deployed"
            value={deployedResources.length}
            color="#f97316"
            theme={theme}
          />

          <SummaryCard
            title="Mutual Aid / External"
            value={mutualAidResources.length}
            color="#0ea5e9"
            theme={theme}
          />
        </div>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Logistics Resource Board</h2>

          {activeResources.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active logistics resources for this incident.
            </div>
          )}

          {activeResources.map((resource) => (
            <div
              key={resource.id}
              style={{
                borderLeft: `8px solid ${
                  statusColours[resource.status] || "#eab308"
                }`,
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ color: theme.muted, fontSize: "13px" }}>
                {resource.incidentNumber}
              </div>

              <label>Resource Name</label>
              <input
                value={resource.resourceName || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    resourceName: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Category</label>
              <select
                value={resource.category}
                onChange={(e) =>
                  updateResource(resource.id, {
                    category: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>Personnel</option>
                <option>Vehicle</option>
                <option>Equipment</option>
                <option>Heavy Equipment</option>
                <option>Medical</option>
                <option>Communications</option>
                <option>Shelter</option>
                <option>Food Services</option>
                <option>Mutual Aid</option>
                <option>External Agency</option>
                <option>Other</option>
              </select>

              <label>Status</label>
              <select
                value={resource.status}
                onChange={(e) =>
                  updateResource(resource.id, {
                    status: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>Available</option>
                <option>Assigned</option>
                <option>Deployed</option>
                <option>OutOfService</option>
                <option>Demobilized</option>
              </select>

              <label>Assigned Community</label>
              <select
                value={resource.assignedCommunity}
                onChange={(e) =>
                  updateResource(resource.id, {
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

              <label>Assigned Location</label>
              <input
                value={resource.assignedLocation || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    assignedLocation: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Assigned To</label>
              <input
                value={resource.assignedTo || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    assignedTo: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Staging Area</label>
              <input
                value={resource.stagingArea || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    stagingArea: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Deployment Start</label>
              <input
                value={resource.deploymentStart || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    deploymentStart: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Deployment End</label>
              <input
                value={resource.deploymentEnd || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    deploymentEnd: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Agency / Organization</label>
              <input
                value={resource.agency || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    agency: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Primary Contact</label>
              <input
                value={resource.contact || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    contact: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Quantity</label>
              <input
                value={resource.quantity || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    quantity: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Operational Notes</label>
              <textarea
                value={resource.notes || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    notes: e.target.value,
                  })
                }
                style={{
                  ...inputStyle(theme),
                  minHeight: "100px",
                }}
              />

              <div style={{ color: theme.muted, fontSize: "13px" }}>
                Created: {resource.created || "Not listed"}
                {resource.updated && <> | Updated: {resource.updated}</>}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() =>
                    updateResource(resource.id, {
                      archived: true,
                    })
                  }
                  style={secondaryButton("#475569")}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteResource(resource.id)}
                  style={secondaryButton("#dc2626")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        {archivedResources.length > 0 && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archived Logistics Resources</h2>

            {archivedResources.map((resource) => (
              <div key={resource.id} style={archivedCard(theme)}>
                <strong>{resource.resourceName}</strong>
                <br />
                Status: {resource.status}
                <br />
                Community: {resource.assignedCommunity}
                <br />
                Incident: {resource.incidentNumber}

                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() =>
                      updateResource(resource.id, {
                        archived: false,
                      })
                    }
                    style={secondaryButton("#475569")}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => deleteResource(resource.id)}
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