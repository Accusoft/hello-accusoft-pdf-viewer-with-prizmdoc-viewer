'use strict';

const nodeFetch = require('node-fetch');
const config = require('../config/loadConfig');

const fetch = function(url, options) {
  const fullUrl = new URL(url, config.prizmDocServerUrl).toString();
  return nodeFetch(fullUrl, options);
};

module.exports = fetch;
