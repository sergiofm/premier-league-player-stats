const superagent = require('superagent');

const PAGE_SIZE = 500;
const BASE_URL = `https://footballapi.pulselive.com/football/stats/ranked/players/goals?pageSize=${PAGE_SIZE}&comps=1&compCodeForActivePlayer=EN_PR&altIds=true&page=`;
const ORIGIN_HEADER = "origin";
const ORIGIN_HEADER_VALUE = "https://www.premierleague.com";

const getApiResults = async (pageNumber = 0) => {
  console.log('Scrapping page', pageNumber);
  const {body: {stats: {pageInfo, content} = {}} = {stats: {}}, err} = 
    await superagent.get(BASE_URL+pageNumber).set(ORIGIN_HEADER, ORIGIN_HEADER_VALUE).catch(err => ({err}));

  if(err) return { err };
  if(!pageInfo || !content) return { err: 'Invalid API result' };

  if(pageNumber < pageInfo.numPages - 1) {
    const nextPageContent = await getApiResults(pageNumber + 1);
    if(nextPageContent.err) return { err: nextPageContent.err };
    return [...content, ...nextPageContent];
  }

  return content;
};

const flattenResult = result => {
  const { owner: { birth, name } = {}, rank = 0, value: goals = 0 } = result;
  if (!birth || !birth.country || !name) return { err: "Invalid result"};
  return {
    rank, 
    name: name.display,
    nationality: birth.country.country,
    goals
  };
};

const getPlayersStats = async () => {
  const results = await getApiResults();
  if(results.err) return results;
  return results.map(flattenResult).filter(({err}) => !err);
};

module.exports = {
  BASE_URL,
  getApiResults,
  flattenResult,
  getPlayersStats
};