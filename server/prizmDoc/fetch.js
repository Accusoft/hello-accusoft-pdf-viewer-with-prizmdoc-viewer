'use strict';

const nodeFetch = require('node-fetch');
const config = require('../config/loadConfig');

const fetch = function(url, options = {}) {
  const fullUrl = new URL(url, config.prizmDocServerUrl).toString();
  if (config.apiKey !== undefined) {
    if (options.headers === undefined) {
      options.headers = {};
    }
    options.headers['acs-api-key'] = config.apiKey;
  }
  return nodeFetch(fullUrl, options);
};

module.exports = fetch;
