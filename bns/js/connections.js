$(document).ready(function(){
	$("#addgroupprofiles, #managesnsgroupmember").click(function() {
		var groupId = $(this).attr("groupId");
		var groupName = $(this).attr("groupName");
		addGroupProfiles(groupId, groupName);
	});

	$('[js="concern"]').click(function(){
		var userid = $(this).attr("userid");
		$.get("/sns/sns!addFollower.jhtml?targetUserId="+userid+"&r="+Math.random());
		$(this).after(lang.connections.followed);
		$(this).remove();
	});

	//更新组名
	$('[js="updatesnsgroup"]').click(function(event){
		var a = $(this),
			name = $(event.currentTarget).closest('li').find('a:first'),
			updateurl = a.attr("updateurl"),
			currentname = a.attr("currentname"),
			groupid = a.attr("groupid"),
			pop = $('<div style="padding:10px;"></div>').html(lang.connections.changename + '<input type="text" id="snsgroupname" class="formtext" value="' + currentname + '" />'),
			buttons = {};

		buttons[lang.common.confirm] = function(){
			var self = this;
			var param = new Object();
			var groupName = $("#snsgroupname", this).val();
			param.groupName = groupName;
			param.snsGroupId = groupid;
			$.post(updateurl, param, function(html) {
				if (html=="") {
					//location.href = '/sns/sns!view1stFriends.jhtml';
					name.text(groupName);
					a.attr("currentname", groupName);
					$(self).popupWin('destroy');
				} else {
					setErrMsg($("#snsgroupname", self), lang.connections.duplicatedname);
				}
			});
		};
		buttons[lang.common.cancel] = function(){
			$(this).popupWin('destroy');
		};

		pop.popupWin({
			title: lang.connections.changename + currentname,
			buttons: buttons,
			width: 300,
			closeDestroy: true,
			open: function(){
				$("#snsgroupname", this).focus();
			}
		});
	});

	//删除组
	$('[js="deletesnsgroup"]').click(function(event){
		var name = $(event.currentTarget).closest('li').find('a:first'),
			deleteurl = $(this).attr("deleteurl"),
			currentname = $(this).attr("currentname");

		pop_confirm(
			null,
			lang.connections.delete_group(currentname),
			function(pop){
				$.post(deleteurl, function() {
					location.href = '/sns/sns!view1stFriends.jhtml';
				});
				return false;
	 		}
	 	);
	});

	var list=$("#snsgroup");
	if(list.size()){
		$(".act-edit,.act-del",list).hide();
		$("li",list).hover(function(){
			$(this).addClass("action");
			$(".act-edit,.act-del",this).show();
		},function(){
			$(this).removeClass("action");
			$(".act-edit,.act-del",this).hide();
		});
	}

	//页面上按名称搜索输入框事件
	var keytm = null;
	var inputSearchKey = function(event){
		var input = $(event.currentTarget);
		if( input.attr('listLoading') == true || input.val() == input.attr('searchkey') ){ return; }
		friendslistSearch();
	};
	$("#usernameSearch").one('focus', function(){
		$(this).val('');
	}).keydown(function(event){
		keytm = setInterval(function(){ inputSearchKey(event); }, 200);
	}).keyup(function(event){
		clearInterval(keytm);
		keytm = null;
		setTimeout(function(){ inputSearchKey(event); }, 50);
	});
	
	//初始化好友列表内按钮事件
	$("#connections_list > div").live('mouseover', function(){
		$(this).addClass("list-box-hover");
		$(".col-4,.col-2a",this).show();
	}).live('mouseout', function(){
		$(this).removeClass("list-box-hover");
		$(".col-4,.col-2a",this).hide();
	});
	$('[js="createsnsgroup"]').live('click', function() {
		var buttons = {};
		buttons[lang.connections.create] = function(){
			var param = new Object(),
				self = this;
			var groupName = $("#snsgroupname", this).val();
			param.groupName = groupName;
			clearErrMsg();
			if (groupName.length==0) {
				setErrMsg($("#snsgroupname", this), lang.connections.nameerror);
			} else {
				$.post("/sns/sns!addSNSGroup.jhtml", param, function(groupId) {
					if (isNaN(groupId)) {
						setErrMsg($("#snsgroupname", self), lang.connections.duplicatedname);
					} else {
						$(self).popupWin('close');
						addGroupProfiles(groupId, groupName);
					}
				});
			}
		};
		buttons[lang.common.cancel] = function(){
			$(this).popupWin('close');
		};

		$("#createsnsgroupname").popupWin({
			title: lang.connections.creategroup,
			width: 300,
			height: 50,
			buttons: buttons,
			open: function(){
				clearErrMsg();
				$("#snsgroupname", this).val('').focus();
	 		}
	 	});
	});
	ctrlBtnInit();

	
	//用户上限提示信息
	$('#limit_friends').bind('mouseover', function(event){
        var a = $(this), pos = a.offset();
        if( lang.lang == 'zh_CN' ){
        	$('#limit_friends_tips').popupTips({tipsType: 1, arrow: 'left', width: 350, position: [pos.left + a.width(), pos.top - 10]});
        } else {
        	$('#limit_friends_tips').popupTips({tipsType: 1, arrow: 'right', width: 350, position: [pos.left - 360, pos.top - 10]});
        }
    });
    $('#limit_friends').bind('mouseout', function(){
        $('#limit_friends_tips').popupTips('destroy');
    });
});

