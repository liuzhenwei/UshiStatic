$(document).ready(function(){
	//站内通知删除链接hover
	$('li', '#notificationList').hover(function(){
		$('a.common-close', this).show();
	}, function(){
		$('a.common-close', this).hide();
	});
	
	
	//----------------------------------------------发送直邮------------------------------
	$('#friendSelectList').friendSelectList({
		url: '/msg/message!getFriends.jhtml',
		idField: '#receiverId',
		inviteMax: 5,
		fsParam: {
			prompt: lang.friend.fs_max_info(5),
			width: 826
		}
	});

	$('#sendMessage').submit(function(){
		var b = true;
		clearErrMsg();
		if( $('input[name="receiverId"]', this).val() == '' ){
			//setErrStyle('#friendSelectList');
			setErrMsg('#friendSelectList', lang.msg.receiver_error);
			b = false;
		}
		var subject = $('input[name="bnsmessage.subject"]', this);
		if( $.trim(subject.val()) == '' ){
			//setErrStyle(subject);
			setErrMsg(subject, lang.msg.subject_error);
			b = false;
		}
		var message = $('textarea[name="bnsmessage.body"]', this);
		if( $.trim(message.val()) == '' ){
			//setErrStyle(message);
			setErrMsg(message, lang.msg.body_error);
			b = false;
		}
		
		var msgPermitFlag = $('[js="msgPermitFlag"]').attr("checked");
		msgPermitFlag?($('[name="msgPermitFlag"]').val(0)):($('[name="msgPermitFlag"]').val(1));
		return b;
	});
	
	//---------------------------------mail_inbox----------------------------------------------------------
	function replyInfo(obj,id){
		var msg=$(obj).closest("[msgId]");
		$.getJSON("/msg/message!getMessageReplys.jhtml?r="+Math.random()+"&messageReplyId="+parseInt(id),function(data){
			msg.find("textarea").val("");
			var hideShowInfo=msg.find("[select='hideShowInfo']");
			var hideShowInfoText=hideShowInfo.html().replace(/(\d)+/,data.replies.length);
			hideShowInfo.html(hideShowInfoText);
			var html="";
			$.each(data.replies,function(i,list){
				html+="<p class=\"quiet divide\"><strong>"+list.name+"<\/strong><span class=\"date\">("+list.date+")<\/span>："+list.content+"<\/p>";
			});

			obj.html(html);
		});
	}

	$("#mail_inbox_list [select='hideShowInfo']").click(function(){
		var info=$("+ [select='replyInfo']",this.parentNode);
		var id=$(this).closest("[msgId]").attr("msgId");
		replyInfo(info,id);
		var state= $(this).html();
		//state=state.indexOf("收起") > -1 ? state.replace("收起","展开") : state.replace("展开","收起");
		state=state.indexOf(lang.msg.collapse) > -1 ? state.replace(lang.msg.collapse,lang.msg.expand) : state.replace(lang.msg.expand,lang.msg.collapse);
		$(this).html(state);
		info.toggle();

	});

	$("#mail_inbox_list [select='submitReply']").click(function(){
			var msg=$(this).closest("[msgId]");
			var val=msg.find("textarea").val();
			var info=msg.find("[select='replyInfo']");
			var id=parseInt(msg.attr("msgId"));
			if(val!=''){
		    		$.post("/msg/message!addReply.jhtml?messageReplyId="+parseInt(id),{reply:val},function(){
					replyInfo(info,id);
					info.show();
				});
			}
	});

	$("#mail_inbox_list [select='cancelReply']").click(function(){
		$("textarea",this.parentNode.parentNode).val("");
	});
	//-------------------------msg_notification----------------------------------------------------------------------
	$("#msg_event_list .link-del").click(function(){
		var lis=$(this).closest("ul");
		if(lis.find("li").size()==1){
			lis.prev().remove();
			lis.remove();
		}else{
			$(this).closest("li").remove();
		}
	});
	//-----------------------------------------邀请与请求----------------------------------------------------------
	$('#friendsRequestTypeNew').change(function(){
			window.location.href='/msg/request!listNewRequest.jhtml?eventkey='+this.value;
	});
	$('#friendsRequestTypeOld').change(function(){
			window.location.href='/msg/request!listRequestHistory.jhtml?eventkey='+this.value;
	});
	$('#friendsRequestTypeSent').change(function(){
			window.location.href='/msg/request!listRequestOutbox.jhtml?eventkey='+this.value;
	});

	$('[js="deletemsg"]').click(function() {
		var deleteurl = $(this).attr("deleteurl");
		pop_confirm(null,
			lang.common.delete_confirm,
			function() {
				location.href = deleteurl;
			}
		);
	});

	$('[js="spammsg"]').click(function() {
		var spamurl = $(this).attr("spamurl");
		pop_confirm('',
			lang.msg.spam_confirm,
			function() {
				location.href = spamurl;
			}
		);
	});

	//显示共同好友
	$('a[js="insertComm"]').click(function(){
		var a = $(this),
			p = a.parent();
			list = p.next('div.comon-friends');
		if( list.length ){
			a.removeClass();
			if( list.is(':visible') ){
				list.hide();
				a.addClass('comments-shop-up');
			} else {
				list.show();
				a.addClass('comments-shop-down');
			}
		} else {
			var loading = $('<span class="loading" style="display:inline;"></span>');
			a.after(loading);
			$.get('/msg/request!queryRenmailist.jhtml?senderid=' + a.attr('uid'), function(data){
				a.removeClass().addClass('comments-shop-down');
				loading.remove();
				var html = '<div class="comon-friends"><ul class="p-h-list">' + data + '</ul></div>';
				p.after(html);
			}, 'html');
		}
	});

	//查看更多邀请内容
	$('a[js="viewMoreInvite"]').click(function(){
		var a = $(this),
			p = a.parent(),
			rid = a.closest('.event-block').attr('requestid');
		$.getJSON('/msg/request!fetchFormatedMsg.jhtml?requestid=' + rid, function(data){
			if( data.state == 0 ){
				p.html(data.formatMsg);
			}
		});
		return false;
    });

	//自动发出同意
	$('div[automatic="yes"]').each(function(){
		$(this).find('a[js="agreeButton"]').click();
	});
	//自动发出忽略
	$('div[automatic="no"]').each(function(){
		$(this).find('a[js="ignoreButton"]').click();
	});

	//非inbox.jsp里的同意请求
	$('#request [approveReq]').click(function() {
        var approveObj = $(this);
        var url = '/msg/request!approveRequest.jhtml?requestid=' + approveObj.attr('requestid');
        if(approveObj.attr('canSubmit') == 'true'){
        	approveObj.attr('canSubmit', 'false');
        	window.location.href = url;
        }
        return false;
    });
    $('#request [approveReq_eventKey_4_5]').click(function() {
    	var approveObj = $(this);
    	var checkUrl = "/group/invite!getLimit.jhtml";
        var url = '/msg/request!approveRequest.jhtml?requestid=' + approveObj.attr('requestid');
        if(approveObj.attr('canSubmit') == 'true'){
	        $.post(checkUrl ,{ } , function(data){
				if(data.indexOf('0') != -1){
					approveObj.attr('canSubmit', 'false');
					window.location.href = url;
				} else if(data.indexOf('1') != -1) {
					var layer = $('<div>' + $('#groupLimitDiv').html() + '</div>');
					layer.popupWin({
						width: 600,
						title: lang.group.limit_title
					});
				} else if(data.indexOf('2') != -1) {
					var layer = $('<div>' + $('#groupLimit_Platinum_Div').html() + '</div>');
					layer.popupWin({
						width: 600,
						title: lang.group.limit_title
					});
				} else if(data.indexOf('3') != -1) {
					var layer = $('<div>' + $('#groupLimit_Diamond_Div').html() + '</div>');
					layer.popupWin({
						width: 600,
						title: lang.group.limit_title
					});
				} else if(data.indexOf('4') != -1) {
					var layer = $('<div>' + $('#groupLimit_UshiTong_Div').html() + '</div>');
					layer.popupWin({
						width: 600,
						title: lang.group.limit_title
					});
				}
			});
        }
        return false;
    });
});

