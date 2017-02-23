// Node modules
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var https = require('https');
require('dotenv').config();

// Config and custom modules for working with Facebook API and MySQL
var config = require('./config');
var auth = require('./auth.js');
var postManager = require('./post-manager.js');

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Extract token - middleware
app.use(function (req, res, next) {
  req.jwtToken = req.body.user_token || req.header('Authorization');
  next();
})

postManager.getPostReactions('1as3d54wq', '65432115', function(err, response) {
  console.log(err, response);
});

app.get('/', function(req, res) {
  res.send('Facebook Reactions Extended API');
});

app.get('/login-success', function(req, res) {
  res.status(200).send('Sucessfully logged in');
});

app.get('/facebook-login', function(req, res) {
  if(typeof req.query.code === 'undefined') {
    res.status(500).send({error: 'Code not provided.'});
    return;
  }
  auth.exchangeCodeForJwtToken(req.query.code, function(err, jwtToken) {
    if(err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.redirect(config.fb.successUrl+jwtToken);
  });
});

app.get('/reactions/:postId', function(req, res) {
  var postId = req.params.postId;

  auth.getUserId(req.jwtToken, function(err, userId) {
    postManager.getPostReactions(postId, userId, function(err, reactions) {
      if (err) {
        res.status(500).send(err);
      } else {
        console.log('----------------------------------------------------------------');
        console.log('Reaction GET. Post ID:', req.params.postId, reactions);
        res.status(200).send(reactions);
      }
    });
  });
});

app.delete('/reactions/:postId/:reactionId', function(req, res) {
  var postId = req.params.postId;
  var reactionId = req.params.reactionId;

  auth.getUserId(req.jwtToken, function(err, userId) {
    if(err) {
      res.status(200).send({error: 'User ID could not be retrieved', logged: false})
      return;
    }
    postManager.deletePostReaction(postId, userId, reactionId, function(err, reactions) {
      if (!err) {
        console.log('----------------------------------------------------------------');
        console.log('Reaction DELETE. Post ID:', postId, reactions);
        res.status(200).send(reactions)
      }
      else {
        res.status(500).send('Failed to remove reaction. Please, try again.');
      }
    });
  });
});

app.post('/reactions/:postId/:reactionId', function(req, res) {
  var postId = req.params.postId;
  var reactionId = req.params.reactionId;

  auth.getUserId(req.jwtToken, function(err, userId) {
    if(err) {
      res.status(200).send({error: 'User ID could not be retrieved', logged: false})
      return;
    }
    postManager.insertOrUpdatePost(postId, userId, reactionId, function(err, reactions) {
      if (!err) {
        console.log('----------------------------------------------------------------');
        console.log('Reaction POST. Post ID:', postId, reactions);
        res.status(200).send(reactions)
      }
      else {
        res.status(500).send('Failed to update reactions. Please, try again.');
      }
    });
  });
});

if (!module.parent) {
  app.listen(process.env.PORT || 3000);
  console.log('Express started on port 3000');
}
