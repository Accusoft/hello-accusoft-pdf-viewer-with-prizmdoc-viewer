'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const app = express();
const documents = require('./routes/documents');
const viewingPackages = require('./routes/viewingPackages');
const viewingSessions = require('./routes/viewingSessions');
const createProxyRouteToPrizmDoc = require('./prizmDoc/createProxyRoute');
const config = require('./config/loadConfig');

app.use(logger('dev'));

// Setup the proxy to PrizmDoc Server.
// The viewer will send all of its requests for document content to the
// /prizmdoc route and the proxy will forward those requests
// on to PrizmDoc Server. If you are using PrizmDoc Cloud, the proxy will also inject your API
// key before forwarding the request.
app.use(createProxyRouteToPrizmDoc('/prizmdoc', config.prizmDocServerUrl, config.apiKey));


// Register the react app as our default route.
app.use('/', express.static(path.join(__dirname, '../client/build')));

// Register GET /documents so the client has a way to
// request the list of documents.
app.use(documents);

// Register POST and GET /viewingPackages routes so the client has a way
// to create viewing package and get viewing package state.
app.use(viewingPackages);

// Register POST /viewingSessions route so the client has a way
// to create a viewing session.
app.use(viewingSessions);

// catch 404 and forward to error handler
app.use(function(_req, _res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res /*, next*/) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
