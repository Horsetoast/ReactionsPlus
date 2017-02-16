'use strict';

var FBConnect = function(proxyURL, appID) {

   var appID = appID;
   var proxyURL = proxyURL;

   var facebookLoginPopup = function() {
      var path = 'https://www.facebook.com/dialog/oauth?';
      var queryParams = ['client_id=' + appID, 'redirect_uri=' + proxyURL, 'response_type=code', 'display=popup'];
      var query = queryParams.join('&');
      var url = path + query;

      chrome.windows.create({
         'url': url,
         'type': 'popup'
      }, function (window) {});
   };

   var accessTokenFromSuccessURL = function(url) {
     var regex = new RegExp('[\\?&]token=([^&#]*)');
     var token = regex.exec(url);
     return token === null ? '' : decodeURIComponent(token[1].replace(/\+/g, ' '));
   };

   return {
     facebookLoginPopup: facebookLoginPopup,
     accessTokenFromSuccessURL: accessTokenFromSuccessURL
   }
}(config.fbProxyUrl, config.fbAppId);
