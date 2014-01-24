$(document).ready(function(){
	(function( obj ){
		if( obj.length != 1 ){ return; }
		var listurl = $('#friendSelectList').attr('url') + eventid;
		$('#friendSelectList').friendSelectList({
			url: listurl,
			idField: '#inviteFriendsId',
			fsParam: {
				width: 826
			}
		});
		
		$('#submit_invite').click(function(){
			var uid = $('#inviteFriendsId').val()
				url = $(this).attr('url') + eventid + '&gid=' + gid;
			if( uid != '' ){
				$.post(url, {content: $('#invite_friends_content').val(), uid: uid}, function(data){
					if(data.flag == 0)
					{
						pop_confirm(data.title,data.err, function(){
						window.location.reload();			  
						});	
					}
					else
					{
						pop_confirm(data.title,data.err, function(){
						});	
					}
				}, 'json');
			} else {
			  	pop_alert(lang.group.pleasechouseuse);
			}
		});
	})($('#groups_eventInviteFriendCont'));
});
