function topage(index,gid){
window.location.href="/group/member.findEvents.jhtml?mark=eventAll&page.firstindex="+index+"&gid="+gid;
}
function toeventpage(index,gid,eventid){
   window.location.href="/group/member.eventmanageUI.jhtml?page.firstindex="+index+"&gid="+gid+"&eventid="+eventid;
}
function toeventpagein(index,gid,eventid){
window.location.href="/group/member.eventmanageUI.jhtml?mark=eventPersonTake&page.firstindex="+index+"&gid="+gid+"&eventid="+eventid;
}
$(document).ready(function(){
	selectCity();
	(function(){//group home
		var groupsAbout=$("#groupsAbout");
		if(groupsAbout.size()>0){
			$(document).keydown(function(e){
				if(e.keyCode==13) homeSubmit();
			});
		}
		function homeSubmit(){

		}
	})();

	//-----------------------------------------------------view-------------------------------

	//------------------------------------------------------create----------------------------

	//------------------------------------------------------invite----------------------------
	(function( obj ){
		if( obj.length != 1 ){ return; }
		var gid = $('#friendSelectList').attr('groupid');
		$('#friendSelectList').friendSelectList({
			url: '/group/member.findOneFriends.jhtml?gid=' + gid,
			idField: '#inviteFriendsId',
			fsParam: {
				width: 826
			}
		});

		$('#submit_invite_friends_list').click(function(){
			var uid = $('#inviteFriendsId').val();
			if( uid != '' ){
				$.post('/group/member.addInviteFriends.jhtml?gid=' + gid, {content: $('#invite_friends_Letter_content').val(), uid: uid}, function(data){
					pop_alert(data, function(){
						window.location.reload();
						return false;
					});
				});
			} else {
				pop_alert(lang.group.pleasechouseuse);
			}
		});

	})($('#inviteFriendsSelectCont'));


	$('#edit_invite_friends_Letter').toggle(function(){
		$(this).parent().next().show();
		$(this).parent().next().find(':eq(0)').animate({height:"150px"},500);

		return false;
	},function(){
		$(this).parent().next().find(':eq(0)').animate({height:"0px"},500,function(){
		$(this).parent().hide();
		});
		return false;
	});

	//------------------------------------------------------------------invite-out-friends-------------------------------------------------------------
	(function(form){
		if( !form.size()) return false;
		var invite_out_form_url = form.find(".input-w-500:eq(0)");
		var invite_out_form_url_default = invite_out_form_url.val();
		var box = form.find(":checkbox:eq(0)");

		box.click(function(){
			var url = invite_out_form_url.val();
			var urlCount = url.lastIndexOf('/')+1;
			var urlLeft = url.substr(0,urlCount);
			var urlRight = url.substr(urlCount);
			if( this.checked ){
				$.get("/group/member.updatelinkurl.jhtml?inviteOutLinkUrl="+ urlRight,function(data){
					invite_out_form_url.val( urlLeft + data );
				});
			}else{
				invite_out_form_url.val(invite_out_form_url_default);
			}
		});

		//初次加载执行
		var url = invite_out_form_url.val();
		var urlCount = url.lastIndexOf('/')+1;
		var urlLeft = url.substr(0,urlCount);
		var urlRight = url.substr(urlCount);
		$.get("/group/member.updatelinkurl.jhtml?inviteOutLinkUrl="+ urlRight,function(data){
			invite_out_form_url.val( urlLeft + data );
		});
		
		form.submit(function(){
			clearErrMsg();
			var ta = $(this).find('textarea'),
				email = $.trim(ta.val());
			email = email.split(/[,|\n|\r\n]/);
			var b = true;
			for( var i = 0; i < email.length; i++ ){
				var m = $.trim(email[i]);
				if( m.is_email() == false ){
					b = false;
					break;
				}
			}
			if( b == false ){
				setErrMsg(ta[0], lang.reg.email_format);
			}
			return b;
		});
	})($("#invite_out_form"));
	//-----------------------------------------------------参与者&感兴趣者切换---------------------------------
	$("#participantBtn").next().click(function(){
				$(this).addClass("current");
				$(this).prev().removeClass("current");
				var list=$("#participant");
				list.show();
				list.prev().hide();
				$(this).prev().click(function(){
					$(this).addClass("current");
					$(this).next().removeClass("current");
					list.hide();
					list.prev().show();
				});
	});
	//------------------------------------------------------groups.admin.editinfo------------------------------
	$('#edit_userface_file_input').change(function(){
		$('#edit_userface_img').src=this.value;
	});

	$('[js="deletegroupbbs"]').click(function() {
		var deleteurl = $(this).attr("deleteurl");
		pop_confirm(lang.group.deleteTopicTitle,
			lang.group.sure_delete,
			function() {
				location.href = deleteurl;
			}
		);
	});

	//--------------------------------------------------------------------------------------------------------

	(function(list){
		if(list.size()==0) return null;
		var imgs = list.find('img'),
			imgsLength = imgs.length,
			imgCont = $('<div style="text-align:center;height:500px;display:none;"></div>').appendTo('body');


		var transform = function(type){
			var i = imgCont.data('imgnum');
			if( type == 'next' && ++i >= imgsLength ){ i = 0 }
			if( type == 'prev' && --i <= -1 ){ i = imgsLength - 1 }
			showImage(i);
		};
		var showImage = function(num){
			var img = $(imgs[num]);
			var bigImg = $('<img src="' + img.attr('maxImg') + '" alt="' + img.attr('title') + '" />')
				.css({cursor: 'pointer'}).click(function(){transform('next')});
			imgCont.empty().append(bigImg).popupWin('option', 'title', img.attr('title'));
			imgCont.data('imgnum', num);
		};

		imgs.each(function(i){
			$(this).click(function(){
				var buttons = {};
				buttons[lang.common.photo_pre] = function(){ transform('prev'); };
				buttons[lang.common.photo_next] = function(){ transform('next'); };
				var options = {
					width: 530,
					reserve: true,
					clickClose: true,
					closeDestroy: true,
					title: '',
					buttons: buttons,
					open: function(){
						showImage(i);
					}
				}
				imgCont.popupWin(options);
			});
		});
	})($('#photoList'));

	//关闭新功能提示
	$('.notice-new a.common-close').click(function(){
		$.get('/user/index!closePromotion.jhtml?type=2',
		function(data) {
			if (!data) return null;
			var obj = $('.notice-new');
			obj.animate({
				height: 0,
				opacity: 0
			},
			500,
			function() {
				obj.remove()
			});

		});
	});

});

function showGroupLimitTip(gid, pageNo,key){
	var checkUrl = "/group/invite!getLimit.jhtml?gid=" + gid;
	var submitUrl = "/group/member.applyInit.jhtml?gid=" + gid;
	if(pageNo != '-1'){
		
		submitUrl = submitUrl + "&pageNo=" + pageNo;
	}
	$.post(checkUrl ,{'grpGroup.groupname':key } , function(data){
		if(data.indexOf('0') != -1){
			$('[name="submit___form"]').find('[name="gid"]').val(gid)
			$('[name="submit___form"]').submit();
		} else if(data.indexOf('1') != -1) {
			var layer = $('<div>' + $('#groupLimitDiv' + data.split(',')[1]).html() + '</div>');
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
		}
		else if(data.indexOf('3') != -1) {
			var layer = $('<div>' + $('#groupLimit_Diamond_Div').html() + '</div>');
			layer.popupWin({
				width: 600,
				title: lang.group.limit_title
			});
		}
		else if(data.indexOf('4') != -1) {
			var layer = $('<div>' + $('#groupLimit_UshiTong_Div').html() + '</div>');
			layer.popupWin({
				width: 600,
				title: lang.group.limit_title
			});
		}
	});
	return false
}