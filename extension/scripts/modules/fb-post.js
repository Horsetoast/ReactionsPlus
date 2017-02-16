'use strict';

/*
 * An object for facebook post with extended reactions.
 * VARIABLES EXPLANATION:
 * postId             - hash of the facebook post id
 * newReactions       - extra reactions loaded from config/new-reactions.js
 * extendedReactions  - an array for tracking of already extended reactions on the FB post
 * activeReaction     - 'null' means no new reaction pressed, otherwise the reaction object
 * $likeButton        - DOM like button elements
 * $shadowLikeButton  - DOM clone of the like button to show the extended reactions
 * $reactions         - DOM div containing the reactions
 * $reactedPanel      - DOM div containing the small icons of already pressed reactions
 */

function FBPost(postId, context) {

  var self = this;
  this.postId = postId;
  this.newReactions = newReactions;
  this.extendedReactions = [];
  this.activeReaction = null;
  this.$likeButton = null;
  this.$shadowLikeButton = null;
  this.$reactions = null;
  this.$reactedPanel = null;

  /*
  Get a reaction object from newReactions array by id.
  */
  this.getReactionById = function(reactionId) {
    return $.grep(self.newReactions, function (e) {
      return e.id == reactionId;
    })[0];
  }

  /*
  After a facebok like button is found in the DOM,
  the button is then duplicated as $shadowLikeButton for
  displaying only extended reactions.
  */
  this.bindLikeButton = function ($likeButton) {
    this.$likeButton = $likeButton;
    this.$shadowLikeButton = $likeButton.clone(true, true);
    this.$shadowLikeButton.hide();
    this.$likeButton.after(this.$shadowLikeButton);
    this.$reactedPanel = $likeButton.closest('form').find('._3t54');

    this.fetchReactionsCount(function(err, response) {
      self.updateReactionsCount(response);
    });
  };

  /*
  Bind the $countPopup for later use, which display
  the count of reactions.
  */
  this.bindCountPopup = function ($countPopup) {
    this.$countPopup = $countPopup;
  };

  /*
  After a reactions div is found in the DOM,
  Iterate over new reactions and add them to the div
  */
  this.bindReactions = function ($reactions) {
    this.$reactions = $reactions;
    this.$sampleReaction = $reactions.find('span._iuw:last').clone();

    $.each(self.newReactions, function (index, reaction) {
      var $newReaction = self.$sampleReaction.clone();
      $newReaction.find('div._4sm1').text(reaction.title);
      $newReaction.find('i').attr('class', reaction.class + ' fer-normal-reaction');

      $newReaction.on('mouseover', function (e) {
        this.classList.add('_iuy');
      });
      $newReaction.on('mouseout', function (e) {
        this.classList.remove('_iuy');
      });

      /* Facebook reaction click event */
      $newReaction.on('click', function (e) {
        if(context.logged === false) {
          alert('Please, click on the ReactionsPlus icon and log in first.');
          return;
        }
        switch (self.activeReaction) {
          case reaction: // If the same reaction is active, 'un-click' it
            self.activeReaction = null;
            self.reactionRemove(reaction);
            ReactionsPlus.removeReaction(postId, reaction.id, function (err, response) {
              if(response.error) {
                console.log(response.error);
                return;
              }
              if(response.logged === false) {
                chrome.runtime.sendMessage({action: 'login'});
              }
              self.updateReactionsCount(response);
            });
            break;
          case null: // If there's no reaction, make this reaction active
            self.activeReaction = reaction;
            self.reactionChange(reaction);
            ReactionsPlus.postReaction(postId, reaction.id, function (err, response) {
              if(response.error) {
                console.log(response.error);
                return;
              }
              if(response.logged === false) {
                chrome.runtime.sendMessage({action: 'login'});
              }
              self.updateReactionsCount(response);
            });
            break;
          default: // If a different reaction is active, change it
            self.activeReaction = reaction;
            self.reactionChange(reaction);
            ReactionsPlus.postReaction(postId, reaction.id, function (err, response) {
              if(response.error) {
                console.log(response.error);
                return;
              }
              if(response.logged === false) {
                chrome.runtime.sendMessage({action: 'login'});
              }
              self.updateReactionsCount(response);
            });
        }
      });

      $($reactions[0].childNodes[0]).append($newReaction);
      self.extendedReactions.push($newReaction);
    });
    $reactions.addClass('extended');
  };

  /*
  Remove the current icons and add new icons
  based on the new data provided.
  */
  this.updateReactionsCount = function(reactionsData) {
    self.$reactedPanel.find('.extended-icon').remove();
    $.each(reactionsData, function (reactionId, reactionData) {
      self.addReactedIcon(reactionId, reactionData);
      if(reactionData.self === true) {
        var reaction = self.getReactionById(reactionId);
        self.activeReaction = reaction;
        self.reactionChange(reaction);
      }
    });
  }

  /*
  Fetch new reactions count data from the server
  */
  this.fetchReactionsCount = function (cb) {
    ReactionsPlus.getReactions(self.postId, function (err, response) {
      if (err || typeof response === null) {
        console.error('Extended Reactions request failed.');
        return;
      }
      if(cb) {cb(null, response)};
    });
  };

  /*
  If a user already clicked on a reaction,
  we won't be appending a new like button,
  instead, change the style and icon of this button.
  */
  this.reactionChange = function (reaction) {
    var textNodePos = this.$shadowLikeButton[0].childNodes[1].nodeName === '#text' ? 1 : 2;
    /* The index of the '#text' child node is sometimes 1, sometimes 2 (wtf facebook?) */
    this.$shadowLikeButton[0].childNodes[textNodePos].data = reaction.title;
    this.$shadowLikeButton.css({ color: reaction.color });
    this.$shadowLikeButton.addClass('pressed-button');
    var $insideSpan = this.$shadowLikeButton.find('span');
    if ($insideSpan.length !== 0) {
      $insideSpan.find('i').attr('class', 'fer-mini-reaction ' + reaction.class);
    } else {
      this.$shadowLikeButton.prepend('<span class="fer-mini-span"><i class="fer-mini-reaction ' + reaction.class + '"></i></span>');
      this.$shadowLikeButton.find('span').attr('class', 'fer-mini-span');
      this.$shadowLikeButton.find('span i').attr('class', 'fer-mini-reaction ' + reaction.class);
    }
    this.$shadowLikeButton.show();
  };

  this.reactionRemove = function (reaction) {
    this.$shadowLikeButton.hide();
  };

  this.addReactedIcon = function (reactionId, reactionData) {
    var reaction = self.getReactionById(reactionId);
    var $reactedIcon = $('<a class="_3emk extended-icon" data-hover="tooltip" href="#" id="js_fg"><span class="_9zc _2p7a _4-op"><i class="reacted-icon '+reaction.class+'"></i></span></a>');
    self.$reactedPanel.append($reactedIcon);

    $reactedIcon.on('mouseover', function () {
      var offset = $(this).offset();
      var aLeft = parseInt(offset.left);
      var aTop = parseInt(offset.top);

      var reactionObj = self.getReactionById(reactionId);

      self.$countPopup.find('.reaction-title').text(reactionObj.title);
      self.$countPopup.find('.count').text(reactionData.total);
      self.$countPopup.css({
        'left': aLeft,
        'top': aTop - 25,
        'position': 'absolute',
        'z-index': '1000',
        'display': 'block'
      });
    });
    $reactedIcon.on('mouseout', function () {
      self.$countPopup.css({
        'display': 'none'
      });
    });

    return $reactedIcon;
  };
}
