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

var fs = require('fs');
var path = require('path');

var CSVParser = require('csv-parse');
var books = {};
var c = 0;
var tab = '\t';
var base = 'https://raw.githubusercontent.com/gitenberg/';

fs.createReadStream(path.join(__dirname, 'gitenberg.tsv')).pipe(CSVParser({
    delimiter: tab, relax: true, 
    columns: ['id', 'gitb_id', 'gitb_name', 'title', 'language', 'downloads', 'text_files']
}, function (err, data) {

    data.forEach(function (row) {
        
        var baseUrl = row['gitb_id'];
        if ((!baseUrl) || (baseUrl == 'gitb_id'))
            return;
        var text_files = row['text_files'].replace('[','').replace(']','').split(",");
        
         var book = {
            id: row['id'],
            gitb_id: row['gitb_id'],
            title: row['title'].replace('-', ' '),
            baseurl: base + row['gitb_name'] + '/master/',
            text_files: text_files
        }
        var key = book.title.toLowerCase();
        if (!books[key])
        books[key] = book;
        c ++;
    });
    console.log(c + "books registered");
}));

module.exports = books;