//同意或忽略加为好友
function agreeFriendAdd(a){
	handleInvite(a, 'agree', 'Add')
}
function ignoreFriendAdd(a){
	handleInvite(a, 'ignore', 'Add')
}
//同意或忽略通过msn寻找优士活动的站外邀请加好友
function agreeFriendMsn20101220(a){
	handleInvite(a, 'agree', 'Msn20101220')
}
//同意或忽略群组邀请
function checkGroupLimit(a, type, ext){
    //检查群组上限
    var checkLimit = function(){
	    $.post('/group/invite!getLimit.jhtml', function(data){
			if(data.indexOf('0') != -1){
				//未超上限时
				handleInvite(a, ext || 'agree', type);
			} else if(data.indexOf('1') != -1) {
				var layer = $('<div>' + $('#groupLimitDiv' + data.split(',')[1]).html() + '</div>');
				layer.popupWin({
					width: 600,
					title: lang.group.limit_title,
					closeDestroy: true
				});
			} else if(data.indexOf('2') != -1 || data.indexOf('3') != -1) {
				pop_alert(lang.group.limit_full);
			} else if(data.indexOf('4') != -1) {
				var layer = $('<div>' + $('#groupLimit50Div').html() + '</div>');
				layer.popupWin({
					width: 600,
					title: lang.group.limit_title
				});
			}
		});
	};

	a = $(a);
	if( type == 'Event' ){
		var gid = a.attr('groupid') || a.attr('uid') || a.closest('.event-block').attr('referenceid');
		$.ajax({
			url: '/msg/request!isGroupMember.jhtml?groupid=' + gid,
			type: 'GET',
			cache: false,
			dataType: 'json',
			success: function(data){
				a.attr('isGroupMember', data.state);
				if( data.state == '0' ){
					checkLimit();
				} else {
					handleInvite(a, ext || 'agree', type);
				}
			}
		});
	} else {
		checkLimit();
	}
}
function agreeGroupAdd(a){
	checkGroupLimit(a, 'Group');
}
function ignoreGroupAdd(a){
	handleInvite(a, 'ignore', 'Group');
}
//同意或忽略活动邀请
function agreeEventAdd(a,type){
	if( $(a).attr('unverify') ) return; //如果未经验证则不绑定
	
	var eventid = $(a).attr('eventid');
	var requestid = $(a).closest('.event-block').attr('requestid');
	var event_name = $(a).closest('.event-content').find('h5').find('span').find('i').text();
	var p_ = $($(a).closest('.event-block'));
	p_.empty();
	p_.addClass('loading');
	if( type==1 ){
		$.post('/msg/request!isGroupMember.jhtml',{"eventid":eventid,'requestid':requestid},function(data){
			if(data.state==0){
				p_.removeClass('loading');
				var arr = [
					'<div class="event-owner"><span class="success3"></span></div>',
					'<div class="event-content">',
					'<p class="fontgreen">'+lang.event.req_w_tips1+'<span style="font-weight:bold;display:inline-block;margin-left:5px;margin-right:5px;">'+event_name+'</span>'+lang.event.req_w_de+'</p>',
					'<p><a href="/event/view!viewDetail.jhtml?id='+eventid+'"><span>'+lang.event.req_w_detail+'</span></a></p>',
					'</div>'];
				var str = arr.join('');
				p_.append(str);
			
			}else{
				p_.removeClass('loading');
				p_.append('<div class="event-owner"><span class="notice3"></span></div><div class="event-content">'+lang.event.receive_invite_on_msgbox_error+'</div>');
			}
		}, 'json');
	}else{
		$.post('/msg/request!neglectRequest.jhtml',{"eventid":eventid,'requestid':requestid},function(data){
			p_.removeClass('loading');
			var arr = [
				'<div class="event-owner"><span class="notice3"></span></div>',
				'<div class="event-content">',
				'<p class="fontgreen">'+lang.event.req_w_tips2+'<span style="font-weight:bold;display:inline-block;margin-left:5px;margin-right:5px;">'+event_name+'</span>'+lang.event.req_w_de+'</p>',
				'</div>'];
			var str = arr.join('');
			p_.append(str);
		})
	}
}
function interestEvent(a){
	checkGroupLimit(a, 'Event', 'interest');
}
function ignoreEventAdd(a){
	//handleInvite(a, 'ignore', 'Event');
}

