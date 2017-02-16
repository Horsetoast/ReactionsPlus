var config = require('./config.js');
var https = require('https');
var jwt = require('jsonwebtoken');

module.exports = (function(config) {
  var exchangeCodeForJwtToken = function(code, callback) {
    var options = {
      hostname: config.fb.graphHost,
      port: 443,
      path: config.fb.codePath
        + 'client_id=' + config.fb.appId
        + '&redirect_uri=' + config.fb.facebookLoginUrl
        + '&client_secret=' + config.fb.appSecret
        + '&code=' + code,
      method: 'GET'
    };

    var req = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var accessToken = JSON.parse(chunk).access_token;
        if(accessToken) {
          getFacebookUserId(accessToken, function(err, facebookUserId) {
            if(err) {
              console.error(err);
              callback(err);
              return;
            }
            var jwtToken = jwt.sign(facebookUserId, config.jwt.secret);
            console.log('FB user ID', jwtToken);
            callback(null, jwtToken);
          })
        }
        else {
          callback('Exchanging code for access token failed. Reason:' + chunk);
        }
      });
    });
    req.on('error', function(err) {
      callback('Exchanging code for access token failed. Reason:' + err);
    });
    req.end();
  }

  var getFacebookUserId = function(accessToken, callback) {
    var options = {
      hostname: config.fb.graphHost,
      port: 443,
      path: config.fb.profilePath + accessToken,
      method: 'GET'
    };
    var req = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var userId = JSON.parse(chunk).id;
        if(!userId) {
          console.error('Facebook user ID could not be retrieved.');
          callback('Facebook user ID could not be retrieved.');
          return;
        }
        callback(null, userId);
      });
    });
    req.end();
    req.on('error', function(err) {
      callback('Unable to verify user');
    });
  }

  var getUserId = function(jwtToken, callback) {
    jwt.verify(jwtToken, config.jwt.secret, function(err, decoded) {
      if(err) {
        callback('Invalid token');
        return;
      }
      callback(null, decoded);
    });
  }

  return {
    exchangeCodeForJwtToken: exchangeCodeForJwtToken,
    getUserId: getUserId
  }
}(config));
