'use strict';

/*
 * Instantiate a popup box showing the count of a reaction.
 * (Only one instance for all)
 */
var $countPopup = $('<div class="count-popup"><span class="reaction-title">Clickbait</span><span class="count"><span><i class="little-arrow"></i></div>');
$countPopup.css({'display': 'none'});
$('body').append($countPopup);

var context = {
  extendedPosts: {},
  logged: false
}

/*
 * When initialized, check whether a user is logged in.
 */
chrome.runtime.sendMessage({
  action: 'check_logged'
}, function(response) {
  if (typeof response.logged !== 'undefined' && response.logged === true) {
    console.info('You are logged in to ReactionsPlus extension.');
    context.logged = true;
  }
  else {
    console.info('You are logged out of ReactionsPlus extension.');
  }
});


/*
 * Periodically check for new facebook posts added to the DOM
 * and process their like buttons and reactions div separately
 * (because they don't necessarily show up simultaneously)
 */
(function checkDOM() {
  $('._1oxk').not('.extended').each(function() {
    processReactions(this);
  });
  $('.commentable_item:not(.processed)').find('._khz a').each(function() {
    processLikeButton(this);
  });
  setTimeout(checkDOM, 500);
})();


/*
 * Log in user in order to protect from identity theft
 * (manipulating reactions as another user)
 */
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == 'logout') {
    context.logged = false;
    callback(null);
  }
  if (request.action == 'login') {
    context.logged = true;
    callback(null);
  }
  if (request.action == 'debug') {
    callback(null);
    console.log(context);
  }
});

/*
 * Functions to find the right elements,
 * extract the post id, create a hash
 *  and pass it down to FBPost
 */
function processLikeButton(likeButton) {
  var $likeButton = $(likeButton);
  var $form = $(likeButton).closest('.commentable_item');
  var postId = $form.find('[name="ft_ent_identifier"]').val();
  var postHash = $.md5(postId);
  if(context.extendedPosts[postHash]) {
    context.extendedPosts[postHash].bindLikeButton($likeButton);
    context.extendedPosts[postHash].bindCountPopup($countPopup);
  }
  else {
    var fbPost = new FBPost(postHash, context);
    fbPost.bindLikeButton($likeButton);
    fbPost.bindCountPopup($countPopup);
    context.extendedPosts[postHash] = fbPost;
  }
  $form.addClass('processed');

  return context.extendedPosts[postHash];
}


function processReactions(reactionsDiv) {
  var $reactions = $(reactionsDiv);
  var $form = $(reactionsDiv).closest('.commentable_item');
  var postId = $form.find('[name="ft_ent_identifier"]').val();
  var postHash = $.md5(postId);
  if (typeof context.extendedPosts[postHash] !== 'undefined') {
    context.extendedPosts[postHash].bindReactions($reactions);
  }

  return context.extendedPosts[postHash];
}
