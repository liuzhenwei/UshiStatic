//微博绑定状态
var weiboBind = 0;

$(function(){
	$('#addAnswer').each(function(){;
		var answerArea = $('[js="myAnswerArea"]'), answerForm = $(this),
			ext = answerForm.find('.answer-ext'), msg = answerForm.find('[js="sendMsgArea"]'),
			editor = answerForm.find('textarea[name=content]'), lnkAddUrl = ext.find('[js="addAnswerUrl"]');
		var addAnswerUrl = function(){
			var p = ext.find('> p:first').clone().show();
			p.find('input').attr('name', 'urls').showDefaultTips({bindSubmit:false});
			p.insertBefore(lnkAddUrl);
			if( this.tagName == 'A' ){
				$(this).blur();
			}
			return false;
		}

		answerForm.ajaxForm({
			beforeSubmit: function(event, form){
				if( form.attr('unverify') ){ //如果未经验证则不绑定
					popupUnverify(form.attr('unverify'));
					return false;
				}
				var conterr = false;
				var cont = editor.editor('option', 'content');
				if( $.trim(cont) == '' ){
					editor.editor('option', 'content', editor.attr('defaultTips'));
					editor.editor('option', 'color', '#c00');
					conterr = true;
				}
				var urlerr = false;
				form.find('[name="urls"]').each(function(){
					var ipt = $(this), url = $.trim($(this).val()), vt = new $.ushi.validate.tools();
					if( url == '' || url == ipt.attr('defaultTips') ){
						ipt.val('').attr('name', 'empty');
						return true;
					}
					if( url != '' && (! vt.isURL(url)) ){
						urlerr = true;
						return false;
					}
				});
				form.find('[js="answerUrlErr"]').hide();
				if( urlerr )
					form.find('[js="answerUrlErr"]').show();
				return !( conterr || urlerr );
			},
			ajaxOptions: {
				dataType: 'json',
				success: function(json, form){
					var answer = json.answerVo;
					var cont = answer.content;
					var username = answer.answer.isanonymous == 1 ? '匿名用户' : '<a href="/u/' + answer.answeruserid + '">' + answer.answerfullname + '</a>';
					var answerbrief = answer.answer.isanonymous == 1 ? '&nbsp;' : answer.answerbrief;
					if( answer.urls.length ){
						cont += '<h5 class="margin-top margin-btm05e">参考网址：</h5>';
						for( var i = 0; i < answer.urls.length; i++ ){
							cont += '<p class="margin-btm05e"><a href="' + answer.urls[i].url + '" target="_blank">' + answer.urls[i].url + '</a></p>';
						}
					}
					form.attr('action', '/wenda/answer!updateAnswer.jhtml');
					form.find('input[name=empty]').remove();
					addAnswerUrl();

					if( form.find('[name=answerid]').length == 0 ){
						var chk = answerForm.find('[js="chkSendMSG"]');
						msg.each(function(){
							var body = msg.find('[name="body"]');
							if( chk.length && chk[0].checked && body.val() != '' && body.val() != body.attr('defaultTips') ){
								var param = {};
								msg.find(':hidden, textarea').each(function(){
									var $this = $(this);
									param[$this.attr('name')] = $this.val();
								});
								$.post('/wenda/common!processSendMessage.jhtml', param, function(){});
							}
							msg.remove();
						});
						$('[js="sendMsgAreaTitle"]').remove();
						$('[js="submitAnswer"]').text('修改答案').before('<a href="#" js="cancelEditAnswer" class="quiet spe-right2">取消修改</a>');
						form.prepend('<input type="hidden" name="answerid" value="' + answer.answer.id + '" />');
						var html = '<div class="event-block answers-event-block" id="' + answer.answer.id + '" answerId="' + answer.answer.id + '">' +
							'<div class="success" js="successTips">谢谢热心解答，想让大家分享您的观点吗？您可将答案分享给好友、微博等，<a href="#">立即前往分享</a></div>' +
							'<div class="event-owner"></div><div class="event-content answers-event-cont" commentTarget="' + answer.answer.id + '">' +
							'<h5 js="answerUsername" class="mg-btm2px">' + username + '</h5>' +
							'<p class="mg-btm15px">' + answerbrief + '</p><p class="quiet" js="voteView"><span js="curVotes">0</span>票</p>' +
							'<div class="margin-bottom large" js="answerCont" share="content">' + cont + '</div>' +
							'<p style="margin-bottom:5px;" class="quiet">该回答发布于 ' + answer.prettyDate + '</p>' +
							'<p class="action"><a href="javascript:void(0)" style="margin:0;" js="showComment" class="comments-shop">评论</a><span class="quiet" js="commentCount"></span>' +
							'<span class="spe-left spe-right">|</span><a href="#" shareLink="' + answer.answer.id + '" token="' + answer.shareToken + '">分享答案</a>' +
							'<div class="event-comments" typeId="2" curCmt="0" style="display:none;"></div>' +
							'<p class="event-comments" style="display:none;"><textarea style="height:60px;" class="input-addcomm margin-btm05e"></textarea>' +
							'<input type="button" style="" value="发表评论" class="common-button" js="addComment" hidefocus="true" /></p>' +
							'</div><div class="answer-mask"></div></div>';
						var obj = $(html), ua = $('[js="modiAMCont"] > a'), uimg = $('[js="modiAMCont"] > img');
						var face = uimg.is(':visible') ? uimg : ua;
						obj.find('.event-owner').append(face.clone());
						$('#answerList').append(obj.css('opacity', 0));
						setTimeout(function(){
							obj.animate({opacity: 1}, 500);
							//出现回答后提示，并绑定相关事件
							var div = obj.find('[js="successTips"]'), gs = div.find('a');
							gs.click(function(){
								obj.find('[shareLink]').trigger('click');
								setTimeout(function(){
									var smenu = $('#shareMenu');
									if( smenu.length ){
										var btm = smenu.offset().top + smenu.outerHeight();
										var ds = $(document).scrollTop(), wbtm = ds + $(window).height();
										if( btm > wbtm ){
											$(document).scrollTop(ds + (btm - wbtm) + 5);
										}
									}
								}, 50);
								return false;
							});
							setTimeout(function(){
								var smenu = $('#shareMenu');
								if( smenu.length ) smenu.popupLayer('destroy');
								div.animate({height:0, opacity:0}, 250, function(){
									div.remove();
								});
							}, 8000);
						}, 0);
						if( form.find('[js="answerShare"]').length > 0 ){ //回答的同时弹出分享窗口
							setTimeout(function(){
								var sns = form.find('[js="answerShare"] :checked').val();
								shareSNS(sns, answer.answer.id, answer.answer.questionid, answer.shareToken, null);
							}, 50);
						}
					} else {
						var block = $('[answerId=' + answer.answer.id + ']', '#answerList'), mask = block.find('.answer-mask');
						var owner = block.find('.event-owner'), ua = $('[js="modiAMCont"] > a'), uimg = $('[js="modiAMCont"] > img');
						var face = uimg.is(':visible') ? uimg : ua;
						owner.empty().append(face.clone());
						block.find('[js="answerCont"]').empty().append(cont);
						block.find('[js="answerUsername"]').empty().append(username);
						mask.animate({opacity: 0.75}, 500, function(){
							mask.hide();
						});
						var bpos = block.offset();
						if( $(document).scrollTop() > bpos.top - 5 ){
							scrollTop(bpos.top - 5);
						}
					}
					answerArea.find('h4').empty().text('修改答案');
					$('[js="addAnswerLink"]').remove()
					answerArea.hide();
					$('[js="addAnswerOk"]').show();
				}
			}
		});
		$('[js="submitAnswer"]').bind('click', function(){
			answerForm.submit();
			return false;
		});

		// 点击修改答案
		$('[js="editMyAnswer"]').bind('click', function(){
			answerArea.show();
			setTimeout(function(){
				editor.editor('setFocus');
			}, 100);
			$('[js="addAnswerOk"]').hide();
			var aid = answerArea.find('form input[name=answerid]').val();
			var block = $('[answerId=' + aid + ']', '#answerList'), mask = block.find('.answer-mask');
			mask.width(block.outerWidth()).height(block.outerHeight()).css('opacity', 0).show();
			mask.animate({opacity: 0.75}, 250);
			return false;
		});
		//取消修改
		$('[js="cancelEditAnswer"]').live('click', function(){
			answerArea.hide();
			$('[js="addAnswerOk"]').show();
			var aid = answerArea.find('form input[name=answerid]').val();
			var block = $('[answerId=' + aid + ']', '#answerList'), mask = block.find('.answer-mask');
			mask.animate({opacity: 0}, 250, function(){
				mask.hide();
			});
			return false;
		});

		// 初始化答案输入区
		editor.editor({
			width: 580,
			styleClass: 'border-text margin-btm05e',
			focus: function(){
				if( hasAnswers == 0 ){
					$('#firstAnswer').popupWin({
						width: 580,
						title: '优问小助手',
						closeDestroy: true,
						reserve: false
					});
				}
				hasAnswers = 1;
			}
		});

		answerForm.find('[js="addAnswerUrl"] a').bind('click', addAnswerUrl).trigger('click');

		answerForm.find('[js="lnkShowext"]').bind('click', function(){
			$(this).parent().remove();
			ext.show();
			return false;
		});
		answerForm.find('[js="chkSendMSG"]').bind('change', function(){
			if( this.checked ){
				msg.show();
			} else {
				msg.hide();
			}
		});
	});

	//切换匿名状态
	$('[js="modiAMCont"]').each(function(){
		var am = $(this), sw = am.find('.wd-ico-switch-am');
		am.find('dl .hide').removeClass('hide').hide();
		var ua = am.find('> a'), uimg = am.find('> img');
		if( uimg.hasClass('hide') ){
			uimg.removeClass('hide').hide();
		} else {
			ua.find('img').removeClass('hide').show();
			ua.hide();
		}
		sw.bind('click', function(){
			var form = $('#addAnswer');
			var a = $(this), v = a.attr('value');
			if( v == '0' || v == '' ){
				form.find('[name="isanonymous"]').val('1');
				a.text('切换为实名状态');
				a.attr('value', '1');
				am.find('[js="am-1-name"]').show();
				am.find('[js="am-0-name"]').hide();
				ua.hide();
				uimg.show();
			} else {
				form.find('[name="isanonymous"]').val('0');
				a.text('切换为匿名状态');
				a.attr('value', '0');
				am.find('[js="am-1-name"]').hide();
				am.find('[js="am-0-name"]').show();
				ua.show();
				uimg.hide();
			}
			return false;
		});
	});

	//编辑话题
	var topicInput = $('[js="questionTopicSearch"]'), topicCont = $('[js="topicCont"]');
	topicInput.topicSearch({
		url: '/wenda/question!tpQuestionTag.jhtml?qid=' + topicInput.attr('questionId'),
		jsonAttr: 'topic',
		searchKeyname: 'keyword',
		igoneEmptyKey: false,
		addUrl: '/wenda/question!addQuestionTag.jhtml?qid=' + topicInput.attr('questionId'),
		removeUrl: '/wenda/question!deleteQuestionTag.jhtml?qid=' + topicInput.attr('questionId')
	});
	$('a[js="editTopic"]').bind('click', function(){
		if( $(this).attr('unverify') ) return false; //如果未经验证则不绑定

		var a = $(this).hide();
		$('[js="topicAdd"]').show();
		var pos = topicInput.offset();
		topicInput.autocomplete('option', 'width', topicInput.outerWidth() + 28);
		topicCont.find('> .wd-topic-outer').each(function(){
			var p = $(this), tn = p.find('a').text();
			tn = cutWord(tn, maxTagShow);
			p.empty().append('<span class="wd-topic"><span class="wd-topic-inner">' + tn + '<a href="#" class="common-close">close</a></span></span>');
			p.css('width', 'auto');
		});
		return false;
	});
	$('[js="closeTopicAdd"]').bind('click', function(){
		if( $(this).attr('unverify') ) return false; //如果未经验证则不绑定

		$('[js="topicAdd"]').hide();
		var a = $('[js="editTopic"]').show();
		topicCont.append(a);
		if( topicCont.find('> .wd-topic-outer').length == 0 ){
			a.text('添加话题').addClass('boldface').removeClass('wd-ico-edit');
		} else {
			a.text('修改').removeClass('boldface').addClass('wd-ico-edit');
		}
		topicCont.find('> .wd-topic-outer').each(function(){
			var p = $(this);
			p.find('a.common-close').remove();
			var tn = p.find('>.wd-topic').text();
			p.empty().append('<a class="wd-topic" href="/wenda/tag!index.jhtml?id=' + p.attr('topicId') + '"><span class="wd-topic-inner">' + tn + '</span></a>');
		});
		return false;
	});

	//邀请好友（旧版）
	$('[js="inviteInput"]').each(function(){
		var ivtSearch = $(this), isPos = ivtSearch.offset(), ivtCont = $('[js="invitedCont"]'), ivtTitle = $('[js="invitedContTitle"]'),
			url = '/wenda/question!addInviteUser.jhtml?qid=' + ivtSearch.attr('qid');
		var addInvite = function(event, li){
			if( ivtSearch.attr('unverify') ){ //如果未经验证则不绑定
				popupUnverify(ivtSearch.attr('unverify'));
				return false;
			}
			if( ! li ) return false;
			$.get(url + '&targetid=' + li.attr('index'), function(data){
				var uid = parseInt(data, 10) || 0;
				if( uid > 0 && ivtCont.find('> [uId=' + uid + ']').length == 0 ){
					var ia = $('[js="invitedAnswers"]');
					ia.text(parseInt(ia.text(), 10) + 1);
					ivtCont.append('<p class="wd-topic-outer" uId="' + uid + '"><span class="wd-topic">' + li.find('[litext]').text() + '</span></p>');
					if( ivtTitle.length == 0 ){
						ivtTitle = $('<p js="invitedContTitle" class="margin-btm05e">你已邀请以下用户回答此问题：</p>');
						ivtCont.before(ivtTitle);
					}
				}
				ivtSearch.val('').attr('searchKey', '');
			});
		};
		ivtSearch.autocomplete({
			position: [isPos.left - 6, isPos.top + ivtSearch.outerHeight()],
			width: ivtSearch.outerWidth() + 29,
			url: '/wenda/question!inviteUser.jhtml',
			ajaxKey: 'username',
			ajax: 'profiles',
			listClass: 'ac-dp-list',
			li_id: ['userid', 'fullname', 'brief'],
			li_template: '<li index="%1"><div class="blue" litext="yes">%2</div><div>%3</div></li>',
			selected: addInvite
		});
	});

	$('[js="voteArea"]').vote({showTips: {agree: '点击投赞成票', differ: '点击投反对票，匿名'}});
	$('[js="voteQuestion"]').vote({
		url: '/wenda/question!vote.jhtml?questionid=',
		showTips: {agree: '这是个好问题', differ: '这个问题不太好<br />匿名投票', count: '当前已有{#}人给此问题投票，点击可投票'}
	});

	//赞 问题
	$('.praise-question').each(praiseQuestion);

	bindComment();
	bindReport();
	bindSuggest();
	bindShare();

	//满意答案
	$('[bestAnswer]').live('click', function(){
		var a = $(this), block = a.closest('.event-block');
		$.get('/wenda/answer!bestAnswer.jhtml?answerid=' + a.attr('bestAnswer'), function(){
			$('[bestAnswer]').prev('span').remove().end().remove();
			block.find('.answer-mask').before('<div class="best-answer-block">Best</div>');
		});
		return false;
	});
	$('.best-answer-block').live('mouseover', function(){
		var info = $('#bestAnswerInfo');
		var pos = $(this).offset();
		if( info.length == 0 ){
			info = $('<div id="bestAnswerInfo">提问者可以从所有回答中挑选出一个自己认为最满意的答案</div>').appendTo('body');
		}
		info.popupTips({
			tipsType: 1,
			width: 200,
			position: [pos.left + 95, pos.top + 35]
		});
	}).live('mouseout', function(){
		$('#bestAnswerInfo').popupTips('close');
	});

	//用户间动作
	$('a[userAction]').bind('click', function(){
		if( $(this).attr('unverify') ) return false; //如果未经验证则不绑定

		var a = $(this), ua = a.attr('userAction'), aId = a.closest('.event-block').attr('answerId');
		var span = $('<span class="' + a[0].className + '" title="已' + a.attr('title') + '">' + a.text() + '</span>');
		$.get('/wenda/answer!interact.jhtml?answerid=' + aId + '&userAction=' + ua, function(data){
			a.replaceWith(span);
		});
		return false;
	});

	//问题投票提示
	$('span[js="qVoteTip"]').hover(function(){
		var a= $(this), tip = $('#qVoteTip');
		var qt = $('.question-title'), qtr = qt.offset().left + qt.width();
		var pos = [qtr - 255, $(this).offset().top - 6];
		tip.popupTips({
			tipsType: 4,
			width: 255,
			arrowPos: 5,
			position: pos
		});
	}, function(){
		var tip = $('#qVoteTip');
		tip.popupTips('close');
	});

	//通知答案高亮显示
	$('div[js="curAnswer"]').each(function(){
		var div = $(this);
		setTimeout(function(){
			div.animate({"backgroundColor": "#ffffff"}, 1000);
		}, 4000);
	});

	//获取微博绑定状态
	$.ajax({
		url: '/feed/feedapi!ajaxGet.jhtml',
		cache: false,
		dataType: 'text',
		success: function(data){
			weiboBind = parseInt(data, 10);
			if( ! (weiboBind > 0 && weiboBind < 5) ){
				weiboBind = 0;
			}
		}
	});

	//点击显示被隐藏的答案
	var hideAnswer = $('#answerList>div:hidden');
	if( hideAnswer.length ){
		var al = $('#answerList').css('margin-bottom', 0);
		var t1 = hideAnswer.length + ' 个回答被折叠隐藏，点此查看', t2 = '隐藏被折叠的 ' + hideAnswer.length + ' 个回答';
		var saLink = $('<div class="wd-notice1 border-bottom"><a href="/wenda/question!detail.jhtml?qid=1094" target="_blank" class="float-right">了解被折叠的原因</a><a href="#" js="toggle">' + t1 + '</a><span class="wd-ico-down">&nbsp;</span></div>').insertAfter(al);
		saLink.children('a[js=toggle]').click(function(){
			var a = $(this);
			if( a.text() == t1 ){
				hideAnswer.show();
				a.text(t2);
				a.next().removeClass('wd-ico-down').addClass('wd-ico-up');
			} else {
				hideAnswer.hide();
				a.text(t1);
				a.next().removeClass('wd-ico-up').addClass('wd-ico-down');
			}
			return false;
		});
	}

	//邀请专家
	$('#inviteExpertList').each(function(){
		var cont = $(this), qId = cont.attr('questionId');
		cont.find('[js="viewAllExperts"]').click(function(){
			cont.find('li').show();
			$(this).parent().remove();
			return false;
		});
		cont.find('[js="inviteAllExperts"]').click(function(){
			$.get('/wenda/question!addInviteUser.jhtml?qid=' + qId, function(){
				cont.find('.button').unbind('click.invite').removeClass('button').addClass('disable-button').text('已邀请');
			});
			return false;
		});
		cont.find('[inviteExpertLink]').bind('click.invite', function(){
			var a = $(this);
			$.get('/wenda/question!addInviteUser.jhtml?qid=' + qId + '&targetid=' + a.attr('inviteExpertLink'), function(){
				a.unbind('click.invite').removeClass('button').addClass('disable-button').text('已邀请');
			});
		});
	});

	//邀请好友
	$('#inviteFriendList').each(function(){
		var cont = $(this), qId = cont.attr('questionId'), show = cont.find('[js="showListLink"]'), list = cont.find('[js="invitedList"]');
		show.click(function(){
			if( list.is(':visible') ){
				list.hide();
				show.text('展开已邀请列表');
			} else {
				list.show();
				show.text('收起已邀请列表');
			}
			return false;
		});

		var tabli = cont.find('[js="inviteTypeTab"] li');
		tabli.find('a').click(function(){
			var a = $(this);
			cont.find('[invitePanel]').hide();
			cont.find('[invitePanel="' + a.attr('panel') + '"]').show();
			tabli.removeClass('current');
			a.parent().addClass('current');
			return false;
		});

		function inviteEmail(ipt){
			$.post('/wenda/question!addInviteUser.jhtml?qid=' + qId, {emails: ipt.val()}, function(){
				ipt.val('');
				pop_alert('站外邀请已发出');
			});
		}
		cont.find('[js="submitEmail"]').click(function(){
			var ipt = $(this).closest('[invitePanel]').find(':text');
			var email = checkInviteEmail(ipt);
			if( email.length == 0 ){
				pop_alert('请输入至少一个有效的Email地址');
				return false;
			} else if( email.length > 10 ){
				pop_confirm('站外邀请', '一次最多邀请10个邮箱地址，你邀请个数超过限制，是否继续邀请', function(){
					ipt.val(email.slice(0, 9).join(','));
					inviteEmail(ipt);
				});
			} else {
				ipt.val(email.slice(0, 9).join(','));
				inviteEmail(ipt);
			}
			return false;
		});

		$('#friendSelectList1').friendSelectList({
			url: '/msg/message!getFriends.jhtml',
			idField: '#inviteFriendsId',
			inviteMax: 20,
			width: 249,
			fsParam: {
				prompt: lang.friend.fs_max_info(5),
				width: 826
			}
		});
		var hasInvited = ',';
		list.find('p').each(function(){
			hasInvited += $(this).attr('uId') + ',';
		});
		cont.find('[js="submit1d"]').click(function(){
			var a = $(this);
			if( a.data('submiting') == true ) return false;
			a.data('submiting', true);
			var ipt = a.closest('[invitePanel]').find('input:hidden');
			if( ipt.val() == '' ){
				pop_alert('请至少邀请一位朋友');
				return false;
			} else {
				var r = ipt.val();
				$.post('/wenda/question!addInviteUser.jhtml?qid=' + qId, {rids: r}, function(data){
					data = $.trim(data);
					var lu = data.split('、'), lc = lu.length;
					if( data!="" && lc > 0 ){
						pop_alert("很抱歉，" + data + "已在隐私设定中设置为 不接受任何人邀请回答问题，因此无法发送邀请。");
					}
					ipt.val('');
					var c = parseInt(cont.find('[js="invitedFriendsCount"]').text(), 10), c1 = 0;
					show.show().text('收起已邀请列表');
					list.show();
					cont.find('.friend-selector-selected').children('div').each(function(){
						var d = $(this), uId = d.attr('rel');
						if( hasInvited.indexOf(uId) == -1 && $.inArray($.trim(d.text()), lu) == -1 ){
							list.append('<p class="wd-topic-outer" uId="' + uId + '"><span class="wd-topic">' + d.text() + '</span></p>');
							hasInvited += uId + ',';
							c1 ++;
						}
					});
					cont.find('[js="invitedFriendsCount"]').text(c + c1);
					$('#friendSelectList1').friendSelectList('clear');
					a.removeData('submiting');
				});
			}
			return false;
		});
	});

	var popIET;
	$('[js="inviteExpertTip"]').hover(function(){
		var pos = $(this).offset();
		popIET = $('<div>以下是此问题所有关联话题的专家的汇总名单，话题专家榜是由所有用户投票和评选出来的该话题领域的专家，每天实时更新</div>');
		popIET.popupTips({
			tipsType: 3,
			arrow: 'top',
			arrowPos: 50,
			width: 190,
			closeDestroy: true,
			reserve: false,
			position: [pos.left - 52, pos.top + 24],
			open: function(evt, ui){
				$('[js="closePopup"]', ui).remove();
			}
		})
	}, function(){
		popIET.popupTips('close');
	});

	//ti kr 提示
	$('[tikr]').hover(function(){
		var a = $(this), tips = $('#' + a.attr('tikr')), pos = a.offset();
		tips.popupTips({
			tipsType: 4,
			arrow: 'top',
			arrowPos: 10,
			width: 180,
			position: [pos.left - 12, pos.top + 24]
		});
	}, function(){
		var a = $(this), tips = $('#' + a.attr('tikr'));
		tips.popupTips('close');
	});

	//弹出分享信息窗口
	$('a[sharePopInfo]').bind('click', function(){
		var a = $(this), pos = a.offset(), type = a.attr('sharePopInfo'), tId = a.attr('tId');
		$.get('/wenda/question!shareUser.jhtml?targetId=' + tId + '&targetType=' + type, function(data){
			var pop = $(data);
			pop.popupTips({
				title: '<span class="loud">最近的分享</span>',
				tipsType: 5,
				arrow: 'top',
				closeDestroy: true,
				reserve: false,
				clickClose: true,
				modal: true,
				overlay: 0,
				width: 253,
				position: [pos.left - 36, pos.top + 25],
				hide: 'fade',
				show: 'slide',
				open: function(){
					$('[follow]', pop).bind('click', function(){
						followBase($(this), 'follow');
						return false;
					});
					$('[unfollow]', pop).bind('click', function(){
						followBase($(this), 'unfollow');
						return false;
					});
				}
			});
		});
		return false;
	});

	//弹出关注信息窗口
	$('a[subPopInfo]').bind('click', function(){
		var a = $(this), pos = a.offset();
		$.get('/wenda/question!subUsers.jhtml?qid=' + a.attr('subPopInfo'), function(data){
			var pop = $(data);
			pop.popupTips({
				title: '<span class="loud">谁正在关注这个问题</span>',
				tipsType: 5,
				arrow: 'top',
				closeDestroy: true,
				reserve: false,
				clickClose: true,
				modal: true,
				overlay: 0,
				width: 253,
				position: [pos.left - 36, pos.top + 25],
				hide: 'fade',
				show: 'slide'
			});
		});
		return false;
	});

	//探索更多问题换一换
	$('[js="moreHotQuestion"]').each(function(){
		var ul = $('[js="moreHotQuestion"]'), p = parseInt(ul.attr('page')), hot = $.makeArray(ul.find('li.hot-question')), rl = $.makeArray(ul.find('li').not('.hot-question'));
		var arr = [], i, m, n;
		for( i = 0; i < 4; i++ ){
			var hl = hot.length, ll = rl.length;
			if( hl == 0 && ll == 0 ) break;
			for( m = 0; m < Math.max(Math.min(2, hl), 5 - ll); m++ ){
				ul.append(hot.shift());
			}
			for( n = 0; n < Math.min(Math.max(3, 5 - m), ll); n++ ){
				ul.append(rl.shift());
			}
		}
		ul.find('li:lt(5)').show();
		bindExpandList($('[js="moreHotQuestion"]'), 38);
		if( ul.find('>li:hidden').length ){
			$('[js="getMoreHot"]').click(function(){
				$.get('/wenda/question!qrchange.jhtml');
				var ul = $('[js="moreHotQuestion"]'), p = parseInt(ul.attr('page'));
				ul.find('li:visible').remove();
				ul.find('li:lt(5)').show();
				bindExpandList($('[js="moreHotQuestion"]'), 38);
				if( ul.find('li:hidden').length == 0 ) $(this).remove();
			});
		} else {
			$('[js="getMoreHot"]').remove();
		}
		//页面滚动始终出现探索更多
		showExplore();
	});

	//如果链接带定位，则触发一次滚动事件以显示返回顶部按钮
	if( location.hash.length > 1 ) $(window).trigger('scroll.gotoTop');
});


