$(document).ready(function() {
	//调用首页ajax弹出窗口
	var homeAjaxFunc = [
		// {url:'/ajax/json!promotionTip.jhtml?promotionType=20130207'},                 //indeed Tips
		// {url:'/feed/feedapi!poptips.jhtml'},                                          //绑定微博
		// {url:'/ajax/json!promotionTip.jhtml?promotionType=20130606', type:'popup'},   //新版onboarding
		{url:'/ajax/json!promotionTip.jhtml?promotionType=20130509', type:'popup'},   //优士币系统 广告弹层
		{url:'/ajax/json!promotionTip.jhtml?promotionType=20130326', type:'popup'},   //u+ 广告弹层
		{url:'/ajax/json!promotionTip.jhtml?promotionType=201302281', type:'popup'}   //usc 弹层
	];
	var homeAjaxShow = {"tips": 0, "popup": 0};

	var homeAjax = function(){
		if( homeAjaxFunc.length ){
			var obj = homeAjaxFunc.shift();
			obj.type = obj.type || 'tips';
			if( typeof(obj.check) != 'undefined' && obj.check === false ){   //check可以是一个表达式也可以是一个函数执行后的返回值
				homeAjax();
				return;
			}
			$.ajax({
				url: obj.url,
				type: 'GET',
				cache: false,
				success: function(data){
					if( obj.type == 'popup' && homeAjaxShow['popup'] >0 ){         //如果已弹出一个层，则不再弹层
						homeAjax();
						return;
					}
					if( ! ($.trim(data) == '' || checkAjaxData(data) == false) ){  //如果返回错误页面则不做处理
						var div = $(data).appendTo('body');
						if( $.isFunction(obj.func) ) obj.func(div);
						homeAjaxShow[obj.type]++;
					}
					homeAjax();
				},
				dataType: 'text'
			});
		}
	};
	homeAjax();

	$('#homeInviteEmail').validate();

	//首页动态
	//新版
	var feedContent = $('#feed_content_new');
	feedContent.newsfeed().data('morePos', 999999);
	setTimeout(function(){
		$('#moreFeed').trigger('click');
	}, 50);

	//刷新动态
	var refreshFeed = function(){
		var a = $(this), waiting = $('<div>' + a.attr('waiting') + '</div>');
		if( $('#moreFeed').length > 0 ){
			feedContent.attr('morepageno', 0);
			feedContent.find('div.feed-block').remove();
			$('#moreFeed').attr('pageNo', 0).trigger('click');
		} else {
			waiting.popupTips({
				popupClass: 'simple-tips',
				arrow: 'top',
				width: 180,
				arrowPos: 82,
				reserve: false,
				position: {of:$(this), my:'center top', at:'center bottom', offset:'0 5'}
			});
		}
	}

	//写分享
	writeShare({
		postUrl: '/feed/feed!addFeed.jhtml',
		// getUrl: '/feed/feed!listAll.jhtml?r=' + Math.random(),
		atSupport: true,
		callback: function(data){
			if( ! data ){
				$(".ico-feed-add-ref").trigger('click');
			}
			$('.home-reco').remove();
		}
	});

	//动态ajax链接
	var feed_tab_url = [
		'/feed/feed!listAll.jhtml',
		'/feed/feed!listFriend.jhtml',
		'/feed/feed!listFollower.jhtml',
		'/feed/feed!listIndustry.jhtml',
		'/security/acceptfeed!view.jhtml'
	];

	//动态切换
	$('#feedTab').each(function(){
		var tab = $(this);
		var taba = tab.find('> a');
		var tabslt = tab.find(".tabs-select");
		var expli = tab.find(".tabs-expend li");
		function checkEmpty(data){
			var t = $(data).not('[js="moreFeedDiv"]');
			return t.filter('div').length;
		}
		taba.each(function(i) {
			$(this).click(function() {
				var a = $(this);
				if( a.hasClass('tabs-current') ) return false;
				var scrollTop = $(window).scrollTop();//记住滚动条位置
				taba.removeClass('tabs-current');
				a.addClass('tabs-current');
				feedContent.empty();
				feedContent.append('<div class="loading" style="width:20px;margin:20px auto;"></div>');
				var url = feed_tab_url[i] + '?newsFeedType=' + tabslt.find('> a').attr('js');
				feedContent.attr('ajaxAction', url);
				feedContent.attr('morepageno','1');
				$.ajax({
					url: url,
					cache: false,
					success: function(data) {
						if( checkEmpty(data) == 0 ){
							data = '<div class="tipsbox">' + lang.feed.feed_type_emtpy + tabslt.find('a').text() + '</div>' + data;	
						}
						feedContent.empty();
						feedContent.append(data);
					}
				});
				$(window).scrollTop( scrollTop );//设置滚动条位置
			});
		});
		function showTabMenu(menu, type){
			if( menu.is(':hidden') ){
				menu.show();
				setTimeout(function(){
					$(document).bind('click.' + type, function(){
						hideTabMenu(menu, type);
					});
				}, 100);
			}
		}
		function hideTabMenu(menu, type){
			menu.hide();
			$(document).unbind('click.' + type);
		}
		tabslt.click(function(evt){
			showTabMenu($(this).siblings(".tabs-expend"), 'hidefeedTypeMenu');
		});
		expli.click(function(){
			var li = $(this), a = li.children("a"), type = a.attr('js');
			if( ! type ) return;
			expli.removeClass("hide");
			li.addClass("hide");
			tabslt.children("a").html(a.html() + lang.feed.feed_type_name).attr("js", type);
			hideTabMenu(tab.find('.tabs-expend'), 'hidefeedTypeMenu');
			feedContent.empty();
			feedContent.append('<div class="loading" style="width:20px;margin:20px auto;"></div>');
			// var url = feed_tab_url[taba.index(taba.filter('.tabs-current'))] + '?newsFeedType=' + type;
			var url = feed_tab_url[0] + '?newsFeedType=' + type;
			feedContent.attr('ajaxAction', url);
			feedContent.attr('morepageno','1');
			$.ajax({
				url: url,
				cache: false,
				success: function(data) {
					if( checkEmpty(data) == 0 ){
						data = '<div class="tipsbox">' + lang.feed.feed_type_emtpy + tabslt.find('a').text() + '</div>' + data;	
					}
					feedContent.empty();
					feedContent.append(data);
				}
			});
		});

		// 动态控制
		$(".ico-feed-add-set").click(function(evt){
			showTabMenu($(this).parent().siblings(".settings-expend"), 'hidefeedSetMenu');
		});
		// 动态刷新
		$(".ico-feed-add-ref").click(refreshFeed);

		tab.find('.settings-expend').bind('click', function(evt){
			//evt.stopPropagation();
		});
	});

	// 滚动翻页动态
	$(window).bind('scroll', function(){
		var $w = $(window), st = $w.scrollTop() + $w.data('wh'), mp = feedContent.data('morePos');
		if( st > mp ){
			$('#moreFeed').trigger('click');
		}
	}).data('wh', $(window).height());
	
	//动态点击统计
	var sendClickType = function(feedId, clickType){
		feedId = feedId || '';
		$.get('/feed/feed!afterClick.jhtml?feedId=' + feedId + '&clickType=' + clickType);
	}
	$('#update_feeds [clickType], div[feedCtrlMenu] [clickType]').live('click.feedClick',  function(event){
		var a = $(this);
		sendClickType(a.closest('[feedId]').attr('feedId'), a.attr('clickType'));
	});
	$('#update_feeds [poppersonInfo]').live('mouseenter', function(){
		sendClickType($(this).closest('[feedId]').attr('feedId'), 14);
	});
	$('#update_feeds [feedCtrlMenu]').live('mouseenter', function(){
		sendClickType($(this).closest('[feedId]').attr('feedId'), 24);
	});
	
	
	//动态切换 && 更多动态 (老版)
	$('#feed_tab').each(function(){
		var feed_tab = $('#feed_tab li');
		$('#feed_tab li a').each(function(i) {
			var feed_content = $('#feed_content');
			$(this).click(function() {
				if( i >= 3 ){
					//window.document.location.href = feed_tab_url[3];
					return true;
				}
				var scrollTop = $(window).scrollTop();//记住滚动条位置
				feed_tab.removeClass('current');
				$(this).parent().addClass('current');
				feed_content.empty();
				feed_content.append('<div class="loading" style="width:20px;margin:20px auto;"></div>');
				feed_content.attr('ajaxAction', feed_tab_url[i]);
				feed_content.attr('morepageno','1');
				$.ajax({
					url: feed_tab_url[i],
					cache: false,
					success: function(data) {
						feed_content.empty();
						feed_content.append(data);
						bindFeed();
					}
				});
				$(window).scrollTop( scrollTop );//设置滚动条位置
				return false;
			});
		});
	});

	//可能认识的人模块
	(function( obj, url ) {
		function setClose() {
			var li = $(this).closest('li');
			var ids = [];

			var objA = li.siblings().andSelf().find('.common-close');
			var objB=$('[js="pymk_frame"]').find("[targetuserid]");
			
			objA.each(function(){
				ids.push($(this).attr('userid'));
			})
			objB.each(function(){
				ids.push($(this).attr('targetuserid'));
			})
			
			ids = ids.join(',');
			$.get(url + '?rid=' + li.find('dl').attr('rid') + '&recommTop=' + li.find('dl').attr('isrecommtop')+'&existUserIds='+ids+'&action='+$(this).attr('closeAction'),
				function(data) {
					li.fadeOut(350,
						function() {
							if (data != '') {
								$(this).html(data);
								var this_ = this;
								$(this).find(".common-close").click(setClose);
								$(this).find('[js="concern"]').click(setConcern);
								$(this).fadeIn(350);
							} else {
								$(this).remove();
							}
						});
				});
		}
		function setConcern(){
			var userid = $(this).attr('userid');
			$.get('/sns/sns!addFollower.jhtml?targetUserId=' + userid + '&fromWhere=1&flag=' + ($(this).attr('concernFlag') || ''));
			setClose.call(this);
		}
		$('[js="concern"]', obj).click(setConcern);
		$('.common-close', obj).click(setClose);
	})($('#userFriendsList'), '/user/index!loadNextRecommend.jhtml');

	//推荐的组模块
	(function(obj, url) {
		function setClose() {
			var li = $(this.parentNode);
			var groupId = li.find("dl").attr('groupId');
			$.get(url + groupId,
			function(data) {
				li.fadeOut(1000,
				function() {
					if (data != '') {
						$(this).html(data);
						$(this).find('.common-close').click(setClose);
						$(this).fadeIn();
					} else {
						$(this).remove();
					}
				})
			});
		}
		$('.common-close', obj).click(setClose);
	})($('#recommendationGroupList'), '/user/index!loadNextRecommendGroup.jhtml?groupId=');

	
	//首页feed设置浮动选项层*******************
	$('[js="index_feed_center_settings"]').hover(function(){
		var self_ = $(this).offset();
		var lf_ = self_.left;
		var rt_ = self_.right;
		$('[js="feed_setting_list_select_items"]').css({'z-index':'100'}).show();
		$('[js="feed_setting_list_select_items"]').hover(function(){
			$(this).show();
		},function(){
			$(this).hide();
		})
	})
	

	//验证用户名是否有效
	var showInvalidNameNotice = function(){
		var notice = $('<div class="notice">' + lang.profile.oldname_tip + '<a href="#" class="common-close"><span class="hide">Close</span></a></div>');
		$('#main').prepend(notice);
		notice.find('a').click(function(){
			$.get('/user/index!closeInvalidNameNotice.jhtml');
			setTimeout(function(){
				notice.animate({height: 0}, 500, function(){notice.remove();});
			}, 300);
		});
	}
	if ( typeof(INN_closed) == 'string' && INN_closed == '' ) {
		var nameString = $('span[js="userFullname"]').text().trim();
		var validateResult = nameString.validate_name();
		if (validateResult != "success_validation" && validateResult != "server_validation") {
			showInvalidNameNotice();
		} else if (validateResult == "server_validation") {
			$.ajax({
				url: "/user/reg!validateUserName.jhtml",
				type:'POST',
				dataType: 'text',
				data: {'nameString': nameString},
				success: function(data){
					if (data != "SUCCESS_VALIDATION") {
						showInvalidNameNotice();
					}
				}
			});
		}
	}

	//用户上限提示信息
	$('#limit_friends').bind('mouseover', function(){
		var a = $(this), pos = a.offset();
		$('#limit_friends_tips').popupTips({tipsType: 1, arrow: 'left', arrowPos: 10, width: 180, position: [pos.left + a.width() + 6, pos.top - 10]});
	});
	$('#limit_friends').bind('mouseout', function(){
		$('#limit_friends_tips').popupTips('destroy');
	});

	//如何获取优士币提示信息
	$('#showHowgetCoins').hover(function(){
		var a = $(this), pos = a.offset();
		$('#howgetCoinsPrompt').popupTips({tipsType: 1, arrow: 'top', width: 180, position: [pos.left - 20, pos.top + 20]});
	}, function(){
		if( $('#howgetCoinsPrompt').length ){
			$('#howgetCoinsPrompt').popupTips('destroy');
		}
	});

	//ajax三度人脉总数
	$.getJSON('/user/index!queryThirdDegreeFriendCount.jhtml', function(json){
		$('[jsonInfo="thirdDegreeFriendCount"]').html(json.thirdDegreeFriendCount);
	});
	
	//新版发布微博、活动、问题
	$('#homeAdd').each(function(){
		var addCont = $(this), taba = addCont.find('.home-add-link > a');
		taba.bind('click', function(event){
			var a = $(this), href = a.attr('href');
			if( href.indexOf('#') == 0 ){
				var panel = href.slice(1);
				taba.removeClass('selected');
				addCont.find('.home-add-cont > div:gt(0)').hide();
				a.addClass('selected');
				$('#' + panel).show();
				if( panel == 'wendaPanel' ){
					setTimeout(function(){
						bindWendaAddSearch($('[js="wenda_search_input"]'));
					}, 0);
				}
				if( panel == 'eventPanel' ){
					setTimeout(function(){
						bindEventAddSearch($('[js="event_search_input"]'));
					}, 0);
				}
				// return false;
				event.preventDefault();
			}
		});
		var text = addCont.find('textarea'), textCont = addCont.find('.home-add-weibo-text');
		text.bind('focus', function(){
			text.animate({height:60}, 300, function(){
				text.css('overflow', 'auto');
				addCont.find('.home-add-weibo-submit').show();
			});
			textCont.addClass('home-add-weibo-text-hover');
		});
		text.bind('blur', function(){
			textCont.removeClass('home-add-weibo-text-hover');
		});
	});

	//首页中栏hotmail邀请
	$('#hotmailInvite').each(function(){
		var panel = $(this);
		panel.find('form').submit(function(){
			var form = $(this);
			var email = form.find('[name="email"]').val(), pw = form.find('[name="emailPassword"]').val();
			if( email.is_email() != true ){
				form.find('[vdErr="notsupport"]').hide();
				form.find('[vdErr="email"]').show();
				return false;
			} else {
				var mail = email.split('@')[1];
				if( $.inArray(mail, supportEmail) == -1 ){
					form.find('[vdErr="notsupport"]').show();
					form.find('[vdErr="email"]').hide();
					return false;
				}
			}
			form.find('[vdErr="email"]').hide();
			form.find('[vdErr="notsupport"]').hide();
			if( pw.length == 0 ){
				form.find('[vdErr="password"]').show();
				return false;
			}
			form.find('[vdErr="password"]').hide();
			form.find(':submit').attr('disabled', true);
			return true;
		});
		panel.find('.common-close').click(function(){
			$.get('/user/onboarding!closeShowExcept1.jhtml');
			panel.css('overflow', 'hidden').animate({"height": 0}, 300, function(){
				panel.remove();
			});
		});
	});
	
	//换新的话题和问题
	$('#homeUWTags').each(function(){
		var cont = $(this), list = cont.find('.expand-word'), a = cont.find('[js="homeGetUWTopic"]');
		function showTags(p){
			$.get('/wenda/common!nextGroup.jhtml?targettype=2&type=' + p, function(data){
				data = $.trim(data);
				if( data == '' ){
					if( p == 1 ) return false;
					a.remove();
				} else {
					cont.show();
					data = $(data).filter('li');
					list.empty().append(data);
					bindExpandWord(list);
					if( data.length < 4 || p == 4 ){
						a.remove();
					} else {
						a.attr('page', p + 1);
					}
					$('.epl-height').css({'padding-left':'10px'});
				}
			});
		}
		a.click(function(){
			showTags(parseInt(a.attr('page')));
			return false;
		});
		showTags(1);
	});
	$('#homeUWQuestions').each(function(){
		var cont = $(this), list = cont.find('.expand-list'), a = cont.find('[js="homeGetUWQuestion"]');
		function showQuestions(p){
			$.get('/wenda/common!nextGroup.jhtml?targettype=1&type=' + p, function(data){
				data = $.trim(data);
				if( data == '' ){
					if( p == 1 ) return false;
					a.remove();
				} else {
					cont.show();
					data = $(data).filter('li');
					list.empty().append(data);
					bindExpandList(list);
					if( data.length < 3 || p == 4 ){
						a.remove();
					} else {
						a.attr('page', p + 1);
					}
					$('.epl-height').css({'padding-left':'10px'});
				}
			});
		}
		a.click(function(){
			showQuestions(parseInt(a.attr('page')));
			return false;
		});
		showQuestions(1);
	});
	
	//首页中部拓展人脉模块的关闭时间
	$(".home_friend").children(".common-close").click(function(){
		var _type=$(this).attr("type");
		$.ajax({
			url:"/user/index!closeOnboarding.jhtml",
			type:"POST",
			data:{"type":_type}
		})
		$(this).parent().remove();
	});
	
});

