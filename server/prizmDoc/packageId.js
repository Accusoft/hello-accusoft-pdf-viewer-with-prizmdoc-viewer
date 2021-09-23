'use strict';

const crypto = require('crypto');
const base64url = require('base64url');
const config = require('../config/loadConfig');

// Generates packageId which is used to uniquely identify the document.
// Result will be always the same for the same input documentName and salt.
const getPackageIdForDocument = documentName => {
  let input = documentName;
  if (config.packageIdSalt) {
    input = `${documentName}_${config.packageIdSalt}`;
  }
  const hashBuffer = crypto
    .createHash('sha256')
    .update(input)
    .digest();
  return base64url.encode(hashBuffer);
};

module.exports.getPackageIdForDocument = getPackageIdForDocument;
