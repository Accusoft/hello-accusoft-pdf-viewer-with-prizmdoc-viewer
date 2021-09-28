'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const fetch = require('../prizmDoc/fetch');
const { getPackageIdForDocument } = require('../prizmDoc/packageId');

// This map is used to track Viewing Package creation status
// so the application can return it to the client.
const viewingPackageCreatorsMap = new Map();

// This route will be called by the client when it needs to create a
// viewing package to be able to view the document. This route will contact 
// PrizmDoc Server to create a work file resource and new Viewing Package
// for a document.
//
// In this example Node.js application, this route accepts a document filename
// via a "document" query string parameter. In your actual application, you
// might choose to use some other document identifier, such as a database id.
// The key idea here is that this route gives the client a way to say "I need to
// create a Viewing Package for document XYZ" (where XYZ is how you identify
// a document in your application).
router.post('/viewingPackages/:document', async (req, res, next) => {
  try {
    const documentName = req.params.document;
    const fileExtension = path.extname(documentName).slice(1);

    // Generate packageId which is used to uniquely identify the document.
    const packageId = getPackageIdForDocument(req.params.document);

    // 1. Create a work file resource from local document
    const documentPath = path.join(__dirname, '..', 'documents', documentName);
    const documentStream = fs.createReadStream(documentPath);
    const workFileResponse = await fetch(`/PCCIS/V1/WorkFile?FileExtension=${fileExtension}`, { // See https://help.accusoft.com/PrizmDoc/latest/HTML/work-files.html#post-pccisv1workfile-when-body-is-file-bytes
      method: 'POST',
      body: documentStream
    });
    if (workFileResponse.status !== 200) {
      throw new Error(`Not expected response when trying to create workfile resource: HTTP ${workFileResponse.status}`);
    }
    const { fileId, affinityToken } = await workFileResponse.json();

    // 2. Start new Viewing Package Creator
    const creatorResponse = await fetch('/v3/viewingPackageCreators', { // See https://help.accusoft.com/PrizmDoc/latest/HTML/v3-viewing-package-creators.html#post-v3viewingpackagecreators
      method: 'POST',
      headers: extendWithAffinity({ 
        'Content-Type': 'application/json'
      }, affinityToken),
      body: JSON.stringify({
        input: {
          source: { 
            type: 'workFile',
            fileId 
          },
          packageId,
          lifetimeAfterLastUse: '1d'
        }
      })
    });
    if (creatorResponse.status !== 200) {
      throw new Error(`Not expected response when trying to start Viewing Package Creator: HTTP ${creatorResponse.status}`);
    }

    // Viewing Package Creator started successfully.
    // Send response to client and start polling Viewing Package Creator state
    // so the application knows when viewing package creation is complete.
    const { processId, state } = await creatorResponse.json();
    viewingPackageCreatorsMap.set(packageId, { processId, state, affinityToken });
    pollViewingPackageCreation(packageId);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

// This route returns the state of Viewing Package for a document.
// Possible states are:
//   "not-found"  - there is no Viewing Package for this document.
//                  Viewing Package needs to be created with
//                  POST /viewingPackages/:document route.
//   "processing" - Viewing Package creation is in progress.
//   "complete"   - Viewing Package is ready. Now client can 
//                  get Viewing Package content with
//                  GET /viewingPackages/:document/content/pdf route.
//   "error"      - Viewing Package creation failed for this document.
router.get('/viewingPackages/:document', async (req, res, next) => {
  try {
    const packageId = getPackageIdForDocument(req.params.document);

    // Check Viewing Package Creator state for this packageId.
    // Application tracks viewing package creation because we can not
    // get Viewing Package state before the creation process has completed.
    const viewingPackageCreator = viewingPackageCreatorsMap.get(packageId);
    if (viewingPackageCreator) {
      switch (viewingPackageCreator.state) {
      case 'queued':
      case 'processing':
        res.send({ state: 'processing' });
        return;
      case 'complete':
        // Viewing Package creation is complete, we will use 
        // PrizmDoc Server API to get Viewing Package state.
        break;
      default:
        res.send({ state: 'error' });
        return;
      }
    }

    // Request Viewing Package state from PrizmDoc Server.
    const stateResponse = await fetch(`/v3/viewingPackages/${packageId}`); // See https://help.accusoft.com/PrizmDoc/latest/HTML/v3-viewing-packages.html#get-v3viewingpackagespackageid
    if (stateResponse.status === 200) {
      res.send({ state: 'complete' });
    } else if (stateResponse.status === 404) {
      res.send({ state: 'not-found' });
    } else {
      throw new Error(`Not expected response when trying to get viewing package state: HTTP ${stateResponse.status}`);
    }
  } catch (err) {
    next(err);
  }
});

// This route will be called by the client whenever it needs to view a document.
// This route will contact PrizmDoc Server to receive PDF content of Viewing Package.
router.get('/viewingPackages/:document/content/pdf', async (req, res, next) => {
  try {
    const packageId = getPackageIdForDocument(req.params.document);
    const contentResponse = await fetch(`/v3/viewingPackages/${packageId}/content/pdf`); // See https://help.accusoft.com/PrizmDoc/latest/HTML/v3-viewing-packages.html#get-v3viewingpackagespackageidcontentpdf
    if (contentResponse.status === 200) {
      res.set('content-type', 'application/pdf');
      contentResponse.body.pipe(res);
    } else {
      throw new Error(`Not expected response when trying to download viewing package content: HTTP ${contentResponse.status}`);
    }
  } catch (err) {
    next(err);
  }
});

// This function repeatedly requests Viewing Package Creator state
// until it is complete and updates Viewing Package creation status
// in the application.
const pollViewingPackageCreation = async (packageId) => {
  const { processId, affinityToken } = viewingPackageCreatorsMap.get(packageId);
  let state;
  do {
    // Wait half a second between requests
    await wait(500);

    // Request Viewing Package Creator state from PrizmDoc Server.
    const stateResponse = await fetch(`/v3/viewingPackageCreators/${processId}`, { // See https://help.accusoft.com/PrizmDoc/latest/HTML/v3-viewing-package-creators.html#get-v3viewingpackagecreatorsprocessid
      method: 'GET',
      headers: extendWithAffinity({}, affinityToken)
    });
    if (stateResponse.status !== 200) {
      throw new Error(`Not expected response when trying to get viewing package creator state: HTTP ${stateResponse.status}`);
    }
    const stateJson = await stateResponse.json();
    state = stateJson.state;
    viewingPackageCreatorsMap.set(packageId, { processId, state });
    if (state === 'error') {
      // In your actual application you might check "errorCode"
      // to handle different errors in a different way.
      throw new Error(`Viewing Package creation failed for processId ${processId}`);
    }
  } while(state === 'queued' || state === 'processing');
};

// Util function to add affinity token header which is required
// when server clustering is enabled.
const extendWithAffinity = (headers, affinityToken) => {
  if (affinityToken) {
    headers['Accusoft-Affinity-Token'] = affinityToken;
  }
  return headers;
};

// Util function which wraps setTimeout in a promise.
const wait = async ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

module.exports = router;