//*************************************************************************************
//页面滚动始终出现探索更多
function showExplore(){
	var mcont = $('#explore1'), more = mcont.find('>div'), cont = $('#explore2'), contLoca = $('#explore2Loca');
	contLoca.data('isShow', false);
	$(window).bind('scroll.showExplore', function(){
		if( $(document).scrollTop() > contLoca.offset().top ){
			if( contLoca.data('isShow') != true ){
				contLoca.data('isShow', true);
				mcont.css('height', more.outerHeight() + 'px');
				cont.css({position: 'fixed', top: 0});
				if( $.browser.msie && $.browser.version == '6.0' ){
					cont.append(more);
				} else {
					cont.append(more.css('opacity', 0));
					more.animate({opacity: 1}, 1000);
				}
			}
			if( $.browser.msie && $.browser.version == '6.0' ){
				cont.css({position: 'absolute', top: $(document).scrollTop()});
			}
		} else {
			if( contLoca.data('isShow') == false ) return;
			contLoca.data('isShow', false);
			cont.css({position:'static'});
			if( $.browser.msie && $.browser.version == '6.0' ){
				mcont.append(more).css('height', 'auto');
			} else {
				more.animate({opacity: 0}, 250, function(){
					mcont.append(more.css('opacity', 1)).css('height', 'auto');
				});
			}
		}
	});
}

