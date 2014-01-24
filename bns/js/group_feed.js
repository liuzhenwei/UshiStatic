$(document).ready(function(){			   						   
	if( typeof(groupId) != 'undefined' ){
		var feed_content=$("#feed_content");

		var bindFeed = function(){
			feed_content.find('#moreFeed').attr('pageNo', 1);
			feed({
				moreFeedURL: '/group/feed!listFeeds.jhtml?groupId=' + groupId,
				addCommentURL:'/group/feed!addComment.jhtml',
				removeCB: function(type){
					if( type == 'group' ){
						var rc = $('#resListCount');
						var c = parseInt(rc.text(), 10) - 1;
						rc.text(Math.max(0, c));
						if( feed_content.find('.feed-block').length == 0 ){
							var h = location.href, s = h.indexOf('&pageNo');
							if( s > 0 ) h = h.slice(0, s);
							location.href = h + '&pageNo=1';
						}
					}
				}
			});
		}

		if( $('#freetext').length ){
			writeShare({
				postUrl: '/group/feed!addGroupFeed.jhtml?groupId=' + groupId,
				getUrl: '/group/feed!listFeeds.jhtml?groupId=' + groupId + '&r=' + Math.random(),
				callback: function(data){
					$('#freetext').data('feedtext', $('#freetext').val())
					feed_content.find('.event-block').remove();
					$('#moreFeed').remove();
					feed_content.prepend(data);
					bindFeed();
				}
			});
		}
		bindFeed();
	}	
});