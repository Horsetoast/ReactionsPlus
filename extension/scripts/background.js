'use strict';

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == 'check_logged') {
    chrome.storage.local.get('FBaccessToken', function(result) {
      console.log('login check token:', result.FBaccessToken);
      if (typeof result.FBaccessToken === 'undefined') {
        callback({logged: false});
      }
      callback({logged: true});
    });
    return true;
  }
  if (request.action == 'login') {
    FBConnect.facebookLoginPopup();
    chrome.tabs.onUpdated.addListener(onTabUpdated);
    callback();
    return true;
  }
  if (request.action == 'logout') {
    chrome.storage.local.remove('FBaccessToken', function() {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
    });
    chrome.tabs.query({active: true}, function(tabs) {
      for (var i = 0; i < tabs.length; ++i) {
        chrome.tabs.sendMessage(tabs[i].id, {
          action: 'logout'
        });
      }
    });
    callback();
    return true;
  }
  if (request.action == 'debug') {
    chrome.tabs.query({active: true}, function(tabs) {
      for (var i = 0; i < tabs.length; ++i) {
        chrome.tabs.sendMessage(tabs[i].id, {
          action: 'debug'
        });
      }
    });
    callback();
    return true;
  }
  if (request.action == 'xhttp') {
    var xhttp = new XMLHttpRequest();
    var method = request.method ? request.method.toUpperCase() : 'GET';

    xhttp.onload = function() {
      callback(xhttp.responseText);
    };
    xhttp.onerror = function(err) {
      callback(err);
    };
    xhttp.open(method, config.api + request.url, true);
    if (method == 'POST' || method == 'DELETE') {
      xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    if (request.token) {
      xhttp.setRequestHeader('Authorization', request.token);
    }
    xhttp.send(request.data);
    return true;
  }
});


function onTabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.url && changeInfo.url.indexOf(config.fbSuccessUrl) === 0) {
    chrome.tabs.query({
      active: true
    }, function(tabs) {
      for (var i = 0; i < tabs.length; ++i) {
        chrome.tabs.sendMessage(tabs[i].id, {
          action: 'login'
        });
      }
    });
    chrome.storage.local.set({
      'FBaccessToken': FBConnect.accessTokenFromSuccessURL(changeInfo.url)
    });
    chrome.tabs.remove(tabId);
    chrome.tabs.onUpdated.removeListener(onTabUpdated);

    chrome.notifications.create('fb-connect-success', {
      type: 'basic',
      title: 'Facebook Authentication Successful',
      message: 'Enjoy your new reactions!',
      iconUrl: 'images/reactions-plus.png'
    });
  }
}
