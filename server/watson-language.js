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

var path       = require('path'),
  watson     = require('watson-developer-cloud'),
  extend     = require('util')._extend,
  request = require('request'),
    async  = require('async');
 
var Language = function (credentials) {
    this.credentials = credentials;
    
    this.alchemy_language = watson.alchemy_language(this.credentials);
    
};

Language.prototype.lookup = function (req, res, next, url) {
    console.log(url);
    var self = this;
    var params = { url: url, maxRetrieve: 50, sentiment: 1, outputMode: "json" };
    self.alchemy_language.entities(params, function (err, results) {
        console.log("LANGUAGE " + err + results);
        if (err) {
            console.log(err);
            return next(err);
        }

        res.json(results);
    });
}  

module.exports = Language;