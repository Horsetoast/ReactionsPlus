/*
 * jQuery MD5 Plugin 1.2.1
 * https://github.com/blueimp/jQuery-MD5
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

'use strict';

var ReactionsPlus = new function() {

  this.postReaction = function (postId, reactionId, callback) {
    chrome.storage.local.get('FBaccessToken', function (result) {
      var userToken = result.FBaccessToken;
      chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: '/reactions/' + postId + '/' + reactionId,
        data: 'user_token=' + userToken
      }, function (responseText) {
        try {
          var response = JSON.parse(responseText);
          callback(null, response);
        } catch (err) {
          callback(err);
        }
      });
    });
  };

  this.removeReaction = function (postId, reactionId, callback) {
    chrome.storage.local.get('FBaccessToken', function (result) {
      var userToken = result.FBaccessToken;
      chrome.runtime.sendMessage({
        method: 'DELETE',
        action: 'xhttp',
        url: '/reactions/' + postId + '/' + reactionId,
        data: 'user_token=' + userToken
      }, function (responseText) {
        try {
          var response = JSON.parse(responseText);
          callback(null, response);
        } catch (err) {
          callback(err);
        }
      });
    });
  };

  this.getReactions = function (postId, callback) {
    chrome.storage.local.get('FBaccessToken', function (result) {
      var userToken = result.FBaccessToken;
      chrome.runtime.sendMessage({
        method: 'GET',
        action: 'xhttp',
        url: '/reactions/' + postId,
        token: userToken
      }, function (responseText) {
        try {
          var response = JSON.parse(responseText);
          callback(null, response);
        } catch (err) {
          callback(err);
        }
      });
    });
  };
};
