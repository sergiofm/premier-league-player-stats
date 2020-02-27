const { exportStats } = require('./src/premier-stats-scrapper');


console.log('Welcom to Premier League Player Stats Scrapper!');

exportStats().then(() => process.exit()).catch(err => {
  console.error(err);
  process.exit(1);
});