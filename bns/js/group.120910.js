//获取群组列表
function getGroupList(list){
	list.data('groupListLoading', true);
	var pageNo = parseInt(list.attr('pageNo'), 10), filter = list.attr('filter'), order = list.attr('order'), industry = list.attr('industry');
	if( list.attr('id') == 'myGroupList' ){
		list.find('[js="getmoreDiv"]').remove().end().append('<div class="loading" style="width:20px;margin:0 auto;"></div>');
		$.get('/group/queryMyGrp.jhtml?grpFilter=' + filter + '&pageNo=' + (pageNo + 1) + '&grpOrderBy=' + order, function(data){
			list.removeData('groupListLoading');
			list.find('.loading').remove();
			if( !checkAjaxData(data) ) return false;
			list.attr('pageNo', pageNo + 1).append(data);
		});
	} else {
		var mask = list.siblings('.grouplist-loading-mask');
		mask.show().css('opacity', 0.6).height(mask.parent().height()).after('<div class="loading_m" style="width:50px;position:absolute;top:0;left:305px;"></div>');
		$.get('/group/queryGrpByIndustry.jhtml?industryId=' + industry + '&pageNo=' + (pageNo + 1) + '&grpOrderBy=' + order, function(data){
			list.removeData('groupListLoading');
			mask.hide().parent().find('.loading_m').remove();
			if( !checkAjaxData(data) ) return false;
			list.attr('pageNo', pageNo + 1).empty().append(data);
			list.find('>div.vcard').each(function(){
				initGroupDescCont($('[js="groupDescCont"]', this));
			});
		});
	}
}
//初始化群组简介显示3行
function initGroupDescCont(cont){
	var mdesc = cont.find('div[js=minDescCont]'), desc = mdesc.find('>div'), sdesc = cont.find('div[js=descCont]');
	if( desc.height() > mdesc.height() + 10 ){
		desc.text(cutWord(desc.text(), parseInt(mdesc.attr('words')) || 260));
		desc.append('<a href="javascript:;" js="showDescCont" class="spe-left2">' + lang.group.view_more + '</a>');
		sdesc.find('>div.grp-desc-cont').height(55).css('max-height', 'none');
	} else {
		sdesc.remove();
	}
}

//获取话题列表
function getTopicList(list){
	list.data('topicListLoading', true);
	var pageNo = parseInt(list.attr('pageNo'), 10), groupId = list.attr('groupId');
	list.find('[js="getmoreDiv"]').remove().end().append('<div class="loading" style="width:20px;margin:0 auto;"></div>');
	$.get('/group/viewMoreTopic.jhtml?groupId=' + groupId + '&pageNo=' + (pageNo + 1), function(data){
		list.removeData('topicListLoading');
		list.find('.loading').remove();
		if( !checkAjaxData(data) ) return false;
		data = $(data);
		list.attr('pageNo', pageNo + 1).append(data);
		if( list.attr('rw') == 'read' ){
			readonlyTopicList(data);
		}
		initTopicContView(data);
	});
}

//设置话题列表只读
function readonlyTopicList(list){
	list.each(function(){
		var act = $(this).find('div.action');
		if( act.find('[replyCnt]').attr('replyCnt') == '0' ){
			act.height(28).find('.reply-action').remove();
		}
		var reply = $('.group-reply-list', this);
		reply.find('[js="replyList"]').attr('rw', 'read');
		reply.find('textarea, div.grp-reply-input').remove();
	});
}

//初始化话题列表中内容的高度
function initTopicContView(list){
	list.each(function(){
		var block = $(this), cont = block.find('.group-topic-cont'), inner = cont.find('.grp-topic-inner');
		if( inner.find('>div').height() > inner.height() + 16 ){
			cont.find('.grp-topic-more').show();
			var h = parseInt(inner.css('max-height'), 10) || 65;
			inner.height(h).data('defaultH', h);
			inner.css('max-height', 'none');
		} else {
			cont.find('.grp-topic-more').remove();
		}
	});
}