//验证多个email
function checkInviteEmail(emailCont){
	var vali = new $.ushi.validate.tools();
	var arr = [], emails = $.trim(emailCont.val());
	emails = emails.split(/\n|\;|\,|，/g);
	for( var i = 0; i < emails.length; i++ ){
		var mail = $.trim(emails[i]);
		if( vali.isEmail(mail) ){
			arr.push(mail);
		}
	}
	return arr;
}

//分享
function shareSNS(sns, aid, qid, token, event){
	var title = $.trim($('[share="title"]').text()), question = $.trim($('[share="question"]').text()), url = 'http://www.ushi.com/wenda/qp/' + token;
	var title1 = $('[share="title"]').attr('answerShareTitle') || '转一个挺有意思的问题：';
	var answer = '', user = '', content = '';
	if( aid > 0 ){
		var acont = $('#' + aid);
		if( acont.length ){
			answer = $.trim(acont.find('[share="content"]').text());
			user = $.trim(acont.find('[share="user"]').text());
		}
	}
	if( sns == 'sinaminiblog' ){
		if( aid > 0 ){
			if( title.length > 35 ) title = title.slice(0, 32) + '...';
			if( user.indexOf(' ') > 0 ){
				if( user.length > 10 ) user = user.split(' ')[0];
			} else {
				user = user.split(/[^\u4e00-\u9fa5\da-zA-Z]/g)[0];
			}
			content = $.trim(title1 + '“' + title + '” @' + user + ' 回答：“' + answer);
			if( content.length > (140 - 2 - 2 - 28 - 19) ) content = content.slice(0, (140 - 2 - 2 - 28 - 19) - 3) + '...';
			content += '” - 来自@优士网-优问 #优问精选#：';
		} else {
			content = '看到一个挺有意思的问题，转给大家看看：“' + $.trim(title);
			if( content.length > (140 - 2 - 28 - 19) ) content = content.slice(0, (140 - 2 - 28 - 19) - 3) + '...';
			content += '” - 来自@优士网-优问 #优问精选#：';
		}
		title = ' ';
	} else {
		if( aid > 0 ){
			content = $.trim('来自 ' + user + ' 的回答：' + answer);
			if( content.length > 30 ) content = content.slice(0, 27) + '...';
			content += ' 更多精彩回答，点击网址：';
		} else {
			content = '精彩问答，点击网址：';
		}
		content += url;
	}
	var param = {"title": title, "url": url};
	param['content'] = param['summary'] = content;
	if( event == null ){ //无法弹窗的话
		location.href = 'http://api.bshare.cn/share/sinaminiblog?url=' + url + '&title=' + encodeURIComponent(title) + '&summary=' + encodeURIComponent(content) + '&publisherUuid=3fdcc2ed-8a07-4d3c-96b1-7a4484d82a26';
	} else {
		bShare.share(event, sns, param);
	}
}
function bindShare(){
	$('a[shareLink]').live('click', function(){
		var a = $(this), pos = a.offset(), pop = $('#shareMenu');
		pop.attr({"aid": a.attr('shareLink'), "token": a.attr('token')});
		pop.popupLayer({
			closeDestroy: true,
			reserve: true,
			position: [pos.left - 2, pos.top + a.outerHeight() + 2]
		});
		return false;
	});
	$('a[shareSNSType]').bind('click', function(event){
		var a = $(this), sns = a.attr('shareSNSType'), menu = a.closest('div'), aid = parseInt(menu.attr('aid'), 10) || 0,
			qa = aid > 0 ? 'a' : 'q', qid = parseInt(menu.attr('question'), 10), token = menu.attr('token');
		shareSNS(sns, aid, qid, token, event);
		$('#shareMenu').popupLayer('close');
		var shareType = {sinaminiblog:4, renren:5, kaixin001:6};
		$.get('/wenda/question!shareExt.jhtml?qid=' + qid + '&answerId=' + aid + '&shareType=' + shareType[sns]);
		if( sns == 'sinaminiblog' && (weiboBind == 0 || weiboBind == 1 || weiboBind == 2) ){
			return true;
		} else {
			return false;
		}
	});

	$('[shareUshi]').bind('click', function(){
		var a = $(this), idx = a.attr('shareUshi'), menu = a.closest('div'), aid = parseInt(menu.attr('aid'), 10) || 0,
			qa = aid > 0 ? 'a' : 'q', qid = parseInt(menu.attr('question'), 10), token = menu.attr('token');
		var pop = $('<div id="sharePopWin">' + $('#sharePop').html() + '</div>');
		var title = $('[share="title"]').text(), question = $('[share="question"]').html(), squestion = $.trim($('[share="question"]').text()),
			answer = '', sanswer = '';
		var url1 = '/wenda/question_public/apply_public.jhtml?qid=' + qid, url2 = 'http://www.ushi.com/wenda/qp/' + token;
		if( qa == 'a' ){
			if( $('#' + aid).length ){
				var scont = $('#' + aid).find('[share="content"]');
				answer = scont.html();
				sanswer = $.trim(scont.text());
			}
			url1 += '&answerId=' + aid;
			var cont1 = ' 分享了此问题的一个答案给你：<a href="' + url1 + '" target="_blank">' + title + '</a>，点击链接可查阅。';
			var cont2 = '分享了此问题的一个答案给你：<br /><br />问题：<br /><a href="' + url2 + '" target="_blank">' + title + '</a>' +
						(squestion == '' ? '' : '<br />' + question) + '<br />' +
						(sanswer == '' ? '' : '<br />回答：<br />' + answer) + '<br />' +
						'<br />点击问题链接可查看问题详情和其它回答。';
		} else {
			var cont1 = ' 分享了一个问题给你：<a href="' + url1 + '" target="_blank">' + title + '</a>，点击链接可查阅。';
			var cont2 = '分享了一个问题给你：<br /><a href="' + url2 + '" target="_blank">' + title + '</a><br />点击链接可查看问题详情。';
		}
		pop.popupWin({
			title: '分享给好友',
			width: 600,
			closeDestroy: true,
			reserve: false,
			open: function(evt, ui){
				var tabli = pop.find('.tabs-feed li');
				tabli.find('> a').bind('click', function(){
					var li = $(this).closest('li'), idx = tabli.index(li);
					tabli.removeClass('current');
					li.addClass('current');
					var forms = pop.find('> form');
					forms.hide().filter(':eq(' + idx + ')').show();
					return false;
				});
				pop.find('[js="shareContent"]').filter(':eq(0)').append(cont1).end().filter(':eq(1)').append(cont2);
				pop.find('[name="answerId"]').val(aid);
				pop.find('[name="shareurl"]').val(url2);
				pop.find('.tabs-feed li:eq(' + idx + ') > a').trigger('click');
				pop.find('#friendSelectList').friendSelectList({
					url: '/msg/message!getFriends.jhtml',
					idField: '#sharePopWin input[js=shareFrdIds]',
					inviteMax: 50,
					fsParam: {
						prompt: '最多只能选择 50 个联系人',
						width: 826
					}
				});
				pop.find('form:eq(0)').ajaxForm({
					validate: true,
					ajaxOptions: {
						success: function(data){
							pop.popupWin('destroy');
							pop_alert((qa == 0 ? '您已成功分享该回答，接收者将收到系统通知！' : '您已成功分享该问题，接收者将收到系统通知！'));
						}
					}
				});
				pop.find('form:eq(1)').ajaxForm({
					beforeSubmit: function(event, form){
						var arr = filterMultiEmail(form.find('textarea').val());
						if( arr.length ){
							for( var i = 0; i < arr.length; i++ ){
								arr[i] = arr[i].email;
							}
							form.find('textarea').val(arr.join(','));
							form.find('span.red').hide();
							return true;
						} else {
							form.find('span.red').show();
							return false;
						}
					},
					ajaxOptions: {
						success: function(data){
							pop.popupWin('destroy');
							pop_alert((qa == 0 ? '您已成功分享该回答，接收者将收到优士网发送的通知邮件！' : '您已成功分享该问题，接收者将收到优士网发送的通知邮件！'));
						}
					}
				});
			}
		});
		$('#shareMenu').popupLayer('close');
		return false;
	});
}
function filterMultiEmail(emails){
	var arr = [], vali = new $.ushi.validate.tools();
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
	return arr;
}

