/* Copyright (c) 2013 State Government Victoria.  All Rights Reserved. http://www.dtpli.vic.gov.au */

$( function() {
  if (typeof dtpli_comment_cfg !== 'undefined') {
    listComments();
  }
});

function listComments() {
  $('.dtpli-comments .list').hide();
  $('.dtpli-comments .post-new').hide();
  $('.dtpli-comments .status').addClass('loading').text('Loading...').show();

  $.get(dtpli_comment_cfg['listURL'], function(data) {
    $('.dtpli-comments .status').removeClass('loading').hide();
    $('.dtpli-comments').replaceWith(data.split('<script>')[0]).fadeIn();
  }); // get
}

function postComment() {
  var commentTitle = 'Comment - ' + $('#comment-post-name').val();
  var commentText = $('#comment-post-text').val();

  if (commentText.length == 0) {
     alert('You need to actually put something into the comment area.');
     return;
  }

  $('.dtpli-comments .post-new').hide();
  $('.dtpli-comments .status').addClass('loading').text('Saving comment...').show();

  var params = {};
  params['AB_' + dtpli_comment_cfg['builderID'] + '_ASSET_BUILDER_ACTION'] = 'create';
  params['AB_' + dtpli_comment_cfg['builderID'] + '_ASSET_BUILDER_CREATE_TYPE'] = 'comment';
  params['asset_action'] = 'create';
  params['asset_ei_screen'] = 'details';
  params['sq_link_path'] = '';
  params['sq_preview_url'] = '';
  params['comment_0_name'] = commentTitle;
  params['comment_0_comment'] = commentText;
  params['sq_lock_release'] = '1';

  $.post(dtpli_comment_cfg['builderURL'], params, function(data) {
    if (data == "success") {
      $('.dtpli-comments .status').removeClass('loading').addClass('success').text('Success.').show();
      var obj = $('<div class="comment small"><a class="icon-email" href="mailto:intranetanswers@dtpli.vic.gov.au">Report</a><h3>' + commentTitle.replace('Comment - ', '') + ' (...)</h3><p>' + commentText + '</p></div>');
      obj.hide();
      $('.dtpli-comments .list').append(obj);
      $('.dtpli-comments .count').text($('.comment').length + ' comments');
      obj.fadeIn();
    }
    else {
      $('.dtpli-comments .status').removeClass('loading').addClass('error').text('Error.').show();
    }
  });
}