//页面header通用信息的特别处理
function checkInfoProfile(json){

}


//textarea输入“@”后自动匹配好友姓名

function textarea_autocomplete_initialize(_textarea){
	$(_textarea).parent().css("position","relative");
	var _div=$('<div class="text-div"></div>');
	var _textarea=$(_textarea);	
	var _position=_textarea.position();

	$(_textarea).parent().append(_div);
	_div.css({"position":"absolute","left":_position.left+parseInt(_textarea.css("margin-left")),"top":_position.top,
	 "overflow":"auto","width":_textarea.width(),"height":_textarea.height(),
	 "padding-top":_textarea.css("padding-top"),"padding-right":_textarea.css("padding-right"),"padding-bottom":_textarea.css("padding-bottom"),"padding-left":_textarea.css("padding-left"),
	 "border-top-width":_textarea.css("border-top-width"),"border-right-width":_textarea.css("border-right-width"),"border-bottom-width":_textarea.css("border-bottom-width"),"border-left-width":_textarea.css("border-left-width"),
	 "border-top-style":_textarea.css("border-top-style"),"border-right-style":_textarea.css("border-right-style"),"border-bottom-style":_textarea.css("border-bottom-style"),"border-left-style":_textarea.css("border-left-style"),
	 "border-top-color":_textarea.css("border-top-color"),"border-right-color":_textarea.css("border-right-color"),"border-bottom-color":_textarea.css("border-bottom-color"),"border-left-color":_textarea.css("border-left-color"),
	 "font-size":_textarea.css("font-size"),"font-family":_textarea.css("font-family"),"line-height":_textarea.css("line-height")});
	_div.hide();
	
	$(_textarea).keyup(function(){
		friends_autocomplete($(this));
	});
	$(_textarea).click(function(){
		friends_autocomplete($(this));
	});
}