//举报
function bindReport(){
	$('[js="reportNotHelp"]').live('click', function(){
		if( $(this).attr('unverify') ) return false; //如果未经验证则不绑定

		var a = $(this);
		reportAction(a, {
			targetid: a.closest('div[answerId]').attr('answerId'),
			typeid: 2,
			optioncode: 'ANSOPTION_COMPLAINT5',
			reason: ''
		});
		return false;
	});
	$('a[report]').live('click', function(){
		if( $(this).attr('unverify') ) return false; //如果未经验证则不绑定

		var a = $(this), typeId = parseInt(a.attr('report')), pop = $('#reportOptionPop');
		pop.attr('targetId', typeId == 2 ? a.closest('div[answerId]').attr('answerId') : a.attr('targetId'));
		pop.attr('typeId', typeId);
		pop.data('reportObj', a);
		var pos = a.offset();
		pop.popupLayer({
			closeDestroy: true,
			reserve: true,
			position: [pos.left - 2, pos.top + a.outerHeight() + 2]
		});
		return false;
	});
	$('a[reportOption]').bind('click', function(){
		var a = $(this), pop = $('#reportOptionPop'), code = a.attr('reportOption');
		var ra = pop.data('reportObj'), param = {
			targetid: pop.attr('targetId'),
			typeid: pop.attr('typeId'),
			optioncode: code,
			reason: ''
		};
		if( code == 'ANSOPTION_COMPLAINT2' ){
			pop_confirm('举报', '<div><p>请说明举报原因：</p><p><textarea style="width:320px;" js="reportReason" defaultTips="如果必要，请添加简要的理由说明，以帮助网站进行核实">如果必要，请添加简要的理由说明，以帮助网站进行核实</textarea></p></div>', function(div){
				param.reason = $(div).find('textarea').val().slice(0, 200);
				reportAction(ra, param);
			}, null, {
				open: function(){
					$(this).find('textarea').showDefaultTips({
						bindSubmit: false
					});
				}
			});
		} else {
			reportAction(ra, param);
		}
		pop.popupLayer('close');
		return false;
	});
}
function reportAction(a, param){
	$.post('/wenda/report!comlaint.jhtml', param, function(){
		if( param.typeid == 2 ){
			var cont = a.closest('div[answerId]');
			if( param.optioncode == 'ANSOPTION_COMPLAINT5' ){
				cont.find('[js="reportNotHelp"]').replaceWith('<span class="quiet">没有帮助</span>');
			} else {
				cont.find('[report]').replaceWith('<span class="quiet">已举报</span>');
			}
		} else {
			a.replaceWith('<span class="quiet spe-left3">已举报</span>');
		}
	});
}

