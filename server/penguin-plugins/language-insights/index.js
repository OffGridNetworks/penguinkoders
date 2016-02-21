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

var books = require('./gitenberg.js'),
  WatsonInsights = require('./watson-insights.js'),
  WatsonLanguage = require('./watson-language.js')

var penguinPlugin = function (app, credentials) {

  var insights = new WatsonInsights(credentials["concept-insights"]);
  var language = new WatsonLanguage(credentials["alchemy-language"]);

    app.post('/language-insights-sentiments', function (req, res, next) {
        var book = books[req.body.book.toLowerCase()];

        if (book) {
            language.lookup(req, res, next, book.baseurl + book.text_files[0]);
        }
        else
            res.json({ success: false });
    });

    app.post('/language-insights-concepts', function (req, res, next) {
        var book = books[req.body.book.toLowerCase()];

        if (book) {
            insights.lookup(req, res, next, book.baseurl + book.text_files[0]);
        }
        else
            res.json({ success: false });
    });

    app.get('/language-insights-ted', function (req, res, next) {
        return insights.videos(req, res, next);
    });

}