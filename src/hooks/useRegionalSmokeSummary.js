export default function useRegionalSmokeSummary(airQualityData = []) {
  const validReadings = airQualityData.filter(
    (item) => item.aqhi !== "N/A" && item.category !== "No Data"
  );

  const highSmokeCommunities = validReadings.filter(
    (item) => item.category === "High" || item.category === "Very High"
  );

  const veryHighSmokeCommunities = validReadings.filter(
    (item) => item.category === "Very High" || Number(item.aqhi) >= 10
  );

  const moderateSmokeCommunities = validReadings.filter(
    (item) => item.category === "Moderate"
  );

  const highestSmoke =
    validReadings.length > 0
      ? [...validReadings].sort(
          (a, b) => Number(b.aqhi || 0) - Number(a.aqhi || 0)
        )[0]
      : null;

  let concern = {
    level: "Normal",
    color: "#22c55e",
    reason: "All reporting communities are currently in the Low AQHI range.",
  };

  if (veryHighSmokeCommunities.length > 0) {
    concern = {
      level: "Critical",
      color: "#dc2626",
      reason: `${veryHighSmokeCommunities.length} community or communities are reporting Very High AQHI conditions.`,
    };
  } else if (highSmokeCommunities.length >= 2) {
    concern = {
      level: "Elevated",
      color: "#f97316",
      reason: `${highSmokeCommunities.length} communities are reporting High or Very High AQHI conditions.`,
    };
  } else if (moderateSmokeCommunities.length > 0 || highSmokeCommunities.length === 1) {
    concern = {
      level: "Monitor",
      color: "#facc15",
      reason: "One or more communities are reporting Moderate or High AQHI conditions.",
    };
  }

  return {
    validReadings,
    highSmokeCommunities,
    veryHighSmokeCommunities,
    moderateSmokeCommunities,
    highestSmoke,
    concern,
  };
}