//提建议
function bindSuggest(){
	$('#suggestPop').each(function(){
		var pop = $(this);
		$('a[js=suggest]').live('click', function(){
			if( $(this).attr('unverify') ) return false; //如果未经验证则不绑定

			var a = $(this);
			pop.data('suggestObj', a);
			var pos = a.offset();
			pop.popupLayer({
				closeDestroy: true,
				reserve: true,
				position: [pos.left - 2, pos.top + a.outerHeight() + 2]
			});
			return false;
		});
		pop.find('li a').bind('click', function(){
			var act = pop.data('suggestObj'), tId = act.closest('div[answerId]').attr('answerId');
			var a = $(this), opt = a.attr('option');
			$.get('/wenda/answer!suggest.jhtml?targetId=' + tId + '&option=' + opt);
			pop.popupLayer('close');
			act.replaceWith('<span class="quiet">已提建议</span>');
			return false;
		});
	});
}

//赞
function praiseQuestion(){
	var cont = $(this), a = cont.find('a'), b = cont.find('b'), acont = cont.closest('[commentTarget]');
	a.hover(function(){
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
	}, function(){
		a.removeClass('hover');
		$('#praiseTips').popupTips('close');
	});
	a.click(function(){
		if( (! a.hasClass('hover')) || a.attr('voted') == 'true' ) return false;
		$.get('/wenda/question!vote.jhtml?vote=1&questionid=' + acont.attr('commentTarget'));
		a.attr('voted', 'true');
		b.show();
		setTimeout(function(){
			b.animate({top:18, opacity:0.2}, 500, function(){
				b.css({top:'35px', opacity:1}).hide();
				var cv = acont.find('[js="curVotes"]'), un = a.attr('un');
				a.removeClass('hover').text(parseInt(a.text()) + 1);
				cv.text(parseInt(cv.text()) + 1);
			});
		}, 250);
		return false;
	});
}

