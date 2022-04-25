'use strict';

const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');
const configFilePath = path.join(__dirname, '../config.json5');
const configFile = JSON5.parse(fs.readFileSync(configFilePath));
const config = {
  apiKey: process.env.API_KEY || configFile.apiKey,
  prizmDocServerUrl: process.env.PRIZMDOC_SERVER_URL || configFile.prizmDocServerUrl,
  packageIdSalt: process.env.ACCUSOFT_PACKAGEID_SALT || configFile.packageIdSalt
};
module.exports = config;
