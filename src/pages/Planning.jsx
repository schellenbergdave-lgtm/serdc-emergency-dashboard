import React from "react";
import { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";

export default function Planning({ theme }) {
  const [incidents] = useStoredState("serdcIncidents", []);
  const [activeIncidentId] = useStoredState("serdcActiveIncidentId", null);

  const activeIncident = incidents.find(
    (incident) => incident.id === activeIncidentId
  );

  const [plans, setPlans] = useStoredState("serdcPlanningRecords", []);

  const [form, setForm] = useState({
    type: "Planning Note",
    community: "Regional / All Communities",
    priority: "Medium",
    status: "Draft",
    title: "",
    details: "",
    assignedTo: "",
    dueDate: "",
  });

  const scopedPlans = plans.filter(
    (plan) => plan.incidentId === activeIncidentId
  );

  const activePlans = scopedPlans.filter((plan) => !plan.archived);
  const archivedPlans = scopedPlans.filter((plan) => plan.archived);

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }

  function addPlan() {
    if (!activeIncidentId) {
      alert("Please create or select an active incident first.");
      return;
    }

    if (!form.title.trim() && !form.details.trim()) return;

    setPlans([
      {
        ...form,
        id: Date.now(),
        incidentId: activeIncidentId,
        incidentNumber: activeIncident?.incidentNumber || "",
        archived: false,
        created: new Date().toLocaleString(),
      },
      ...plans,
    ]);

    setForm({
      type: "Planning Note",
      community: "Regional / All Communities",
      priority: "Medium",
      status: "Draft",
      title: "",
      details: "",
      assignedTo: "",
      dueDate: "",
    });
  }

  function updatePlan(id, updates) {
    setPlans(
      plans.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              ...updates,
              updated: new Date().toLocaleString(),
            }
          : plan
      )
    );
  }

  function deletePlan(id) {
    if (!window.confirm("Delete this planning record?")) return;

    setPlans(plans.filter((plan) => plan.id !== id));
  }

  const priorityColours = {
    Low: "#22c55e",
    Medium: "#eab308",
    High: "#f97316",
    Critical: "#dc2626",
  };

  if (!activeIncidentId || !activeIncident) {
    return (
      <div style={{ padding: "24px" }}>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Planning</h2>
          <p style={{ color: theme.muted }}>
            No active incident selected. Go to the Incidents tab and create or
            select an active incident before adding planning records.
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
          <h2 style={{ marginTop: 0 }}>Add Planning Record</h2>

          <label>Type</label>
          <select
            value={form.type}
            onChange={(e) => updateForm("type", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Planning Note</option>
            <option>Incident Action Planning</option>
            <option>Contingency Plan</option>
            <option>Community Plan</option>
            <option>Weather / Fire Behaviour Note</option>
            <option>Operational Period Plan</option>
            <option>Meeting Note</option>
            <option>Other</option>
          </select>

          <label>Community / Area</label>
          <select
            value={form.community}
            onChange={(e) => updateForm("community", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Regional / All Communities</option>
            {communities.map((community) => (
              <option key={community.name}>{community.name}</option>
            ))}
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

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => updateForm("status", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Draft</option>
            <option>In Progress</option>
            <option>Approved</option>
            <option>Implemented</option>
            <option>Deferred</option>
          </select>

          <label>Title</label>
          <input
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            placeholder="Example: 24-hour contingency plan"
            style={inputStyle(theme)}
          />

          <label>Assigned To</label>
          <input
            value={form.assignedTo}
            onChange={(e) => updateForm("assignedTo", e.target.value)}
            placeholder="Example: Planning Section, EM Coordinator"
            style={inputStyle(theme)}
          />

          <label>Due Date / Time</label>
          <input
            value={form.dueDate}
            onChange={(e) => updateForm("dueDate", e.target.value)}
            placeholder="Example: May 24, 1800 hrs"
            style={inputStyle(theme)}
          />

          <label>Details</label>
          <textarea
            value={form.details}
            onChange={(e) => updateForm("details", e.target.value)}
            placeholder="Enter planning details..."
            style={{ ...inputStyle(theme), minHeight: "130px" }}
          />

          <button
            onClick={addPlan}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Add Planning Record
          </button>
        </SectionCard>
      </div>

      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Planning Board</h2>

          {activePlans.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active planning records for this incident.
            </div>
          )}

          {activePlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                borderLeft: `8px solid ${
                  priorityColours[plan.priority] || "#2563eb"
                }`,
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ color: theme.muted, fontSize: "13px" }}>
                {plan.incidentNumber}
              </div>

              <label>Type</label>
              <select
                value={plan.type}
                onChange={(e) => updatePlan(plan.id, { type: e.target.value })}
                style={inputStyle(theme)}
              >
                <option>Planning Note</option>
                <option>Incident Action Planning</option>
                <option>Contingency Plan</option>
                <option>Community Plan</option>
                <option>Weather / Fire Behaviour Note</option>
                <option>Operational Period Plan</option>
                <option>Meeting Note</option>
                <option>Other</option>
              </select>

              <label>Community / Area</label>
              <select
                value={plan.community}
                onChange={(e) =>
                  updatePlan(plan.id, { community: e.target.value })
                }
                style={inputStyle(theme)}
              >
                <option>Regional / All Communities</option>
                {communities.map((community) => (
                  <option key={community.name}>{community.name}</option>
                ))}
              </select>

              <label>Priority</label>
              <select
                value={plan.priority}
                onChange={(e) =>
                  updatePlan(plan.id, { priority: e.target.value })
                }
                style={inputStyle(theme)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <label>Status</label>
              <select
                value={plan.status}
                onChange={(e) => updatePlan(plan.id, { status: e.target.value })}
                style={inputStyle(theme)}
              >
                <option>Draft</option>
                <option>In Progress</option>
                <option>Approved</option>
                <option>Implemented</option>
                <option>Deferred</option>
              </select>

              <label>Title</label>
              <input
                value={plan.title || ""}
                onChange={(e) => updatePlan(plan.id, { title: e.target.value })}
                style={inputStyle(theme)}
              />

              <label>Assigned To</label>
              <input
                value={plan.assignedTo || ""}
                onChange={(e) =>
                  updatePlan(plan.id, { assignedTo: e.target.value })
                }
                style={inputStyle(theme)}
              />

              <label>Due Date / Time</label>
              <input
                value={plan.dueDate || ""}
                onChange={(e) => updatePlan(plan.id, { dueDate: e.target.value })}
                style={inputStyle(theme)}
              />

              <label>Details</label>
              <textarea
                value={plan.details || ""}
                onChange={(e) => updatePlan(plan.id, { details: e.target.value })}
                style={{ ...inputStyle(theme), minHeight: "110px" }}
              />

              <div style={{ color: theme.muted, fontSize: "13px" }}>
                Created: {plan.created || "Not listed"}
                {plan.updated && <> | Updated: {plan.updated}</>}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => updatePlan(plan.id, { archived: true })}
                  style={secondaryButton("#475569")}
                >
                  Archive
                </button>

                <button
                  onClick={() => deletePlan(plan.id)}
                  style={secondaryButton("#dc2626")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        {archivedPlans.length > 0 && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archived Planning Records</h2>

            {archivedPlans.map((plan) => (
              <div key={plan.id} style={archivedCard(theme)}>
                <strong>{plan.title || "Untitled Planning Record"}</strong>
                <br />
                Type: {plan.type}
                <br />
                Status: {plan.status}
                <br />
                Community: {plan.community}

                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => updatePlan(plan.id, { archived: false })}
                    style={secondaryButton("#475569")}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => deletePlan(plan.id)}
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