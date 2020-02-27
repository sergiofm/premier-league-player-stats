const { getPlayersStats } = require('./premier-api.service');
const { exportPlayersStats, exportNationalitiesStats } = require('./exporter.service');

const playersStatsFields = ["rank", "name", "nationality", "goals"];
const nationalitiesStatsFields = ["name", "bestPlayerRank", "worstPlayerRank", "totalPlayers", "bestPlayerGoals", "worstPlayerGoals", "totalGoals"];

const sortByRank =  (a, b) => {
  return a.rank - b.rank;
};

const sortByName = (a, b) => {
  return a.name.localeCompare(b.name);
};

const mapStats = (statsMap, player) => {
  const {nationality, rank, goals} = player;
  if(nationality){
    const stats = statsMap[nationality] || {
      bestPlayerRank: rank,
      worstPlayerRank: rank,
      bestPlayerGoals: goals,
      worstPlayerGoals: goals,
      totalPlayers: 0,
      totalGoals: 0
    };
    statsMap[nationality] = {
      name: nationality,
      bestPlayerRank: Math.min(stats.bestPlayerRank, rank), 
      worstPlayerRank: Math.max(stats.worstPlayerRank, rank),
      bestPlayerGoals: Math.max(stats.bestPlayerGoals, goals),
      worstPlayerGoals: Math.min(stats.worstPlayerGoals, goals),
      totalPlayers: stats.totalPlayers + 1,
      totalGoals: stats.totalGoals + goals
    };
  }
  return statsMap;
}

const exportStats = async () => {
  console.log('Starting Premier League Player Stats Scrapper...');
  const playersStats = await getPlayersStats();
  if (playersStats.err) {
    console.error('Error scrapping stats from API', playersStats.err);
    return;
  }

  console.log('Exporting Players Stats...');
  const playersExportResult = await exportPlayersStats(playersStats.sort(sortByRank), playersStatsFields).catch(err => ({err}));

  if (playersExportResult.err) {
    console.error('Error trying to export players stats', playersExportResult.err);
    return;
  }

  console.log('Players Stats Exported Successfully!');

  const nationalitiesStatsMap = playersStats.reduce(mapStats, {});
  const nationalitiesStats = Object.values(nationalitiesStatsMap).sort(sortByName);

  console.log('Exporting Nationalities Stats...');
  const nationalitiesExportResult = await exportNationalitiesStats(nationalitiesStats, nationalitiesStatsFields).catch(err => ({
    err
  }));

  if (nationalitiesExportResult.err) {
    console.error('Error trying to export nationalities stats', nationalitiesExportResult.err);
    return;
  }

  console.log('Nationalities Stats Exported Successfully!');
};

module.exports = {
  exportStats
}

