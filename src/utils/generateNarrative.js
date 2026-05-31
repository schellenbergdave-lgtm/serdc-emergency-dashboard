export default function generateNarrative({
  reportScope,
  reportTitle,
  communityRiskScores = [],
  regionalWeather = null,
  regionalSmoke = null,
  activeEvacuations = [],
  activeReceptionCentres = [],
}) {
  const topRisks = communityRiskScores.slice(0, 3);
  const highestRisk = topRisks[0];

  const evacuationCount = activeEvacuations.length;
  const receptionCount = activeReceptionCentres.length;

  const executiveSummary = highestRisk
    ? `${reportScope === "active" ? "The current incident" : "The SERDC region"} is being monitored for changing emergency conditions. ${highestRisk.community} is currently the highest operational concern with a risk score of ${highestRisk.score}/100 and a severity level of ${highestRisk.severity}. Key drivers include ${highestRisk.drivers.length > 0 ? highestRisk.drivers.join(", ") : "no major active risk drivers currently identified"}.`
    : `${reportTitle} is currently being monitored. No community operational risk scores are available at this time.`;

  const weatherSummary = regionalWeather
    ? `Regional weather concern is ${regionalWeather.concern.level}. ${regionalWeather.concern.reason} The 72-hour regional outlook shows an average temperature of ${regionalWeather.averageTemperature.toFixed(
        1
      )} °C, average precipitation of ${regionalWeather.averagePrecipitation.toFixed(
        1
      )} mm, lowest relative humidity of ${regionalWeather.lowestHumidity}% at ${regionalWeather.driestCommunity?.community}, and strongest wind gusts of ${regionalWeather.maxWindGust} km/h at ${regionalWeather.windiestCommunity?.community}.`
    : "Regional weather summary has not loaded.";

  const smokeSummary = regionalSmoke
    ? `Regional smoke concern is ${regionalSmoke.concern.level}. ${regionalSmoke.concern.reason} ${
        regionalSmoke.highestSmoke
          ? `The highest current AQHI is reported at ${regionalSmoke.highestSmoke.community} with AQHI ${regionalSmoke.highestSmoke.aqhi} (${regionalSmoke.highestSmoke.category}).`
          : "No valid AQHI readings are currently loaded."
      }`
    : "Regional smoke summary has not loaded.";

  const evacuationSummary =
    evacuationCount > 0
      ? `${evacuationCount} active evacuation or evacuation monitoring record(s) are included in this report. Reception centre activity includes ${receptionCount} active reception centre record(s).`
      : `No active evacuation records are included in this report. Reception centre activity includes ${receptionCount} active reception centre record(s).`;

  const priorityCommunities =
    topRisks.length > 0
      ? topRisks
          .map(
            (item) =>
              `${item.community}: ${item.severity}, score ${item.score}/100. Drivers: ${
                item.drivers.length > 0
                  ? item.drivers.join("; ")
                  : "No major active risk drivers."
              }`
          )
          .join("\n")
      : "No priority communities identified.";

  const regionalOutlook = highestRisk
    ? `Operational priorities should continue to focus on the highest-risk communities, maintaining situational awareness of wildfire proximity, FIRMS hotspot activity, AQHI/smoke impacts, evacuation status, reception centre capacity, and logistics requirements. Risk scores should be reviewed whenever wildfire, weather, AQHI, or evacuation conditions change.`
    : `Operational priorities should continue to focus on routine monitoring and maintaining readiness across SERDC communities.`;

  return {
    executiveSummary,
    weatherSummary,
    smokeSummary,
    evacuationSummary,
    priorityCommunities,
    regionalOutlook,
  };
}