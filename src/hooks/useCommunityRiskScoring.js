export default function useCommunityRiskScoring({
  communities = [],
  communityStatus = [],
  firmsHotspots = [],
  airQualityData = [],
  regionalWeather = null,
  evacuations = [],
  logisticsResources = [],
  receptionCentres = [],
}) {
  function distanceKm(lat1, lon1, lat2, lon2) {
    const r = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return r * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function getSeverity(score) {
    if (score >= 80) {
      return {
        level: "Critical",
        color: "#dc2626",
      };
    }

    if (score >= 55) {
      return {
        level: "Elevated",
        color: "#f97316",
      };
    }

    if (score >= 30) {
      return {
        level: "Monitor",
        color: "#facc15",
      };
    }

    return {
      level: "Normal",
      color: "#22c55e",
    };
  }
  const accessComplexity = {
    "Poplar River First Nation": {
      score: 25,
      reason:
        "Remote fly-in evacuation constraint with limited aircraft capacity, approximately 9 passengers per aircraft.",
    },
    "Little Grand Rapids First Nation": {
      score: 35,
      reason:
        "Remote evacuation constraint requiring boat or float-plane staging to airport access with limited aircraft capacity.",
    },
    "Pauingassi First Nation": {
      score: 35,
      reason:
        "Remote evacuation constraint requiring boat or float-plane staging to airport access with limited aircraft capacity.",
    },
  };
  const scoredCommunities = communities.map((community) => {
    const [lat, lon] = community.position;

    let score = 0;
    const drivers = [];
    const access = accessComplexity[community.name];

    if (access) {
      score += access.score;
      drivers.push(access.reason);
    }
    const wildfireRecord = communityStatus.find(
      (item) => item.name === community.name
    );

    if (wildfireRecord) {
      if (wildfireRecord.closestDistance <= 25) {
        score += 40;
        drivers.push(
          `Active wildfire within ${wildfireRecord.closestDistance} km`
        );
      } else if (wildfireRecord.closestDistance <= 30) {
        score += 30;
        drivers.push(
          `Active wildfire within ${wildfireRecord.closestDistance} km`
        );
      } else if (wildfireRecord.closestDistance <= 50) {
        score += 20;
        drivers.push(
          `Active wildfire within ${wildfireRecord.closestDistance} km`
        );
      }
    }

    const nearbyHotspots = firmsHotspots.filter((hotspot) => {
      const distance = distanceKm(
        lat,
        lon,
        Number(hotspot.latitude),
        Number(hotspot.longitude)
      );

      return distance <= 50;
    });

    if (nearbyHotspots.length >= 5) {
      score += 20;
      drivers.push(`${nearbyHotspots.length} FIRMS hotspots within 50 km`);
    } else if (nearbyHotspots.length > 0) {
      score += 10;
      drivers.push(`${nearbyHotspots.length} FIRMS hotspot(s) within 50 km`);
    }

    const smoke = airQualityData.find(
      (item) => item.community === community.name
    );

    if (smoke) {
      if (smoke.category === "Very High" || Number(smoke.aqhi) >= 10) {
        score += 25;
        drivers.push(`Very High AQHI: ${smoke.aqhi}`);
      } else if (smoke.category === "High" || Number(smoke.aqhi) >= 7) {
        score += 18;
        drivers.push(`High AQHI: ${smoke.aqhi}`);
      } else if (smoke.category === "Moderate" || Number(smoke.aqhi) >= 4) {
        score += 8;
        drivers.push(`Moderate AQHI: ${smoke.aqhi}`);
      }
    }

    if (regionalWeather?.concern?.level === "Critical") {
      score += 15;
      drivers.push("Regional fire weather concern: Critical");
    } else if (regionalWeather?.concern?.level === "Elevated") {
      score += 10;
      drivers.push("Regional fire weather concern: Elevated");
    } else if (regionalWeather?.concern?.level === "Monitor") {
      score += 5;
      drivers.push("Regional fire weather concern: Monitor");
    }

    const evacuationRecords = evacuations.filter(
      (item) =>
        item.community === community.name &&
        !item.archived &&
        item.status !== "Normal"
    );

    if (evacuationRecords.some((item) => item.status === "Full Evacuation")) {
      score += 60;
drivers.push("Full evacuation active");
    } else if (
      evacuationRecords.some((item) => item.status === "Partial Evacuation")
    ) {
      score += 40;
drivers.push("Partial evacuation active");
    } else if (evacuationRecords.length > 0) {
      score += 15;
drivers.push("Evacuation monitoring or preparedness record active");
    }

    const deployedLogistics = logisticsResources.filter(
      (item) =>
        item.assignedCommunity === community.name &&
        !item.archived &&
        (item.status === "Assigned" || item.status === "Deployed")
    );

    if (deployedLogistics.length > 0) {
      score += Math.min(15, deployedLogistics.length * 5);
      drivers.push(`${deployedLogistics.length} logistics resource(s) deployed`);
    }

    const activeReception = receptionCentres.filter(
      (item) =>
        item.assignedCommunity === community.name &&
        !item.archived &&
        item.status !== "Closed"
    );

    if (activeReception.length > 0) {
      score += 10;
      drivers.push("Reception centre activity linked to community");
    }

    const cappedScore = Math.min(score, 100);
    const severity = getSeverity(cappedScore);

    return {
      community: community.name,
      score: cappedScore,
      severity: severity.level,
      color: severity.color,
      drivers,
      nearbyHotspots: nearbyHotspots.length,
      wildfireDistance: wildfireRecord?.closestDistance ?? null,
      aqhi: smoke?.aqhi ?? "N/A",
      aqhiCategory: smoke?.category ?? "No Data",
    };
  });

  return scoredCommunities.sort((a, b) => b.score - a.score);
}