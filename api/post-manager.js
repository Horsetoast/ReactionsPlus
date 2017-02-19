var config = require('./config.js');
var auth = require('./auth.js');
var connection = require('./mysql-connection-pool');

module.exports = function(config, connection) {
  var getPostReactions = function(postId, userId, callback) {
    connection.query('SELECT reaction_id, user_id, COUNT(reaction_id) AS total FROM posts WHERE post_id = ? GROUP BY reaction_id', [postId], function(err, results) {
      if(err) {
        console.log(err);
        callback(err);
        return;
      }
      /* Convert an array of results into an object */
      var resultsObj = results.reduce(function(acc, cur, i) {
        acc[cur.reaction_id] = {
          total: cur.total
        };
        console.log()
        if(results.length > 0 && typeof userId !== 'undefined' && userId === results[i].user_id) {
          acc[cur.reaction_id].self = true;
        }
        return acc;
      }, {});
      /* Return self = true if one of the reactions belongs to the user */
      callback(null, resultsObj);
    });
  }

  var insertOrUpdatePost = function(postId, userId, reactionId, callback) {
    connection.query('INSERT INTO posts (post_id, user_id, reaction_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reaction_id = ?', [postId, userId, reactionId, reactionId], function(err, result) {
      if(err) {
        console.log(err);
        callback(err);
        return;
      }
      getPostReactions(postId, userId, function(err, reactions) {
        if(err) {
          console.log(err);
          callback(err);
          return;
        }
        callback(null, reactions);
      });
    });
  }

  var deletePostReaction = function(postId, userId, reactionId, callback) {
    connection.query('DELETE FROM posts WHERE post_id = ? AND user_id = ? AND reaction_id = ?', [postId, userId, reactionId, reactionId], function(err, result) {
      if(err) {
        console.log(err);
        callback(err);
        return;
      }
      getPostReactions(postId, userId, function(err, reactions) {
        if(err) {
          console.log(err);
          callback(err);
          return;
        }
        callback(null, reactions);
      });
    });
  }

  return {
    getPostReactions: getPostReactions,
    insertOrUpdatePost: insertOrUpdatePost,
    deletePostReaction: deletePostReaction
  }
}(config, connection);