//同意或忽略
function handleInvite(a, action, type){
	a = $(a);
	var block = a.closest('.event-block'),
		newBlock = $('<div class="event-block"><div class="event-owner"><span></span></div></div>'),
		loading = $('<span class="loading" style="display:block;float:left">' + lang.notification.request_loading + '</span>'),
		id = a.attr('uid') || block.attr('referenceid'),
		name = a.attr('uname') || block.find('h5 span').text();
	var ajaxHandle = function(ajaxUrl){
		a.parent().append(loading).find('a').hide();
		$.getJSON(ajaxUrl, function(data){
			if( data.state == 0 ){
				var clone = $('#popupLayers .' + action + type).clone();
				clone.find('span').text(name);
				clone.find('a[js="viewProfile"]').attr('href', clone.find('a[js="viewProfile"]').attr('href') + id);
				clone.find('a[js="sendMail"]').attr('receiverid', id).click(send_mail_fn);
				block.replaceWith(newBlock.append(clone));
			} else {
				pop_alert(lang.notification.request_error, function(){
					loading.remove();
				}, lang.notification.request_err_title);
			}
		});
	};
	var showGroupsetting = function(url, callback){
		var gs = $('#groupSetting');
		gs.attr('ajaxUrl', url);
		gs.popupWin({
			title: lang.notification.groupsetting_title(name),
			width: 480,
			reserve: true,
			closeDestroy: true,
			open: function(){
				gs.find('> .notice').hide();
				gs.find(':checkbox, :radio').attr('checked', false).filter('[name="displayinprofile"]').attr('checked', true);
				gs.find('[js="submit"]').bind('click', function(){
					if( $(this).attr('unverify') ){ //如果未经验证则不绑定
						 gs.popupWin('close');
						 popupUnverify($(this).attr('unverify'));
						 return false;
					}
					if( $(':radio:checked', gs).length ){
						var ajaxUrl = gs.attr('ajaxUrl');
						gs.find('> .notice').hide();
						ajaxUrl += '&subscriptiontype=' + $(':radio:checked', gs).val();
						ajaxUrl += '&displayinprofile=' + ($('[name="displayinprofile"]', gs)[0].checked ? '1' : '0');
						ajaxUrl += '&setting=' + ($('[name="setting"]', gs)[0].checked ? '1' : '0');
						ajaxHandle(ajaxUrl);
						gs.popupWin('close');
					} else {
						gs.find('> .notice').show();
					}
				});
			},
			beforeClose: function(){
				gs.find('[js="submit"]').unbind('click');
			}
		});
	};

	if( action == 'ignore' ){
		var url = '/msg/request!neglectRequestSyn.jhtml?requestid=' + block.attr('requestid');
		newBlock.find('span').addClass('notice3');
		ajaxHandle(url);
	} else {
		var url = '/msg/request!approveRequestSyn.jhtml?requestid=' + block.attr('requestid');
		if( action == 'interest' ){
			url += '&interest=1';
		}
		newBlock.find('span').addClass('success3');
		if( type == 'Event' ){
			id = a.attr('groupid') + '&grpEvent.id=' + id;
			if( a.attr('isGroupMember') == '0' ){
				showGroupsetting(url);
			} else {
				ajaxHandle(url);
			}
		} else if( type == 'Group' ){
			showGroupsetting(url);
		} else {
			ajaxHandle(url);
		}
	}
}

