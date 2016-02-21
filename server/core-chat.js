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

var path = require('path'),
  Firebase = require("firebase"),
  Firechat = require('../client/lib/firechat.js'),
  extend = require('util')._extend,
  fs = require('fs')
 
var PenguinChat = function (app, credentials) {
    var chatRef = new Firebase("https://firechat-demo.firebaseio.com");
    this._chat = new Firechat(chatRef);
    this._roomId = null;
 	this.urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
    this.pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    
    this.maxLengthUsername = 15;
    this.maxLengthUsernameDisplay = 15;
    this.maxLengthRoomName = 24;
    this.maxLengthMessage = 120;
    this.maxUserSearchResults = 100;
    
   var self = this; 
   chatRef.authAnonymously(function (error, authData) {
        if (error) {
            console.log("Login Failed!", error);
        } else {
            self._chat.setUser(authData.uid, "Penguin", function (user) {
                self._user = user;
                self._chat.createRoom("Penguin", 'public', function(roomId) {
                    console.log("Connected to Penguin Chat Network");
                   self._roomId = roomId;
              });
            });
        }
    });
    
    app.get('/chat-getpenguin', function (req, res, next) {
       var remoteUserId = req.query.user;
        if (self._roomId)
       {
          return res.json({"name": "Penguin", "id": self._roomId, "user": self._user.id});
       }
       var timeoutCount = 0;
          
       var onReady = function() {
           if (self._roomId)
              return res.json({"name": "$$$Penguin", "id": self._roomId, "user": self._user.id});
        
        if (timeoutCount++ < 6)
            setTimeout(onReady, 300);
         else next(500);
       }
       
       setTimeout(onReady, 300);
    });
};

PenguinChat.prototype.sendMessage = function (msg, userid, cb) {
    var messageContent = {"userid": userid, "body": msg};
    this._chat.sendMessage(this._roomId, messageContent, 'penguin', cb);
};

PenguinChat.prototype.formatTime = function(timestamp) {
    var date = (timestamp) ? new Date(timestamp) : new Date(),
        hours = date.getHours() || 12,
        minutes = '' + date.getMinutes(),
        ampm = (date.getHours() >= 12) ? 'pm' : 'am';

    hours = (hours > 12) ? hours - 12 : hours;
    minutes = (minutes.length < 2) ? '0' + minutes : minutes;
    return '' + hours + ':' + minutes + ampm;
};
  
PenguinChat.prototype.linkify = function(str) {
    var self = this;
    return str
      .replace(self.urlPattern, '<a target="_blank" href="$&">$&</a>')
      .replace(self.pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>');
  };

module.exports = PenguinChat;