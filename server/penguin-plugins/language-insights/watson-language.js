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

Language.prototype.lookup = function (app, context, itemType, book, url) {
    var self = this;
    var params = { url: url, maxRetrieve: 50, sentiment: 1, outputMode: "json" };
    self.alchemy_language.entities(params, function (err, results) {
         if (err) {
            console.log(err);
           app.penguinchat.sendMessage("I had trouble: " + err.toString(), context.userid);
        } else
        {
            var positives = [];
            var negatives = [];

            if (results.entities && results.entities.length) {
                var name;
                for (var i = 0; i < results.entities.length; i++) {
                    name = results.entities[i].text + "[" + results.entities[i].type + "]";
                    if (self.check_duplicate_concept(positives, name) || (results.entities[i].sentiment.type != "positive") || positives.length == 3)
                        continue;
                    else {
                        positives.push(name);
                    }
                }
                for (var i = 0; i < results.entities.length; i++) {
                     name = results.entities[i].text + "[" + results.entities[i].type + "]";
                    if (self.check_duplicate_concept(negatives, name) || (results.entities[i].sentiment.type != "negative") || negatives.length == 3)
                        continue;
                    else {
                        negatives.push(name);
                    }
                }
            }
	         
            
            app.penguinchat.sendMessage("I just read the entire text of " + book + ", thanks!  It is in the public domain so can download it too from <a href='" + url + "' target='_blank'>here</a>", context.userid); 

            app.penguinchat.sendMessage("The " + itemType + " " + book + " is positive towards " + positives.join(", and "), context.userid);
            app.penguinchat.sendMessage("The " + itemType + " " + book + " is negative towards " + negatives.join(", and "), context.userid); 
            if (!book.startsWith('http'))
              app.penguinhandler["language-insights"](context, "analyze-concepts", book);           
        }
    });
}  

Language.prototype.check_duplicate_concept = function (unique_concept_array, concept) {

        for (var i = 0; i < unique_concept_array.length; i++) {
            if (unique_concept_array[i] == concept)
                return true;
        }

        return false;
    }

module.exports = Language;