//同意或忽略介绍好友
function denyRecommand(a, rid){
	a = $(a);
	var url = '/sns/sns!denyRecommend.jhtml?requestId=' + (rid || a.attr('rid'));
	$.get(url);
	var block = $(a).closest('.event-block');
	block.animate({
		height: 0
	}, 500, 'linear', function(){
		block.remove();
	});
}
function acceptRecommand(a, rid){
	a = $(a);
	var block = $(a).closest('.event-block'),
		h5 = a.closest('.event-content').find('h5'),
		fname = h5.find('a:eq(0)').text(),
		aname = h5.find('a:eq(1)').text(),
		clone = $('#popupLayers .acceptReco').clone().width(500),
		title = clone.find('h4').text().replace('{0}', aname);

	clone.find('h4').text(title);
	clone.find('textarea').val(clone.find('textarea').val().replace('{0}', fname));
	clone.find('input[name="requestId"]').val(rid || a.attr('rid'));
	clone.find('a[js="closeAcceptReco"]').click(function(){
		clone.popupWin('destroy');
	});
	clone.find('input:button').ajaxForm({
		ajaxOptions: {
			success: function(data){
				pop_alert(lang.group.invite_success, function(){
					clone.popupWin('destroy');
					block.animate({
						height: 0
					}, 500, function(){
						block.remove();
					});
				});
			}
		}
	});

	clone.popupWin({
		title: lang.common.invite,
		closeDestroy: true
	});
}

//删除站内通知
function deleteNewNotification(notificationId) {
	pop_confirm(null,
		lang.common.delete_confirm,
		function() {
			location.href = '/msg/notification!userDeleteNewNotification.jhtml?notificationId='+notificationId;
		}
	);
	return false;
}
function deleteOldNotification(notificationId) {
	pop_confirm(null,
		lang.common.delete_confirm,
		function() {
			location.href = '/msg/notification!userDeleteOldNotification.jhtml?notificationId='+notificationId;
		}
	);
	return false;
}
function deleteAllNotification() {
	pop_confirm(null,
		lang.common.delete_confirm,
		function() {
			location.href = '/msg/notification!deleteAllNotification.jhtml';
		}
	);
	return false;
}
