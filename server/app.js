'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const app = express();
const documents = require('./routes/documents');
const viewingPackages = require('./routes/viewingPackages');

app.use(logger('dev'));

// Register the react app as our default route.
app.use('/', express.static(path.join(__dirname, '../client/build')));

// Register GET /documents so the client has a way to
// request the list of documents.
app.use(documents);

// Register POST and GET /viewingPackages routes so the client has a way
// to create viewing package, get viewing package state and content.
app.use(viewingPackages);

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