//跳转到答案
var awListBox = {x1:0, y1:0, x2:0, y2:0};
function jumpAnswer(aid){
	var aw = $('#' + aid);
	if( aw.length == 0 ) return false;
	var ques = $('#simpleQuestion'), awlist = $('#answerList'), awlistpos = awlist.offset();
	var qtitle = '', qcont = $.trim($('[share="question"]').html());
	if( ques.outerHeight() > 55 ){
		qtitle = ques.find('h4').text();
		ques.find('h4').height(22);
	}
	if( qtitle == '' && qcont == '' ){
		ques.find('a').remove();
	}
	var awListBox = {x1:awlistpos.left, y1:awlistpos.top - ques.outerHeight(), x2:awlistpos.left + awlist.outerWidth(), y2:awlistpos.top + awlist.outerHeight()};
	//显示问题详情
	ques.find('a').click(function(){
		var pop = $('#simpleQuestionCont');
		if( pop.length ) return false;
		var html = '', maxh = 93;
		if( qtitle != '' ){
			html = '<h5 class="margin-btm05e">' + qtitle + '</h5>';
		}
		if( qcont != '' ){
			if( html != '' ) maxh = 130;
			html += '<div>' + qcont + '</div>';
		}
		pop = $('<div id="simpleQuestionCont" style="max-height:' + maxh + 'px;">' + html + '</div>');
		pop.popupTips({
			width: 674,
			tipsType:1,
			arrow:'top',
			arrowPos:640,
			closeDestroy:true,
			reserve:false,
			position:{of:$(this), my:'right top', at:'right bottom', offset:'11 15'},
			open:function(){
				$(window).one('scroll', function(){
					pop.popupTips('close');
				});
			}
		});
	});
	//隐藏问题详情
	$(window).bind('scroll', function(){
		var st = $(document).scrollTop();
		if( st < awListBox.y1 || st > awListBox.y2 ){
			ques.hide();
		}
	});

	//初始显示
	var firstTop = aw.offset().top - ques.outerHeight() + 1;
	$(document).scrollTop(firstTop);
	if( $.browser.msie7 == true ){
		ques.show().css({position:'absolute', top:(firstTop - awlistpos.top) + 'px', left:0});
		$(window).bind('scroll', function(){
			var st = $(document).scrollTop();
			ques.css({top:(st - awlistpos.top - 1) + 'px'});
		});
	} else {
		ques.show().css({position:'fixed', top:0});
	}
	ques.find('h4').ellipsis();
}
