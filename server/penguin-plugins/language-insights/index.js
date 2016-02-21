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

    return function langugeInsightsPlugin(context, method, data) {

        var book;
        switch (method) {
            case "analyze-book":
                book = books[data.toLowerCase()];

                if (book)
                    language.lookup(app, context, 'book', data, book.baseurl + book.text_files[0]);
                else
                    app.penguinchat.sendMessage("I didn't find " + data + " in the Gutenberg repository;  perhaps it is spelled differently?", context.userid);
                break;
            case "analyze-url":
                var src = context.input.toLowerCase();
                var url = src.substr(src.indexOf('http'));
                language.lookup(app, context, 'page', url, url);
                       break;
            case "analyze-concepts":
                book = books[data.toLowerCase()];

                if (book)
                    insights.lookup(app, context, data, book.baseurl + book.text_files[0]);
                else
                    app.penguinchat.sendMessage("I didn't find  " + data + " in the Gutenberg repository;  perhaps it is spelled differently?", context.userid);
                break;
            case "analyze-videos":
                if (data.length > 0)
                   insights.videos(app, context, data);
                else
                    app.penguinchat.sendMessage("I didn't find any additional meaningful concepts in the work", context.userid);
            default:
                break
        }
    }
}

module.exports = penguinPlugin;