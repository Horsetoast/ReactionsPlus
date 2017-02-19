var config = require('./config.js');
var auth = require('./auth.js');
var mysql = require('mysql');

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(config.db); // Recreate the connection, since                                                // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

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
