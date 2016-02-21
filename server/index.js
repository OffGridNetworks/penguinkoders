/**
 * Copyright 2016 OffGrid Penguins
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

var express  = require('express'),
  fs         = require('fs'),
  path       = require('path'),
  credentials    = require('../config/credentials.json'),
  extend     = require('util')._extend,
  errorCatchAll = require('./util/error-handler.js'),
  errorhandler = require('errorhandler'),
  bodyParser   = require('body-parser'),
  PenguinChat = require('./core-chat'),
  shim = require('./util/startswith.js')
  
var app = express();
  
// Bootstrap express
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(express.static(__dirname + '/../client'));
  
// Bootstrap PenguinDialog API
var dialog = require('./core-dialog')(app, credentials["dialog"])
  
// Bootstrap PenguinChat Channel
app.penguinchat = new PenguinChat(app, credentials["dialog"])

// Load Custom Penguin Plugins
var pluginsMetaData = require('../penguin.json').plugins;
app.penguinhandler = {};
pluginsMetaData.forEach(function(plugin){
    var pluginHandler = require(plugin.main);
    app.penguinhandler[plugin.name] = pluginHandler(app, credentials[plugin.name]);
    console.log("loaded penguin plugin " + plugin.name + " by " + plugin.supplier);
});

// Load error handlers
errorCatchAll(app);
app.use(errorhandler());

// Start server
var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening at:', port);
