const fs = require('fs');
const { parse } = require("json2csv");

const writeJsonArrayToCSVFile = (jsonArray, fields, filename) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, parse(jsonArray, { fields }), 'utf8', err => {
      if (err) return reject(err);
      resolve('OK');
    });
  });
  
};

const exportPlayersStats = async (stats, fields) => {
  return await writeJsonArrayToCSVFile(stats, fields, 'players.csv');
};

const exportNationalitiesStats = async (stats, fields) => {
  return await writeJsonArrayToCSVFile(stats, fields, 'nationalities.csv');
};

module.exports = {
  exportPlayersStats,
  exportNationalitiesStats
}