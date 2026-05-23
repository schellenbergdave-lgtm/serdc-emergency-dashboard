import React from "react";
import { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";

export default function Resources({ theme }) {
  const [resources, setResources] = useStoredState("serdcResources", []);

  const [form, setForm] = useState({
    category: "Crew",
    name: "",
    community: "Poplar River First Nation",
    status: "Available",
    quantity: "",
    notes: "",
  });

  function updateForm(field, value) {
    setForm({
      ...form,
      [field]: value,
    });
  }

  function addResource() {
    if (!form.name.trim() && !form.notes.trim()) return;

    setResources([
      {
        ...form,
        id: Date.now(),
        archived: false,
        created: new Date().toLocaleString(),
      },
      ...resources,
    ]);

    setForm({
      category: "Crew",
      name: "",
      community: "Poplar River First Nation",
      status: "Available",
      quantity: "",
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
    if (!window.confirm("Delete this resource entry?")) return;

    setResources(resources.filter((resource) => resource.id !== id));
  }

  const activeResources = resources.filter((resource) => !resource.archived);
  const archivedResources = resources.filter((resource) => resource.archived);

  const statusColours = {
    Available: "#22c55e",
    Requested: "#facc15",
    Assigned: "#0ea5e9",
    Deployed: "#f97316",
    Unavailable: "#dc2626",
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
          <h2 style={{ marginTop: 0 }}>Add Resource</h2>

          <label>Category</label>
          <select
            value={form.category}
            onChange={(e) => updateForm("category", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Crew</option>
            <option>Equipment</option>
            <option>Generator</option>
            <option>Fuel</option>
            <option>Aircraft</option>
            <option>Bus / Transportation</option>
            <option>Reception Centre</option>
            <option>Emergency Supplies</option>
            <option>Communications</option>
            <option>Other</option>
          </select>

          <label>Resource Name</label>
          <input
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Example: Generator, crew, bus, trailer..."
            style={inputStyle(theme)}
          />

          <label>Community / Location</label>
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
            <option>Available</option>
            <option>Requested</option>
            <option>Assigned</option>
            <option>Deployed</option>
            <option>Unavailable</option>
          </select>

          <label>Quantity / Capacity</label>
          <input
            value={form.quantity}
            onChange={(e) => updateForm("quantity", e.target.value)}
            placeholder="Example: 2 units, 20 people, 500L fuel"
            style={inputStyle(theme)}
          />

          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            placeholder="Enter resource details..."
            style={{
              ...inputStyle(theme),
              minHeight: "110px",
            }}
          />

          <button
            onClick={addResource}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: theme.secondary,
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Add Resource
          </button>
        </SectionCard>
      </div>

      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Resource Board</h2>

          {activeResources.length === 0 && (
            <div style={{ color: theme.muted }}>No active resources entered.</div>
          )}

          {activeResources.map((resource) => (
            <div
              key={resource.id}
              style={{
                borderLeft: `8px solid ${
                  statusColours[resource.status] || theme.accent
                }`,
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "12px",
              }}
            >
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
                <option>Crew</option>
                <option>Equipment</option>
                <option>Generator</option>
                <option>Fuel</option>
                <option>Aircraft</option>
                <option>Bus / Transportation</option>
                <option>Reception Centre</option>
                <option>Emergency Supplies</option>
                <option>Communications</option>
                <option>Other</option>
              </select>

              <label>Resource Name</label>
              <input
                value={resource.name || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    name: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Community / Location</label>
              <select
                value={resource.community}
                onChange={(e) =>
                  updateResource(resource.id, {
                    community: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                {communities.map((community) => (
                  <option key={community.name}>{community.name}</option>
                ))}
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
                <option>Requested</option>
                <option>Assigned</option>
                <option>Deployed</option>
                <option>Unavailable</option>
              </select>

              <label>Quantity / Capacity</label>
              <input
                value={resource.quantity || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    quantity: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              />

              <label>Notes</label>
              <textarea
                value={resource.notes || ""}
                onChange={(e) =>
                  updateResource(resource.id, {
                    notes: e.target.value,
                  })
                }
                style={{
                  ...inputStyle(theme),
                  minHeight: "90px",
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
                  style={secondaryButton()}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteResource(resource.id)}
                  style={dangerButton()}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        {archivedResources.length > 0 && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archived Resources</h2>

            {archivedResources.map((resource) => (
              <div key={resource.id} style={archivedCard(theme)}>
                <strong>
                  {resource.category}: {resource.name || "Unnamed Resource"}
                </strong>
                <br />
                Status: {resource.status}
                <br />
                Location: {resource.community}

                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() =>
                      updateResource(resource.id, {
                        archived: false,
                      })
                    }
                    style={secondaryButton()}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => deleteResource(resource.id)}
                    style={dangerButton()}
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