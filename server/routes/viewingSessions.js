'use strict';

const express = require('express');
const router = express.Router();
const fetch = require('../prizmDoc/fetch');
const { getPackageIdForDocument } = require('../prizmDoc/packageId');

// This route will be called by the client when it needs to view the document. 
// This route will contact PrizmDoc Server to create a Viewing Session 
// and return viewingSessionId to the client.
router.post('/viewingSessions/:document', async (req, res, next) => {
  try {
    // Generate packageId which is used to uniquely identify the document.
    const packageId = getPackageIdForDocument(req.params.document);

    // Create new Viewing Session
    const response = await fetch('/v3/viewingSessions', { // https://help.accusoft.com/PrizmDoc/latest/HTML/v3-viewing-sessions.html#post-v3viewingsessions
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          source: {
            type: 'viewingPackage',
            packageId
          }
        }
      })
    });
    if (response.status !== 200) {
      throw new Error(`Not expected response when trying to create Viewing Session: HTTP ${response.status}`);
    }

    // Viewing Session created successfully.
    const { viewingSessionId } = await response.json();
    res.send({ viewingSessionId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
