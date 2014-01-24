//话题最长显示数
var maxTagShow = 85;

//关注
function followBase(a, action){
	if( a.data('following') == true )
		return false;
	a.data('following', true);
	var act = {
		follow: {name: 'unfollow', url: '/wenda/subscribe!follow.jhtml?'},
		unfollow: {name: 'follow', url: '/wenda/subscribe!unfollow.jhtml?'}
	};
	var typeId = parseInt(a.attr('followType'), 10), targetId = a.attr(action);
	act.follow['cls'] = a.attr('uflc') || 'quiet';
	act.unfollow['cls'] = a.attr('flc') || '';
	act.follow['dn'] = a.attr('ufldn') || '取消关注';
	act.unfollow['dn'] = a.attr('fldn') || '关注';
	var s = ' flc="' + act.unfollow['cls'] + '" uflc="' + act.follow['cls'] + '" fldn="' + act.unfollow['dn'] + '" ufldn="' + act.follow['dn'] + '"';
	var ra = $('<a href="#" ' + act[action].name + '="' + targetId + '" followType="' + typeId + '" class="' + act[action].cls + '"' + s + '>' + act[action].dn + '</a>');
	if( typeId == 3 && action == 'follow' ){
		//followUser(act[action].url, a, targetId, ra);
		followAction(act[action].url, a, targetId, typeId, ra);
		$.get('/sns/sns!addFollower.jhtml?targetUserId=' + targetId);
	} else {
		followAction(act[action].url, a, targetId, typeId, ra);
	}
}
//关注用户
function followUser(url, a, targetId, ra){
	var pop = $('#followUserPop'), allurl = '/sns/sns!addFollower.jhtml?targetUserId=';
	if( pop.length == 0 )
		pop = $('<div id="followUserPop" class="dp-menu dp-menu-static"><ul class="dp-menulist"><li><a href="#" js="followAllFeed">关注全站动态</a></li><li><a href="#">只关注问答动态</a></li></ul></div>');
	pop.find('a').unbind('click').bind('click', function(){
		followAction(url, a, targetId, 3, ra);
		pop.popupLayer('destroy');
		return false;
	});
	pop.find('a[js="followAllFeed"]').unbind('click').bind('click', function(){
		$.get(allurl + targetId);
		return false;
	});
	var pos = a.offset();
	pop.popupLayer({
		closeDestroy: true,
		reserve: true,
		position: [pos.left - 2, pos.top + a.outerHeight() + 2]
	});
}
function followAction(url, a, targetId, typeId, elem){
	url = url + 'targetId=' + targetId + '&typeId=' + typeId;
	if( a.attr('recommend') ){
		url += '&recommend=' + a.attr('recommend');
	}
	$.getJSON(url, function(json){
		a.data('following', false);
		if( json.state == 0 && elem && elem.length ){
			if( $.isFunction(a.data('followCB')) ){
				a.data('followCB')(elem, a);
			} else {
				a.replaceWith(elem);
			}
		}
	});
}