//绑定话题列表事件
function bindTopicList(){
	//显示隐藏话题操作
	$('div[js="groupTopicList"] div.event-block').live('mouseenter', function(){
		$('div.action', this).addClass('current-action');
		$('div.action .hide-action', this).css({display: 'inline-block', opacity: 0}).animate({opacity: 1}, 300, function(){$(this).css('display', 'inline-block');});
	}).live('mouseleave', function(){
		$('div.action', this).removeClass('current-action');
		$('div.action .hide-action', this).animate({opacity: 0}, 300, function(){$(this).css('display', 'none');});
	});
	//显示隐藏回复操作
	$('div[js="groupTopicList"] div[js="groupReplyBlock"]').live('mouseenter', function(){
		$('p.action [js="hideAction"]', this).fadeIn(250);
	}).live('mouseleave', function(){
		$('p.action [js="hideAction"]', this).fadeOut(250);
	});

	//举报话题
	$('div[js="groupTopicList"] [reportTopic]').live('click', function(){
		var a = $(this), type = a.attr('reportTopic'), tid = a.attr('tid');
		$.post('/group/topicReport!jubaobefore.jhtml', {targetTypeId: type, targetId: tid}, function(data){
			if( data != '1' ){
				var pop = $($('#reportSelect').html());
				pop.popupWin({
					title: '举报',
					width: 400,
					closeDestroy: true,
					reserve: false,
					open:function(){
						pop.find('[type="button"]').click(function(){
							$.post('/group/topicReport!jubao.jhtml', {targetTypeId: type, targetId: tid, jubaoTypeId: pop.find(':checked').val()},
								function(){
									pop.popupWin('close');
									pop_alert(lang.group.report_tips1);
								});
						});
					}
				});
			} else {
				pop_alert(lang.group.report_tips2);
			}
		});
	});

	//删除话题
	$('div[js="groupTopicList"] [delTopic]').live('click', function(){
		var a = $(this), block = a.closest('.event-block'), gid = a.attr('gid');
		pop_confirm(null, lang.group.topic_del_tips1, function(){
			$.get('/group/topic.deleteAjax.jhtml' + a.attr('delTopic'), function(){
				if( document.isTopicDetailPage == true ){
					location.href = '/group/groupDetail.jhtml?groupId=' + gid;
				} else {
					block.slideUp(300, function(){block.remove();});
				}
			});
		});
	});

	//置顶话题
	$('div[js="groupTopicList"] [topTopic]').live('click', function(){
		var a = $(this), block = a.closest('.event-block'), list = block.parent();
		pop_confirm(null, (lang.group.topic_top_tips1).replace('#0#', a.text()), function(){
			var curTop = block.attr('isTop');
			var tt = a.attr('topTopic') + (curTop == 'true' ? '1' : '');
			$.get('/group/toptopic.jhtml' + tt, function(){
				var txt = a.attr('txt');
				a.attr('txt', a.text()).text(txt);
				if( curTop == 'true' ){
					block.removeAttr('isTop');
					if( document.isTopicDetailPage == true ) return;
					var last = list.find('.event-block[isTop="true"]:last'), next = last.next('.event-block');
					if( last.length > 0 && next.length > 0 ){
						var top = next.offset().top - block.outerHeight() - 10;
						block.slideUp(300, function(){
							last.after(block);
							//$(document).scrollTop(top);
							block.slideDown(300);
						});
					}
				} else {
					block.attr('isTop', 'true');
					if( document.isTopicDetailPage == true ) return;
					block.slideUp(300, function(){
						list.prepend(block);
						$(document).scrollTop(list.offset().top - 40);
						block.slideDown(300);
					});
				}
			});
		});
	});

	//放大缩小附加的图片
	$('div[js="groupTopicList"] [js="showImage"]').live('click', function(){
		$(this).parent().hide().next('.event-share-image').show();
	});
	$('div[js="groupTopicList"] [js="showThumb"]').live('click', function(){
		$(this).closest('.event-share-image').hide().prev('.event-share-image').show();
	});

	//显示隐藏回复
	$('div[js="groupTopicList"] [js="showReply"]').live('click', function(){
		var a = $(this), span = a.parent(), reply = a.closest('.event-content').find('.group-reply-list');
		if( span.hasClass('reply-action-show') ){
			span.removeClass('reply-action-show');
			reply.hide();
		} else {
			span.addClass('reply-action-show');
			reply.show();
			if( a.find('[replyCnt]').attr('replyCnt') == '0' ){
				reply.find('[js="showReplyPost"]').trigger('focus');
			} else {
				loadReplyList(reply);
			}
		}
		a.blur();
	});
	//载入回复列表
	function loadReplyList(cont){
		if( cont.data('listLoaded') == true ) return;
		var list = cont.find('[js="replyList"]'), rw = list.attr('rw');
		list.show().append('<div class="loading" style="width:20px;margin:0 auto 15px auto;"></div>');
		$.get('/group/queryReplyByTopic.jhtml?topicId=' + cont.attr('topicId'), function(data){
			if( !checkAjaxData(data) ) return false;
			cont.data('listLoaded', true);
			var div = $('<div>' + data + '</div>'), cnt = div.find('>div.grp-reply-block').length;
			if( cnt > 2 ){
				list.empty().append(div);
				showReplyList(list);
				cont.find('[js="showMoreReply"]').show().find('a').click(function(){
					var rl = list.find('.grp-reply-block').length;
					if( parseInt(div.css('margin-top'), 10) == 0 ){
						if( rl > 2 ){
							showReplyList(list, true);
						} else {
							cont.find('[js="showMoreReply"]').remove();
						}
					} else {
						div.animate({marginTop: 0}, 300);
						if( rl <= 2 ) cont.find('[js="showMoreReply"]').remove();
					}
					var a = $(this), txt = a.attr('txt');
					a.attr('txt', a.text()).text(txt);
					a.blur();
				});
			} else {
				list.height('auto').empty().append(div);
			}
			if( rw == 'read' ){
				list.find('div[js="groupReplyBlock"]').each(function(){
					$(this).find('p.action').find('a[js="showCurReplyPost"]').remove();
					$(this).find('.grp-reply-input').remove();
				});
			}
		});
	}
	function showReplyList(list, ani){
		var div = list.find('>div'), h = div.outerHeight(), h1 = 7;
		div.find('>div.grp-reply-block:gt(' + (div.find('>div.grp-reply-block').length - 3) + ')').each(function(){
			h1 += $(this).outerHeight();
		});
		if( ani == true ){
			div.animate({marginTop: h1 - h}, 300);
		} else {
			div.css({"margin-top": (h1 - h) + 'px'});
		}
	}

	//显示隐藏回复输入框
	$('div[js="groupTopicList"] [js="showReplyPost"]').live('focus', function(){
		var a = $(this);
		a.closest('.group-reply-list').find('[js="cancelReplyPost"]').trigger('click');
		a.hide().next('.grp-reply-input').show().find('textarea').focus();
	});
	$('div[js="groupTopicList"] [js="showCurReplyPost"]').live('click', function(event){
		var a = $(this);
		a.closest('.group-reply-list').find('[js="cancelReplyPost"]').trigger('click');
		var text = a.parent().next('.grp-reply-input').show().find('textarea').focus();
		setTimeout(function(){
			text.val(text.attr('v') + ' ').click();
		}, 50);
	});
	$('div[js="groupTopicList"] [js="cancelReplyPost"]').live('click', function(){
		$(this).closest('.grp-reply-input').hide().prev('[js="showReplyPost"]').show();
	});

	//发表回复
	function postReply(cont, callback){
		var form = cont.is('form') ? cont : cont.closest('.group-reply-list').find('form');
		cont.find('[js="cancelReplyPost"], [js="submitReply"], [js="submitCurReply"]').hide();
		cont.find('[js="cancelReplyPost"]').after('<span class="loading-inline">&nbsp;</span>');
		$.post(form.attr('action'), form.serializeArray(), function(rid){
			var rc = form.closest('.event-block').find('[replyCnt]'), cnt = parseInt(rc.attr('replyCnt')) + 1;
			rc.attr('replyCnt', cnt).text('(' + cnt + ')');
			var reply = $($('#replyHtml').html().replace('{content}', $.trim(form.find('textarea').val())).replace('{replyid}', rid));
			var div = form.closest('.group-reply-list').find('[js="replyList"]>div');
			if( div.length == 0 ){
				rc.show();
				div = $('<div></div>').appendTo(form.closest('.group-reply-list').find('[js="replyList"]').show());
			}
			div.append(reply);
			form.find('[name="reply.id"], [name="pid"], [name="pname"], textarea').val('');
			cont.find('.loading-inline').remove();
			cont.find('[js="cancelReplyPost"], [js="submitReply"], [js="submitCurReply"]').show();
			cont.closest('.grp-reply-input').hide().prev('[js="showReplyPost"]').show();
			if( $.isFunction(callback) ) callback(reply);
		});
	}
	$('div[js="groupTopicList"] [js="submitReply"]').live('click', function(){
		var a = $(this), cont = a.closest('.grp-reply-cont'), text = cont.find('textarea'), v = $.trim(text.val()), err = cont.find('[js="err"]');
		if( v == '' || v == text.attr('v') ){
			err.show();
			return;
		}
		err.hide();
		if( cont.find('form').length == 0 ){
			var form = cont.closest('.group-reply-list').find('form');
			form.find('[name="pid"]').val(a.attr('pid'));
			form.find('[name="pname"]').val(a.attr('pname'));
			form.find('[name="reply.content"]').val(v);
			postReply(cont, function(reply){
				var rt = reply.offset().top;
				if( rt > $(document).scrollTop() + $(window).height() ){
					$(document).UscrollTop({to: rt - 7});
				}
			});
		} else {
			postReply(cont);
		}
	});
	
	//删除回复
	$('div[js="groupTopicList"] [delReply]').live('click', function(){
		var a = $(this), block = a.closest('[js="groupReplyBlock"]');
		pop_confirm(null, lang.group.reply_del_tips1, function(){
			$.get('/group/deleteReplyAjax.jhtml' + a.attr('delReply'), function(){
				if( document.isTopicDetailPage == true ){
					block.slideUp(300, function(){block.remove();});
					return;
				}
				var list = block.closest('[js="replyList"]');
				var rc = list.closest('.event-block').find('[replyCnt]'), cnt = Math.max(0, parseInt(rc.attr('replyCnt')) - 1);
				rc.attr('replyCnt', cnt).text('(' + cnt + ')');
				block.slideUp(300, function(){
					block.remove();
					if( list.find('.grp-reply-block').length == 0 ){
						
					} else {
						if( list.height() < 20 ){
							showReplyList(list);
						}
					}
				});
			});
		});
	});
	
	//显示隐藏话题全部
	$('div[js="groupTopicList"] .grp-topic-more [js=show]').live('click', function(){
		var a = $(this).hide(), more = a.parent(), inner = a.closest('.group-topic-cont').find('.grp-topic-inner');
		more.find('[js=hide]').show();
		more.find('span').hide();
		var h = inner.find('>div').height(), h1 = inner.data('defaultH') || 65;
		inner.animate({height: h}, Math.min(100 + 100 * Math.floor(h / h1), 600));
	});
	$('div[js="groupTopicList"] .grp-topic-more [js=hide]').live('click', function(){
		var a = $(this).hide(), more = a.parent(), inner = a.closest('.group-topic-cont').find('.grp-topic-inner');
		more.find('[js=show]').show();
		more.find('span').show();
		var h = inner.find('>div').height(), h1 = inner.data('defaultH') || 65;
		inner.animate({height: h1}, Math.min(100 + 100 * Math.floor(h / h1), 600));
	});
}


