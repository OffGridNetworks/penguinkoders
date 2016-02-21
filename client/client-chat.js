/**
 * Copyright 2016 OffGrid Penguins
 * Portions Copyright 2015 IBM Corp. All Rights Reserved.
 * Portions Copyright 2015 Firebase. All Rights Reserved.
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

var ChatApp = function ChatApp(delegate, done) {
    var chatRef = new Firebase("https://firechat-demo.firebaseio.com");
    this._chat = new Firechat(chatRef);
    this._roomId = null;
    this.$roomList = $('#firechat-room-list'),
    this.$userList = $('#firechat-user-list');
    this._callback = delegate;
	this.urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
    this.pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    this.ready = done;
    
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
            console.log("Authenticated successfully with payload:", authData);
            self._chat.setUser(authData.uid, "Alex", function (user) {

                self._user = user;
                self._refreshRooms();
                self._chat.on('room-enter', self._onEnterRoom.bind(self));
                self._chat.on('message-add', self._onNewMessage.bind(self));
                self._chat.on('message-remove', self._onRemoveMessage.bind(self));

            });
        }
    });
 };

ChatApp.prototype.trimWithEllipsis = function (str, length) {
    str = str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    return (length && str.length <= length) ? str : str.substring(0, length) + '...';
};

ChatApp.prototype.sortListLexicographically = function (selector) {
    $(selector).children("li").sort(function (a, b) {
        var upA = $(a).text().toUpperCase();
        var upB = $(b).text().toUpperCase();
        return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
    }).appendTo(selector);
};


ChatApp.prototype._onEnterRoom = function(room) {
    setTimeout(function(){
     var element = $('.chat-box--pane');
        element.animate({
            scrollTop: element[0].scrollHeight
        }, 420);
    },500);
};
  
ChatApp.prototype._onNewMessage = function (roomId, message) {
    console.log("message received" + roomId + " " + message.id + message.message || '');
    var userId = message.userId;
    if (!this._user || !this._user.muted || !this._user.muted[userId]) {
        this._processMessage(roomId, message);
    }
};

ChatApp.prototype._onRemoveMessage = function (roomId, messageId) {
        console.log("message remove" + roomId + " " + messageId);

      $('.chat-box--item[data-message-id="' + messageId + '"]').remove()
};

ChatApp.prototype.sendMessage = function (msg, cb) {
       console.log("message sent" + this._roomId + " " + msg);
 
    this._chat.sendMessage(this._roomId, msg, 'default', cb);
};

ChatApp.prototype.hashCode = function(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return ((hash + 2147483647 + 1) % 16) + 1;
}

ChatApp.prototype._processMessage = function(roomId, rawMessage) {
    var self = this;

    // Setup defaults
    var message = {
      id              : rawMessage.id,
      localtime       : self.formatTime(rawMessage.timestamp),
      message         : rawMessage.message || '',
      userId          : rawMessage.userId,
      name            : rawMessage.name,
      origin          : (this._user && rawMessage.userId == this._user.id) ? "YOU" : "PEER",
      type            : rawMessage.type || 'default',
      disableActions  : (!self._user || rawMessage.userId == self._user.id)
    };
    
       if (message.name.substring(0,1) == '@')
            {
                message.avatar = message.name.substring(1,2);
                message.name = message.name.substring(3);
            } else
            {
                var s = "0" + self.hashCode(message.name);
                console.log(s);
                message.avatar = s.substr(s.length-2);
            }
  
    message.message = _.map(message.message.split(' '), function(token) {
      if (self.urlPattern.test(token) || self.pseudoUrlPattern.test(token)) {
        return self.linkify(encodeURI(token));
      } else {
        return _.escape(token);
      }
    }).join(' ');
    
    message.message = self.trimWithEllipsis(message.message, self.maxLengthMessage);
    
    this._callback(message.origin, message.avatar, message.id, message.name + ":<br />" + message.message);
}

ChatApp.prototype.formatTime = function(timestamp) {
    var date = (timestamp) ? new Date(timestamp) : new Date(),
        hours = date.getHours() || 12,
        minutes = '' + date.getMinutes(),
        ampm = (date.getHours() >= 12) ? 'pm' : 'am';

    hours = (hours > 12) ? hours - 12 : hours;
    minutes = (minutes.length < 2) ? '0' + minutes : minutes;
    return '' + hours + ':' + minutes + ampm;
  };

ChatApp.prototype._refreshRooms = function () {
    var self = this;
    this._chat.getRoomList(function (rooms) {
        var template = function (obj) { obj || (obj = {}); var __t, __p = '', __e = _.escape, __j = Array.prototype.join; function print() { __p += __j.call(arguments, '') } with (obj) { __p += '<li data-room-type=\'' + __e(type) + '\' data-room-id=\'' + __e(id) + '\' data-room-name=\'' + __e(name) + '\'>\n<a href=\'#!\' class=\'clearfix '; if (isRoomOpen) { ; __p += ' highlight '; }; __p += '\'>\n<span class=\'left\' title=\'' + __e(name) + '\'>#' + __e(name) + '</span>\n</a>\n</li>'; } return __p };

        var selectRoomListItem = function (e) {
            var parent = $(this).parent(),
                roomId = parent.data('room-id'),
                roomName = parent.data('room-name');
            console.log("leaving room" + self._roomId);
            self._chat.leaveRoom(self._roomId);
            self._roomId = roomId;
            console.log("joining room" + roomId);
    
            self._chat.enterRoom(roomId, roomName);
            self._refreshRooms();
            return false;
        };

        var count = 0;
        self.$roomList.empty();
        for (var roomId in rooms) {
            if (self._roomId == null) self._roomId = roomId;
            var room = rooms[roomId];

            if (room.name == "MyNewRoom")
                room.name = "Public";

            if (room.type != "public") continue;
            room.isRoomOpen = (roomId == self._roomId);
            console.log(room.isRoomOpen);

            var $roomItem = $(template(room));
            $roomItem.children('a').bind('click', selectRoomListItem);

            count++;

            self.$roomList.append($roomItem.toggle(true));
            if (count > 6) break;
        }
	    self._chat.enterRoom(self._roomId, "Public"); 
        self._refreshUsers();
    });
}

ChatApp.prototype.linkify = function(str) {
    var self = this;
    return str
      .replace(self.urlPattern, '<a target="_blank" href="$&">$&</a>')
      .replace(self.pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>');
  };

ChatApp.prototype._refreshUsers = function () {
    var self = this;
        
    this._chat.getUsersByRoom(self._roomId, function (users) {
        var template = function (obj) { obj || (obj = {}); var __t, __p = '', __e = _.escape, __j = Array.prototype.join; function print() { __p += __j.call(arguments, '') } with (obj) { __p += '<li data-user-id=\'' + __e(id) + '\' data-user-name=\'' + __e(name) + '\'>\n<a href=\'#!\' class=\'clearfix\'>\n<span class=\'left twothird clipped\' title=\'' + __e(name) + '\'>' + __e(name) + '</span>'; if (!disableActions) { ; __p += '\n<span data-event=\'firechat-user-mute-toggle\' class=\'icon user-mute right '; if (isMuted) { ; __p += ' red '; }; __p += '\' title=\'Toggle User Mute\'>&nbsp;</span>\n<span data-event=\'firechat-user-chat\' class=\'icon user-chat right\' title=\'Invite to Private Chat\'>&nbsp;</span>\n'; }; __p += '\n</a>\n</li>'; } return __p };
        self.$userList.empty();
  
        for (var username in users) {
            var user = users[username];
            user.disableActions = (!self._user || user.id === self._user.id);
            if (user.name.substring(0,1) == '@')
            {
                user.avatar = user.name.substring(1,2);
                user.name = user.name.substring(3);
            } else
            {
                var s = "0" + Math.floor((Math.random() * 14) + 1);
                user.avatar = s.substr(s.length-2);
            }
            user.nameTrimmed = self.trimWithEllipsis(user.name, self.maxLengthUsernameDisplay);
            user.isMuted = (self._user && self._user.muted && self._user.muted[user.id]);
            
            self.$userList.append($(template(user)));
        }
        self.sortListLexicographically(self.$userList);
        self.ready();
    });
};