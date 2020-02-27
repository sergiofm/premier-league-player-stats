const XLSX = require('xlsx');

const FILENAME = "statistics.xlsx";

const exportStatsToXLSX = async (playersStats, nationalitiesStats) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(playersStats), "Players");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nationalitiesStats), "Nationalities");
  return await XLSX.writeFile(wb, FILENAME, {
    Props: {
      Author: "Sergio Mendonça"
    }
  });
};

module.exports = {
  exportStatsToXLSX
};