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
  fs = require('fs')
 
var Dialog = function (app, credentials) {

    //Setup Predefined Watson Dialog Flow
    //To edit the flow, change the dialog.xml file in each plugin directory and incorporate into penguin.xml in root dialogs directory
    var dialog_id_in_json = (function () {
        try {
            var dialogsFile = path.join(path.dirname(__filename), '../dialogs', 'dialog-id.json');
            var obj = JSON.parse(fs.readFileSync(dialogsFile));
            return obj[Object.keys(obj)[0]].id;
        } catch (e) {
            console.log(e);
        }
    })();

    var dialog_id = process.env.DIALOG_ID || dialog_id_in_json || '<missing-dialog-id>';

    var dialog = watson.dialog(credentials);

    app.post('/dialog-conversation', function (req, res, next) {
        var params = extend({ dialog_id: dialog_id }, req.body);
        dialog.conversation(params, function (err, results) {
            if (err)
                return next(err);
            else
                res.json({ dialog_id: dialog_id, conversation: results });
        });
    });

    app.post('/dialog-profile', function (req, res, next) {
        var params = extend({ dialog_id: dialog_id }, req.body);
        dialog.getProfile(params, function (err, results) {
            console.log(results);
            if (err)
                return next(err);
            else
                res.json(results);
        });
    });
};

module.exports = Dialog;