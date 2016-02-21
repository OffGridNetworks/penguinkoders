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
        $information = $('.data--information'),
        $profile = $('.data--profile'),
        $loading = $('.loader');
   
    $chatInput.keyup(function (event) {
        if (event.keyCode === 13) {
            converse($(this).val());
        }
    });

    var converse = function (userText) {      
        if (userText !== "penguin")
          $loading.show();
             
           if (!userText.toLowerCase().startsWith("penguin"))
         {
            chatApp.sendMessage(userText, function (){
                 $loading.hide();
                 clearInput();
            });
         }
         else 
         {
             
               // check if the user typed text or not
        if (typeof (userText) !== 'undefined' && $.trim(userText) !== '')
            submitMessage(userText);
       
        // build the conversation parameters
        var params = { input: userText };

        // check if there is a conversation in place and continue that
        // by specifing the conversation_id and client_id
        if (conversation_id) {
            params.conversation_id = conversation_id;
            params.client_id = client_id;
        }

        $.post('/conversation', params)
            .done(function onSucess(dialog) {
                $chatInput.val(''); // clear the text input

                // update conversation variables
                conversation_id = dialog.conversation.conversation_id;
                client_id = dialog.conversation.client_id;

                var texts = dialog.conversation.response;
                var response = texts.join('&lt;br/&gt;'); // &lt;br/&gt; is <br/>

                $chatInput.show();
                $chatInput[0].focus();

                $information.empty();

                addProperty($information, 'Dialog ID: ', dialog.dialog_id);
                addProperty($information, 'Conversation ID: ', conversation_id);
                addProperty($information, 'Client ID: ', client_id);

                talk('PENGUIN', null, null, response); // show

                getProfile();
                console.log(dialog);
       
            })
            .fail(function (error) {
                talk('PENGUIN', null, null, error.responseJSON ? error.responseJSON.error : error.statusText);
            })
            .always(function always() {
                $loading.hide();
                scrollChatToBottom();
                $chatInput.focus();
            });
         }

    };

    var getProfile = function () {
        var params = {
            conversation_id: conversation_id,
            client_id: client_id
        };
	     
        $.post('/profile', params).done(function (data) {
            $profile.empty();
            var result = {};
            data.name_values.forEach(function (par) {
                
                if (par.value !== '')
                {
                    result[par.name] = par.value;
                    addProperty($profile, par.name + ':', par.value);
                }
                if (result.confirmed == "Yes" && result.book != '')
                  getBook(result.book);
            });
        }).fail(function (error) {
            talk('PENGUIN', null, null, error.responseJSON ? error.responseJSON.error : error.statusText);
        });
    };
    
    
    
    var getBook = function (book) {
        var params = {
            book: book,
            client_id: client_id,
            conversation_id: conversation_id
        };
        $loading.show();
        $.post('/book1', params).done(function (results) {
            console.log(results);

            var positives = [];
            var negatives = [];

            if (results.entities && results.entities.length) {

                for (var i = 0; i < results.entities.length; i++) {
                    var name = results.entities[i].text + "[" + results.entities[i].type + "]";
                    if (check_duplicate_concept(positives, name) || (results.entities[i].sentiment.type != "positive") || positives.length == 3)
                        continue;
                    else {
                        positives.push(name);
                    }
                }
                for (var i = 0; i < results.entities.length; i++) {
                     var name = results.entities[i].text + "[" + results.entities[i].type + "]";
                  if (check_duplicate_concept(negatives, name) || (results.entities[i].sentiment.type != "negative") || negatives.length == 3)
                        continue;
                    else {
                        negatives.push(name);
                    }
                }
            }

            console.log("The primary positive in " + book + " relate to " + positives.join(", and "))
            console.log("The primary negatives in " + book + " relate to " + negatives.join(", and "))
            talk('PENGUIN', null, null, "The book " + book + " is positive towards " + positives.join(", and "));
            talk('PENGUIN', null, null, "The book " + book + " is negative towards " + negatives.join(", and "));
            scrollChatToBottom();

            $.post('/book2', params).done(function (results) {
                console.log(results);

                var unique_concept_array = [];
                var unique_concept_desc = [];

                if (results.annotations && results.annotations.length) {
                    for (var i = 0; i < results.annotations.length; i++) {
                        if (check_duplicate_concept(unique_concept_array, results.annotations[i].concept.id) || (results.annotations[i].concept.label == book) || unique_concept_array.length == 3)
                            continue;
                        else {
                            unique_concept_array.push(results.annotations[i].concept.id);
                            unique_concept_desc.push(results.annotations[i].concept.label);
                        }
                    };

                  $.get('/ted', {
                        ids: unique_concept_array,
                        limit: 3,
                        document_fields: JSON.stringify({
                            user_fields: 1
                        })
                    })
                        .done(function (results) {
                            for (var i = 0; i < results.results.length; i++)
                                generate_TED_panel(results.results[i]);
                        }).fail(function (error) {
                            error = error.responseJSON ? error.responseJSON.error : error.statusText;
                            console.log('error:', error);
                        }).always(function () {

                        });
                }

            }).fail(function (error) {
                talk('PENGUIN', null, null, error.responseJSON ? error.responseJSON.error : error.statusText);
            });
        }).fail(function (error) {
            talk('PENGUIN', null, null, error.responseJSON ? error.responseJSON.error : error.statusText);
        });
    };

  var generate_TED_panel = function(TED_data) {
           talk('PENGUIN', null, null, "I am " + Math.floor(TED_data.score * 100) + "% confident that a relevant TED talk is " + TED_data.user_fields.title + " by " + TED_data.user_fields.speaker);
              scrollChatToBottom();

  }



   var check_duplicate_concept= function(unique_concept_array, concept) {
       
       for (var i = 0; i < unique_concept_array.length; i++) {
           if (unique_concept_array[i] == concept)
               return true;
       }

       return false;
   }

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

    var talk = function (origin, avatar, messageId, text) {
        var $chatBox = $('.chat-box--item_' + origin).first().clone();
        var $loading = $('.loader');
        $chatBox.find('p').html($('<p/>').html(text).text());
        $chatBox.attr('data-message-id', messageId);
        if (avatar !== null)
          $chatBox.find("img").eq(0).attr("src","images/icons/avatar-peer" + avatar + ".svg");
      
        $chatBox.insertBefore($loading);
        setTimeout(function () {
            $chatBox.removeClass('chat-box--item_HIDDEN');
        }, 100);
        if (!messageId)
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
        talk('YOU', null, null, text);
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
    var chatApp = new ChatApp(talk, function() {$loading.hide();     converse('penguin');});
    
    
});
