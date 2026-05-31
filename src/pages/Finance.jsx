import React from "react";
import { useState } from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";

export default function Finance({ theme }) {
  const [incidents] = useStoredState("serdcIncidents", []);
  const [activeIncidentId] = useStoredState("serdcActiveIncidentId", null);

  const activeIncident = incidents.find(
    (incident) => incident.id === activeIncidentId
  );

  const [expenses, setExpenses] = useStoredState("serdcFinanceExpenses", []);

  const [form, setForm] = useState({
    date: new Date().toLocaleDateString("en-CA"),
    category: "Personnel",
    community: "Regional / All Communities",
    vendor: "",
    poNumber: "",
    invoiceNumber: "",
    description: "",
    amount: "",
    fundingSource: "Unknown / TBD",
    approvalStatus: "Pending",
    reimbursementStatus: "Not Submitted",
    receiptStatus: "No Receipt",
    notes: "",
  });

  const scopedExpenses = expenses.filter(
    (expense) => expense.incidentId === activeIncidentId
  );

  const activeExpenses = scopedExpenses.filter((expense) => !expense.archived);
  const archivedExpenses = scopedExpenses.filter((expense) => expense.archived);

  const totalEstimated = activeExpenses.reduce((total, expense) => {
    const amount = Number(String(expense.amount).replace(/[^0-9.-]+/g, ""));
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const pendingApproval = activeExpenses.filter(
    (expense) => expense.approvalStatus === "Pending"
  );

  const submittedForReimbursement = activeExpenses.filter(
    (expense) => expense.reimbursementStatus === "Submitted"
  );

  const statusColours = {
    Pending: "#facc15",
    Approved: "#22c55e",
    Denied: "#dc2626",
    "Needs Review": "#f97316",
  };

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }

  function addExpense() {
    if (!activeIncidentId) {
      alert("Please create or select an active incident first.");
      return;
    }

    if (!form.description.trim() && !form.amount.trim()) return;

    setExpenses([
      {
        ...form,
        id: Date.now(),
        incidentId: activeIncidentId,
        incidentNumber: activeIncident?.incidentNumber || "",
        archived: false,
        created: new Date().toLocaleString(),
      },
      ...expenses,
    ]);

    setForm({
      date: new Date().toLocaleDateString("en-CA"),
      category: "Personnel",
      community: "Regional / All Communities",
      vendor: "",
      poNumber: "",
      invoiceNumber: "",
      description: "",
      amount: "",
      fundingSource: "Unknown / TBD",
      approvalStatus: "Pending",
      reimbursementStatus: "Not Submitted",
      receiptStatus: "No Receipt",
      notes: "",
    });
  }

  function updateExpense(id, updates) {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              ...updates,
              updated: new Date().toLocaleString(),
            }
          : expense
      )
    );
  }

  function deleteExpense(id) {
    if (!window.confirm("Delete this finance entry?")) return;

    setExpenses(expenses.filter((expense) => expense.id !== id));
  }

  if (!activeIncidentId || !activeIncident) {
    return (
      <div style={{ padding: "24px" }}>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Finance</h2>
          <p style={{ color: theme.muted }}>
            No active incident selected. Go to the Incidents tab and create or
            select an active incident before adding finance records.
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
          <h2 style={{ marginTop: 0 }}>Add Expense / Cost Entry</h2>

          <label>Date</label>
          <input
            value={form.date}
            onChange={(e) => updateForm("date", e.target.value)}
            style={inputStyle(theme)}
          />

          <label>Category</label>
          <select
            value={form.category}
            onChange={(e) => updateForm("category", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Personnel</option>
            <option>Overtime</option>
            <option>Travel</option>
            <option>Meals</option>
            <option>Lodging</option>
            <option>Transportation</option>
            <option>Fuel</option>
            <option>Equipment</option>
            <option>Supplies</option>
            <option>Contractor</option>
            <option>Reception Centre</option>
            <option>Evacuation Support</option>
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

          <label>Vendor / Payee</label>
          <input
            value={form.vendor}
            onChange={(e) => updateForm("vendor", e.target.value)}
            placeholder="Vendor, payee, contractor, or staff name"
            style={inputStyle(theme)}
          />

          <label>PO Number</label>
          <input
            value={form.poNumber}
            onChange={(e) => updateForm("poNumber", e.target.value)}
            placeholder="Purchase order number"
            style={inputStyle(theme)}
          />

          <label>Invoice Number</label>
          <input
            value={form.invoiceNumber}
            onChange={(e) => updateForm("invoiceNumber", e.target.value)}
            placeholder="Invoice number"
            style={inputStyle(theme)}
          />

          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            placeholder="Describe the expense or cost..."
            style={{ ...inputStyle(theme), minHeight: "90px" }}
          />

          <label>Amount</label>
          <input
            value={form.amount}
            onChange={(e) => updateForm("amount", e.target.value)}
            placeholder="Example: 1250.00"
            style={inputStyle(theme)}
          />

          <label>Funding Source</label>
          <select
            value={form.fundingSource}
            onChange={(e) => updateForm("fundingSource", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Unknown / TBD</option>
            <option>ISC EMAP</option>
            <option>Provincial Support</option>
            <option>SERDC Internal</option>
            <option>Community</option>
            <option>Insurance</option>
            <option>Other</option>
          </select>

          <label>Approval Status</label>
          <select
            value={form.approvalStatus}
            onChange={(e) => updateForm("approvalStatus", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Pending</option>
            <option>Approved</option>
            <option>Denied</option>
            <option>Needs Review</option>
          </select>

          <label>Reimbursement Status</label>
          <select
            value={form.reimbursementStatus}
            onChange={(e) => updateForm("reimbursementStatus", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>Not Submitted</option>
            <option>Submitted</option>
            <option>Approved</option>
            <option>Paid</option>
            <option>Rejected</option>
          </select>

          <label>Receipt / Documentation</label>
          <select
            value={form.receiptStatus}
            onChange={(e) => updateForm("receiptStatus", e.target.value)}
            style={inputStyle(theme)}
          >
            <option>No Receipt</option>
            <option>Receipt Received</option>
            <option>Invoice Received</option>
            <option>Missing Documentation</option>
          </select>

          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            placeholder="Approval notes, claim notes, reimbursement details..."
            style={{ ...inputStyle(theme), minHeight: "90px" }}
          />

          <button
            onClick={addExpense}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "#6b7280",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Add Finance Entry
          </button>
        </SectionCard>
      </div>

      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <SummaryCard
            title="Estimated Active Costs"
            value={`$${totalEstimated.toLocaleString("en-CA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            theme={theme}
            color="#6b7280"
          />

          <SummaryCard
            title="Pending Approval"
            value={pendingApproval.length}
            theme={theme}
            color="#facc15"
          />

          <SummaryCard
            title="Submitted Claims"
            value={submittedForReimbursement.length}
            theme={theme}
            color="#0ea5e9"
          />

          <SummaryCard
            title="Active Entries"
            value={activeExpenses.length}
            theme={theme}
            color="#6b7280"
          />
        </div>

        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>Finance / Cost Tracking Board</h2>

          {activeExpenses.length === 0 && (
            <div style={{ color: theme.muted }}>
              No active finance entries for this incident.
            </div>
          )}

          {activeExpenses.map((expense) => (
            <div
              key={expense.id}
              style={{
                borderLeft: `8px solid ${
                  statusColours[expense.approvalStatus] || "#6b7280"
                }`,
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ color: theme.muted, fontSize: "13px" }}>
                {expense.incidentNumber}
              </div>

              <label>Date</label>
              <input
                value={expense.date || ""}
                onChange={(e) =>
                  updateExpense(expense.id, { date: e.target.value })
                }
                style={inputStyle(theme)}
              />

              <label>Category</label>
              <select
                value={expense.category}
                onChange={(e) =>
                  updateExpense(expense.id, { category: e.target.value })
                }
                style={inputStyle(theme)}
              >
                <option>Personnel</option>
                <option>Overtime</option>
                <option>Travel</option>
                <option>Meals</option>
                <option>Lodging</option>
                <option>Transportation</option>
                <option>Fuel</option>
                <option>Equipment</option>
                <option>Supplies</option>
                <option>Contractor</option>
                <option>Reception Centre</option>
                <option>Evacuation Support</option>
                <option>Other</option>
              </select>

              <label>Community / Area</label>
              <select
                value={expense.community}
                onChange={(e) =>
                  updateExpense(expense.id, { community: e.target.value })
                }
                style={inputStyle(theme)}
              >
                <option>Regional / All Communities</option>
                {communities.map((community) => (
                  <option key={community.name}>{community.name}</option>
                ))}
              </select>

              <label>Vendor / Payee</label>
              <input
                value={expense.vendor || ""}
                onChange={(e) =>
                  updateExpense(expense.id, { vendor: e.target.value })
                }
                style={inputStyle(theme)}
              />

              <label>PO Number</label>
              <input
                value={expense.poNumber || ""}
                onChange={(e) =>
                  updateExpense(expense.id, { poNumber: e.target.value })
                }
                style={inputStyle(theme)}
              />

              <label>Invoice Number</label>
              <input
                value={expense.invoiceNumber || ""}
                onChange={(e) =>
                  updateExpense(expense.id, { invoiceNumber: e.target.value })
                }
                style={inputStyle(theme)}
              />

              <label>Description</label>
              <textarea
                value={expense.description || ""}
                onChange={(e) =>
                  updateExpense(expense.id, { description: e.target.value })
                }
                style={{ ...inputStyle(theme), minHeight: "90px" }}
              />

              <label>Amount</label>
              <input
                value={expense.amount || ""}
                onChange={(e) =>
                  updateExpense(expense.id, { amount: e.target.value })
                }
                style={inputStyle(theme)}
              />

              <label>Funding Source</label>
              <select
                value={expense.fundingSource}
                onChange={(e) =>
                  updateExpense(expense.id, { fundingSource: e.target.value })
                }
                style={inputStyle(theme)}
              >
                <option>Unknown / TBD</option>
                <option>ISC EMAP</option>
                <option>Provincial Support</option>
                <option>SERDC Internal</option>
                <option>Community</option>
                <option>Insurance</option>
                <option>Other</option>
              </select>

              <label>Approval Status</label>
              <select
                value={expense.approvalStatus}
                onChange={(e) =>
                  updateExpense(expense.id, {
                    approvalStatus: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Denied</option>
                <option>Needs Review</option>
              </select>

              <label>Reimbursement Status</label>
              <select
                value={expense.reimbursementStatus}
                onChange={(e) =>
                  updateExpense(expense.id, {
                    reimbursementStatus: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>Not Submitted</option>
                <option>Submitted</option>
                <option>Approved</option>
                <option>Paid</option>
                <option>Rejected</option>
              </select>

              <label>Receipt / Documentation</label>
              <select
                value={expense.receiptStatus}
                onChange={(e) =>
                  updateExpense(expense.id, {
                    receiptStatus: e.target.value,
                  })
                }
                style={inputStyle(theme)}
              >
                <option>No Receipt</option>
                <option>Receipt Received</option>
                <option>Invoice Received</option>
                <option>Missing Documentation</option>
              </select>

              <label>Notes</label>
              <textarea
                value={expense.notes || ""}
                onChange={(e) =>
                  updateExpense(expense.id, { notes: e.target.value })
                }
                style={{ ...inputStyle(theme), minHeight: "90px" }}
              />

              <div style={{ color: theme.muted, fontSize: "13px" }}>
                Created: {expense.created || "Not listed"}
                {expense.updated && <> | Updated: {expense.updated}</>}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() =>
                    updateExpense(expense.id, { archived: true })
                  }
                  style={secondaryButton("#475569")}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteExpense(expense.id)}
                  style={secondaryButton("#dc2626")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </SectionCard>

        {archivedExpenses.length > 0 && (
          <SectionCard theme={theme}>
            <h2 style={{ marginTop: 0 }}>Archived Finance Entries</h2>

            {archivedExpenses.map((expense) => (
              <div key={expense.id} style={archivedCard(theme)}>
                <strong>{expense.description || "Finance Entry"}</strong>
                <br />
                Incident: {expense.incidentNumber}
                <br />
                Amount: {expense.amount || "Not listed"}
                <br />
                PO: {expense.poNumber || "Not listed"}
                <br />
                Invoice: {expense.invoiceNumber || "Not listed"}
                <br />
                Status: {expense.approvalStatus}
                <br />
                Reimbursement: {expense.reimbursementStatus}

                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() =>
                      updateExpense(expense.id, { archived: false })
                    }
                    style={secondaryButton("#475569")}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => deleteExpense(expense.id)}
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