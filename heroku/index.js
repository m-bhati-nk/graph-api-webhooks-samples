/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || 'token';
var received_updates = [];
var deletes = [];
var deauths = [];

app.get('/', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get('/deletes', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(deletes, null, 2) + '</pre>');
});

app.get('/deauth', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(deauths, null, 2) + '</pre>');
});

app.get(['/facebook', '/instagram', '/threads'], function(req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == token
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.get('/instagram/data_deletion', function(req, res) {
  console.log('Instagram deletion request GET body:');
  // Process the Facebook deauth here
  res.send({'confirmation_code': req.query['confirmation_code']});
});

app.post('/instagram/data_deletion', function(req, res) {
  console.log('Instagram deletion request POST body:');
  // Process the Facebook deauth here
  deletes.unshift(req.body);
  res.send({'confirmation_code': req.body['confirmation_code']});
}
);

app.post('/instagram/deauthorize', function(req, res) {
  console.log('Instagram deletion request POST body:');
  // Process the Facebook deauth here
  deletes.unshift(req.body);
  res.send({'confirmation_code': req.body['confirmation_code']});
}
);

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/threads', function(req, res) {
  console.log('Threads request body:');
  console.log(req.body);
  // Process the Threads updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen();