$(function(){
	//获取新的推荐群组
	$('#recommendationGroupList').each(function(){
		var list = $(this);
		var setClose = function(){
			var li = $(this).closest('li'), agid = [];
			list.find('li').each(function(){
				agid.push($(this).find('dl').attr('groupId'));
			});
			if( $.isArray(document.leftRecommend) ){
				$.merge(agid, document.leftRecommend);
			}
			$.get('/user/index!loadNextRecommendGroup.jhtml?groupId=' + li.find('dl').attr('groupId') + '&groupIds=' + agid.join('_'), function(data) {
				li.fadeOut(250, function() {
					if (data != '') {
						var newli = $('<li class="border-bottom">' + data + '</li>').css('opacity', 0);
						newli.find('.common-close').click(setClose);
						li.replaceWith(newli);
						newli.animate({opacity: 1}, 250);
					} else {
						li.remove();
					}
				})
			});
		}
		list.find('.common-close').click(setClose);
	});

	//获取群组列表
	$('a[orderBy]').live('click', function(){
		var a = $(this), list = $('div[groupList]');
		if( list.data('groupListLoading') == true ){
			a.blur();
			return;
		}
		a.addClass('group-sort-selected').siblings('a').removeClass('group-sort-selected');
		list.attr({pageNo: 0, order: a.attr('orderBy')});
		if( list.attr('id') == 'myGroupList' ) list.empty();
		getGroupList(list);
		a.blur();
	});
	$('#myGroupList').each(function(){
		var list = $(this);
		$('a[js="getmoreLink"]', list).live('click', function(){
			getGroupList(list);
		});
		$('a[filterBy]').bind('click', function(){
			if( list.data('groupListLoading') == true ) return;
			var a = $(this), li = a.closest('ul').find('li');
			if( li.length > 1 ){
				list.attr({pageNo: 0, filter: a.attr('filterBy')});
				li.removeClass('current');
				a.closest('li').addClass('current');
				list.empty();
				getGroupList(list);
				a.blur();
			}
		});
	});
	$('#industryGroupList').each(function(){
		var list = $(this);
		$('a[snsBy]').bind('click', function(){
			var a = $(this);
			if( list.data('groupListLoading') == true ){
				a.blur();
				return;
			}
			a.closest('div').find('a').removeClass('selected');
			a.addClass('selected');
			list.attr({pageNo: 0, industry: a.attr('snsBy')});
			getGroupList(list);
			a.blur();
		});
	});

	//显示加入群组按钮
	$('div[groupList] div.vcard').live('mouseenter', function(){
		$(this).find('.join-cont').show();
	}).live('mouseleave', function(){
		$(this).find('.join-cont').hide();
	});
	/*
	$('div[groupList] .join-cont a').live('click', function(){
		var a = $(this), gid = a.closest('[groupId]').attr('groupId');
		$.get('/group/member.openApply.jhtml?gid=' + gid, function(data){
			if( data == '0' ){
				a.replaceWith('<span class="green">已加入</span>');
			} else if( data == '1' ){
				a.replaceWith('<span class="quiet">待审核</span>');
			} else if( data == '2' ){
				a.replaceWith('<span class="red">超过上限</span>');
			}
		});
	});
	*/

	//获取我发表过的话题
	$('[js="ajaxGroupTopic"]').each(function(){
		var ul = $(this);
		$.get(ul.attr('url'), function(data){
			if( $.trim(data) == '' ){
				ul.replaceWith('<div class="group-right-empty">' + ul.attr('tips') + '</div>');
			} else {
				ul.empty().append(data);
			}
		});
	});

	//发表群组话题
	$('#postGroupTopic').postContent();

	//获取更多话题
	$('#detailTopicList').each(function(){
		var list = $(this);
		$('a[js="getmoreLink"]', list).live('click', function(){
			getTopicList(list);
		});
	});

	//绑定话题列表事件
	bindTopicList();
	
	//绑定群组简介显示3行
	$('a[js="showDescCont"]').live('click', function(){
		var cont = $(this).closest('[js="groupDescCont"]'), mdesc = cont.find('[js=minDescCont]'), sdesc = cont.find('[js=descCont]'), desc = sdesc.find('>div.grp-desc-cont');
		mdesc.hide();
		sdesc.show();
		desc.animate({height: desc.find('>div').height()}, 250);
	});
	$('a[js="hideDescCont"]').live('click', function(){
		var cont = $(this).closest('[js="groupDescCont"]'), mdesc = cont.find('[js=minDescCont]'), sdesc = cont.find('[js=descCont]'), desc = sdesc.find('>div.grp-desc-cont');
		desc.animate({height: 55}, 250, function(){
			sdesc.hide();
			mdesc.show();
		});
	});
});