//需多次调用的初始化好友列表内按钮事件
function ctrlBtnInit() {
	dropDownMenu($("#snsGroupSortingDropDownBtn"), $("#snsGroupSortingDropDownMenu"));

	var list=$("#connections_list");
	if( list.length ){
		$(".col-4,.col-2a", list).hide();

		$('a[js^="snsGroupDropDownBtn-"]', list).each(function() {
			dropDownMenu($(this), $(this).next());
		});
	}
}

//管理分组成员
function addGroupProfiles(groupId, groupName) {
	var fswin = $('#friend-selector');
	if( fswin.length == 0 ){ fswin = $('<div id="friend-selector" style="zoom:1;" />'); }
	fswin.friendSelect({
		url: '/sns/sns!get1stFriends.jhtml?snsGroupId=' + groupId,
		selectedTitle: groupName,
		onOK: function(event, selectedUsers){
			var profileIds = "";
			for( var i in selectedUsers ){
				var profileId = selectedUsers[i].id;
				profileIds += "&profileIds="+profileId;
			}
			location.href = "/sns/sns!addProfiles2SNSGroup.jhtml?snsGroupId=" + groupId + profileIds;
		},
		onCancel: function(){
			location.reload();
		}
	}).popupWin({
		title: groupName,
		reserve: true,
		width: 826,
		beforeClose: function(){
			location.reload();
		}
	});
}

//搜索用户列表
function friendslistSearch(param){
	var input = $('#usernameSearch');
	input.attr({'listLoading': true, 'searchkey': input.val()});
	param = $.extend({
		'queryType': 4,
		'queryValue': input.val(),
		'sorting': sorting
	}, param || {});
	$.post("/sns/sns!view1stFriends.jhtml", param, function(html){
		$("#1degreelist").html(html);
		friendslistLoaded();
	});	

	$("#snsgroup, #snscity, #snsindustry").find('li').removeClass("current");
}
function friendslistLoaded(){
	$('#usernameSearch').attr('listloading', false);
	ctrlBtnInit();

	$("[send_mail_id]").click(send_mail_fn);
}

//修改用户组
function changeSnsGroup(a, profileId, groupId, queryType, queryValue, pageNo){
	var li = $(a).closest('li'), div = li.closest('div.dp-menu'), p = div.prev();
	$.get('/sns/sns!manageSNSGroup.jhtml?snsOperationType=0&profileIds=' + profileId + '&snsGroupId=' + groupId + '&code=' + Math.random(), function(){
		p.text($(a).text());
		div.find('li:hidden').css('display', 'block');
		li.css('display', 'none');
	});
	return false;
}

function deleteSnsProfile(userid, username) {
	pop_confirm(
		null,
		lang.connections.delete_friend(username),    //"您确实希望将 "+username+" 从您的一度人脉列表中删除吗"
		function() {
			$.get("/sns/sns!removeFriend.jhtml?friendId="+userid+"&code="+Math.random(),
				function() {
					$("#sns-list-row-"+userid).remove();
				}
			);
		}
	);
	return false;
}

function deleteSnsFollower(userid, username, queryType) {
	pop_confirm(
		null,
		lang.connections.delete_follower(username),  //"您确实希望将 "+username+" 从您的关注列表中删除吗",
		function() {
			$.get("/sns/sns!removeFollower.jhtml?targetUserId="+userid+"&code="+Math.random(),
				function() {
					location.href = "/sns/sns!getFollowers.jhtml?queryType="+queryType;
				}
			);
		}
	);
	return false;
}

function deleteSnsMemo(memoid, username) {
	pop_confirm(
		null,
		lang.connections.delete_memo(username),    //"您确实希望将关于 "+username+" 的备忘从您的备忘列表中删除吗"
		function() {
			$.get("/sns/sns!removeMemo.jhtml?targetId="+memoid+"&code="+Math.random(),
				function() {
					location.href = "/sns/sns!getMemo.jhtml";
				}
			);
		}
	);

	return false;
}

function selectInternalInviteConnection(obj, listType) {
	$(obj).closest('ul').find('span.fs3-sup').hide();
	$(obj).closest('li').find('span.fs3-sup').css('display', 'block');
	$("#schoolmateOther").hide();
	$("#colleagueOther").hide();
	$("#companyOther").hide();

	if (obj.type=='select-one' && $(obj).val()==-1) {
		$("#"+listType+"Other input").val("");
		$("#"+listType+"Other").show();
	}

	$("*[id^='internalInviteList_']").each(function() {
		if (this.id != "internalInviteList_"+listType) {
			$(this).val("");
		}
	});

	$("#snsInternalRequestType").val($("#"+listType).val());
	$("#"+listType).attr("checked", "checked");

	clearErrMsg();
}