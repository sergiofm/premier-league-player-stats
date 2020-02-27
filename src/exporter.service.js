const XLSX = require('xlsx');

const exportStatsToXLSX = (playersStats, nationalitiesStats) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(playersStats), "Players");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nationalitiesStats), "Nationalities");
  try {
    XLSX.writeFileSync(wb, "statistics.xlsx", {
      Props: {
        Author: "Sergio Mendonça"
      }
    });
    return 'OK';
  } catch (err) {
    return {err};
  }
};

module.exports = {
  exportStatsToXLSX
};