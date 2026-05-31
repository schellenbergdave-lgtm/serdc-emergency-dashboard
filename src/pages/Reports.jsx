import React, { useState } from "react";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  ImageRun,
  TableCell,
  WidthType,
  AlignmentType,
  Footer,
  PageNumber,
  BorderStyle,
  ShadingType,
} from "docx";
import generateNarrative from "../utils/generateNarrative";
import SectionCard from "../components/SectionCard";
import useStoredState from "../hooks/useStoredState";
import usePurpleAirData from "../hooks/usePurpleAirData";
import { nowDate, nowTime } from "../utils/dateUtils";
import communities from "../data/communities";
import useWeatherForecast from "../hooks/useWeatherForecast";
import useRegionalSmokeSummary from "../hooks/useRegionalSmokeSummary";
import useRegionalWeatherSummary from "../hooks/useRegionalWeatherSummary";
import useCommunityRiskScoring from "../hooks/useCommunityRiskScoring";
export default function Reports({ theme }) {
  const [reportScope, setReportScope] = useState("active");
  const [selectedWeatherCommunity, setSelectedWeatherCommunity] = useState(
    communities[0]
  );
  const [sitrepInfo, setSitrepInfo] = useStoredState("serdcSitrepInfo", {
    incident: "Wildfire Season",
    reportNumber: "001",
    reportVersion: "Draft 1",
    issuedBy: "SERDC",
    preparedBy: "David Schellenberg",
    situationOverview: "",
    weatherForecast: "",
    firesOfNote: "",
    additionalNotes: "",
  });

  const [incidents] = useStoredState("serdcIncidents", []);
  const [activeIncidentId] = useStoredState("serdcActiveIncidentId", null);

  const [incidentObjectives] = useStoredState("serdcIncidentObjectives", []);
  const [actionLog] = useStoredState("serdcActionLog", []);
  const [planningRecords] = useStoredState("serdcPlanningRecords", []);
  const [logisticsResources] = useStoredState("serdcLogisticsResources", []);
  const [financeExpenses] = useStoredState("serdcFinanceExpenses", []);
  const [evacuations] = useStoredState("serdcEvacuations", []);
  const [receptionCentres] = useStoredState("serdcReceptionCentres", []);
  const [mapScreenshot, setMapScreenshot] = useStoredState(
    "serdcMapScreenshot",
    null
  );
  const { airQualityData, airQualityStatus, airQualityLastLoaded } =
    usePurpleAirData();
    const {
      forecastData,
      forecastStatus,
      forecastLastLoaded,
      loadForecast,
    } = useWeatherForecast(selectedWeatherCommunity);
    const regionalSmoke = useRegionalSmokeSummary(airQualityData);
    
    const {
      regionalWeather,
      regionalWeatherStatus,
      regionalWeatherLastLoaded,
    } = useRegionalWeatherSummary();
    const activeIncident = incidents.find(
    (incident) => incident.id === activeIncidentId
  );
  const [communityStatus] = useStoredState(
    "serdcCommunityStatus",
    []
  );
  
  const [firmsHotspots] = useStoredState(
    "serdcFirmsHotspots",
    []
  );
  
  const activeIncidents = incidents.filter((incident) => !incident.archived);

  const activeIncidentIds = activeIncidents.map((incident) => incident.id);
  
  function belongsToActiveIncident(item) {
    return activeIncidentIds.includes(item.incidentId);
  }

  const scopedEvacuationsForRisk = evacuations.filter((item) =>
  belongsToActiveIncident(item)
);

const scopedLogisticsForRisk = logisticsResources.filter((item) =>
  belongsToActiveIncident(item)
);

const scopedReceptionForRisk = receptionCentres.filter((item) =>
  belongsToActiveIncident(item)
);

const communityRiskScores = useCommunityRiskScoring({
  communities,
  communityStatus,
  firmsHotspots,
  airQualityData,
  regionalWeather,
  evacuations: scopedEvacuationsForRisk,
  logisticsResources: scopedLogisticsForRisk,
  receptionCentres: scopedReceptionForRisk,
});



const scopedIncidentIds =
  reportScope === "active"
    ? activeIncidentId && activeIncidentIds.includes(activeIncidentId)
      ? [activeIncidentId]
      : []
    : activeIncidentIds;

  const reportTitle =
    reportScope === "active"
      ? activeIncident
        ? `${activeIncident.incidentNumber} | ${activeIncident.name}`
        : "No Active Incident Selected"
      : "SERDC Regional All-Incidents SITREP";
      
  function updateField(field, value) {
    setSitrepInfo({
      ...sitrepInfo,
      [field]: value,
    });
  }
  function handleMapUpload(event) {
    const file = event.target.files?.[0];
  
    if (!file) return;
  
    const reader = new FileReader();
  
    reader.onload = () => {
      setMapScreenshot(reader.result);
    };
  
    reader.readAsDataURL(file);
  }
  function inScope(item) {
    return (
      belongsToActiveIncident(item) &&
      scopedIncidentIds.includes(item.incidentId)
    );
  }

  const scopedIncidents =
    reportScope === "active" && activeIncident
      ? [activeIncident]
      : activeIncidents;

  const activeObjectives = incidentObjectives.filter(
    (item) => inScope(item) && !item.archived
  );

  const openActions = actionLog.filter(
    (item) => inScope(item) && !item.archived && item.status !== "Completed"
  );

  const activePlanning = planningRecords.filter(
    (item) =>
      inScope(item) &&
      !item.archived &&
      item.status !== "Implemented" &&
      item.status !== "Deferred"
  );

  const activeLogistics = logisticsResources.filter(
    (item) => inScope(item) && !item.archived
  );

  const deployedLogistics = activeLogistics.filter(
    (item) => item.status === "Assigned" || item.status === "Deployed"
  );

  const activeFinance = financeExpenses.filter(
    (item) => inScope(item) && !item.archived
  );

  const financeTotal = activeFinance.reduce((total, item) => {
    const amount = Number(String(item.amount || "").replace(/[^0-9.-]+/g, ""));
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const pendingFinance = activeFinance.filter(
    (item) =>
      item.approvalStatus === "Pending" ||
      item.approvalStatus === "Needs Review"
  );
  
  const activeEvacuations = evacuations.filter(
    (item) => inScope(item) && !item.archived && item.status !== "Normal"
  );
  
  const activeReceptionCentres = receptionCentres.filter(
    (item) => inScope(item) && !item.archived && item.status !== "Closed"
  );

  const totalReceptionCapacity = activeReceptionCentres.reduce(
    (total, item) => total + (Number(item.capacity) || 0),
    0
  );

  const totalReceptionEvacuees = activeReceptionCentres.reduce(
    (total, item) => total + (Number(item.evacuees) || 0),
    0
  );
  const narrative = generateNarrative({
    reportScope,
    reportTitle,
    communityRiskScores,
    regionalWeather,
    regionalSmoke,
    activeEvacuations,
    activeReceptionCentres,
  });
  const highSmokeCommunities = airQualityData.filter(
    (item) => item.category === "High" || item.category === "Very High"
  );
  const next72Hours = forecastData.slice(0, 72);

  const maxTemp = Math.max(
    ...next72Hours.map((hour) => Number(hour.temperature) || -100)
  );
  
  const minHumidity = Math.min(
    ...next72Hours.map((hour) => Number(hour.humidity) || 100)
  );
  
  const totalPrecip = next72Hours.reduce(
    (total, hour) => total + (Number(hour.precipitation) || 0),
    0
  );
  
  const maxWindGust = Math.max(
    ...next72Hours.map((hour) => Number(hour.windGusts) || 0)
  );
  
  function windDirectionText(degrees) {
    const value = Number(degrees);
  
    if (!Number.isFinite(value)) return "N/A";
  
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  
    return directions[Math.round(value / 45) % 8];
  }
  
  const peakWindHour = [...next72Hours].sort(
    (a, b) => Number(b.windGusts || 0) - Number(a.windGusts || 0)
  )[0];
  
  const weatherSummaryText =
    next72Hours.length === 0
      ? "72-hour weather forecast data has not loaded."
      : `72-hour forecast for ${selectedWeatherCommunity.name}: maximum temperature ${maxTemp} °C, minimum relative humidity ${minHumidity}%, total precipitation ${totalPrecip.toFixed(
          1
        )} mm, maximum wind gust ${maxWindGust} km/h from ${
          peakWindHour
            ? windDirectionText(peakWindHour.windDirection)
            : "N/A"
        }.`;
  function incidentLabel(item) {
    return item.incidentNumber ? `[${item.incidentNumber}] ` : "";
  }

  function generateSitrep() {
    return `Southeast Resource Development Council
Emergency Management Situation Report

Report Scope:
${reportScope === "active" ? "Active Incident Only" : "All Active Incidents"}

Report Title:
${reportTitle}

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
Report Version:
${sitrepInfo.reportVersion || "Draft"}
Incidents Included:
${
  scopedIncidents.length === 0
    ? "- No incidents selected."
    : scopedIncidents
        .map(
          (incident) =>
            `- ${incident.incidentNumber || "NO-ID"} | ${incident.name} | ${
              incident.status
            } | Priority: ${incident.priority} | Operational Period: ${
              incident.operationalPeriod || "Not set"
            }`
        )
        .join("\n")
}


2. Situation Overview

Executive Summary

${narrative.executiveSummary}

Priority Communities

${narrative.priorityCommunities}

Evacuation Summary

${narrative.evacuationSummary}

Situation Overview

${sitrepInfo.situationOverview || "Situation overview to be completed."}


3. Weather & Forecast

Weather Data Source:
${forecastStatus}

Last Loaded:
${forecastLastLoaded}

${weatherSummaryText}

Additional Weather Notes:
${sitrepInfo.weatherForecast || "No additional weather notes entered."}


4. Fire Situation / Fires of Note

${sitrepInfo.firesOfNote || "Fires of note to be completed."}


5. Regional Weather / Air Quality / Smoke

Regional Weather Status:
${regionalWeatherStatus}

Regional Weather Last Loaded:
${regionalWeatherLastLoaded}

Regional Weather Concern:
${regionalWeather?.concern?.level || "Not loaded"}

Regional Weather Reason:
${regionalWeather?.concern?.reason || "No regional weather summary loaded."}

Regional Weather Summary:
${
  regionalWeather
    ? `Average temperature ${regionalWeather.averageTemperature.toFixed(
        1
      )} °C, average 72-hour precipitation ${regionalWeather.averagePrecipitation.toFixed(
        1
      )} mm, lowest RH ${regionalWeather.lowestHumidity}% at ${
        regionalWeather.driestCommunity?.community
      }, strongest wind gust ${regionalWeather.maxWindGust} km/h at ${
        regionalWeather.windiestCommunity?.community
      }.`
    : "Regional weather summary has not loaded."
}

Selected Community 72-Hour Forecast:
${weatherSummaryText}

PurpleAir Status:
${airQualityStatus}

PurpleAir Last Loaded:
${airQualityLastLoaded}

Regional Smoke Concern:
${regionalSmoke.concern.level}

Regional Smoke Reason:
${regionalSmoke.concern.reason}

Highest Smoke Impact:
${
  regionalSmoke.highestSmoke
    ? `${regionalSmoke.highestSmoke.community}: AQHI ${regionalSmoke.highestSmoke.aqhi}, ${regionalSmoke.highestSmoke.category}, PM2.5 ${regionalSmoke.highestSmoke.pm25 ?? "No Data"}`
    : "No valid AQHI readings loaded."
}

Community AQHI Readings:
${
  airQualityData.length === 0
    ? "- No AQHI readings loaded."
    : airQualityData
        .map(
          (item) =>
            `- ${item.community}: AQHI ${item.aqhi}, ${item.category}, PM2.5 ${
              item.pm25 ?? "No Data"
            }`
        )
        .join("\n")
}
6. Community Operational Risk Ranking

${
  communityRiskScores.length === 0
    ? "- No community risk scores available."
    : communityRiskScores
        .slice(0, 10)
        .map(
          (community, index) =>
            `${index + 1}. ${community.community}
Risk Score: ${community.score}/100
Severity: ${community.severity}
AQHI: ${community.aqhi} (${community.aqhiCategory})
Wildfire Distance: ${
              community.wildfireDistance ?? "Not Available"
            }
FIRMS Hotspots Within 50 km: ${community.nearbyHotspots}
Drivers:
${
  community.drivers.length > 0
    ? community.drivers.map((driver) => `  - ${driver}`).join("\n")
    : "  - No active risk drivers identified."
}
`
        )
        .join("\n")
}
7. Operations Objectives

${
  activeObjectives.length === 0
    ? "- No active incident objectives entered."
    : activeObjectives
        .map(
          (item) =>
            `- ${incidentLabel(item)}${item.status || "Active"}: ${item.text}`
        )
        .join("\n")
}


8. Operational Action Log

${
  openActions.length === 0
    ? "- No open operational action log entries."
    : openActions
        .map(
          (item) =>
            `- ${incidentLabel(item)}${item.status || "Open"}: ${item.text}`
        )
        .join("\n")
}


9. Planning Section

${
  activePlanning.length === 0
    ? "- No active planning records entered."
    : activePlanning
        .map(
          (item) =>
            `- ${incidentLabel(item)}${item.status}: ${
              item.title || item.type
            } | ${item.community} | Priority: ${
              item.priority
            } | Assigned To: ${
              item.assignedTo || "Not listed"
            } | Due: ${item.dueDate || "Not listed"}`
        )
        .join("\n")
}


10. Logistics Section

Active Logistics Resources:
${activeLogistics.length}

Assigned / Deployed Logistics Resources:
${
  deployedLogistics.length === 0
    ? "- No assigned or deployed logistics resources entered."
    : deployedLogistics
        .map(
          (item) =>
            `- ${incidentLabel(item)}${item.status}: ${
              item.resourceName || "Unnamed Resource"
            } | ${item.category} | ${item.assignedCommunity} | Location: ${
              item.assignedLocation || "Not listed"
            } | Assigned To: ${item.assignedTo || "Not listed"}`
        )
        .join("\n")
}


11. Finance / Administration

Active Finance Entries:
${activeFinance.length}

Estimated Active Costs:
$${financeTotal.toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}

Pending / Needs Review:
${pendingFinance.length}

Finance Items:
${
  activeFinance.length === 0
    ? "- No active finance entries entered."
    : activeFinance
        .slice(0, 20)
        .map(
          (item) =>
            `- ${incidentLabel(item)}${item.approvalStatus}: ${
              item.description || "Finance Entry"
            } | ${item.amount || "$0"} | Funding: ${
              item.fundingSource
            } | PO: ${item.poNumber || "N/A"} | Invoice: ${
              item.invoiceNumber || "N/A"
            }`
        )
        .join("\n")
}


12. Evacuation Status

${
  activeEvacuations.length === 0
    ? "- No active evacuation or monitoring records entered."
    : activeEvacuations
        .map(
          (item) =>
            `- ${incidentLabel(item)}${item.community}: ${
              item.status
            } | Evacuees: ${item.evacuees || "0"} | Priority Evacuees: ${
              item.priorityEvacuees || "0"
            } | Transportation: ${
              item.transportation || "Not listed"
            } | Reception Centre: ${item.receptionCentre || "Not listed"}`
        )
        .join("\n")
}


13. Reception Centres

Active Reception Centres:
${activeReceptionCentres.length}

Total Capacity:
${totalReceptionCapacity}

Current Evacuees:
${totalReceptionEvacuees}

Available Space:
${totalReceptionCapacity - totalReceptionEvacuees}

Reception Centre Details:
${
  activeReceptionCentres.length === 0
    ? "- No active reception centres entered."
    : activeReceptionCentres
        .map(
          (item) =>
            `- ${incidentLabel(item)}${item.status}: ${item.name} | ${
              item.location || "No location"
            } | ${item.evacuees || "0"}/${
              item.capacity || "0"
            } evacuees/capacity | Assigned Community: ${
              item.assignedCommunity
            } | Lead Agency: ${item.leadAgency || "Not listed"}`
        )
        .join("\n")
}

Regional Outlook

${narrative.regionalOutlook}
13. Additional Notes / Maps / Resources

${sitrepInfo.additionalNotes || "No additional notes entered."}

Reference Links:
- Dashboard: Available in system.
- Situation Map: Available in system.
- Fire Danger: Available in system.
- Wind Forecast: Available in system.
- Weather Forecast: Available in system.
- Smoke Forecast: Available in system.
- Manitoba Hydro Outages: Available in system.
- Manitoba 511 Road Conditions: Available in system.
`;
  }

  
  

  

  async function exportDocxReport() {
    const BLUE = "1D4ED8";
    const BLACK = "000000";
    const WHITE = "FFFFFF";
  
    function bodyText(text = "") {
      return new Paragraph({
        spacing: {
          after: 120,
          line: 300,
        },
        children: [
          new TextRun({
            text: String(text),
            font: "Arial",
            size: 24,
            color: BLACK,
          }),
        ],
      });
    }
  
    function heading(text) {
      return new Paragraph({
        spacing: {
          before: 360,
          after: 180,
        },
        children: [
          new TextRun({
            text,
            font: "Arial",
            size: 28,
            bold: true,
            color: BLUE,
          }),
        ],
      });
    }
  
    function sectionGap() {
      return new Paragraph({
        spacing: {
          after: 240,
        },
        children: [new TextRun({ text: "" })],
      });
    }
  
    function severityColor(value = "") {
      const clean = String(value).toLowerCase();
  
      if (
        clean.includes("critical") ||
        clean.includes("full evacuation") ||
        clean.includes("very high")
      ) {
        return "DC2626";
      }
  
      if (
        clean.includes("high") ||
        clean.includes("partial evacuation") ||
        clean.includes("near capacity") ||
        clean.includes("enhanced")
      ) {
        return "F97316";
      }
  
      if (
        clean.includes("medium") ||
        clean.includes("monitor") ||
        clean.includes("preparedness") ||
        clean.includes("standby") ||
        clean.includes("draft") ||
        clean.includes("pending")
      ) {
        return "FACC15";
      }
  
      if (
        clean.includes("low") ||
        clean.includes("normal") ||
        clean.includes("open") ||
        clean.includes("approved")
      ) {
        return "22C55E";
      }
  
      return "CBD5E1";
    }
  
    function tableCell(text, options = {}) {
      const fill = options.fill || "FFFFFF";
      const color = options.color || BLACK;
      const bold = options.bold || false;
  
      return new TableCell({
        shading: {
          type: ShadingType.CLEAR,
          fill,
          color: "auto",
        },
        margins: {
          top: 80,
          bottom: 80,
          left: 100,
          right: 100,
        },
        children: [
          new Paragraph({
            spacing: {
              line: 300,
            },
            children: [
              new TextRun({
                text: String(text ?? ""),
                font: "Arial",
                size: 24,
                bold,
                color,
              }),
            ],
          }),
        ],
      });
    }
  
    function makeTable(headers, rows) {
      return new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          insideHorizontal: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: "CBD5E1",
          },
          insideVertical: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: "CBD5E1",
          },
        },
        rows: [
          new TableRow({
            children: headers.map((header) =>
              tableCell(header, {
                fill: BLUE,
                color: WHITE,
                bold: true,
              })
            ),
          }),
          ...rows.map(
            (row) =>
              new TableRow({
                children: row.map((cell) => tableCell(cell)),
              })
          ),
        ],
      });
    }
    function dataUrlToUint8Array(dataUrl) {
      const base64 = dataUrl.split(",")[1];
      const binaryString = window.atob(base64);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
    
      for (let i = 0; i < length; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    
      return bytes;
    }
    function makeSeverityTable(headers, rows, severityIndex) {
      return new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          insideHorizontal: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: "CBD5E1",
          },
          insideVertical: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: "CBD5E1",
          },
        },
        rows: [
          new TableRow({
            children: headers.map((header) =>
              tableCell(header, {
                fill: BLUE,
                color: WHITE,
                bold: true,
              })
            ),
          }),
          ...rows.map(
            (row) =>
              new TableRow({
                children: row.map((cell, index) =>
                  tableCell(cell, {
                    fill:
                      index === severityIndex
                        ? severityColor(cell)
                        : "FFFFFF",
                    bold: index === severityIndex,
                  })
                ),
              })
          ),
        ],
      });
    }
  
    function safeList(items, formatter, emptyText) {
      if (!items.length) {
        return [bodyText(emptyText)];
      }
  
      return items.map((item) => bodyText(formatter(item)));
    }
  
    const incidentRows = scopedIncidents.map((incident) => [
      incident.incidentNumber || "NO-ID",
      incident.name || "Not listed",
      incident.status || "Not listed",
      incident.priority || "Not listed",
      incident.operationalPeriod || "Not set",
    ]);
  
    const evacuationRows = activeEvacuations.map((item) => [
      item.incidentNumber || "",
      item.community || "",
      item.status || "",
      item.evacuees || "0",
      item.priorityEvacuees || "0",
      item.receptionCentre || "Not listed",
    ]);
  
    const receptionRows = activeReceptionCentres.map((item) => [
      item.incidentNumber || "",
      item.name || "",
      item.status || "",
      `${item.evacuees || "0"}/${item.capacity || "0"}`,
      item.assignedCommunity || "",
      item.leadAgency || "Not listed",
    ]);
  
    const logisticsRows = deployedLogistics.map((item) => [
      item.incidentNumber || "",
      item.status || "",
      item.resourceName || "Unnamed Resource",
      item.category || "",
      item.assignedCommunity || "",
      item.assignedLocation || "Not listed",
    ]);
  
    const financeRows = activeFinance.slice(0, 20).map((item) => [
      item.incidentNumber || "",
      item.approvalStatus || "",
      item.description || "Finance Entry",
      item.amount || "$0",
      item.poNumber || "N/A",
      item.invoiceNumber || "N/A",
    ]);
  
    const smokeRows = highSmokeCommunities.map((item) => [
      item.community || "",
      item.aqhi || "N/A",
      item.category || "No Data",
      item.pm25 ?? "No Data",
    ]);
  
    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 180,
          line: 300,
        },
        children: [
          new TextRun({
            text: "Southeast Resource Development Council",
            font: "Arial",
            size: 32,
            bold: true,
            color: BLUE,
          }),
        ],
      }),
  
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 360,
          line: 300,
        },
        children: [
          new TextRun({
            text: "Emergency Management Situation Report",
            font: "Arial",
            size: 28,
            bold: true,
            color: BLACK,
          }),
        ],
      }),
  
      makeTable(
        ["Report Field", "Information"],
        [
          ["Report Scope", reportScope === "active" ? "Active Incident Only" : "All Active Incidents"],
          ["Report Title", reportTitle],
          ["Date of Issue", nowDate()],
          ["Time of Issue", nowTime()],
          ["Issued By", sitrepInfo.issuedBy],
          ["Prepared By", sitrepInfo.preparedBy],
          ["Incident/Event", sitrepInfo.incident],
          ["Report Version", sitrepInfo.reportVersion || "Draft"],
          
        ]
      ),
  
      sectionGap(),
  
      heading("Incidents Included"),
  
      incidentRows.length
        ? makeSeverityTable(
            ["Incident Number", "Name", "Status", "Priority", "Operational Period"],
            incidentRows,
            3
          )
        : bodyText("No incidents selected."),
  
      sectionGap(),
  
      heading("Situation Overview"),
      bodyText(sitrepInfo.situationOverview || "Situation overview to be completed."),
  
      sectionGap(),
  
      heading("Weather & Forecast"),
      bodyText(sitrepInfo.weatherForecast || "Weather forecast to be completed."),
  
      sectionGap(),
  
      heading("Fire Situation / Fires of Note"),
      bodyText(sitrepInfo.firesOfNote || "Fires of note to be completed."),
  
      sectionGap(),
  
      heading("Community Risk Methodology"),
      bodyText(
        "Community wildfire risk is calculated using proximity to loaded active wildfire intelligence and operational indicators. The current wildfire proximity thresholds are: Critical at 0-25 km, Elevated at 26-30 km, Monitor at 31-50 km, and Normal beyond 50 km. Additional operational factors such as evacuation records, logistics deployments, planning records, reception centre activity, finance records, and High or Very High AQHI/smoke conditions increase the community risk score used on the dashboard."
      ),
      bodyText(
        "Severity colours used in this report are: red for Critical or Full Evacuation conditions, orange for High or Elevated conditions, yellow for Monitoring, Preparedness, Standby, Draft, or Pending conditions, green for Low, Normal, Open, or Approved conditions, and grey where no severity is assigned."
      ),
  
      sectionGap(),
      heading("Community Operational Risk Ranking"),

      communityRiskScores.length > 0
        ? makeSeverityTable(
            [
              "Community",
              "Risk Score",
              "Severity",
              "AQHI",
              "Wildfire Distance",
            ],
            communityRiskScores.map((item) => [
              item.community,
              `${item.score}/100`,
              item.severity,
              `${item.aqhi} (${item.aqhiCategory})`,
              item.wildfireDistance ?? "Not Available",
            ]),
            2
          )
        : bodyText("No community risk scores available."),
      
      sectionGap(),
      heading("Operations Objectives"),
      ...safeList(
        activeObjectives,
        (item) => `• ${incidentLabel(item)}${item.status || "Active"}: ${item.text}`,
        "No active incident objectives entered."
      ),
  
      sectionGap(),
  
      heading("Operational Action Log"),
      ...safeList(
        openActions,
        (item) => `• ${incidentLabel(item)}${item.status || "Open"}: ${item.text}`,
        "No open operational action log entries."
      ),
  
      sectionGap(),
  
      heading("Planning Section"),
      ...safeList(
        activePlanning,
        (item) =>
          `• ${incidentLabel(item)}${item.status}: ${item.title || item.type} | ${item.community} | Priority: ${item.priority} | Assigned To: ${item.assignedTo || "Not listed"} | Due: ${item.dueDate || "Not listed"}`,
        "No active planning records entered."
      ),
  
      sectionGap(),
  
      heading("Logistics Quick Reference"),
      logisticsRows.length
        ? makeSeverityTable(
            ["Incident", "Status", "Resource", "Category", "Community", "Location"],
            logisticsRows,
            1
          )
        : bodyText("No assigned or deployed logistics resources entered."),
  
      sectionGap(),
  
      heading("Finance / Administration Quick Reference"),
      makeTable(
        ["Finance Field", "Information"],
        [
          [
            "Estimated Active Costs",
            `$${financeTotal.toLocaleString("en-CA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          ],
          ["Pending / Needs Review", pendingFinance.length],
          ["Active Finance Entries", activeFinance.length],
        ]
      ),
  
      financeRows.length
        ? makeSeverityTable(
            ["Incident", "Approval", "Description", "Amount", "PO", "Invoice"],
            financeRows,
            1
          )
        : bodyText("No active finance entries entered."),
  
      sectionGap(),
  
      heading("Evacuation Quick Reference"),
      evacuationRows.length
        ? makeSeverityTable(
            ["Incident", "Community", "Status", "Evacuees", "Priority Evacuees", "Reception Centre"],
            evacuationRows,
            2
          )
        : bodyText("No active evacuation or monitoring records entered."),
  
      sectionGap(),
  
      heading("Reception Centre Quick Reference"),
      makeTable(
        ["Reception Field", "Information"],
        [
          ["Active Reception Centres", activeReceptionCentres.length],
          ["Total Capacity", totalReceptionCapacity],
          ["Current Evacuees", totalReceptionEvacuees],
          ["Available Space", totalReceptionCapacity - totalReceptionEvacuees],
        ]
      ),
  
      receptionRows.length
        ? makeSeverityTable(
            ["Incident", "Centre", "Status", "Evacuees/Capacity", "Assigned Community", "Lead Agency"],
            receptionRows,
            2
          )
        : bodyText("No active reception centres entered."),
  
      sectionGap(),
  
      heading("Regional Weather / Air Quality / Smoke"),

makeTable(
  ["Regional Weather Field", "Value"],
  [
    [
      "Regional Weather Concern",
      regionalWeather?.concern?.level || "Not loaded",
    ],
    [
      "Regional Weather Reason",
      regionalWeather?.concern?.reason ||
        "No regional weather summary loaded.",
    ],
    [
      "Average Temperature",
      regionalWeather
        ? `${regionalWeather.averageTemperature.toFixed(1)} °C`
        : "Not loaded",
    ],
    [
      "Average 72-Hour Precipitation",
      regionalWeather
        ? `${regionalWeather.averagePrecipitation.toFixed(1)} mm`
        : "Not loaded",
    ],
    [
      "Lowest Relative Humidity",
      regionalWeather
        ? `${regionalWeather.lowestHumidity}% at ${regionalWeather.driestCommunity?.community}`
        : "Not loaded",
    ],
    [
      "Strongest Wind Gust",
      regionalWeather
        ? `${regionalWeather.maxWindGust} km/h at ${regionalWeather.windiestCommunity?.community}`
        : "Not loaded",
    ],
  ]
),

sectionGap(),

bodyText(`Selected Community Forecast: ${selectedWeatherCommunity.name}`),

bodyText(weatherSummaryText),

sectionGap(),

makeTable(
  ["Regional Smoke Field", "Value"],
  [
    [
      "Regional Smoke Concern",
      regionalSmoke.concern.level,
    ],
    [
      "Regional Smoke Reason",
      regionalSmoke.concern.reason,
    ],
    [
      "Highest Smoke Impact",
      regionalSmoke.highestSmoke
        ? `${regionalSmoke.highestSmoke.community}: AQHI ${regionalSmoke.highestSmoke.aqhi}, ${regionalSmoke.highestSmoke.category}`
        : "No valid AQHI readings loaded.",
    ],
    [
      "PurpleAir Status",
      airQualityStatus,
    ],
    [
      "PurpleAir Last Loaded",
      airQualityLastLoaded,
    ],
  ]
),

sectionGap(),

heading("Community AQHI Quick Reference"),

airQualityData.length > 0
  ? makeSeverityTable(
      ["Community", "AQHI", "Category", "PM2.5"],
      airQualityData.map((item) => [
        item.community || "",
        item.aqhi || "N/A",
        item.category || "No Data",
        item.pm25 ?? "No Data",
      ]),
      2
    )
  : bodyText("No AQHI readings loaded."),
  
  heading("Situation Map Screenshot"),

  mapScreenshot
    ? new Paragraph({
        children: [
          new ImageRun({
            data: dataUrlToUint8Array(mapScreenshot),
            transformation: {
              width: 600,
              height: 350,
            },
          }),
        ],
      })
    : bodyText("No situation map screenshot uploaded."),
  
  sectionGap(),
  
  heading("Additional Notes / Maps / Resources"),
  bodyText(sitrepInfo.additionalNotes || "No additional notes entered."),
  
      sectionGap(),
  
      heading("Reference Links"),
      bodyText("Dashboard: Available in system."),
      bodyText("Situation Map: Available in system."),
      bodyText("Fire Danger: Available in system."),
      bodyText("Wind Forecast: Available in system."),
      bodyText("Weather Forecast: Available in system."),
      bodyText("Smoke Forecast: Available in system."),
      bodyText("Manitoba Hydro Outages: Available in system."),
      bodyText("Manitoba 511 Road Conditions: Available in system."),
    ];
  
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: "Page ",
                      font: "Arial",
                      size: 20,
                    }),
                    PageNumber.CURRENT,
                  ],
                }),
              ],
            }),
          },
          children,
        },
      ],
    });
  
    const blob = await Packer.toBlob(doc);
  
    const timestamp = new Date()
  .toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  .replace(",", "")
  .replaceAll("/", "-")
  .replaceAll(":", "")
  .replaceAll(" ", "_");

saveAs(
  blob,
  `SERDC_SITREP_${timestamp}_${sitrepInfo.reportNumber}_${
    reportScope === "active" && activeIncident
      ? activeIncident.incidentNumber
      : "REGIONAL"
  }.docx`
);
setSitrepInfo({
  incident: "Wildfire Season",
  reportNumber: "",
  reportVersion: "Draft 1",
  issuedBy: "SERDC",
  preparedBy: "David Schellenberg",
  situationOverview: "",
  weatherForecast: "",
  firesOfNote: "",
  additionalNotes: "",
});

setMapScreenshot(null);
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
          <h2 style={{ marginTop: 0 }}>SITREP Builder</h2>

          <label>Report Scope</label>
          <select
            value={reportScope}
            onChange={(e) => setReportScope(e.target.value)}
            style={inputStyle(theme)}
          >
            <option value="active">Active Incident Only</option>
            <option value="all">All Active Incidents</option>
          </select>

          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: theme.background,
              border: `1px solid ${theme.border}`,
              marginBottom: "12px",
              color: theme.muted,
            }}
          >
            <strong>Report Title:</strong>
            <br />
            {reportTitle}
          </div>

          <label>Incident / Event</label>
          <input
            value={sitrepInfo.incident}
            onChange={(e) => updateField("incident", e.target.value)}
            style={inputStyle(theme)}
          />

          <label>Report Number</label>
          <input
            value={sitrepInfo.reportNumber}
            onChange={(e) => updateField("reportNumber", e.target.value)}
            style={inputStyle(theme)}
          />
<label>Report Version</label>
<input
  value={sitrepInfo.reportVersion}
  onChange={(e) => updateField("reportVersion", e.target.value)}
  placeholder="Example: Draft 1, Final, Update 2"
  style={inputStyle(theme)}
/>
          <label>Issued By</label>
          <input
            value={sitrepInfo.issuedBy}
            onChange={(e) => updateField("issuedBy", e.target.value)}
            style={inputStyle(theme)}
          />

          <label>Prepared By</label>
          <input
            value={sitrepInfo.preparedBy}
            onChange={(e) => updateField("preparedBy", e.target.value)}
            style={inputStyle(theme)}
          />

          <label>Situation Overview</label>
          <textarea
            value={sitrepInfo.situationOverview}
            onChange={(e) => updateField("situationOverview", e.target.value)}
            style={textareaStyle(theme)}
          />
<label>Weather Forecast Community</label>
<select
  value={selectedWeatherCommunity.name}
  onChange={(e) => {
    const community = communities.find(
      (item) => item.name === e.target.value
    );

    setSelectedWeatherCommunity(community);
  }}
  style={inputStyle(theme)}
>
  {communities.map((community) => (
    <option key={community.name}>{community.name}</option>
  ))}
</select>

<button
  onClick={loadForecast}
  style={buttonStyle("#2563eb")}
>
  Refresh Weather Forecast
</button>

<div style={{ color: theme.muted, marginBottom: "12px" }}>
  {weatherSummaryText}
</div>
          <label>Weather & Forecast</label>
          <textarea
            value={sitrepInfo.weatherForecast}
            onChange={(e) => updateField("weatherForecast", e.target.value)}
            style={textareaStyle(theme)}
          />

          <label>Fire Situation / Fires of Note</label>
          <textarea
            value={sitrepInfo.firesOfNote}
            onChange={(e) => updateField("firesOfNote", e.target.value)}
            style={textareaStyle(theme)}
          />
<label>Situation Map Screenshot</label>

<input
  type="file"
  accept="image/*"
  onChange={handleMapUpload}
  style={{
    width: "100%",
    marginTop: "5px",
    marginBottom: "12px",
  }}
/>

{mapScreenshot && (
  <div
    style={{
      marginBottom: "12px",
      border: `1px solid ${theme.border}`,
      borderRadius: "8px",
      overflow: "hidden",
    }}
  >
    <img
      src={mapScreenshot}
      alt="Situation Map"
      style={{
        width: "100%",
        display: "block",
      }}
    />
    <button
  onClick={() => setMapScreenshot(null)}
  style={{
    width: "100%",
    padding: "10px",
    border: "none",
    background: "#dc2626",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Remove Screenshot
</button>
  </div>
)}
          <label>Additional Notes / Maps / Resources</label>
          <textarea
            value={sitrepInfo.additionalNotes}
            onChange={(e) => updateField("additionalNotes", e.target.value)}
            style={textareaStyle(theme)}
          />

<div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
  <button onClick={exportDocxReport} style={buttonStyle("#2563eb")}>
  Generate SITREP Report
  </button>
</div>
        </SectionCard>
      </div>

      <div>
        <SectionCard theme={theme}>
          <h2 style={{ marginTop: 0 }}>SITREP Preview</h2>

          <textarea
            readOnly
            value={generateSitrep()}
            style={{
              width: "100%",
              minHeight: "900px",
              padding: "14px",
              borderRadius: "10px",
              border: `1px solid ${theme.border}`,
              background: theme.background,
              color: theme.text,
              fontFamily: "Arial",
              fontSize: "16px",
              lineHeight: "1.5",
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
    minHeight: "110px",
    resize: "vertical",
  };
}

function buttonStyle(background) {
  return {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  };
}