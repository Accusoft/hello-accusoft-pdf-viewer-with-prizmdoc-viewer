'use strict';

const CONFIG_FILENAME = 'server/config.json5';
const fetch = require('../prizmDoc/fetch');

async function validateConfig() {
  try {
    const res = await fetch('/v3/viewingPackages/fake-viewing-package-to-validate-sample-config');

    if (res.status === 200) {
      // Our fake viewing package exists and PrizmDoc Server configured properly
      return;
    }

    // TODO: check with empty body
    const body = await res.json();
    if (res.status === 404 && body && body.errorCode === 'ResourceNotFound') {
      // Our fake viewing package does not exist, but PrizmDoc Server configured properly
      return;
    }
  
    if (res.status === 480 && body && body.errorCode === 'FeatureDisabled') {
      // TODO: add documentation link to configuration instructions
      console.error('ERROR: V3 Viewing Packages feature is not enabled.');
    } else {
      console.error(`ERROR: Unexpected response when trying to contact PrizmDoc Server. Have you configured the connection to PrizmDoc Server correctly in ${CONFIG_FILENAME}? Your "prizmDocServerUrl" may be incorrect. See the README for more information.`);
    }
    process.exit(1);
  } catch (error) {
    console.error(`ERROR: Failed to contact PrizmDoc Server: "${error}". Have you configured the connection to PrizmDoc Server correctly in ${CONFIG_FILENAME}? Your "prizmDocServerUrl" may be incorrect. See the README for more information.`);
    process.exit(1);
  }
}

module.exports = validateConfig;
