/**
 * Copyright 2016 OffGrid Penguins
 * Portions Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var books = require('./resources/gitenberg.js');

var express  = require('express'),
  app        = express(),
  fs         = require('fs'),
  path       = require('path'),
  credentials    = require('../config/bluemix.json'),
  extend     = require('util')._extend,
  watson     = require('watson-developer-cloud'),
  errorhandlerLocal = require('./error-handler.js'),
  errorhandler = require('errorhandler'),
  bodyParser   = require('body-parser'),
  watsonDialog = require('./watson-dialog.js'),
  WatsonInsights = require('./watson-insights.js'),
  WatsonLanguage = require('./watson-language.js')
  
// Bootstrap express
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(express.static(__dirname + '/../client'));

  watsonDialog(app, credentials.dialog);
  var insights = new WatsonInsights(credentials["concept-insights"]);
  var language = new WatsonLanguage(credentials["alchemy-language"]);

app.post('/book1', function(req, res, next) {
  var book = books[req.body.book.toLowerCase()];
  
  if (book)
  {
      language.lookup(req, res, next, book.baseurl + book.text_files[0]);
  }
  else  
     res.json({success: false});
});

app.post('/book2', function(req, res, next) {
  var book = books[req.body.book.toLowerCase()];
  
  if (book)
  {
     insights.lookup(req, res, next, book.baseurl + book.text_files[0]);
   }
  else  
     res.json({success: false});
});

app.get('/ted', function(req, res, next) {
   return  insights.videos(req, res, next);
});

// error-handler settings
app.use(errorhandler());
errorhandlerLocal(app);

var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening at:', port);