//添加问题
var questionTimes = 0;   //当前页面添加问题次数
function firstQuestion(title, html, from, openCB){
	var jq = $(html);
	if( jq.filter('#firstQuestion').length ){
		var pop = jq.filter('#firstQuestion'), html = jq.filter('div:last');
		pop.popupWin({
			width: 580,
			title: '优问小助手',
			closeDestroy: true,
			reserve: false,
			afterDestroy: function(){
				addQuestion(title, html, from, openCB);
			}
		});
	} else {
		addQuestion(title, html, from, openCB);
	}
}
function addQuestion(title, html, from, openCB){
	questionTimes = 1;
	var input = $('input[addQuestion="input"]');
	input.autocomplete('option', 'stopShow', true);  //停止搜索结果的显示
	var pop = typeof(html) == 'string' ? $('<div>' + html + '</div>') : $(html);
	var showDoYouKnow = function(n){
		$.ajax({
			url: '/wenda/doc!tip.jhtml?tipid=' + n,
			cache: true,
			type: 'get',
			success: function(data){
				$('div[js="doyouknow"]').replaceWith(data);
			}
		});
	}
	var pos = from == 'home' ? ['center', 'center'] : [input.closest('.wd-home-search').offset().left + 150, 'center'];
	pop.popupWin({
		title: '添加问题',
		width: 740,
		//position: pos,
		closeDestroy: true,
		reserve: false,
		open: function(evt, ui){
			ui.find('a.close').remove();
			var fs = pop.find('#friend-selector');
			var qt = pop.find('[js="questionTitle"]');
			function checkQTitle(){
				var qtv = qt.val();
				if( qtv == qt.attr('defaultTips') || $.trim(qtv) == '' ){
					qt.css('color', '#C00');
					return false;
				}
			}
			//初始化第1步
			function initStep1(cont){
				pop.popupWin('option', 'title', '添加问题');
				if( title ) qt.val(title).css('color', 'inherit');
				cont.find('[defaultTips]').showDefaultTips();
				var ti = cont.find('[js="addQuestionTopicSearch"]'), tiPos = ti.offset();
				var defaultTopic = null;
				if( typeof(defaultTagId) == 'string' ){
					defaultTopic = {id:defaultTagId, name:defaultTagName};
				}
				if( typeof(defaultTag) == 'object' ){
					if( $.isArray(defaultTag) ) defaultTopic = defaultTag;
				}
				ti.topicSearch({
					position: [tiPos.left - 6, tiPos.top + 23],
					width: ti.outerWidth() + 29,
					defaultTopic: defaultTopic,
					topicCont: pop.find('[js="questionTopicCont"]')
				});
				cont.find('textarea[maxlength]').checkFieldLength();
				cont.find('input[js="setp1Submit"]').bind('click', checkQTitle);
				cont.find('[tipsInfo]').focus(function(){
					cont.find('[js^=tipsInfo]').hide();
					cont.find('[js=tipsInfo' + $(this).attr('tipsInfo') + ']').show();
				});
			}
			//初始化第2步
			function initStep2(cont){
				cont.find('[js="checkAllExperts"]').removeAttr('checked');
				pop.popupWin('option', 'title', '邀请他人回答此问题');
				cont.show().simpleTabs({
					selectedClass: 'current',
					tabs: '>div.tabs-sub>ul>li',
					content: '>div:gt(0)'
				});
				if( cont.data('fsInit') != true ){
					fs.friendSelect({
						template: '',
						inviteMax: 200,
						url: '/msg/message!getFriends.jhtml',
						memberLoaded: function(event, md){
							cont.find('[fs="allMemberCount"]').text(md.length);
						}
					});
					cont.data('fsInit', true);
				} else {
					fs.find('[fsNavi="ushi"] a').trigger('click');
				}
				var tids, aids = [];
				pop.find('.wd-topic-outer[topicId]').each(function(){
					var tId = $(this).attr('topicId');
					if( tId ) aids.push(tId);
				});
				tids = aids.join(',');
				$.get('/wenda/question!tp.jhtml?s_topicids=' + tids, function(data){
					var eptcont = cont.find('div[js="expertsCont"]').empty(), ept = $(data).appendTo(eptcont);
					var lis = ept.find('li');
					if( lis.length ){
						eptcont.siblings('p').show();
						lis.bind('click', function(){
							var li = $(this);
							if( li.hasClass('select') ){
								li.removeClass('select');
								li.find(':checkbox').removeAttr('checked');
							} else {
								li.addClass('select');
								li.find(':checkbox').attr('checked', true);
							}
						}).hover(function(){
							$(this).addClass('hover');
						}, function(){
							$(this).removeClass('hover');
						});
						lis.find('a').click(function(event){
							event.stopPropagation();
						});
						cont.find('[js="checkAllExperts"]').click(function(){
							ept.find(':checkbox').attr('checked', this.checked);
							this.checked ? lis.addClass('select') : lis.removeClass('select');
						});
					} else {
						eptcont.siblings('p').hide();
					}
				});
			}
			initStep1(pop.find('div[js="addQuestionStep1"]'));
			pop.find('[js="goNext"]').bind('click', function(){
				if( checkQTitle() == false ){
					return false;
				}
				pop.find('[js="addQuestionStep1"]').hide();
				initStep2(pop.find('[js="addQuestionStep2"]'));
				return false;
			});
			pop.find('[js="goPrev"]').bind('click', function(){
				fs.friendSelect('clear');
				var step2 = pop.find('[js="addQuestionStep2"]');
				step2.hide();
				pop.find('[js="addQuestionStep1"]').show();
				return false;
			});
			pop.find('form').submit(function(){
				if( checkQTitle() == false ){
					return false;
				}
				var m = fs.friendSelect('option', 'selectedUsers'), form = $(this);
				if( $.isPlainObject(m) ){
					for( var k in m ){
						form.append('<input type="hidden" name="helpuserids" value="' + k + '" />');
					}
				}
				form.find(':submit').attr('disabled', true);
			});
			if( $.isFunction(openCB) ) openCB(pop);
			pop.find('[js=questionTitle]').focus();
		}
	});
}