function friends_autocomplete(_textarea){			
	var _str=_textarea.val();
	var _crtPos=getCursortPosition(_textarea[0]);
	var _searchStr;
	$(".name-box").remove();
	
	if (_str.slice(0,_crtPos).search('@')!=-1){
		var _lastAtPos=_str.slice(0,_crtPos).lastIndexOf("@")+1;
		_searchStr=_str.slice(_lastAtPos,_crtPos);
		var _patrn=new RegExp('^([a-zA-Z0-9]|[\u4e00-\u9fa5]|[_]){1,20}$');
		if (_patrn.exec(_searchStr)){
			var _strRpt;
			_strRpt=_str.slice(0,_lastAtPos)+'<span js="cursor">&nbsp;</span>'+_str.slice(_lastAtPos,_str.length);
			_strRpt=_strRpt.replace(/\n/g,'<br />');
			$(".text-div").html(_strRpt).show();
			var _scroll=_textarea.scrollTop();
			$(".text-div").scrollTop(_scroll);
			var _offset=$('[js="cursor"]').offset();
			var _left=_offset.left+3;
			var _top=_offset.top+18;
			$(".text-div").hide();
			var _nameBox=$('<div class="name-box"><ul><li class="nb-title">想用@提到谁？</li>'+search_word(_searchStr)+'</ul></div>');
			$("body").append(_nameBox);
			_nameBox.css({"z-index":"10000","left":_left,"top":_top});
			namelist_click(_textarea,_lastAtPos,_crtPos);
		}
	}
}

