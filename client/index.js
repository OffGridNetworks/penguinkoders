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

/* global $:true */

// conversation variables
var conversation_id, client_id;

$(document).ready(function () {
    var $chatInput = $('.chat-window--message-input'),
      $loading = $('.loader');

    $chatInput.keyup(function (event) {
        if (event.keyCode === 13) {
            converse($(this).val());
        }
    });

    var converse = function (userText) {
        if (userText !== "penguin")
            $loading.show();

        if (!userText.toLowerCase().startsWith("penguin")) {
            chatApp.sendMessage(userText, function () {
                $loading.hide();
                clearInput();
            });
        }
        else {
             
            // check if the user typed text or not
            if (typeof (userText) !== 'undefined' && $.trim(userText) !== 'penguin')
                submitMessage(userText);
       
            // build the conversation parameters
            var params = { input: userText, userid: chatApp.userid };
	           
            // check if there is a conversation in place and continue that
            // by specifing the conversation_id and client_id
            if (conversation_id) {
                params.conversation_id = conversation_id;
                params.client_id = client_id;
            }
         
            $.post('/dialog-conversation', params)
                .done(function onSucess(dialog) {
                    $chatInput.val(''); // clear the text input

                    // update conversation variables
                    conversation_id = dialog.conversation.conversation_id;
                    client_id = dialog.conversation.client_id;

                    $chatInput.show();
                    $chatInput[0].focus();
                })
                .fail(function (error) {
                    talk('PENGUIN', error.responseJSON ? error.responseJSON.error : error.statusText);
                })
                .always(function always() {
                    $loading.hide();
                    scrollChatToBottom();
                    $chatInput.focus();
                });
        }
    };

    var scrollChatToBottom = function () {
        var element = $('.chat-box--pane');
        element.animate({
            scrollTop: element[0].scrollHeight
        }, 420);
    };

    var scrollToInput = function () {
        var element = $('.chat-window--message-input');
        $('body, html').animate({
            scrollTop: (element.offset().top - window.innerHeight + element[0].offsetHeight) + 20 + 'px'
        });
    };
    
    var scrollTime = (new Date()).getTime(); 
    var talkCallback = function(message)
    {
        var $chatBox = $('.chat-box--item_' + message.origin).first().clone();
        var $loading = $('.loader');
         
        if (message.origin == "PENGUIN" || message.origin == "YOU")
            $chatBox.find('p').html($('<p/>').html(message.message));
          //    $chatBox.find('p').html($('<p/>').html(message.message).text());
        else
             $chatBox.find('p').html('<div>' + message.message + '<div class=\'chat-box--message-title\'>' + message.name + '</div>' + ' </div>')
  
        $chatBox.attr('data-message-id', message.messageId);
      
        if (message.avatar)
            $chatBox.find("img").eq(0).attr("src", "images/icons/avatar-peer" + message.avatar + ".svg");

        $chatBox.insertBefore($loading);
        setTimeout(function () {
            $chatBox.removeClass('chat-box--item_HIDDEN');
        }, 100);
        
        var newScrollTime =  (new Date()).getTime();  
  
        if ((newScrollTime - scrollTime) >500) 
                scrollChatToBottom();
                
        scrollTime = newScrollTime;
                
        if (!message.messageId)
            $loading.hide();
    }

    var talk = function (origin,  text) {
        var $chatBox = $('.chat-box--item_' + origin).first().clone();
        var $loading = $('.loader');
        $chatBox.find('p').html($('<p/>').html(text).text());
        $chatBox.insertBefore($loading);
        setTimeout(function () {
            $chatBox.removeClass('chat-box--item_HIDDEN');
        }, 100);
        $loading.hide();
    };

    var addProperty = function ($parent, name, value) {
        var $property = $('.data--variable').last().clone();
        $property.find('.data--variable-title').text(name);
        $property.find('.data--variable-value').text(value);
        $property.appendTo($parent);
        setTimeout(function () {
            $property.removeClass('hidden');
        }, 100);
    };

    var submitMessage = function (text) {
        talk('YOU', text);
        scrollChatToBottom();
        clearInput();
    };

    var clearInput = function () {
        $('.chat-window--message-input').val('');
    };

    $('.tab-panels--tab').click(function (e) {
        e.preventDefault();
        var self = $(this);
        var inputGroup = self.closest('.tab-panels');
        var idName = null;

        inputGroup.find('.active').removeClass('active');
        self.addClass('active');
        idName = self.attr('href');
        $(idName).addClass('active');
    });

    // Initialize the conversation

    scrollToInput();
    var chatApp = new ChatApp(talkCallback, function () { $loading.hide(); 
  	converse('penguin');
     });
});
