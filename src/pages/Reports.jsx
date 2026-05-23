import React from "react";

import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import communities from "../data/communities";
import { nowDate, nowTime } from "../utils/dateUtils";

export default function Reports({ theme }) {
  const [sitrepInfo, setSitrepInfo] = useStoredState(
    "serdcSitrepInfo",
    {
      incident: "Wildfire Season",
      reportNumber: "001",
      issuedBy: "SERDC",
      preparedBy: "David Schellenberg",
      situationOverview: "",
      weatherForecast: "",
      airQualitySmoke: "",
      firesOfNote: "",
      receptionShelters: "",
      evacuationsImpacts: "",
      responseActions: "",
      additionalNotes: "",
    }
  );

  const [incidentObjectivesPrimary] = useStoredState(
    "serdcIncidentObjectives",
    []
  );
  
  const [incidentObjectivesOld] = useStoredState(
    "incidentObjectives",
    []
  );
  
  const incidentObjectives =
    incidentObjectivesPrimary.length > 0
      ? incidentObjectivesPrimary
      : incidentObjectivesOld;
  
  const [actionLogPrimary] = useStoredState(
    "serdcActionLog",
    []
  );
  
  const [actionLogOld] = useStoredState(
    "actionLog",
    []
  );
  
  const actionLog =
    actionLogPrimary.length > 0
      ? actionLogPrimary
      : actionLogOld;
  
  const [resourcesPrimary] = useStoredState(
    "serdcResources",
    []
  );
  
  const [resourcesOld] = useStoredState(
    "resources",
    []
  );
  
  const resources =
    resourcesPrimary.length > 0
      ? resourcesPrimary
      : resourcesOld;

  const [evacuations] = useStoredState(
    "serdcEvacuations",
    []
  );

  function updateField(field, value) {
    setSitrepInfo({
      ...sitrepInfo,
      [field]: value,
    });
  }

  const activeEvacuations = evacuations.filter(
    (record) => record.status !== "Normal"
  );

  const activeResources = resources.filter(
    (resource) =>
      resource.status === "Requested" ||
      resource.status === "Assigned" ||
      resource.status === "Deployed"
  );

  function generateSitrep() {
    return `Southeast Resource Development Council
Wildfire Situation Report

1. Incident / Event Information

Date of Issue:
${nowDate()}

Time of Issue:
${nowTime()}

Issued By:
${sitrepInfo.issuedBy}

Prepared By:
${sitrepInfo.preparedBy}

Incident/Event:
${sitrepInfo.incident}

Report Number:
${sitrepInfo.reportNumber}


2. Situation Overview

${sitrepInfo.situationOverview || "Situation overview to be completed."}


3. Weather & Forecast

${sitrepInfo.weatherForecast || "Weather forecast to be completed."}


4. Air Quality / Smoke

${sitrepInfo.airQualitySmoke || "Air quality and smoke conditions to be completed."}


5. Fires of Note

${sitrepInfo.firesOfNote || "Fires of note to be completed."}


6. Reception Center & Shelters

${sitrepInfo.receptionShelters || "Reception centre and shelter status to be completed."}


7. SERDC Evacuations & Impacts

${
  sitrepInfo.evacuationsImpacts ||
  "Evacuation impacts to be completed."
}

Active Evacuation Records:
${
  activeEvacuations.length === 0
    ? "- No active evacuation records entered."
    : activeEvacuations
        .map(
          (record) =>
            `- ${record.community}: ${record.status}. Total evacuees: ${
              record.evacuees || "0"
            }. Priority evacuees: ${
              record.priorityEvacuees || "0"
            }. Reception: ${
              record.receptionCentre || "Not listed"
            }. Notes: ${record.notes || "None"}`
        )
        .join("\n")
}


8. Response Actions Provincial and Interagency Partners

${sitrepInfo.responseActions || "Response actions to be completed."}


9. Operational Objectives

${
  incidentObjectives.length === 0
    ? "- No incident objectives entered."
    : incidentObjectives
        .map((objective) => `- ${objective.text}`)
        .join("\n")
}


10. Operational Action Log

${
  actionLog.length === 0
    ? "- No action log entries entered."
    : actionLog
        .map((entry) => `- ${entry.time}: ${entry.text}`)
        .join("\n")
}


11. Resources of Note

${
  activeResources.length === 0
    ? "- No active resource requests, assignments, or deployments entered."
    : activeResources
        .map(
          (resource) =>
            `- ${resource.category}: ${
              resource.name || "Unnamed Resource"
            } | ${resource.status} | ${
              resource.community
            } | Quantity/Capacity: ${
              resource.quantity || "Not listed"
            } | Notes: ${resource.notes || "None"}`
        )
        .join("\n")
}


12. Additional Notes / Maps / Resources

${sitrepInfo.additionalNotes || "No additional notes entered."}

Reference Links:
- Situation Map: Available in dashboard.
- Wind Forecast: Available in dashboard.
- Weather Forecast: Available in dashboard.
- Smoke Forecast: FireSmoke link available in dashboard.
- Hydro Outages: Manitoba Hydro outage link available in dashboard.
- Road Conditions: Manitoba 511 link available in dashboard.
`;
  }

  function copySitrep() {
    navigator.clipboard.writeText(generateSitrep());
    alert("SITREP copied to clipboard.");
  }

  return (
    <div
      style={{
        padding: "24px",
        display: "grid",
        gridTemplateColumns: "440px 1fr",
        gap: "20px",
      }}
    >
      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>
            SITREP Builder
          </h2>

          <label>Incident / Event</label>
          <input
            value={sitrepInfo.incident}
            onChange={(e) =>
              updateField("incident", e.target.value)
            }
            style={inputStyle(theme)}
          />

          <label>Report Number</label>
          <input
            value={sitrepInfo.reportNumber}
            onChange={(e) =>
              updateField("reportNumber", e.target.value)
            }
            style={inputStyle(theme)}
          />

          <label>Issued By</label>
          <input
            value={sitrepInfo.issuedBy}
            onChange={(e) =>
              updateField("issuedBy", e.target.value)
            }
            style={inputStyle(theme)}
          />

          <label>Prepared By</label>
          <input
            value={sitrepInfo.preparedBy}
            onChange={(e) =>
              updateField("preparedBy", e.target.value)
            }
            style={inputStyle(theme)}
          />

          <label>Situation Overview</label>
          <textarea
            value={sitrepInfo.situationOverview}
            onChange={(e) =>
              updateField(
                "situationOverview",
                e.target.value
              )
            }
            style={textareaStyle(theme)}
          />

          <label>Weather & Forecast</label>
          <textarea
            value={sitrepInfo.weatherForecast}
            onChange={(e) =>
              updateField("weatherForecast", e.target.value)
            }
            style={textareaStyle(theme)}
          />

          <label>Air Quality / Smoke</label>
          <textarea
            value={sitrepInfo.airQualitySmoke}
            onChange={(e) =>
              updateField("airQualitySmoke", e.target.value)
            }
            style={textareaStyle(theme)}
          />

          <label>Fires of Note</label>
          <textarea
            value={sitrepInfo.firesOfNote}
            onChange={(e) =>
              updateField("firesOfNote", e.target.value)
            }
            style={textareaStyle(theme)}
          />

          <label>Reception Center & Shelters</label>
          <textarea
            value={sitrepInfo.receptionShelters}
            onChange={(e) =>
              updateField(
                "receptionShelters",
                e.target.value
              )
            }
            style={textareaStyle(theme)}
          />

          <label>SERDC Evacuations & Impacts</label>
          <textarea
            value={sitrepInfo.evacuationsImpacts}
            onChange={(e) =>
              updateField(
                "evacuationsImpacts",
                e.target.value
              )
            }
            style={textareaStyle(theme)}
          />

          <label>Response Actions</label>
          <textarea
            value={sitrepInfo.responseActions}
            onChange={(e) =>
              updateField("responseActions", e.target.value)
            }
            style={textareaStyle(theme)}
          />

          <label>Additional Notes / Maps / Resources</label>
          <textarea
            value={sitrepInfo.additionalNotes}
            onChange={(e) =>
              updateField("additionalNotes", e.target.value)
            }
            style={textareaStyle(theme)}
          />

          <button
            onClick={copySitrep}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: theme.secondary,
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Copy SITREP
          </button>
        </SectionCard>
      </div>

      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>
            Generated SITREP Preview
          </h2>

          <textarea
            readOnly
            value={generateSitrep()}
            style={{
              width: "100%",
              minHeight: "820px",
              fontSize: "16px",
lineHeight: "1.5",
              padding: "14px",
              borderRadius: "10px",
              border: `1px solid ${theme.border}`,
              background: theme.background,
              color: theme.text,
              fontFamily: "Arial",
              whiteSpace: "pre-wrap",
              boxSizing: "border-box",
            }}
          />
        </SectionCard>
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
    minHeight: "100px",
    resize: "vertical",
  };
}