//邀请使用问答
function checkEmail(emails, max){
	var vali = new $.ushi.validate.tools(), arr = [];
	emails = emails.split(/\n|\;|\,|，/g);
	for( var i = 0; i < emails.length; i++ ){
		var o = {}, email = $.trim(emails[i]);
		if( email == '' ) continue;
		email = email.split(/\<|\>/g);
		if( email.length == 1 ){
			o.email = $.trim(email[0]);
			if( vali.isEmail(o.email) ){
				o.name = o.email.slice(0, o.email.indexOf('@'));
				arr.push(o);
			}
		} else if( email.length >= 2 ){
			o.email = $.trim(email[1]);
			if( vali.isEmail(o.email) ){
				o.name = $.trim(email[0]);
				if( o.name == '' ){
					o.name = o.email.slice(0, o.email.indexOf('@'));
				} else {
					o.name = o.name.replace(/^(\'|\")|(\'|\")$/g, '');
				}
				o.name = $.trim(o.name);
				arr.push(o);
			}
		}
	}
	emails = '';
	if( arr.length ){
		for( i = 0; i < Math.min(arr.length, max); i++ ){
			emails += arr[i].email + ',';
		}
	}
	return emails.slice(0, emails.length - 1);
}
function inviteJoin(html, max){
	var pop = $(html), invited = 0;
	var resetLink = function(){
		pop.popupWin('close');
		if( invited == max ){
			var li = $('[js="inviteJoin"]').closest('li');
			li.empty().append('<span class="quiet">邀请好友使用优问</span>');
		} else {
			$('[js="maxInviteJoin"]').text(max - invited);
		}
	};
	pop.popupWin({
		title: '邀请好友使用优问',
		width: 555,
		closeDestroy: true,
		reserve: false,
		open: function(){
			var fsl = pop.find('div#friendSelectList');
			fsl.friendSelectList({
				inviteMax: max,
				url: '/ajax/json!uwenInnerInvite.jhtml',
				idField: pop.find('input[js="inviteJoinReceiverId"]'),
				fsParam: {
					prompt: lang.friend.fs_max_info(max),
					enableMin: false,
					width: 826
				}
			});
			pop.find('form[js="inviteJoin1d"]').ajaxForm({
				beforeSubmit: function(event, form){
					if( form.find(':hidden').val() == '' ){
						fsl.find(':text').addClass('red');
						return false;
					}
					invited = form.find('[name="userIds"]').val().split(',').length;
					form.find(':submit').attr('disabled', true);
				},
				ajaxOptions: {
					success: function(){
						resetLink();
						pop_alert('站内邀请已发送');
					}
				}
			});
			pop.find('textarea[defaultTips]').showDefaultTips();
			pop.find('form[js="inviteJoinEmail"]').ajaxForm({
				beforeSubmit: function(event, form){
					var t = form.find('textarea'), emails = $.trim(t.val());
					if( emails == '' || emails == t.attr('defaultTips') ){
						t.val(t.attr('defaultTips')).css('color', '#c00');
						return false;
					}
					emails = checkEmail(emails, max);
					if( emails ){
						invited = emails.split(',').length;
						t.val(emails);
						form.find(':submit').attr('disabled', true);
					} else {
						pop_alert('请输入格式正确的E-mail地址');
						return false;
					}
				},
				ajaxOptions: {
					success: function(){
						resetLink();
						pop_alert('邀请已发送');
					}
				}
			});
		}
	});
}

//绑定话题搜索
jQuery.fn.topicSearch = function(options){
	options = $.extend({
		url: '/wenda/tag!search.jhtml',
		jsonAttr: 'topic',
		searchKeyname: 'topicname',
		topicCont: '[js="topicCont"]',
		urlKey: 'topicid',
		addUrl: null,
		removeUrl: null,
		addCB: null,
		removeCB: null
	}, options || {});

	return this.each(function(){
		var topicInput = $(this);
		var topicCont = topicInput.attr('topicCont') ? $(topicInput.attr('topicCont')) : $(options.topicCont);
		var addLink = topicInput.closest('[js="topicAdd"]').find('[js="addNewTopicLink"]');
		var addTopic = function(topic){
			if( checkIgnoreAddTopic(topic.id) === false )
				return false;
			if( topicCont.find(':hidden[value="' + topic.id + '"]').length )
				return false;
			var obj = $('<p class="wd-topic-outer" topicId="' + topic.id + '"><span class="wd-topic"><span class="wd-topic-inner">' + cutWord(topic.name, maxTagShow) +
				'<a class="common-close">close</a></span></span>' + '<input type="hidden" name="topicids" value="' + topic.id + '" /></p>');
			var param = {};
			param[options.urlKey] = topic.id;
			bindAddTopic(obj, param);
		}
		var addNewTopic = function(topic){
			if( checkIgnoreAddTopic(topic) === false )
				return false;
			if( topic == '' || topicCont.find(':hidden[value="' + topic + '"]').length )
				return false;
			var obj = $('<p class="wd-topic-outer" topicId=""><span class="wd-topic"><span class="wd-topic-inner">' + cutWord(topic, maxTagShow) + '<a class="common-close">close</a></span></span>' +
							'<input type="hidden" name="newtopics" value="' + topic + '" /></p>');
			bindAddTopic(obj, {"title": topic});
		}
		var removeTopic = function(){
			var obj = $(this).closest('.wd-topic-outer'), topicId = obj.attr('topicId');
			if( options.removeUrl )
				$.get(options.removeUrl + '&' + options.urlKey + '=' + topicId, function(){
					if( $.isFunction(options.removeCB) )
						options.removeCB(obj);
					obj.remove();
				});
			return false;
		}
		var bindAddTopic = function(obj, param){
			if( options.addUrl ){
				$.post(options.addUrl, param, function(json){
					if( json.topicid > 0 ){
						topicCont.append(obj);
						obj.attr('topicId', json.topicid);
						if( $.isFunction(options.addCB) )
							options.addCB(json, obj);
						obj.find('.common-close').bind('click', removeTopic);
					}
				}, 'json');
			} else {
				topicCont.append(obj);
				obj.find('.common-close').bind('click', function(){
					obj.remove();
					return false;
				});
			}
		}
		var enterTopic = function(){
			var v = topicInput.val();
			if( v == topicInput.attr('defaultTips') ) return false;
			var list = ([]).concat(topicInput.autocomplete('option', 'dataList'));
			topicInput.val('').attr('searchKey', '');
			topicInput.autocomplete('hide');
			for( var i = 0; i < Math.min(10, list.length); i++ ){
				if( list[i]['name_'].toLowerCase() == v.toLowerCase() ){
					addTopic({"id": list[i]['id_'], "name": list[i]['name_']});
					return false;
				}
			}
			addNewTopic(v);
			return false;
		}
		var tiPos = topicInput.offset();
		topicInput.autocomplete({
			position: options.position || {of: topicInput, offset: '-6 0'},
			width: options.width || topicInput.outerWidth() + 28,
			url: options.url,
			ajax: options.jsonAttr,
			ajaxKey: options.searchKeyname,
			listClass: 'ac-dp-list',
			listMax: 10,
			selected: function(event, li){
				addTopic({"id": li.attr('index'), "name": li.text()});
				$(this).val('').attr('searchKey', '');
			},
			pressEnter: enterTopic
		});
		topicCont.find('> .wd-topic-outer a.common-close').live('click', removeTopic);
		addLink.bind('click', enterTopic);
		if( options.defaultTopic ){
			if( $.isArray(options.defaultTopic) ){
				for( var i = 0; i < options.defaultTopic.length; i ++ ){
					addTopic(options.defaultTopic[i]);
				}
			} else {
				addTopic(options.defaultTopic);
			}
		}
	});
}

//投票
jQuery.fn.vote = function(options){
	options = $.extend({
		url: '/wenda/answer!vote.jhtml?answerid=',
		public: false
	}, options || {});
	return this.each(function(){
		var vote = $(this), cnt = vote.find('.answer-vote-count'),
			url = options.url + vote.attr('aid') + '&vote=';
		if( vote.attr('hasBind') == 'vote' ){
			return true;
		} else {
			vote.attr('hasBind', 'vote');
		}
		if( cnt.length ){
			var aa = vote.find('a').hide();
			cnt.show().bind('click', function(){
				if( vote.attr('voted') === 'true' ){
					//return false;
				}
				var a = $(this);
				aa.show();
				if( aa.length > 1 )
					a.hide();
				return false;
			});
		}
		var vtcont = vote.closest('.event-content, .question-cont'), cv = vtcont.find('[js="curVotes"]'), vf = vtcont.find('[js=voteFrom]');
		function resetVote(v, a, cls){
			if( vote.attr('voted') === 'true' )
				return false;
			if( v == '1' ){
				var curv = cnt.length ? parseInt(cnt.text(), 10) : cv.length ? parseInt(cv.text(), 10) : 0;
				cv.text(curv + 1);
				if( vf.length ){
					var un = vote.attr('un');
					vf.show();
					if( curv == 0 ){
						vf.append('<span>' + un + '</span>');
					} else {
						$('<span>' + un + ', </span>').insertBefore(vf.find('a:first'));
					}
				}
			}
			if( options.public != true ){
				$.get(url + v);
				vote.attr('voted', 'true').removeClass('answer-vote-false').addClass('answer-vote-true');
				a.addClass(cls);
			}
		}
		vote.find('.answer-agree').bind('click', function(){
			resetVote('1', $(this), 'answer-agree-selected');
			return false;
		});
		vote.find('.answer-differ').bind('click', function(){
			resetVote('-1', $(this), 'answer-differ-selected');
			return false;
		});
		if( options.showTips ){
			var showTip = function(a, msg, pos, w){
				if( a.data('voteTip') ) return false;
				var tip = $('<div>' + msg + '</div>');
				tip.popupTips({
					closeDestroy: true,
					reserve: false,
					tipsType: 4,
					width: w || 130,
					arrowPos: 4,
					position: pos,
					open: function(evt, ui){
						ui.find('.fl-content').css('padding', '3px 6px');
					}
				});
				a.data('voteTip', tip);
			}
			var closeTip = function(a){
				tip = a.data('voteTip');
				if( tip ){
					tip.popupTips('close');
					a.removeData('voteTip');
				}
			}
			vote.find('.answer-agree').hover(function(){
				var a = $(this), pos = a.offset();
				showTip(a, options.showTips.agree, [pos.left + 33, pos.top - 3]);
			}, function(){
				closeTip($(this));
			});
			vote.find('.answer-differ').hover(function(){
				var a = $(this), pos = a.offset();
				showTip(a, options.showTips.differ, [pos.left + 33, pos.top - 3]);
			}, function(){
				closeTip($(this));
			});
			vote.find('.answer-vote-count').hover(function(){
				var a = $(this), pos = a.offset();
				showTip(a, options.showTips.count.replace('{#}', a.text()), [pos.left + 33, pos.top - 3], 250);
			}, function(){
				closeTip($(this));
			});
		}
	})
}

//初始化显示更多
jQuery.fn.initViewmore = function(options){
	return this.each(function(){
		var a = $(this), div = a.closest('div'), maxlen = 200;
		a.remove();
		var str = div.text(), cn = str.replace(/[\x00-\xff]/g, ''), en = str.replace(/[^\x00-\xff]/g, '');
		//if( cn.length * 2 + en.length < maxlen )
		if( str.length < maxlen )
			return true;
		var hstr = div.html(), sour = $('<p style="display:none;">' + hstr + '</p>');
		var createNew = function(s){
			var n = $('<p>' + s + '...</p>'), na = $('<a href="#" class="spe-left">显示更多</a>');
			div.append(n.append(na));
			na.bind('click', function(){
				n.remove();
				sour.show();
				return false;
			});
		}
		div.empty().append(sour);
		if( str == hstr ){
			createNew(str.slice(0, maxlen - 4));
		} else {
			var t1 = str.slice(maxlen - 7, maxlen - 4), t2 = hstr.indexOf(t1, maxlen - 7);
			createNew(hstr.slice(0, t2 + 4));
		}
	});
}

//加 go top 按钮
function easeOutCirc (x, t, b, c, d) {
	return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
}
function scrollTop(toTop){
	var fromTop = $(document).scrollTop(), h = toTop - fromTop, t = 0;
	function start(){
		t ++;
		if( t <= 10 ){
			scrollTo(0, fromTop + h * easeOutCirc(t * 50 / 500, t * 50, 0, 1, 500));
			setTimeout(start, 50);
		}
	}
	start();
}
function addGoTop(){
	var c3 = $('.column-3');
	if( c3.length == 0 || $('div[js=footer]').length == 0 )
		return false;
	var hdh = typeof(headerHeight) == 'number' ? headerHeight : 200;
	var toph = 60;
	var c3b = $('<div style="width:1px;height:1px;"/>').appendTo(c3), ft = $('div[js=footer]');
	var topBtn = $('<a href="#" class="wd-go-top" style="display:none;">Top</a>').appendTo('body');
	var resetPos = function(){
		var wh = $(window).height(), ds = $(document).scrollTop();
		var p1 = c3b.offset();
		topBtn.css('left', (p1.left - 25) + 'px');
		var vt =  Math.max(wh, p1.top);
		if( wh + ds > vt + 60 ){
			var ftt = ft.offset().top;
			if( ftt > p1.top + toph ){
				if( $.browser.msie && $.browser.version == '6.0' ){
					topBtn.css('top', Math.min(ds + (wh - toph), ftt - toph) + 'px');
				} else {
					topBtn.css('top', Math.min((wh - toph), (wh - (toph + ds + wh - ftt))) + 'px');
				}
				topBtn.css('display', 'block');
			}
		} else {
			topBtn.css('display', 'none');
		}
	}
	$(window).bind('resize scroll.gotoTop', resetPos);
	topBtn.bind('click', function(){
		scrollTop(0);
		topBtn.blur();
		return false;
	});
}

//评论
function bindComment(options){
	options = $.extend({
		getURL: '/wenda/comment!list.jhtml',
		public: false
	}, options || {});
	
	$('[js="showComment"]').live('click', function(){
		var cont = $(this).closest('[commentTarget]'), tId = cont.attr('commentTarget'), comm = cont.find('.event-comments');
		var list = comm.filter('div'), add = comm.filter('p');
		if( list.is(':visible') ){
			comm.hide();
		} else {
			comm.show();
			var cur = parseInt(list.attr('curCmt'), 10);
			if( list.attr('loaded') != 'true' && cur > 0 ){
				list.append('<div class="loading">&nbsp;</div>');
				$.get(options.getURL + '?typeId=' + list.attr('typeId') + '&targetId=' + tId, function(data){
					list.empty().append(data);
					list.attr('loaded', 'true');
					list.attr('curCmt', list.find('>div').length);
				});
			}
		}
		return false;
	});
	$('.event-comments [js="addComment"]').live('click', function(){
		if( options.public == true ) return;

		if( $(this).attr('unverify') ) return false; //如果未经验证则不绑定

		var cont = $(this).closest('[commentTarget]'), tId = cont.attr('commentTarget'), comm = cont.find('.event-comments');
		var list = comm.filter('div'), add = comm.filter('p'), text = $(this).siblings('textarea');
		var v = $.trim(text.val());
		if( v != '' ){
			$.post('/wenda/comment!add.jhtml?typeId=' + list.attr('typeId') + '&targetId=' + tId, {"content": v}, function(json){
				var cmt = json.commentVo;
				var html = '<div class="reply" commentId="' + cmt.id + '"><p><a href="/u/' + cmt.userId + '">' + cmt.userName + '</a>' +
					'<span class="spe-left">' + cmt.content + '</span></p><p class="action">' + cmt.postTime + '</p></div>';
				var obj = $(html);
				obj.css('opacity', 0).appendTo(list);
				setTimeout(function(){
					obj.animate({opacity: 1}, 500);
					var c = list.find('>div').length;
					list.attr('curCmt', c);
					cont.find('[js="commentCount"]').text('(' + c + ')');
				}, 0);
				cont.find('[js="showComment"]').text('评论');
			}, 'json');
			text.val('');
		}
		return false;
	});
	$('.event-comments [js="delComment"]').live('click', function(){
		return false;
	});
}

//显示新手引导
function showGuidePop(opt){
	opt = opt || {};
	var guide = $('#guideCont');
	if( guide.length == 0 ) return false;
	var conts = guide.find('> div');
	conts.each(function(i){
		var cont = $(this), type = cont.attr('gd'), pos = $('[guide="' + type + '"]:first').offset(), pos1 = cont.attr('offset').split(',');
		var position = [pos.left + parseInt(pos1[0]), pos.top + parseInt(pos1[1])];
		var param = {
			clickClose: false,
			closeDestroy: false,
			reserve: true,
			modal: true,
			overlay: 0.6,
			position: position,
			open: function(event, ui){
				$(document).scrollTop(Math.max(0, position[1] - 100));
				$(window).trigger('resize.popup-overlay');
				if( $.isFunction(opt.open) ) opt.open(type);
			},
			beforeClose: function(){
				if( $.isFunction(opt.close) ) opt.close(type);
			}
		}
		cont.data('popParam', param);
		cont.find('a[gd="next"]').click(function(){
			cont.popupLayer('close');
			var next = conts.filter(':eq(' + (i + 1) + ')');
			next.popupLayer(next.data('popParam'));
			return false;
		});
		cont.find('a[gd="prev"]').click(function(){
			cont.popupLayer('close');
			var prev = conts.filter(':eq(' + (i - 1) + ')');
			prev.popupLayer(prev.data('popParam'));
			return false;
		});
		cont.find('a[gd="end"]').click(function(){
			cont.popupLayer('close');
			$(document).scrollTop(0);
			return false;
		});
	});
	var first = conts.filter(':first');
	first.popupLayer(first.data('popParam'));	
}

//feed 绑定
function bindFeedLoaded(cont){
	cont.find('[js="voteArea"]').not('[hasBind=vote]').vote();
	cont.find('.answer-vote-count').attr('title', '当前投票数量，点击可投票');
	cont.find('.answer-agree').attr('title', '点击投赞成票');
	cont.find('.answer-differ').attr('title', '点击投反对票');
	cont.find('[js="viewmoreCont"]').initViewmore();
	if( typeof(bindFeedLoadedExt) == 'function' ){
		bindFeedLoadedExt();
	}
}

//绑定首页话题向导
function bindHomeTagGuide(){
	var ftg = $('#homeTagGuide'), hasFollow = false;
	var ul = ftg.find('.wd-first2-recom ul'), qtCont = ftg.find('[js="questionCont"]');
	var topicSearch = ftg.find('[js="followTopic"]'), topicCont = ftg.find('[js="followTopicCont"]');
	function addTopicFollow(tid, tn){
		hasFollow = true;
		var rIds = [];
		ul.find('>li').each(function(){
			rIds.push($(this).attr('topicId'));
		});
		$.getJSON('/wenda/subscribe!follow.jhtml?typeId=2&recommend=1&targetId=' + tid, function(json){
			topicSearch.val('').attr('searchKey', '');
			if( json.state == 0 ){
				var s = $.trim(topicCont.text());
				if( s == '' ){
					topicCont.text(tn);
				} else {
					if( ('，' + s + '，').indexOf('，' + tn + '，') == -1 ){
						s = tn + '，' + s
						topicCont.text(s);
						setTimeout(function(){
							if( topicCont.height() > 36 ){
								var as = s.replace('，...', '').split('，');
								as = as.slice(0, as.length - 1);
								topicCont.text(as.join('，') + '，...');
							}
						}, 200);
					}
				}
			}
		});

		$.get('/wenda/guide!recommendTagByFollowTag.jhtml?recommendTagIds=' + rIds.join(',') + '&tagid=' + tid, function(tdata){
			var lis = $(tdata).filter('li[topicId]');
			ul.empty().append(lis);
			var isPos = topicSearch.offset();
			topicSearch.autocomplete('option', 'position', [isPos.left - 6, isPos.top + topicSearch.outerHeight() + 1]);
		});
	}
	topicSearch.each(function(){
		topicSearch.autocomplete({
			position: {of: topicSearch, offset: '-6 0'},
			width: topicSearch.outerWidth() + 29,
			url: '/wenda/tag!search.jhtml',
			ajax: 'topic',
			ajaxKey: 'topicname',
			listClass: 'ac-dp-list',
			selected: function(event, li){
				if( ! li ) return false;
				addTopicFollow(li.attr('index'), li.text());
			}
		});
	});

	ftg.find('a[js=finish]').bind('click', function(){
		var url = '/wenda/guide!complete.jhtml';
		var t = $.trim($('div[js="followTopicCont"]').text());
		if( hasFollow != true && (t == '' || t == '优问手册') ){
			pop_confirm('提示', '您还没有关注任何话题，关注感兴趣的话题能帮助您更好地使用优问，及时参与您感兴趣的讨论。是否继续？', function(){
				location.reload(true);
			});
			return false;
		}
		location.reload(true);
		return false;
	});

	$('.wd-first2-recom a[followType="2"]').die('click').live('click', function(){
		var li = $(this).closest('li'), tid = li.attr('topicId');
		addTopicFollow(tid, li.find('[js="tagname"]').text());
		li.css('opacity', 0);
		return false;
	});
}




$(function(){
	var loadingAddQtPop = false, loadingInvitePop = false;
	//ajax 添加问题弹出层
	$('[js="addQuestion"]').bind('click', function(){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

		if( loadingAddQtPop == true )
			return false;
		var input = $('[addQuestion="input"]'), key = $.trim(input.val());
		if( input.attr('defaultTips') && key == $.trim(input.attr('defaultTips')) )
			key = '';
		loadingAddQtPop = true;
		$.get('/wenda/showask.jhtml?times=' + questionTimes, $.getOptions($(this).attr('data-param')), function(data){
			loadingAddQtPop = false;
			if( checkAjaxData(data) == false ){
				return false;
			}
			firstQuestion(key, data, input.attr('callPage'));
		});
		return false;
	});

	//初始化页面主搜索框
	$('input[addQuestion="input"]').each(function(){
		bindWendaAddSearch($(this));
	});

	//如果不是在优问中则跳出，不执行以下优问的初始化
	if( typeof(__nav) != 'string' || __nav != 'nav_wenda' )
		return; 

	//切换 do you know
	$('a[doyouknow]').bind('click', function(){
		$.ajax({
			url: '/wenda/doc!tip.jhtml?tipid=' + $(this).attr('doyouknow'),
			cache: true,
			type: 'get',
			success: function(data){
				$('div[js="doyouknow"]').replaceWith(data);
			}
		});
	});

	//ajax 邀请加入弹出层
	$('a[js="inviteJoin"]').bind('click', function(){
		var max = parseInt($('[js="maxInviteJoin"]').text(), 10);
		if( max == 0 || loadingInvitePop == true )
			return false;
		loadingInvitePop = true;
		$.ajax({
			url: '/wenda/invite!popInvite.jhtml',
			dataType: 'text',
			cache: false,
			type: 'get',
			success: function(data){
				loadingInvitePop = false;
				if( checkAjaxData(data) == false ){
					return false;
				}
				inviteJoin(data, max);
			}
		});
		return false;
	});

	//绑定关注
	$('[follow]').live('click', function(){
		followBase($(this), 'follow');
		return false;
	});
	$('[unfollow]').live('click', function(){
		followBase($(this), 'unfollow');
		return false;
	});

	// feed tab
	$('#homeFeed, [js="tabsView"]').each(function(){
		var feed = $(this);
		var li = feed.find('> div:first li'), menu = li.children('a');
		menu.bind('click', function(){
			var a = $(this);
			if( a.closest('li').hasClass('current') )
				return false;
			li.removeClass('current');
			a.closest('li').addClass('current');
			var cont = feed.find('> div:eq(' + a.attr('href').split('_')[1] + ')'),
				acont = cont.find('> div[js="moreFeedDiv"]');
			feed.find('> div:gt(0)').hide();
			cont.show();
			if( cont.find('[js=ajaxListCont]').length == 0 ){
				cont.attr('pageNo', 1);
				cont.find('> div').not('div[js="moreFeedDiv"]').remove();
				acont.show().find('a').click();
			} else {
				if( cont.find('[js=ajaxListCont] li').length == 0 ){
					acont.show().find('a').click();
				}
			}
		});
	});
	$('div[js="moreFeedDiv"] a').live('click', function(){
		var a = $(this), cont = a.closest('div[pageNo]'), pageNo = parseInt(cont.attr('pageNo'), 10), acont = a.closest('[js="moreFeedDiv"]');
		var loading = $('<div class="loading" style="width:20px;margin:20px auto;"></div>').insertAfter(acont);
		acont.hide();
		var url = cont.attr('ajaxUrl'), method = cont.attr('ajaxType') || 'get', param = {};
		if( cont.attr('ajaxParam') ){
			var sp = cont.attr('ajaxParam'), re = /(?:^|;)(.[^\:]*)\:(.[^;]*)/g;
			var g = re.exec(sp);
			while( g ){
				param[g[1]] = g[2];
				g = re.exec(sp);
			}
		}
		url = (url.indexOf('?') > 0 ? url + '&' : url + '?') + 'pageNo=';
		$.ajax({
			url: url + pageNo,
			type: method,
			data: param,
			success: function(data){
				if( data.indexOf('<!--thisErrorPage-->') >=0 )
					return false;
				loading.remove();
				data = $.trim(data);
				if( data != '' ){
					data = $(data).filter('div, li, script');
					if( data.length == 0 ){
						acont.hide();
						return false;
					}
					acont.show();
					var ba = cont.attr('beforeAppend');
					if( ba && $.isFunction(window[ba]) ){
						window[ba](cont, data, pageNo);
					}
					if( cont.find('[js=ajaxListCont]').length ){
						cont.find('[js=ajaxListCont]').append(data);
					} else {
						acont.before(data);
					}
					var total = parseInt(data.filter(':first').attr('feedTotal') || data.length);
					if( total < 20 ) acont.hide();
					bindFeedLoaded(cont);
				} else {
					acont.hide();
				}
				$(window).trigger('resize.popup-overlay');
			}
		});
		cont.attr('pageNo', pageNo + 1);
		return false;
	});
	if( location.hash && location.hash != '#' ){
		$('#homeFeed > div:first a[href=' + location.hash + ']').trigger('click');
	} else {
		$('#homeFeed > div:first li:first a').trigger('click');
	}
	bindFeedLoaded($('.wd-event-list'));

	//分享
	$('[shareExt]').bind('click', function(){
		var a = $(this);
		var se = ( typeof(shareExt) != 'object' ) ? {} : shareExt;
		se = $.extend({
			title: $('head > title').text() || '',
			url: document.location.href
		}, se);
		if( ! se['content'] )
			se['content'] = se['title'] + ' ' + se['url'];
		switch( a.attr('shareExt') ){
		case 'sina':
			share.sina(se.url, se.title);
		break;
		case 'kaixin':
			share.kaixin(se.title, se.content, se.url);
		break;
		case 'renren':
			share.renren(screen, document, encodeURIComponent);
		break;
		}
	});

	// 在线编辑标题和正文
	$('textarea[htmlEditor]').editor({
		styleClass: 'border-text margin-btm05e'
	});
	$('[qedit]').bind('click', function(){
		var a = $(this), qe = a.attr('qedit'), form = $('form[js=form' + qe + ']');
		var static = a.closest('[js=static' + qe + ']').hide();
		form.show();
		var t = form.find('textarea, :text');
		if( t.attr('htmlEditor') ){
			t.editor('option', 'content', static.find('span').html());
		} else {
			t.val(static.find('span').text()).focus();
		}
		return false;
	});
	$('[editCancel]').bind('click', function(){
		var form = $(this).closest('form');
		$('[js=' + form.attr('js').replace('form', 'static') + ']').show();
		form.hide();
		return false;
	});

	var _strTemp;
	$('form[js^=formEdit]').ajaxForm({
		beforeSubmit: function(event, form){
			if( form.data('allowSubmit') == true ){
				form.removeData('allowSubmit');
				return true;
			}
			var qe = form.attr('js').replace('form', ''), t = form.find('textarea, :text');
			if( t.attr('htmlEditor') ){
				t.editor('option', 'content');
			} else {
				t.val($.trim(t.val()));
			}
			var nm = form.attr('js').replace('form', 'static'), cont = $('[js=' + nm + ']').find('>span');
			_strTemp=t.val();

			if( t.attr('contType') && $.trim(t.val()) == '' && $.trim(cont.text()) != '' ){
				var s = t.attr('contType');
				pop_confirm(null,
					'您确定要删除此' + s + '的正文内容吗？如无特殊原因，建议保留正文，以帮助大家更好地理解' + s + '。',
					function(){
						form.data('allowSubmit', true);
						form.submit();
					}
				)
				return false;
			}
			if( t.attr('defaultTips') && (t.val() == '' || t.attr('defaultTips') == t.val()) ){
				t.val(t.attr('defaultTips')).css('color', '#C00');

				return false;
			}
		},
		ajaxOptions: {
			dataType: 'json',
			success: function(data, form){
				var qe = form.attr('js').replace('form', ''), t = form.find('textarea, :text');
				var static = $('[js=static' + qe + ']').show(), a = static.find('a');
				form.hide();
				/*
				if( data ){
					static.find('span').html(data.question.content);
					t.val(data.question.content);
				} else {
					t.attr('htmlEditor') ? static.find('span').html(t.editor('option', 'content')) : static.find('span').text(t.val());
				}
				*/
				static.find('span').html(data && data.question && data.question.content ? data.question.content : _strTemp);
				t.val(_strTemp);

				if( t.val() == '' ){
					t.attr('ln0') && a.text(t.attr('ln0')).addClass('boldface').removeClass('wd-ico-edit');
				} else {
					t.attr('ln1') && a.text(t.attr('ln1')).removeClass('boldface').addClass('wd-ico-edit');
				}
			}
		}
	});

	//加 go top 按钮
	addGoTop();

	//文本框里按回车就提交表单
	$('[js="enterSubmitText"]').bind('keydown', function(event){
		if( event.keyCode == 13 ){
			$(this).closest('form').submit();
			return false;
		}
	});

	//删除问题
	$('a[deleteQuestion]').live('click', function(){
		var a = $(this);
		pop_confirm(lang.common.prompt, '你确定要删除该问题吗？', function(){
			var block = a.closest('.event-block'), qid = a.attr('deleteQuestion');
			$.get('/wenda/question!deleteQuestion.jhtml?qid=' + qid, function(){
				block.css('overflow', 'hidden').animate({height: 0}, 250, function(){
					block.remove();
				});
			});
		});
		return false;
	});

	//显示成就统计提示
	$('span[achievementTip]').hover(function(){
		var span = $(this), tip = span.data('tipDiv');
		if( ! tip ){
			tip = $('<div>' + $(this).attr('achievementTip') + '</div>').appendTo('body');
			span.data('tipDiv', tip);
		}
		var pos = span.offset();
		tip.popupTips({
			tipsType: 1,
			arrow: 'top',
			arrowPos: 80,
			width: 280,
			position: [pos.left - 80, pos.top + 22]
		});
	}, function(){
		var span = $(this), tip = span.data('tipDiv');
		if( tip )
			tip.popupTips('close');
	});

	//定位常用链接
	if( typeof(__submenu) == 'string' ){
		$('[submenu=' + __submenu + ']').addClass('current');
	}

	//搜索框提示
	$('.wd-home-search-ipt').each(function(){
		var ipt = $(this), pos = ipt.offset(), w = ipt.outerWidth();
		ipt.hover(function(){
			var tip = $('[js="homeSearchTip"]'), qt = $('input[addQuestion="input"]');
			if( qt.val() == '' || qt.val() == qt.attr('defaultTips') ){
				tip.popupTips({
					position: [pos.left, pos.top + 42],
					width: w,
					tipsType: 3,
					arrow: 'top',
					open: function(evt, ui){
						ui.find('.tip-close').remove();
					}
				});
			}
		}, function(){
			$('[js="homeSearchTip"]').popupTips('close');
		});
		$('input[addQuestion="input"]').focus(function(){
			$('[js="homeSearchTip"]').popupTips('close');
		})
	});
	
	//绑定查看更多投票
	$('p[js="voteView"] a[js="viewmoreVote"]').live('click', function(){
		var a = $(this), vl = a.next('[js="moreVoteList"]');
		a.hide();
		if( vl.length ) vl.show();
		return false;
	});
	
	//绑定 赞
	$('.praise-answer a').live('click', function(){
		var a = $(this), cont = a.parent(), b = cont.find('b'), acont = cont.closest('.event-content');
		if( (! a.hasClass('hover')) || a.attr('voted') == 'true' ) return false;
		$.get('/wenda/answer!vote.jhtml?vote=1&answerid=' + a.attr('aid'));
		a.attr('voted', 'true');
		b.show();
		setTimeout(function(){
			b.animate({top:18, opacity:0.2}, 500, function(){
				b.css({top:'33px', opacity:1}).hide();
				a.removeClass('hover').text(parseInt(a.text()) + 1);
				var cv = acont.find('[js="curVotes"]'), vf = acont.find('[js="voteFrom"]'), un = a.attr('un');
				if( cv.length ) cv.text(parseInt(cv.text()) + 1);
				if( vf.length ){
					var vd = vf.show().find('a');
					if( vd.length ){
						$('<span>' + un + ', </span>').insertBefore(vd.filter(':first'));
					} else {
						vf.append('<span>' + un + '</span>');
					}
				}
			});
		}, 250);
		return false;
	}).live('mouseenter', function(){
		var a = $(this);
		if( a.attr('voted') != 'true' ){
			a.addClass('hover');
			var pos = a.offset(), tips = $('#praiseTips');
			if( tips.length == 0 ){
				tips = $('<div id="praiseTips">觉得有帮助就鼓励一下作者吧</div>').hide().appendTo('body');
			}
			tips.popupTips({
				tipsType: 4,
				arrow: 'left',
				arrowPos: 10,
				width: 190,
				position: [pos.left + 40, pos.top]
			});
		}
	}).live('mouseleave', function(){
		$(this).removeClass('hover');
		$('#praiseTips').popupTips('close');
	});
	
	//问题还很少人回答，去邀请的提示
	$('#tipsToInvite').each(function(){
		var tips = $(this);
		setTimeout(function(){
			tips.animate({height: 0}, 250, function(){
				tips.remove();
			});
		}, 9000);
		tips.find('a').click(function(){
			$.get('/wenda/common!remindUser.jhtml');
			if( $(this).attr('js') == 'closeTips' ){
				tips.animate({height: 0}, 250, function(){
					tips.remove();
				});
				return false;
			}
			return true;
		});
	});

	//可以关闭的提示条
	$('[js="noticeTips"]').each(function(){
		var tips = $(this);
		var callback = {
			weekly: function(a){
				tips.find('span:eq(0)').hide();
				tips.find('span:eq(1)').show();
				tips.find('a').remove();
				setTimeout(function(){
					tips.animate({height: 0}, 250, function(){
						tips.remove();
					});
				}, 5000);
			}
		}
		tips.find('a').click(function(){
			var a = $(this), url = a.attr('href'), cb = a.attr('cb');
			if( url == '#' ) return false;
			$.get(url, function(){
				if( $.isFunction(callback[cb]) ){
					callback[cb](a);
				}
			});
			return false;
		});
		tips.find('[js="closeTips"]').click(function(){
			tips.animate({height: 0}, 250, function(){
				tips.remove();
			});
		});
	});
});

if( typeof(lang) == 'object' ){
	lang.friend = $.extend(lang.friend, {
		fs_all:'全部',
		fs_city:'所在地：',
		fs_industry:'行业：',
		fs_selectAll:'所有联系人',
		fs_deleteAll:'移除所有',
		fs_selected:'已选',
		fs_filter:'查找人脉',
		fs_nogroup:'未分组',
		fs_title:'我的一度人脉',
		fs_poptitle:'选择联系人',
		fs_notfound:'没有符合条件的联系人',
		fs_filtertitle:'请输入朋友姓名，支持拼音首字母输入',
		fs_filternotfound:'姓名没在一度人脉里，请重新输入',
		fs_max_info: function(num){
			return '最多只能选择'+num+'个联系人';
		},
		fs_select_info: function(num){
			return '你还能选择'+num+'人';
		},
		introduce_misstitle_error:'请输入引荐标题',
		introduce_missbody_error:'请输入引荐正文',
		introduce_missconcattype_error:'请选择联络类型',
		introduce_missforwardmsg_error:'请输入留言',
		navi_ushi: '优士联系人',
		navi_sina: '新浪微博联系人',
		navi_local: '其他联系人',
		navi_group: '按分组查看',
		navi_city: '按城市查看',
		navi_industry: '按行业查看',
		key_tips: '输入姓名查找',
		list_empty:'没有符合条件的联系人'
	});
}

// 检查要忽略添加的话题
function checkIgnoreAddTopic(v){
	if( $.isArray(ignoreAddTopic.id) ){
		for( var i = 0; i < ignoreAddTopic.id.length; i ++ ){
			if( v == ignoreAddTopic.id[i] ){
				return false;
			}
		}
	}
	if( $.isArray(ignoreAddTopic.name) ){
		for( var i = 0; i < ignoreAddTopic.name.length; i ++ ){
			if( v == ignoreAddTopic.name[i] ){
				return false;
			}
		}
	}
}
var ignoreAddTopic = {
	id: [],
	name: []
}