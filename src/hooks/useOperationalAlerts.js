export default function useOperationalAlerts({
  communityRiskScores = [],
  airQualityData = [],
  communityStatus = [],
  firmsHotspots = [],
  evacuations = [],
  receptionCentres = [],
  financeExpenses = [],
}) {
  const alerts = [];

  communityRiskScores.forEach((community) => {
    if (community.severity === "Critical") {
      alerts.push({
        id: `risk-${community.community}`,
        level: "Critical",
        color: "#dc2626",
        title: `${community.community} Critical Risk`,
        message: `Risk score ${community.score}/100. Drivers: ${
          community.drivers.length
            ? community.drivers.join("; ")
            : "No drivers listed."
        }`,
      });
    }
  });

  airQualityData.forEach((item) => {
    if (item.category === "Very High" || Number(item.aqhi) >= 10) {
      alerts.push({
        id: `aqhi-${item.community}`,
        level: "Critical",
        color: "#dc2626",
        title: `${item.community} Very High AQHI`,
        message: `AQHI ${item.aqhi}. PM2.5: ${item.pm25 ?? "No Data"}.`,
      });
    }
  });

  communityStatus.forEach((community) => {
    if (
      community.closestFire &&
      Number(community.closestDistance) <= 25
    ) {
      alerts.push({
        id: `fire-${community.name}`,
        level: "Critical",
        color: "#dc2626",
        title: `${community.name} Wildfire Within 25 km`,
        message: `${community.closestFire.fireName || "Wildfire"} is ${
          community.closestDistance
        } km from the community.`,
      });
    }
  });

  communityRiskScores.forEach((community) => {
    if (community.nearbyHotspots >= 5) {
      alerts.push({
        id: `firms-${community.community}`,
        level: "Elevated",
        color: "#f97316",
        title: `${community.community} FIRMS Hotspot Cluster`,
        message: `${community.nearbyHotspots} FIRMS hotspots detected within 50 km.`,
      });
    }
  });

  evacuations.forEach((record) => {
    if (!record.archived && record.status === "Full Evacuation") {
      alerts.push({
        id: `evac-${record.id}`,
        level: "Critical",
        color: "#dc2626",
        title: `${record.community} Full Evacuation`,
        message: `Evacuees: ${record.evacuees || "0"}. Reception Centre: ${
          record.receptionCentre || "Not listed"
        }.`,
      });
    }
  });

  receptionCentres.forEach((centre) => {
    if (centre.archived || centre.status === "Closed") return;

    const capacity = Number(centre.capacity) || 0;
    const evacuees = Number(centre.evacuees) || 0;

    if (capacity > 0) {
      const percent = (evacuees / capacity) * 100;

      if (percent >= 100 || centre.status === "Full") {
        alerts.push({
          id: `rc-full-${centre.id}`,
          level: "Critical",
          color: "#dc2626",
          title: `${centre.name} Full`,
          message: `${evacuees}/${capacity} evacuees. Assigned community: ${
            centre.assignedCommunity || "Not listed"
          }.`,
        });
      } else if (percent >= 80 || centre.status === "Near Capacity") {
        alerts.push({
          id: `rc-near-${centre.id}`,
          level: "Elevated",
          color: "#f97316",
          title: `${centre.name} Near Capacity`,
          message: `${evacuees}/${capacity} evacuees. Assigned community: ${
            centre.assignedCommunity || "Not listed"
          }.`,
        });
      }
    }
  });

  financeExpenses.forEach((item) => {
    if (
      !item.archived &&
      item.approvalStatus === "Needs Review"
    ) {
      alerts.push({
        id: `finance-${item.id}`,
        level: "Monitor",
        color: "#facc15",
        title: "Finance Item Needs Review",
        message: `${item.description || "Finance Entry"} | ${
          item.amount || "$0"
        } | PO: ${item.poNumber || "N/A"}.`,
      });
    }
  });

  const priorityOrder = {
    Critical: 1,
    Elevated: 2,
    Monitor: 3,
  };

  return alerts.sort(
    (a, b) => priorityOrder[a.level] - priorityOrder[b.level]
  );
}