function search_word(_str){
	var _ret="";
	var _count=0;
	var _matchArr=new Array();
	
	if (_nameArr.length>0){
		for (i=0;i<_nameArr.length;i++){
			var _rank=_nameArr[i].indexOf(_str);
			if (_rank!=-1&&_count<10){
				_matchArr.push({"rank":_rank,"name":_nameArr[i]});
				_count++;
			}
		}
		if (_count>0){
			for (i=0;i<_count-1;i++){
				for (j=0;j<_count-i-1;j++){
					if (_matchArr[j].rank>_matchArr[j+1].rank){
						_temp=_matchArr[j];
						_matchArr[j]=_matchArr[j+1];
						_matchArr[j+1]=_temp;
					}
				}
			}
			for (i=0;i<_count;i++){
				_ret+='<li class="nb-item">'+_matchArr[i].name+'</li>';
			}
		}
	}
	return _ret;
}

function namelist_click(_textarea,_atPos,_curPos){
	$(".nb-item").click(function(){
		var _textStr=_textarea.val();
		var _nameStr=$(this).html();
		_textStr=_textStr.slice(0,_atPos)+_nameStr+" "+_textStr.slice(_curPos,_textStr.length);
		_textarea.val(_textStr);
		$(".name-box").remove();
	});
}

