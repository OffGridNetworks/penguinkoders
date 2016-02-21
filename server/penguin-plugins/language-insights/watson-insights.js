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

var path = require('path'),
    watson = require('watson-developer-cloud'),
    extend = require('util')._extend,
    request = require('request'),
    async = require('async');

var Insights = function (credentials) {
    this.credentials = credentials;

    this.corpus_id = process.env.CORPUS_ID || '/corpora/public/TEDTalks';
    this.graph_id = process.env.GRAPH_ID || '/graphs/wikipedia/en-20120601';
    this.conceptInsights = watson.concept_insights(this.credentials);
};

Insights.prototype.lookup = function (app, context, book, url) {
    var self = this;

    request.get(url, function (err, response, body) {
        if (response != null) {
            var start = body.substring(0, 1000).indexOf("CHAPTER");
            if (start == -1) {
                start = body.substring(0, 1000).indexOf("*** START OF THIS PROJECT");
                if (start == -1)
                    start = 0;
                else
                    start += 30;
            }

            var params = { graph: self.graph_id, text: body.substring(start, 32700) };
            self.conceptInsights.graphs.annotateText(params, function (err, results) {
                if (err) {
                    console.log(err);
                    app.penguinchat.sendMessage("I had trouble: " + err.toString(), context.userid);

                } else {

                    var unique_concept_array = [];

                    if (results.annotations && results.annotations.length) {
                        for (var i = 0; i < results.annotations.length; i++) {
                            if (self.check_duplicate_concept(unique_concept_array, results.annotations[i].concept.id) || (results.annotations[i].concept.label == book) || unique_concept_array.length == 3)
                                continue;
                            else {
                                unique_concept_array.push(results.annotations[i].concept.id);
                            }
                        };

                        app.penguinhandler["language-insights"](context, "analyze-videos", unique_concept_array);
                    }
                }
            });
        }
        else app.penguinchat.sendMessage("I had trouble: " + err.toString(), context.userid);
    });
}

Insights.prototype.videos = function (app, context, concepts) {
    var params = extend({ corpus: this.corpus_id,  
                         ids: concepts,
                          limit: 3,
                        document_fields: JSON.stringify({
                            user_fields: 1
                        }) }, context);
    var self = this;
    this.conceptInsights.corpora.getRelatedDocuments(params, function (err, data) {
        if (err)
            app.penguinchat.sendMessage("I had trouble: " + err.toString(), context.userid);
        else {
            async.parallel(data.results.map(self._getPassagesAsync.bind(self)), function (err, documentsWithPassages) {
                if (err)
                    app.penguinchat.sendMessage("I had trouble: " + err.toString(), context.userid);
                else {
                    var results = documentsWithPassages;
                    for (var i = 0; i < results.length; i++)
                          self.generate_TED_panel(app, context, results[i]);
                }
            });
        }
    });
}

Insights.prototype.check_duplicate_concept = function (unique_concept_array, concept) {

        for (var i = 0; i < unique_concept_array.length; i++) {
            if (unique_concept_array[i] == concept)
                return true;
        }

        return false;
    }


var crop = function(doc, tag){
  var textIndexes = tag.text_index;
  var documentText = doc.parts[tag.parts_index].data;

  var anchor = documentText.substring(textIndexes[0], textIndexes[1]);
  var left = Math.max(textIndexes[0] - 100, 0);
  var right = Math.min(textIndexes[1] + 100, documentText.length);

  var prefix = documentText.substring(left, textIndexes[0]);
  var suffix = documentText.substring(textIndexes[1], right);

  var firstSpace = prefix.indexOf(' ');
  if ((firstSpace !== -1) && (firstSpace + 1 < prefix.length))
      prefix = prefix.substring(firstSpace + 1);

  var lastSpace = suffix.lastIndexOf(' ');
  if (lastSpace !== -1)
    suffix = suffix.substring(0, lastSpace);

  tag.passage = '...' + prefix + '<b>' + anchor + '</b>' + suffix + '...';
};

Insights.prototype._getPassagesAsync = function(doc) {
    var self = this;
  return function (callback) {
    self.conceptInsights.corpora.getDocument(doc, function(err, fullDoc) {
      if (err)
        callback(err);
      else {
        doc = extend(doc, fullDoc);
        doc.explanation_tags.forEach(crop.bind(self, doc));
        delete doc.parts;
        callback(null, doc);
      }
    });
  };
};


Insights.prototype.generate_TED_panel = function (app, context, TED_data) {
        app.penguinchat.sendMessage("I am " + Math.floor(TED_data.score * 100) + "% confident that a relevant TED talk is <a href='" + TED_data.user_fields.url + "'  target='_blank'>" + TED_data.user_fields.title + "</a> by " + TED_data.user_fields.speaker, context.userid);
    }


module.exports = Insights;