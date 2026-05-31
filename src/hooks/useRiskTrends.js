import { useEffect, useMemo } from "react";
import useStoredState from "./useStoredState";

export default function useRiskTrends(communityRiskScores = []) {
  const [previousRiskScores, setPreviousRiskScores] = useStoredState(
    "serdcPreviousRiskScores",
    []
  );

  const trends = useMemo(() => {
    return communityRiskScores.map((current) => {
      const previous = previousRiskScores.find(
        (item) => item.community === current.community
      );

      const previousScore = Number(previous?.score ?? current.score);
      const currentScore = Number(current.score ?? 0);
      const change = currentScore - previousScore;

      let direction = "No Change";
      let arrow = "→";
      let color = "#64748b";

      if (change > 0) {
        direction = "Increasing";
        arrow = "↑";
        color = "#dc2626";
      } else if (change < 0) {
        direction = "Decreasing";
        arrow = "↓";
        color = "#22c55e";
      }

      return {
        ...current,
        previousScore,
        change,
        direction,
        arrow,
        trendColor: color,
      };
    });
  }, [communityRiskScores, previousRiskScores]);

  function saveRiskSnapshot() {
    const snapshot = communityRiskScores.map((item) => ({
      community: item.community,
      score: item.score,
      severity: item.severity,
      savedAt: new Date().toLocaleString("en-CA"),
    }));

    setPreviousRiskScores(snapshot);
  }

  useEffect(() => {
    if (previousRiskScores.length === 0 && communityRiskScores.length > 0) {
      saveRiskSnapshot();
    }
  }, [communityRiskScores.length]);

  return {
    trends,
    previousRiskScores,
    saveRiskSnapshot,
  };
}