//获取光标位置函数
function getCursortPosition (ctrl) {
	var CaretPos = 0;	// IE Support
	if (document.selection) {
	ctrl.focus ();
		var Sel = document.selection.createRange ();
		Sel.moveStart ('character', -ctrl.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else if (ctrl.selectionStart || ctrl.selectionStart == '0')
		CaretPos = ctrl.selectionStart;
	return (CaretPos);
}


var supportEmail = [
'hotmail.com',
'msn.com',
'yahoo.com',
'yahoo.com.cn',
'yahoo.cn',
'gmail.com',
'sina.com.cn',
'sina.com',
'sohu.com',
'tom.com',
'163.com',
'126.com',
'hotmail.fr',
'hotmail.it',
'hotmail.de',
'hotmail.co.jp',
'hotmail.co.uk',
'hotmail.com.ar',
'hotmail.co.th',
'hotmail.com.tr',
'hotmail.es',
'msnhotmail.com',
'hotmail.jp',
'hotmail.se',
'hotmail.com.br',
'live.com.ar',
'live.com.au',
'live.at',
'live.be',
'live.ca',
'live.cl',
'live.cn',
'live.dk',
'live.fr',
'live.de',
'live.hk',
'live.ie',
'live.it',
'live.jp',
'live.co.kr',
'live.com.my',
'live.com.mx',
'live.nl',
'live.no',
'live.ru',
'live.com.sg',
'live.co.za',
'live.se',
'live.co.uk',
'live.com',
'windowslive.com',
'googlemail.com',
'yahoo.com.ar',
'yahoo.com.au',
'yahoo.com.br',
'yahoo.com.hk',
'yahoo.com.kr',
'yahoo.com.my',
'yahoo.com.au',
'yahoo.com.no',
'yahoo.com.ph',
'yahoo.com.ru',
'yahoo.com.sg',
'yahoo.com.es',
'yahoo.com.se',
'yahoo.com.tw',
'yahoo.com.mx',
'yahoo.ba',
'yahoo.at',
'yahoo.es',
'yahoo.se',
'yahoo.ie',
'yahoo.ca',
'yahoo.dk',
'yahoo.fr',
'yahoo.de',
'yahoo.gr',
'yahoo.it',
'yahoo.kr',
'yahoo.ru',
'yahoo.tw',
'yahoo.co.in',
'yahoo.co.uk',
'yahoo.co.jp',
'yahoo.co.kr',
'yahoo.co.ru',
'yahoo.co.tw',
'yahoo.co.th',
'aol.com',
'aim.com',
'netscape.net',
'aol.in',
'aol.co.uk',
'aol.com.br',
'aol.de',
'aol.fr',
'aol.nl',
'aol.se',
'lycos.com',
'lycos.co.uk',
'lycos.co.at',
'lycos.co.be',
'lycos.co.ch',
'lycos.co.de',
'lycos.co.es',
'lycos.co.fr',
'lycos.co.it',
'lycos.co.nl',
'caramail.com',
'caramail.fr',
'rediffmail.com',
'indiatimes.com',
'mac.com',
'mail.com',
'mail.com',
'email.com',
'iname.com',
'cheerful.com',
'consultant.com',
'europe.com',
'mindless.com',
'earthling.net',
'myself.com',
'post.com',
'techie.com',
'usa.com',
'writeme.com',
'alumnidirector.com',
'berlin.com',
'dublin.com',
'london.com',
'madrid.com',
'moscowmail.com',
'munich.com',
'nycmail.com',
'rome.com',
'sanfranmail.com',
'singapore.com',
'tokyo.com',
'australiamail.com',
'japan.com',
'singapore.com',
'usa.com',
'minister.com',
'priest.com',
'saintly.com',
'artlover.com',
'bikerider.com',
'catlover.com',
'comic.com',
'cutey.com',
'doglover.com',
'gardener.com',
'musician.org',
'email.com',
'mail.com',
'writeme.com',
'accountant.com',
'adexec.com',
'allergist.com',
'alumnidirector.com',
'archaeologist.com',
'chemist.com',
'clerk.com',
'columnist.com',
'comic.com',
'consultant.com',
'counsellor.com',
'deliveryman.com',
'diplomats.com',
'doctor.com',
'dr.com',
'execs.com',
'financier.com',
'gardener.com',
'geologist.com',
'graphic-designer.com',
'hairdresser.net',
'insurer.com',
'journalist.com',
'lawyer.com',
'legislator.com',
'lobbyist.com',
'mad.scientist.com',
'minister.com',
'optician.com',
'pediatrician.com',
'popstar.com',
'presidency.com',
'priest.com',
'programmer.net',
'publicist.com',
'realtyagent.com',
'registerednurses.com',
'repairman.com',
'representative.com',
'rescueteam.com',
'scientist.com',
'sociologist.com',
'techie.com',
'technologist.com',
'umpire.com',
'africamail.com',
'americamail.com',
'arcticmail.com',
'asia.com',
'asia-mail.com',
'australiamail.com',
'berlin.com',
'californiamail.com',
'dublin.com',
'dutchmail.com',
'englandmail.com',
'europe.com',
'europemail.com',
'japan.com',
'london.com',
'madrid.com',
'moscowmail.com',
'munich.com',
'nycmail.com',
'pacific-ocean.com',
'pacificwest.com',
'rome.com',
'safrica.com',
'samerica.com',
'sanfranmail.com',
'singapore.com',
'swissmail.com',
'tokyo.com',
'usa.com',
'yours.com',
'mail.com',
'cliffhanger.com',
'email.com',
'iname.com',
'mail.com',
'post.com',
'soon.com',
'winning.com',
'earthling.net',
'inorbit.com',
'2die4.com',
'cheerful.com',
'hot-shot.com',
'loveable.com',
'mindless.com',
'myself.com',
'playful.com',
'poetic.com',
'popstar.com',
'saintly.com',
'seductive.com',
'whoever.com',
'witty.com',
'fastmail.fm',
'fastmail.cn',
'fastmail.co.uk',
'fastmail.com.au',
'fastmail.es',
'fastmail.in',
'fastmail.jp',
'fastmail.net',
'fastmail.to',
'fastmail.us',
'123mail.org',
'airpost.net',
'eml.cc',
'fmail.co.uk',
'fmgirl.com',
'fmguy.com',
'mailbolt.com',
'mailcan.com',
'mailhaven.com',
'mailmight.com',
'ml1.net',
'mm.st',
'myfastmail.com',
'proinbox.com',
'promessage.com',
'rushpost.com',
'sent.as',
'sent.at',
'sent.com',
'speedymail.org',
'warpmail.net',
'xsmail.com',
'150mail.com',
'150ml.com',
'16mail.com',
'2-mail.com',
'4email.net',
'50mail.com',
'allmail.net',
'bestmail.us',
'cluemail.com',
'elitemail.org',
'emailcorner.net',
'emailengine.net',
'emailengine.org',
'emailgroups.net',
'emailplus.org',
'emailuser.net',
'f-m.fm',
'fast-email.com',
'fast-mail.org',
'fastem.com',
'fastemail.us',
'fastemailer.com',
'fastest.cc',
'fastimap.com',
'fastmailbox.net',
'fastmessaging.com',
'fea.st',
'fmailbox.com',
'ftml.net',
'h-mail.us',
'hailmail.net',
'imap-mail.com',
'imap.cc',
'imapmail.org',
'inoutbox.com',
'internet-e-mail.com',
'internet-mail.org',
'internetemails.net',
'internetmailing.net',
'jetemail.net',
'justemail.net',
'letterboxes.org',
'mail-central.com',
'mail-page.com',
'mailandftp.com',
'mailas.com',
'mailc.net',
'mailforce.net',
'mailftp.com',
'mailingaddress.org',
'mailite.com',
'mailnew.com',
'mailsent.net',
'mailservice.ms',
'mailup.net',
'mailworks.org',
'mymacmail.com',
'nospammail.net',
'ownmail.net',
'petml.com',
'postinbox.com',
'postpro.net',
'realemail.net',
'reallyfast.biz',
'reallyfast.info',
'speedpost.net',
'ssl-mail.com',
'swift-mail.com',
'the-fastest.net',
'the-quickest.com',
'theinternetemail.com',
'veryfast.biz',
'veryspeedy.net',
'yepmail.net',
'your-mail.com',
'gmx.net',
'gmx.de',
'gmx.at',
'gmx.ch',
'icqmail.com',
'web.de',
'email.de',
'mynet.com',
'mail.ru',
'inbox.ru',
'bk.ru',
'list.ru',
'freenet.de',
'rambler.ru',
'amorki.pl',
'autograf.pl',
'buziaczek.pl',
'onet.pl',
'onet.eu',
'op.pl',
'poczta.onet.eu',
'poczta.onet.pl',
'vp.pl',
'yandex.ru',
'libero.it',
'inwind.it',
'iol.it',
'blu.it',
'interia.eu',
'interia.pl',
'poczta.fm',
'1gb.pl',
'2gb.pl',
'vip.interia.pl',
'czateria.pl',
'akcja.pl',
'serwus.pl',
'znajomi.pl',
't-online.de'];