jQuery.fn.postContent = function(options){
	options = $.extend({

	}, options || {});
	return this.each(function(){
		var feedsync = null; //微博同步状态
		var post = $(this), cont = post.find('[js="topicContainer"]'),
			title = post.find('[js="topicTitle"]'), text = cont.find('[js="topicContent"]'), url = cont.find('[js="linkUrl"]'),
			submit = cont.find('[js="submitContent"]'), form = cont.find('form'),
			imgpanel = cont.find('[panel="img"]'), urlpanel = cont.find('[panel="url"]'), docpanel = cont.find('[panel="doc"]');

		title.one('focus', function(){
			if( cont.is(':hidden') ) cont.slideDown(500);
		}).change(function(){
			cont.find('[name="grpShareTopicVo.topicTitle"]').val($(this).val());
		});

		cont.find('[showPanel]').click(function(){
			cont.find('[js="showPanel"]').hide();
			cont.find('div[panel=' + $(this).attr('showPanel') + ']').slideDown(250);
		});
		cont.find('[panel] .common-close').click(function(){
			$(this).closest('[panel]').slideUp(250);
			cont.find('[js="showPanel"]').show();
		});

		//上传图片
		function initShareImage(){
			imgpanel.find('form').show();
			imgpanel.find('.loading, [js="imagePreview"]').hide();
			imgpanel.find(':file').val('').end().find('[js="netImage"]').val('');
		}
		function showImageUploading(){
			imgpanel.data('uploading', true);
			imgpanel.find('form, [js="imagePreview"]').hide();
			imgpanel.find('.loading').show();
		}
		function showImagePreview(){
			imgpanel.data('uploading', false);
			imgpanel.find('.loading').hide();
			imgpanel.find('[js="imagePreview"]').show();
		}
		function upShareImage(){
			if( imgpanel.data('uploading') == true ) return;
			showImageUploading();
			$.ajaxFileUpload({
				fileElementId: 'uploadImageFile',
				secureuri: false,
				dataType: 'json',
				url: imgpanel.find('form').attr('action'),
				success: function(data, status){
					if( data.error == 0 ){
						showImagePreview();
						imgpanel.find(':file').val('').end().find('[js="netImage"]').val('');
						imgpanel.find('[js="imagePreview"] span').empty().append('<img src="' + data.path + '/' + data.img.replace('.jpg', '_thumbnail.jpg') + '" />');
						cont.find('[name="grpShareTopicVo.imgUrl"]').val(data.img);
					} else {
						imgpanel.data('uploading', false);
						imgpanel.find('.loading').hide();
						imgpanel.find('form').show();
						var upMsg = lang.group.upload_image_msg;
						pop_alert(upMsg[data.error]);  //上传图片时发生错误
						return false;
					}
				}
			});
		}
		imgpanel.find('[js="imagePreview"] a').click(initShareImage);
		imgpanel.find(':file').change(function(){
			if( this.value == '' ) return false;
			upShareImage();
		});
		imgpanel.find('[js="upNetImage"]').click(function(){
			upShareImage();
		});
		initShareImage();

		//发布内容
		submit.click(function(){
			if( $(this).attr('unverify') ) return; //如果未经邮箱验证则不绑定
			if( imgpanel.data('uploading') == true ) return;
			if( submit.data('submitDisabled') == true ) return;

			if( feedsync == 3 && text.val().length > 140 ){
				pop_confirm(null, lang.feed.send_msg, function(){
					sendContent();
				});
			} else {
				sendContent();
			}
		});
		var resetContent = function(){
		}
		var sendContent = function(){
			var tt = cont.find('[name="grpShareTopicVo.topicTitle"]');
			tt.val($.trim(title.val()));
			if( tt.val() == '' ){
				pop_alert(lang.group.topic_add_tips1, function(){title.focus();});
				return;
			}
			cont.find('[name="grpShareTopicVo.topicType"]').val(1);
			if( docpanel.is(':visible') ){  //发表文档
				cont.find('[name="grpShareTopicVo.topicType"]').val(2);
				if( cont.find('[js="document"]').val() == '' ){
					pop_alert(lang.group.topic_add_tips2);
					return;
				}
			}
			if( urlpanel.is(':visible') ){  //发表网址
				cont.find('[name="grpShareTopicVo.topicType"]').val(3);
				var linkurl = url.val().replace(/^(http:\/\/)*/, 'http://');
				if( linkurl != '' && linkurl != 'http://' ){
					if( ! linkurl.is_url() ){
						pop_alert(lang.feed.linkurl_error);
						return;
					}
					url.val(linkurl);
				}
			}
			if( imgpanel.is(':visible') ){  //发表图片
				cont.find('[name="grpShareTopicVo.topicType"]').val(4);
			}
			submit.data('submitDisabled', true);
			$.ajaxFileUpload({
				fileElementId: 'fileField',
				secureuri: false,
				dataType: 'json',
				url: options.postUrl || form.attr('action'),
				success: function(data, status){
					submit.data('submitDisabled', false);
					data.error = parseInt(data.error);
					if( data.error == 0 ){
						location.reload(true);
					} else {
						var errMsg = lang.group.topic_add_errmsg;
						if( errMsg[data.error] ){
							pop_alert(errMsg[data.error]);
						} else {
							pop_alert(lang.group.topic_add_tips3);
						}
					}
					resetContent();
				}
			});
		};
	});
};