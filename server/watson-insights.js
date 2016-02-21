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
 
var Insights = function (credentials) {
    this.credentials = credentials;
    
     this.corpus_id = process.env.CORPUS_ID || '/corpora/public/TEDTalks';
     this.graph_id  = process.env.GRAPH_ID ||  '/graphs/wikipedia/en-20120601';
     this.conceptInsights = watson.concept_insights(this.credentials);
 
    
};

Insights.prototype.lookup = function(req, res, next, url) {
   var self = this;
   request.get(url, function(err, response, body){
       if (response != null)
       { 
           var start = body.substring(0,1000).indexOf("CHAPTER");
           if (start == -1)
           {
              start = body.substring(0,1000).indexOf("*** START OF THIS PROJECT");
               if (start == -1)
                    start = 0;
               else 
                    start += 30;  
           } 
            
        var params = { graph: self.graph_id, text: body.substring(start, 32700) };
        self.conceptInsights.graphs.annotateText(params, function(err, results) {
             console.log("INSIGHTS " + err + results); 
            if (err) {
                console.log(err);
                  return next(err);
            }
        	 
            res.json(results);
        });
       }
       else return next(err);       
   });
}

Insights.prototype.videos = function(req,res,next){
      var params = extend({ corpus: this.corpus_id, limit: 10 }, req.query);
      console.log(params);
  var self = this;
  this.conceptInsights.corpora.getRelatedDocuments(params, function(err, data) {
    if (err)
      return next(err);
    else {
      async.parallel(data.results.map(self._getPassagesAsync.bind(self)), function(err, documentsWithPassages) {
        if (err)
          return next(err);
        else{
          data.results = documentsWithPassages;
          res.json(data);
        }
      });
    }
  });
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

module.exports = Insights;