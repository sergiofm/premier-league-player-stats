const { getPlayersStats } = require('./premier-api.service');
const { exportStatsToXLSX } = require('./exporter.service');

const sortByRank =  (a, b) => {
  return a.rank - b.rank;
};

const sortByName = (a, b) => {
  return a.name.localeCompare(b.name);
};

const mapStats = (statsMap = {}, player = {}) => {
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
};

const exportStats = async () => {
  console.log('Starting Premier League Player Stats Scrapper...');
  const playersStats = await getPlayersStats();
  if (playersStats.err) {
    console.error('Error scrapping stats from API', playersStats.err);
    return playersStats;
  }

  if (!playersStats.length) {
    return { err: 'Nothing to export!' };
  }

  const nationalitiesStatsMap = playersStats.reduce(mapStats, {});
  const nationalitiesStats = Object.values(nationalitiesStatsMap).sort(sortByName);

  console.log('Exporting Players Stats...');
  const exportResult = exportStatsToXLSX(playersStats.sort(sortByRank), nationalitiesStats);

  if (exportResult.err) {
    console.error('Error trying to export stats', exportResult.err);
    return exportResult;
  }

  console.log('Stats Exported Successfully!');
  return 'OK';
};

module.exports = {
  mapStats,
  exportStats
};

