import { useEffect } from "react";
import useStoredState from "./useStoredState";

export default function useNotificationEngine({
  incidents = [],
  watchList = [],
  communityRiskScores = [],
  airQualityData = [],
  communityStatus = [],
  evacuations = [],
}) {
  const [notifications, setNotifications] = useStoredState(
    "serdcNotifications",
    []
  );

  const [lastNotificationState, setLastNotificationState] = useStoredState(
    "serdcLastNotificationState",
    {}
  );

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/first nation/g, "")
      .replace(/ojibway nation/g, "")
      .replace(/fn/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }
  
  function isWatchedCommunity(community) {
    if (!watchList.length) return true;
  
    const cleanCommunity = normalize(community);
  
    return watchList.some((item) => {
      const cleanWatch = normalize(item);
  
      return (
        cleanWatch === cleanCommunity ||
        cleanWatch.includes(cleanCommunity) ||
        cleanCommunity.includes(cleanWatch)
      );
    });
  }

  function createNotification({ id, level, title, message, community }) {
    const notification = {
      id: `${id}-${Date.now()}`,
      baseId: id,
      level,
      title,
      message,
      community,
      created: new Date().toLocaleString("en-CA"),
      read: false,
    };

    setNotifications([notification, ...notifications].slice(0, 200));
  }

  useEffect(() => {
    const nextState = { ...lastNotificationState };

    incidents.forEach((incident) => {
      if (incident.archived) return;
    
      const incidentCommunity =
  incident.community ||
  incident.communityName ||
  incident.affectedCommunity ||
  incident.communityNameCode ||
  incident.name;
    
      const key = `incident-priority-${incident.id}`;
      const previous = lastNotificationState[key];
      const current = incident.priority;
    
      if (!isWatchedCommunity(incidentCommunity)) {
        nextState[key] = current;
        return;
      }
    
      if (previous && previous !== current) {
        if (current === "Critical" || current === "High") {
          createNotification({
            id: key,
            level: current === "Critical" ? "Critical" : "Elevated",
            community: incidentCommunity || "Regional",
            title: `${incident.incidentNumber || "Incident"} priority changed to ${current}`,
            message: `${incident.name || "Unnamed incident"} priority changed from ${previous} to ${current}.`,
          });
        }
      }
    
      nextState[key] = current;
    });

    communityRiskScores.forEach((community) => {
      if (!isWatchedCommunity(community.community)) return;
      const key = `risk-${community.community}`;
      const previous = lastNotificationState[key];
      const current = community.severity;

      if (previous && previous !== current) {
        if (current === "Critical" || current === "Elevated") {
          createNotification({
            id: key,
            level: current,
            community: community.community,
            title: `${community.community} risk changed to ${current}`,
            message: `Risk score is now ${community.score}/100. Drivers: ${
              community.drivers.length
                ? community.drivers.join("; ")
                : "No drivers listed."
            }`,
          });
        }
      }

      nextState[key] = current;
    });

    airQualityData.forEach((item) => {
      if (!isWatchedCommunity(item.community)) return;
      const key = `aqhi-${item.community}`;
      const previous = lastNotificationState[key];
      const current = item.category;

      if (previous && previous !== current) {
        if (current === "High" || current === "Very High") {
          createNotification({
            id: key,
            level: current === "Very High" ? "Critical" : "Elevated",
            community: item.community,
            title: `${item.community} AQHI changed to ${current}`,
            message: `AQHI ${item.aqhi}. PM2.5: ${
              item.pm25 ?? "No Data"
            }.`,
          });
        }
      }

      nextState[key] = current;
    });

    communityStatus.forEach((community) => {
      if (!isWatchedCommunity(community.name)) return;
      const key = `fire-distance-${community.name}`;
      const distance = Number(community.closestDistance);
      const current =
        community.closestFire && Number.isFinite(distance)
          ? distance <= 25
            ? "Critical"
            : distance <= 50
            ? "Monitor"
            : "Normal"
          : "Normal";

      const previous = lastNotificationState[key];

      if (previous && previous !== current && current === "Critical") {
        createNotification({
          id: key,
          level: "Critical",
          community: community.name,
          title: `${community.name} wildfire proximity changed to Critical`,
          message: `${community.closestFire?.fireName || "Wildfire"} is ${
            community.closestDistance
          } km from the community.`,
        });
      }

      nextState[key] = current;
    });

    evacuations.forEach((record) => {
      if (!isWatchedCommunity(record.community)) return;
      if (record.archived) return;

      const key = `evacuation-${record.community}`;
      const previous = lastNotificationState[key];
      const current = record.status;

      if (previous && previous !== current) {
        if (
          current === "Partial Evacuation" ||
          current === "Full Evacuation"
        ) {
          createNotification({
            id: key,
            level: current === "Full Evacuation" ? "Critical" : "Elevated",
            community: record.community,
            title: `${record.community} evacuation changed to ${current}`,
            message: `Evacuees: ${record.evacuees || "0"}. Reception Centre: ${
              record.receptionCentre || "Not listed"
            }.`,
          });
        }
      }

      nextState[key] = current;
    });

    setLastNotificationState(nextState);
  }, [
    communityRiskScores.length,
    airQualityData.length,
    communityStatus.length,
    evacuations.length,
  ]);

  function markNotificationRead(id) {
    setNotifications(
      notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }

  function clearNotifications() {
    if (!window.confirm("Clear all notifications?")) return;
    setNotifications([]);
  }

  return {
    notifications,
    unreadNotifications: notifications.filter((item) => !item.read),
    markNotificationRead,
    clearNotifications,
  };
}