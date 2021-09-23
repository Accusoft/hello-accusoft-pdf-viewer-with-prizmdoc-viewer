'use strict';

const express = require('express');
const router = express.Router();
const { join } = require('path');
const { readdir } = require('fs').promises;

// This route will be called by the client to get sample documents
// list. It returns the list of files in "server/documents" folder.
router.get('/documents', async (_req, res, next) => {
  try {
    const documentsFolder = join(__dirname, '..', 'documents');
    const documents = await readdir(documentsFolder);
    res.send({ documents });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
