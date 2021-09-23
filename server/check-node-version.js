'use strict';

var semver = require('semver');

if (semver(process.version).major < 12) {
  console.error('-------------------------------------------------------');
  console.error('ERROR: Sorry, this sample requires Node.js 12 or higher!');
  console.error('       Try again with a newer version of node.');
  console.error('-------------------------------------------------------');
  process.exit(1);
}
