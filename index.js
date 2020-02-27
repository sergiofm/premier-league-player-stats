const { exportStats } = require('./src/premier-stats-scrapper');


console.log('Welcom to Premier League Player Stats Scrapper!');

exportStats().then(result => {
  const { err } = result;
  if(err){
    console.error(err);
    return process.exit(1);
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});