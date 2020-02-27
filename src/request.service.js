const superagent = require('superagent');

const get = async (url, headers = {}) => await superagent.get(url).set(headers).catch(err => ({
  err
}));


module.exports = {
  get
};