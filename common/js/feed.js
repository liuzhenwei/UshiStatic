function feed(options){
	options = $.extend({
		content: '#feed_content',
		showURL: '/feed/feed!listComments.jhtml',
		moreFeedURL: '/feed/feed!listAll.jhtml',
		delFeedURL: '/feed/feed!delete.jhtml',
		delGroupFeedURL: '/group/feed!removeNewsFeed.jhtml',
		addCommentURL: '/feed/feed!addComment.jhtml',
		delFeedCommUrl: '/feed/feed!removeComment.jhtml',
		delGroupCommUrl: '/group/feed!removeComment.jhtml',
		addFavURL: '/feed/feed!addMicroBlogFav.jhtml',
		delFavUrl: '/feed/feed!removeMicroBlogFav.jhtml',
		retweetUrl: '/feed/feed!viewRetweetNewsfeed.jhtml?fromwhere=1',
		viewRetweetUrl: '/feed/feed!viewretweethistory.jhtml',
		viewBlogUrl: '/pr/cto!viewBlog.jhtml',
		getFeedCtrlUrl: '/security/acceptfeed!feedControlDropdown.jhtml',
		getGroupFeedCtrlUrl: '/group/dropDownMenu.jhtml'
	}, options || {});

	var feed_content = $(options.content);
	var feedCtrl = $('<div id="feedCtrlMenuCont" class="dp-menu"></div>').appendTo('body').css({'display': 'none', 'position': 'absolute'});

	//获取更多feed
	var getMoreFeed = function(event){
		var pageNo = parseInt(feed_content.attr('morepageno'), 10) + 1;
		feed_content.attr('morepageno', pageNo);
		$(this).closest('[js="moreFeedDiv"]').remove();
		feed_content.append('<div class="loading" style="width:20px;margin:20px auto;"></div>');
		var moreFeedURL = feed_content.attr('ajaxAction') || options.moreFeedURL;
		moreFeedURL += ( moreFeedURL.indexOf('?') >= 0 ) ? '&' : '?';
		$.get(moreFeedURL +'r='+ Math.random() + '&pageNo=' + pageNo, function(data) {
	   		if( !checkAjaxData(data) )
	   			return false;
			feed_content.find('.loading').remove();
			feed_content.append(data);
			feedRegEvent();
			if(pageNo >= 6){
				$('#moreFeed', feed_content).parent().remove();
			}
		});
		return false;
	};
	//删除某条feed
	var deleteFeed = function(event){
		var fid = $(this).attr('feedId'), btn = feed_content.find('a[feedId="' + fid + '"]'),
			div = btn.closest('.event-block'), comm = div.find('.event-comments');
		var ct = $(this).attr('menuType'), url = ( ct == 'group' ) ? options.delGroupFeedURL : options.delFeedURL,
			tips = ( ct == 'group' ) ? lang.group.deleteNewsfeedAndTopic : lang.profile.delete_feed_confirm;
		pop_confirm(lang.common.tips, '<font color="red">' + tips + '</font>', function(){
			$.get(url + '?feedId=' + fid, function(data){
				if( parseInt(data, 10) == 0 || data.search(/feed_/ig) >= 0 ){
					div.hide('fast', function(){
						div.remove();
						if( $.isFunction(options.removeCB) ){
							options.removeCB(ct);
						}
					});
				}
			});
		});
		return false;
	};
	//收藏feed
	var favFeed = function(event){
		var self = this;
		//添加收藏
		var addFavFeed = function(event){
			$.post(options.addFavURL ,{'feedId': $(self).attr('feedId')}, function(data){
				var isFav = data.substring(0, 1);
				if(isFav == "1"){
					pop_alert('<font color="red">' + lang.feed.fav_duplicate + '</font>');
				} else if (isFav == "0") {
					pop_alert(lang.feed.fav_success);
				}
			});
		};
		//取消收藏
		var removeFavFeed = function(event){
			pop_confirm(lang.common.tips, '<font color="red">' + lang.feed.fav_delete + '</font>', function(){
				$.post(options.delFavUrl ,{'feedId': $(self).attr('feedId')}, function(data){
					$(self).closest('.event-block').remove();
				});
			});
		};
		( options.isRemoveFav == 1 ) ? removeFavFeed() : addFavFeed();
		return false;
	};
	//转播Feed
	var retweetFeed = function(event){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

		var feedId = $(this).attr('feedId');
		var div = $('div[retweetFeed="' + feedId + '"]');
		if( div.length ){
			div.popupWin('open');
		} else {
			div = $('<div retweetFeed="' + feedId + '" style="display:none;" />').appendTo('body');
			$.ajax({
				type: 'GET',
				url: options.retweetUrl + '&feedId=' + feedId,
				cache: false,
				success: function(data){
					div.append(data);
					div.find("a[name='a_retweethistorylink']").click(viewRetweetHistory);
					div.find('a[viewblog]').click(viewBlog);
					div.popupWin({
						title: lang.feed.retweet_title,
						width: 600,
						reserve: true
					});
				}
			});
		}
		return false;
	};
	//查看转播历史
	var viewRetweetHistory = function(event){
		pop_ajax(options.viewRetweetUrl + '?feedId=' + $(this).attr('feedId'), lang.feed.retweet_history, {
			width: 500,
			closeDestroy: true,
			clickClose: true
		});
		return false;
	};
	//查看微博的详细内容
	var viewBlog = function(event){
		pop_ajax(options.viewBlogUrl + '?bid=' + $(this).attr('viewblog'), '', {
			width: 600,
			title: '查看分享详情',
			closeDestroy: true,
			clickClose: true
		});
		return false;
	};

	//显示,隐藏评论模块
	var showComment = function(event){
		var cont = $(this).closest('.event-content'),
			comm = cont.find('.event-comments'),
			inputText = cont.find('textarea');
		inputText.css('height', 80);
		if( comm.is(':visible') ){
			comm.hide();
			inputText.hide();
			inputText.next().hide();
		} else {
			var cnt = cont.find('[js="commentCnt"]')
			if( cnt.length && $.trim(cnt.text()) != '' ){
				$.get(options.showURL + '?feedId=' + inputText.attr('feedId') + '&groupId=' + inputText.attr('groupId') + '&r=' + Math.random(), function(data) {
					comm.empty().append(data);
					feedRegEvent(comm); //发表评论后绑定评论区事件
				});
				comm.empty().show().append('<div class="loading"/>');
			} else {
				comm.show();
			}
			inputText.show().focus();
			inputText.next().show();
			setTimeout(function(){
				inputText.click();
			}, 50);
		}
		return false;
	};
	//获取更多评论
	var getMoreComment = function(event){
		var inputText = $(this).closest('.event-content').find('textarea');
		$.get(options.showURL + '?feedId=' + inputText.attr('feedId') + '&groupId=' + inputText.attr('groupId') + '&r=' + Math.random(), function(data) {
			var comm = inputText.parent().prev();
			comm.empty().append(data).show();
			feedRegEvent(comm); //发表评论后绑定评论区事件
		});
		$(this).remove();
	};
	//发表评论
	var postComment = function(event){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

		var self = $(this),
			inputText = self.prev(),
			gid = inputText.attr('groupId'),
			fid = inputText.attr('feedId'),
			pid = self.prev().attr("pid"),
			pname = self.prev().attr("pname");
		var body = inputText.val().toText();
		if( body.length > 200 ){
			pop_alert(lang.endorse.limit_200);
			return false;
		}
		self.attr('disabled', true);
		$.post(options.addCommentURL,
			{groupId: gid, feedId: fid, pid: pid, pname: pname, commBody: inputText.val().toText()},
			function(data) {
				if (data == 0) {
					$.get(options.showURL + '?feedId=' + fid + '&groupId=' + gid + '&r=' + Math.random(), function(data1){
						var comm = inputText.parent().prev();
						comm.empty().append(data1).show();
						feedRegEvent(comm); //发表评论后绑定评论区事件
						inputText.val('').css('height', 20);
						setTimeout(function() {
							self.attr('disabled', false);
						}, 500);
					});
					var cnt = self.closest('.event-content').find('.action').find('[js="commentCnt"]');
					var n = ( cnt.text() == '' ) ? 1 : parseInt(cnt.text().replace(/\(|\)/g, ''), 10) + 1;
					cnt.text('(' + n + ')');
				} else {
					float_tips('error', lang.common.submit_failure);
					self.attr('disabled', false);
				}
			});
		return false;
	};
	//删除评论 (调用在html页面onclick)
	var deleteComment = function(event) {
		var cid = $(this).attr('commentId'), btn = feed_content.find('a[commentId="' + cid + '"]'),
			groupId = btn.attr('gid'), c = btn.closest('div'),
			url = ( groupId ) ? options.delGroupCommUrl : options.delFeedCommUrl;
		pop_confirm(lang.common.tips, '<font color="red">' + lang.group.group_feed_deletecomment + '</font>',
			function() {
				$.post(url, {commentId: cid}, function(data){
					var cnt = $(btn).closest('.event-content').find('.action').find('[js="commentCnt"]');
					var n = parseInt(cnt.text().replace(/\(|\)/g, ''), 10) - 1;
					cnt.text(( n == 0 ) ? '' : '(' + n + ')');
					if(data.indexOf('success') >= 0 ){
						c.hide('fast', function(){
							c.remove();
						})
					}
				});
			}
		);
		return false;
	};
	//添加评论回复
	var addComment = function(event){
		var btn = $(this), uid = btn.attr('uid'), uname = btn.attr('uname');
			text = btn.closest('.event-content').find('textarea');
		var lastname = text.attr("lastname"), s = text.val();
		if( lastname && s ){
			if( s.indexOf(lang.group.answer + lastname + ':') == 0 ){
				s = text.val().replace(lastname, uname);
			} else {
				s = lang.group.answer + uname + ': ' + s;
			}
		} else {
			if( s != lang.feed.comment_tips ){
				s = lang.group.answer + uname + ': ' + s;
			} else {
				s = lang.group.answer + uname + ': ';
			}
		}
		text.click().val(s).focus();
		text.attr({
			lastname: uname,
			pid: uid,
			pname: uname
		});
		return false;
	};

	//feed block 鼠标事件
	var tmFeedOver = null;
	var hideCtrlMenu = function(){
		feed_content.find('[js="showFeedCtrl"]').hide();
		feedCtrl.hide();
	};
	var feedBlockOver = function(){
		if( tmFeedOver ) clearTimeout(tmFeedOver);
		if( feedCtrl.attr('cmtag') != $('[js="showFeedCtrl"]', this).attr('cmtag') ){
			feedCtrl.hide();
		}
		feed_content.find('[js="showFeedCtrl"]').hide();
		$('[js="showFeedCtrl"]', this).show();
	};
	var feedBlockOut = function(){
		tmFeedOver = setTimeout(hideCtrlMenu, 100);
	};
	feedCtrl.hover(function(){
		if( tmFeedOver ) clearTimeout(tmFeedOver);
		$('[js="showFeedCtrl"]',this).show();
		feedCtrl.show();
	}, function(){
		hideCtrlMenu();
	});

	//显示feed控制菜单
	var showFeedCtrl = function(){
		feedCtrl.hide();
		var a = $(this);
		var showCtrl = function(){
			var cm = a.data('feedCtrlMenu').clone();
			feedCtrl.empty().append(cm).attr('cmtag', cm.attr('cmtag'));
			var pos = a.offset(), w = feedCtrl.width();
			feedCtrl.css({'left': (pos.left - w + 12) + 'px', 'top': (pos.top + 15) + 'px', 'z-index': 100}).show();
			setTimeout(function(){
				feedRegEvent(feedCtrl);
			}, 0);
		}
		var ajaxSuc = function(data){
			var m = $(data), t = new Date().getTime() + '';
			a.attr('cmtag', t).data('feedCtrlMenu', m.attr('cmtag', t));
			m.find('li>a').attr('feedId', a.attr('feedId'));
			setTimeout(showCtrl, 200);
		}
		if( a.data('feedCtrlMenu') ){
			setTimeout(showCtrl, 50);
		} else if( a.attr('feedCtrlMenu') ){
			ajaxSuc(a.attr('feedCtrlMenu'));
			a.attr('feedCtrlMenu', '');
		} else {
			if( a.attr('ctrlType') == 'group' ){
				$.get(options.getGroupFeedCtrlUrl, {newsfeedId: a.attr('feedid'), ownerid: a.attr('ownerId'), gid: a.attr('gid'), commentId: a.attr("commentId") || 0}, ajaxSuc);
			} else {
				$.get(options.getFeedCtrlUrl, {setting: a.attr('feedtype'), targetId: a.attr('targetId'), feedId: a.attr('feedId')}, ajaxSuc);
			}
		}
	};

	//设置feed控制
	var resetFeedType = function(event){
		var m = $(this), ul = m.closest('ul'), userId = ul.attr('uid'), userName = ul.attr('uname'),
			feedType = parseInt(m.attr('resetFeedType'), 10);
		var reloadFeed = function(){
			feedCtrl.hide();
			feed_content.attr('morepageno', 0);
			feed_content.find('.event-block').remove();
			feed_content.find('#moreFeed').click();
		}
		if (feedType == -1) { // 取消接收来自${profile.fullname}的任何动态
			pop_confirm('', lang.group.dont_receive_comefrom + " <strong>" + userName + "</strong> " + lang.group.dont_receive_comefrom_nextstep, function(){
				$.get("/security/blocklist!addBlockList.jhtml", {targetUserId:userId}, reloadFeed);
			});
		} else if (feedType == -2) {//取消关注${profile.fullname}
			pop_confirm('', lang.group.sureto_chacle_follow + userName + '?', function() {
				$.get("/sns/sns!removeFollower.jhtml", {targetUserId:userId}, reloadFeed);
			});
		} else {
			if(feedType == 1048576){  //优问的newsfeed
				pop_confirm('', lang.feed.dont_receive_comefrom_nextwendastep, function(){
					$.get('/security/acceptfeed!ajaxUpdateFeedAcception.jhtml', {setting: feedType}, reloadFeed);
				});
			}else
				$.get('/security/acceptfeed!ajaxUpdateFeedAcception.jhtml', {setting: feedType}, reloadFeed);
		}
		return false;
	}

	//群组feed举报
	var feedReportSelect = function(event){
		var rs = $('#reportSelect');
		if( rs.length == 0 ){
			return false;
		}
		var btn = $(this), gid = btn.attr("gid"), feedId = btn.attr("feedId"), commentId = btn.attr("commentId") || 0;
		pop_confirm(lang.group.group_feed_reportselect,
			'<div>' + rs.html() + '</div>',
			function(dlg){
				var url = "/group/reportFeed.jhtml";
				$.get(url, {flag:$(dlg).find(':checked').val(),gid:gid, feedId:feedId,commentId:commentId}, function(data){
					data = parseInt(data, 10);
					if( data == 0 ){
						pop_alert(lang.group.group_feed_report_dup);
					} else if( data == 1 ){
						pop_alert(lang.group.group_feed_report_suc);
					}
				});
			},
			null,
			{width: 500}
		);
		return false;
	}
	
	//显示分享的大图
	var showShareImage = function(event){
		var a = $(this), cont = a.closest('.event-share-image');
		a.hide();
		cont.addClass('event-box').find('>div').show();
		return false;
	}
	//隐藏分享的大图
	var hideShareImage = function(event){
		var a = $(this), cont = a.closest('.event-share-image');
		cont.removeClass('event-box').find('>div').hide();
		cont.find('>img').show();
		return false;
	}
	
	//微博举报
	var weiboReport = function(event){
		var feedId = $(this).attr('weiboReport');
		pop_ajax('/feed/feed!report.jhtml', lang.feed.report_pop_title, function(){
			var pop = $(this);
			pop.find('[js="submitReport"]').click(function(){
				var r = pop.find(':checked');
				$.get('/feed/feed!submitReport.jhtml?feedId=' + feedId + '&' + r.attr('name') + '=' + r.val(), function(){
					pop.popupWin('close');
					pop_alert(lang.feed.report_success);	
				});
				return false;
			});
		}, {
			closeDestroy: true,
			reserve: false,
			width: 400
		});
		return false;
	}

	//绑定所有事件
	var feedRegEvent = function(fcont) {
		fcont = fcont || feed_content;

		fcont.find('#moreFeed')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(getMoreFeed);
		fcont.find('[js="fav_span"] a')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(favFeed);
		fcont.find('.event-comments [more]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(getMoreComment);
		fcont.find('[js=deleteFeed]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(deleteFeed);
		fcont.find('[js=insertComm]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(showComment);
		fcont.find('[js=deleteComm]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(deleteComment);
		fcont.find('.common-button')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(postComment);
		fcont.find('[js=addComment]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(addComment);
		fcont.find('.input-addcomm')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.one('click', function(){
				$(this).val('');
			}).bind('click', function() {
				$(this).css('height', 80);
				$(this).next().show();
				return false;
			});
		fcont.find('span.retweet_span a[feedId]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(retweetFeed);
		fcont.find('a[name="a_retweethistorylink"]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(viewRetweetHistory);
		fcont.find('a[viewblog]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.click(viewBlog);
		fcont.find('[js="showFeedCtrl"], [js="showCommentCtrl"]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.bind('click mouseover', showFeedCtrl);
		fcont.find('.event-block')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.hover(feedBlockOver, feedBlockOut);
		fcont.find('[resetFeedType]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.bind('click', resetFeedType);
		fcont.find('[js="feedReport"]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.bind('click', feedReportSelect);
		fcont.find('[js="shareImageM"]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.bind('click', showShareImage);
		fcont.find('[js="shareImageS"]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.bind('click', hideShareImage);
		fcont.find('a[weiboReport]')
			.not('[hasBind="yes"]').attr('hasBind', 'yes')
			.bind('click', weiboReport);
			
		//绑定hover
		fcont.delegate('.feed-block', 'mouseenter', function(){
			$('[weiboReport]', this).show();
			$('.common-close', this).css('display', 'inline-block');
		}).delegate('.feed-block', 'mouseleave', function(){
			$('[weiboReport]', this).hide();
			$('.common-close', this).hide();
		});
	};
	feedRegEvent();

	$(document.body).unbind('click.feedEvent').bind('click.feedEvent', function(){
		feed_content.find('.input-addcomm').each(function(){
			if( ! /[^\s]+/.test(this.value) ){
				$(this).css({
					height: 20
				}).next().hide();
			}
		});
		feedCtrl.hide();
	});
}

//写分享的组件
function writeShare(options){
	options = $.extend({
		feedContent: '#feed_content',
		checkLength: true,
		maxlength: 200,
		atSupport: false,
		callback: function(){}
	}, options || {});
	options.feedContent = $(options.feedContent);

	var feedsync = null;     //微博同步状态

	var wbCont = $('#weiboPanel'),
		textarea = $('#freetext'),
		urlCont = $('#statusUrlContent'),
		docCont = $('#statusDocumentContent'),
		imgCont = $('#statusImageContent'),
		chklenParam = {
			maxlength: options.maxlength,
			wordCount: '#wordCountShow',
			cnWord: true,
			check: function(text){
				return text.toText();
			}
		};

	//绑定检查文本输入长度
	var bindCheckLength = function(){
		if( options.checkLength ){
			textarea.checkFieldLength(chklenParam);
		}
	}
	bindCheckLength();

	//打开输入网址
	$("#statusUrl").click(function(){
		textarea.triggerHandler('focus');
		urlCont.show();
		docCont.hide();
		imgCont.hide();
		return false;
	});
	//填写网址的时候，阻止回车
	$('#linkurl').keydown(function(e){
		if( e.keyCode == 13 ){ return false; }
	});
	//获取网址的标题
	urlCont.find('.common-close').click(function(){
		var g = urlCont.find('div[js="getTitleArea"]').show();
		g.find(':text').val('http://');
		var p = urlCont.find('div[js="postTitleArea"]').hide();
		p.find(':text').val('');
		p.find('p').text('');
		urlCont.hide();
	});
	urlCont.find(':button[js="getTitle"]').click(function(){
		var linkurl = $("#linkurl").val().replace(/^(http:\/\/)*/, 'http://');
		if( linkurl.is_url() ){
			$.get('/feed/feed!getFeedTitle.jhtml?linkurl=' + encodeURIComponent(linkurl), function(data){
					urlCont.find('div[js="getTitleArea"]').hide();
					var area = urlCont.find('div[js="postTitleArea"]').show();
					area.find('p').text(linkurl);
					area.find(':text').val(data);
				});
		} else {
			pop_alert('<font color="red">' + lang.feed.linkurl_error + '</font>');
		}
	});

	//打开共享文档
	$("#statusDocument").click(function(){
		textarea.triggerHandler('focus');
		docCont.show();
		urlCont.hide();
		imgCont.hide();
		return false;
	});
	docCont.find('.common-close').click(function(){
		docCont.hide();
		$('#fileField').val('');
		return false;
	});


	//打开共享图片
	var imgForm = $('#shareImageForm'), imgShow = imgCont.find('[js="shareImageReview"]');
	var ictab = imgCont.find('[js="shareUpimgTab"] li');
	imgForm.data('curTab', '0');
	function initShareImage(){
		wbCont.find('input[name=imgId]').val('');
		imgForm.show().find(':file').val('').end().find('[name="feedImg_remote_url"]').val('');
		imgShow.hide().find('[js="imgCont"]').empty();
		ictab.filter(':first').find('a').trigger('click');
		//本地图片
		imgForm.find(':file').change(function(){
			if( this.value == '' ) return false;
			upShareImage();
		});
		//链接图片
		imgForm.find('[js="upLinkImage"]').click(function(){
			upShareImage();
		});
	}
	//上传图片
	var imageUploading = false;
	function showImageUploading(){
		imageUploading = true;
		imgForm.find('div.tab').hide().filter(':last').show();
	}
	function hideImageUploading(){
		imageUploading = false;
		imgForm.find('div.tab:last').hide();
		imgForm.find('div.tab:eq(' + imgForm.data('curTab') + ')').show();
	}
	function upShareImage(){
		showImageUploading();
		$.ajaxFileUpload({
			fileElementId: 'shareFeedImgFile',
			secureuri: false,
			dataType: 'json',
			url: imgForm.attr('action'),
			success: function(data, status){
				hideImageUploading();
				if( data == null || data.imgId == 0 ){
					pop_alert(lang.feed.upimage_error);  //上传图片时发生错误
					return false;	
				} else if( data.imgId == -1 ){
					pop_alert(lang.feed.upimage_oversize);  //上传的图片超过5M
					return false;	
				}
				imgForm.find(':file').val('');
				imgForm.find('[name="feedImg_remote_url"]').val('');
				imgForm.hide();
				imgShow.show();
				wbCont.find('input[name=imgId]').val(data.imgId);
				imgShow.find('[js="imgCont"]').empty().append('<img src="' + data.imgPath + '" />');
			}
		});
	}
	$("#statusImage").click(function(){
		textarea.triggerHandler('focus');
		imgCont.show();
		docCont.hide();
		urlCont.hide();
		return false;
	});
	imgCont.find('.common-close').click(function(){
		if( imageUploading == true ) return false;
		imgCont.hide();
		initShareImage();
		return false;
	});
	ictab.find('a').click(function(){
		if( imageUploading == true ) return false;
		ictab.removeClass('on');
		var a = $(this), idx = a.attr('href').replace('#', ''), div = imgForm.find('>div');
		a.parent().addClass('on');
		div.hide();
		div.filter(':eq(' + idx + ')').show();
		imgForm.data('curTab', idx);
		return false;
	});
	imgShow.find('[js="delShareImage"]').click(function(){
		initShareImage();
		return false;
	});
	//初始化分享图片
	initShareImage();
	
	//发布微博后重设整个输入区域
	var resetStatus = function(){
		docCont.hide();
		$("#fileField").val("");
		urlCont.find('div[js="getTitleArea"]').show();
		urlCont.find('div[js="postTitleArea"]').hide();
		urlCont.hide();
		$("#linkurl").val("http://");
		$('#freetext').val('');
		$('#wordCountShow').html(lang.feed.char_limit);
		bindCheckLength();
		$("#statusEnter").data('submitDisabled', false).removeClass('home-add-submiting');
		imgCont.hide();
		initShareImage();
		//@系统
		if (options.atSupport){
			$('#freetext').atSystem({recordField:'atnameIds'});
		}
	};
	var sendContent = function(statusEnter){
		if( statusEnter.data('submitDisabled') == true ){
			return;
		}
		var linkurl = $("#linkurl").val().replace(/^(http:\/\/)*/, 'http://');
		if( linkurl != '' && linkurl != 'http://' ){
			if( ! linkurl.is_url() ){
				pop_alert('<font color="red">' + lang.feed.linkurl_error + '</font>');
				return;
			}
		}
//		if( wbCont.find('input[name=imgId]').val() != '' && $('#freetext').val() == '' ){
//			$('#freetext').val(lang.feed.share_image);
//		}
		statusEnter.data('submitDisabled', true);
		statusEnter.addClass('home-add-submiting');
		$.ajaxFileUpload({
			fileElementId: 'fileField',
			secureuri: false,
			dataType: 'json',
			url: options.postUrl,
			success: function(data, status){
				if( data.error == 0 ){
					if( options.getUrl ){
						$.ajax({
							url: options.getUrl,
							cache: false,
							type: 'GET',
							dataType: 'html',
							success: function(data){
								options.callback(data);
								resetStatus();
							}
						});
					} else {
						options.callback(null);
						resetStatus();
					}
					return;
				} else if( data.error ==100 ){
					pop_alert(lang.feed.input_tip);//请输入内容！
					if (options.atSupport){
						$('#freetext').atSystem({recordField:'atnameIds',clearRecordField:false});
					}
				} else if( data.error ==101 ){
					pop_alert(lang.feed.file_size);//文件大小限制在2MB内！
					if (options.atSupport){
						$('#freetext').atSystem({recordField:'atnameIds',clearRecordField:false});
					}
				} else if( data.error ==102 ){
					pop_alert(lang.feed.file_type);//仅支持Word, Excel, PPT, PDF格式文件！
					if (options.atSupport){
						$('#freetext').atSystem({recordField:'atnameIds',clearRecordField:false});
					}
				} else if( data.error ==103 ){
					pop_alert(lang.common.profile_limit);
					if (options.atSupport){
						$('#freetext').atSystem({recordField:'atnameIds',clearRecordField:false});
					}
				} else if( data.error ==104 ){
					pop_alert(lang.feed.slow_down);
					if (options.atSupport){
						$('#freetext').atSystem({recordField:'atnameIds',clearRecordField:false});
					}
				} else if( data.error ==105 ){
					pop_alert(lang.feed.userleavead);
					if (options.atSupport){
						$('#freetext').atSystem({recordField:'atnameIds',clearRecordField:false});
					}
				} else if( data.error ==106 ){
					pop_alert(lang.feed.deactive_user);
					if (options.atSupport){
						$('#freetext').atSystem({recordField:'atnameIds',clearRecordField:false});
					}
				} else {
					pop_alert(lang.common.submit_failure);
					if (options.atSupport){
						$('#freetext').atSystem({recordField:'atnameIds',clearRecordField:false});
					}
				}
				bindCheckLength();
				statusEnter.data('submitDisabled', false);
			}
		});
	};
	$("#statusEnter").click(function(){
		if( imageUploading == true ) return false;
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

		var textlen = $('#freetext').val().length;
		if( feedsync == 3 && textlen > 140 ){
			pop_confirm(null, lang.feed.send_msg, function(){
				sendContent($(this));
			});
		} else {
			sendContent($(this));
		}
		return false;
	});

	//获取和设置微博同步状态
	wbCont.find('[js="synced"] input:checkbox').bind('change', function(){
		var chk = $(this);
		if( chk.val() == '0' ){
			chk.removeAttr('checked');
			var syncwin = window.open('/feed/feedapi!popBindWeibo.jhtml', 'syncwin', 'width=650,height=380');
		} else {
			var type = this.checked ? 'resume' : 'pause';
			var url = '/feed/feedapi!' + type + '.jhtml';
			$.ajax({
				url: url,
				cache: false,
				success: function(data){
					switch( data ){
					case 'pause':
						feedsync = 4;
						break;
					case 'resume':
						feedsync = 3;
						break;
					default:
						feedsync = 0;
					}
				}
			});
		}
	});
	window.setWeiboSync = function(){
		wbCont.find('[js="synced"] input:checkbox').val('3').attr('checked', true);
		$('#weiboBindTips').popupTips('close');
	}
	
	//@系统
	if (options.atSupport){
		$('#freetext').atSystem({recordField:'atnameIds'});
	}
	
}

//新版动态组件
jQuery.fn.newsfeed = function(options){
	options = $.extend({
		showURL: '/feed/feed!listComments.jhtml',
		moreFeedURL: '/feed/feed!listAll.jhtml',
		delFeedURL: '/feed/feed!delete.jhtml',
		delGroupFeedURL: '/group/feed!removeNewsFeed.jhtml',
		addCommentURL: '/feed/feed!addComment.jhtml',
		delFeedCommUrl: '/feed/feed!removeComment.jhtml',
		delGroupCommUrl: '/group/feed!removeComment.jhtml',
		addFavURL: '/feed/feed!addMicroBlogFav.jhtml',
		delFavUrl: '/feed/feed!removeMicroBlogFav.jhtml',
		retweetUrl: '/feed/feed!viewRetweetNewsfeed.jhtml?fromwhere=1',
		viewRetweetUrl: '/feed/feed!viewretweethistory.jhtml',
		viewBlogUrl: '/pr/cto!viewBlog.jhtml',
		getFeedCtrlUrl: '/security/acceptfeed!feedControlDropdown.jhtml',
		getGroupFeedCtrlUrl: '/group/dropDownMenu.jhtml',
		weiboReportMenu: '/feed/feed!report.jhtml',
		weiboReportSubmit: '/feed/feed!submitReport.jhtml',
		followQuestion: '/feed/feed!followQuestion.jhtml',
		unfollowQuestion: '/feed/feed!unfullowQuestion.jhtml'
	}, options || {});

	//删除评论或回复
	var deleteComment = function() {
		var link = $(this), cid = link.attr('commentId'), comm = link.closest('div');
		var url = link.attr('gid') ? options.delGroupCommUrl : options.delFeedCommUrl;
		pop_confirm(lang.common.tips, lang.group.group_feed_deletecomment,
			function() {
				$.post(url, {commentId: cid}, function(data){
					var cnt = link.closest('.event-content').find('.action').find('[js="commentCnt"]');
					var n = parseInt(cnt.text().replace(/\(|\)/g, ''), 10) - 1;
					cnt.text(( n == 0 ) ? '' : '(' + n + ')');
					if(data.indexOf('success') >= 0 ){
						var commCont = comm.parent();
						comm.hide('fast', function(){
							comm.remove();
							if( commCont.find('>*').length == 0 ) commCont.hide();
						})
					}
				});
			}
		);
	};
	if( $('#feed_delCommentMenu').length == 0 ){
		$('body').append('<div id="feed_delCommentMenu" style="display:none;"><div feedCtrlMenu="comment" class="dp-menu dp-menu-static"><ul><li><a href="javascript:;" js="delComment">' + lang.feed.delete_comment_menu + '</a></li></ul></div></div>');
		livePopMenu('feedCommMenu', {
			open: function(event, ui, link){
				var cid = link.attr('commentId'), comm = link.closest('div'), block = comm.closest('.event-block');
				ui.attr('feedId', block.attr('feedId'));
				ui.find('[js="delComment"]').click(function(){
					deleteComment.call(link);
				});
				ui.one('mouseenter', function(){
					feedEnter.call(block);
				});
			}
		});
	}

	//feed控制
	if( $('#feed_CtrlMenu').length == 0 ){
		$('body').append('<div id="feed_CtrlMenu" style="display:none;"><div feedCtrlMenu="feed" class="dp-menu dp-menu-static" style="width:120px;"></div></div>');
		livePopMenu('feedCtrlMenu', {
			ajaxLoaded: function(menu, link){
				var ul = menu.find('ul'), userId = ul.attr('uid'), userName = ul.attr('uname'), block = link.closest('.feed-block'), feed = block.parent();
				//点击feed控制菜单
				var resetFeedType = function(event){
					var m = $(this), feedType = parseInt(m.attr('resetFeedType'), 10);
					var reloadFeed = function(){
						menu.hide();
						feed.attr('morepageno', 0);
						feed.find('.event-block').remove();
						feed.find('#moreFeed').attr('pageNo', 0).click();
					}
					if( feedType == -1 ){ //取消接收来自${profile.fullname}的任何动态
						pop_confirm('', lang.group.dont_receive_comefrom + " <strong>" + userName + "</strong> " + lang.group.dont_receive_comefrom_nextstep, function(){
							$.get("/security/blocklist!addBlockList.jhtml", {targetUserId:userId}, reloadFeed);
						});
					} else if( feedType == -2 ){ //取消关注${profile.fullname}
						pop_confirm('', lang.group.sureto_chacle_follow + userName + '?', function() {
							$.get("/sns/sns!removeFollower.jhtml", {targetUserId:userId}, reloadFeed);
						});
					} else if( feedType == 1048576 ){ //取消优问的newsfeed
						pop_confirm('', lang.feed.dont_receive_comefrom_nextwendastep, function(){
							$.get('/security/acceptfeed!ajaxUpdateFeedAcception.jhtml', {setting: feedType}, reloadFeed);
						});
					} else if( feedType == -9999 ){ //使用a的链接和提示框
						var url = m.attr('href'), msg = m.attr('msg');
						if( msg ){
							pop_confirm('', msg, function(){
								$.get(url, reloadFeed);
							});
						} else {
							$.get(url, reloadFeed);
						}
						event.preventDefault();
					} else if( feedType == -99 ){
						$.get('/biz/index!ajaxCancelfollow.jhtml?bizid='+$(this).attr('bizid'), {setting: feedType}, reloadFeed);
					} else {
						$.get('/security/acceptfeed!ajaxUpdateFeedAcception.jhtml', {setting: feedType}, reloadFeed);
					}
				}
				ul.find('a[resetFeedType]').click(resetFeedType);
				ul.find('[js="deleteComm"]').click(function(){
					deleteComment.call(link);
				});
				ul.find('a[js=deleteFeed]').click(function(){
					deleteFeed.call(link);
				});
				ul.find('a').click(function(){
					feedLeave.call(block);
				});
			},
			open: function(event, ui, link){
				var block = link.closest('.feed-block');
				ui.attr('feedId', block.attr('feedId'));
				ui.one('mouseenter', function(){
					feedEnter.call(block);
				});
				ui.one('mouseleave', function(){
					feedLeave.call(block);
				});
			}
		});
	}
	
	//获取更多feed
	var getMoreFeed = function(feed){
		var a = $(this), pageNo = parseInt(a.attr('pageNo') || feed.attr('morepageno'), 10) + 1;
		a.closest('[js="moreFeedDiv"]').remove();
		feed.attr('morepageno', pageNo);
		feed.append('<div class="loading" style="width:20px;margin:20px auto;"></div>');
		var moreFeedURL = feed.attr('ajaxAction') || options.moreFeedURL;
		moreFeedURL += ( moreFeedURL.indexOf('?') >= 0 ) ? '&' : '?';
		$.get(moreFeedURL + 'pageNo=' + pageNo, function(data) {
	   		if( !checkAjaxData(data) ) 
	   			return false;
			feed.find('.loading').remove();
			data = $(data);
			feed.append(data);
			//优问动态内容超过6行做隐藏
			setTimeout(function(){
				data.find('.feed-wenda-desc').each(function(){
					var desc = $(this), p = desc.find('p'), next = desc.next(), ph = p.height(), dh = desc.height();
					if( ph - dh > 10 ){
						next.show();
					} else {
						if( dh - ph > 10 ) desc.height(ph);
					}
				});
				// 获取get more的位置并保存
				var more = $('[js="moreFeedDiv"]', feed);
				feed.data('morePos', more.length > 0 ? more.offset().top : 999999);
			}, 50);
			if(pageNo >= 6) $('[js="moreFeedDiv"]', feed).remove();
		});
		return false;
	};

	//删除feed
	var deleteFeed = function(){
		var a = $(this), fid = a.attr('feedId'), block = a.closest('.event-block');
		pop_confirm(lang.common.tips, lang.profile.delete_feed_confirm, function(){
			$.get(options.delFeedURL + '?feedId=' + fid, function(data){
				if( parseInt(data, 10) == 0 || data.search(/feed_/ig) >= 0 ){
					block.hide('fast', function(){
						if( $.isFunction(options.removeCB) ){
							options.removeCB(block);
						}
						block.remove();
					});
				}
			});
		});
	};

	//收藏feed
	var favFeed = function(event){
		var self = this;
		//添加收藏
		var addFavFeed = function(event){
			$.post(options.addFavURL ,{'feedId': $(self).attr('feedId')}, function(data){
				var isFav = data.substring(0, 1);
				if(isFav == "1"){
					pop_alert(lang.feed.fav_duplicate);
				} else if (isFav == "0") {
					pop_alert(lang.feed.fav_success);
				}
			});
		};
		//取消收藏
		var removeFavFeed = function(event){
			pop_confirm(lang.common.tips, lang.feed.fav_delete, function(){
				$.post(options.delFavUrl ,{'feedId': $(self).attr('feedId')}, function(data){
					$(self).closest('.event-block').remove();
				});
			});
		};
		( options.isRemoveFav == 1 ) ? removeFavFeed() : addFavFeed();
		return false;
	};

	//转播Feed
	var retweetFeed = function(event){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

		var feedId = $(this).attr('feedId');
		var div = $('div[retweetFeed="' + feedId + '"]');
		if( div.length ){
			div.popupWin('open');
		} else {
			div = $('<div retweetFeed="' + feedId + '" style="display:none;" />').appendTo('body');
			$.ajax({
				type: 'GET',
				url: options.retweetUrl + '&feedId=' + feedId,
				cache: false,
				success: function(data){
					div.append(data);
					div.find("a[name='a_retweethistorylink']").click(viewRetweetHistory);
					div.find('a[viewblog]').click(viewBlog);
					div.popupWin({
						title: lang.feed.retweet_title,
						width: 600,
						reserve: true
					});
				}
			});
		}
		return false;
	};
	//查看转播历史
	var viewRetweetHistory = function(event){
		pop_ajax(options.viewRetweetUrl + '?feedId=' + $(this).attr('feedId'), lang.feed.retweet_history, {
			width: 500,
			closeDestroy: true,
			clickClose: true
		});
		return false;
	};
	//查看微博的详细内容
	var viewBlog = function(event){
		pop_ajax(options.viewBlogUrl + '?bid=' + $(this).attr('viewblog'), '', {
			width: 600,
			title: '查看分享详情',
			closeDestroy: true,
			clickClose: true
		});
		return false;
	};
	//微博举报
	var weiboReport = function(event){
		var feedId = $(this).attr('weiboReport');
		pop_ajax(options.weiboReportMenu, lang.feed.report_pop_title, function(){
			var pop = $(this);
			pop.find('[js="submitReport"]').click(function(){
				var r = pop.find(':checked');
				$.get(options.weiboReportSubmit + '?feedId=' + feedId + '&' + r.attr('name') + '=' + r.val(), function(){
					pop.popupWin('close');
					pop_alert(lang.feed.report_success);	
				});
				return false;
			});
		}, {
			closeDestroy: true,
			reserve: false,
			width: 400
		});
		return false;
	}

	//显示,隐藏评论模块
	var showComment = function(event){
		var a = $(this), cont = a.closest('.event-content'), commList = cont.find('.event-comments'),
			commInput = cont.find('.event-comment-input'), commMore = cont.find('[js="event-comments-more"]');
			inputText = commInput.find('textarea');
		if( commList.is(':visible') || commInput.is(':visible') || commMore.is(':visible') ){
			if( inputText.val() == inputText.data('replyTemp') ){
				inputText.removeData('replyTemp').val('');
			}
			commInput.hide()
			commList.hide();
			commMore.hide();
		} else {
			if( inputText.val() == '' ) inputText.height(20);
			commInput.show();
			inputText.showDefaultTips().next().hide();
			if( cont.attr('feedType') == '1' ){   //优问动态
				commList.show();
				commMore.show();
			} else {
				var cnt = cont.find('[js="commentCnt"]');
				var fid = inputText.attr('feedId') || a.closest('div[feedId]').attr('feedId'), gid = inputText.attr('groupId') || a.attr('groupId') || '';
				if( cnt.length && $.trim(cnt.text()) != '' ){
					$.get(options.showURL + '?feedId=' + fid + '&groupId=' + gid, function(data) {
						commList.empty().append(data);
						if( commList.attr('js') == 'miniblogComm' ) return;
						var clist = commList.find('>div');
						if( clist.length > 2 ){
							clist.filter(':gt(1)').hide();
							commMore.show().find('span').text(clist.length - 2);
						} else {
							commMore.hide();
						}
					});
					commList.empty().show().append('<div class="loading"/>');
				}
			}
		}
		return false;
	};
	var showMoreReply = function(event){
		var more = $(this).parent(), cont = $(this).closest('.event-content'), commList = cont.find('.event-comments');
		commList.find('>div').show();
		if( cont.attr('feedType') != '1' ) more.hide();
	}
	//获取更多评论
	var getMoreComment = function(event){
		var inputText = $(this).closest('.event-content').find('textarea');
		$.get(options.showURL + '?feedId=' + inputText.attr('feedId') + '&groupId=' + inputText.attr('groupId') + '&r=' + Math.random(), function(data) {
			var comm = inputText.parent().prev();
			comm.empty().append(data).show();
		});
		$(this).remove();
	};
	//发送评论
	var postComment = function(event){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

		var self = $(this), cont = self.closest('.event-content'), commInput = cont.find('.event-comment-input'),
			inputText = commInput.find('textarea'), commList = cont.find('.event-comments'), commMore = cont.find('[js="event-comments-more"]'),
			gid = inputText.attr('groupId'),
			fid = inputText.attr('feedId'),
			pid = inputText.attr("pid"),
			pname = inputText.attr("pname");
		var body = $.trim(inputText.val()).toText();
		if( body == '' || ( inputText.attr('defaultTips') && inputText.attr('defaultTips') == body ) ){
			pop_alert(lang.feed.input_tip);
			return false;
		}
		if( $.trim(inputText.data('replyTemp')) == body ){
			pop_alert(lang.feed.input_tip);
			return false;
		}
		if( body.length > 200 ){
			pop_alert(lang.endorse.limit_200);
			return false;
		}
		self.attr('disabled', true);
		$.post(options.addCommentURL,
			{groupId: gid, feedId: fid, pid: pid, pname: pname, commBody: body},
			function(data) {
				if (data == 0) {
					$.get(options.showURL + '?feedId=' + fid + '&groupId=' + gid, function(data1){
						commList.empty().append(data1).show();
						commMore.hide();
						inputText.removeData('replyTemp').val('').blur();
						setTimeout(function() {
							self.attr('disabled', false);
						}, 500);
					});
					var cnt = self.closest('.event-content').find('.action').find('[js="commentCnt"]');
					var n = ( cnt.text() == '' ) ? 1 : parseInt(cnt.text().replace(/\(|\)/g, ''), 10) + 1;
					cnt.text('(' + n + ')');
				} else {
					pop_alert(lang.common.submit_failure);
					self.attr('disabled', false);
				}
			});
		return false;
	};
	//添加回复评论
	var addComment = function(event){
		var btn = $(this), uid = btn.attr('uid'), uname = btn.attr('uname');
			text = btn.closest('.event-content').find('textarea');
		var lastname = text.attr("lastname"), s = text.val();
		if( text.attr('defaultTips') ) s = s.replace(text.attr('defaultTips'), '');
		if( lastname && s ){
			if( s.indexOf(lang.group.answer + lastname + ':') == 0 ){
				s = text.val().replace(lastname, uname);
			} else {
				s = lang.group.answer + uname + ': ' + s;
			}
		} else {
			if( s != lang.feed.comment_tips ){
				s = lang.group.answer + uname + ': ' + s;
			} else {
				s = lang.group.answer + uname + ': ';
			}
		}
		text.click().val(s).data('replyTemp', s).focus();
		setTimeout(function(){text.trigger('focus');}, 300);
		text.attr({
			lastname: uname,
			pid: uid,
			pname: uname
		});
		return false;
	};
	
	//显示分享的大图
	var showShareImage = function(){
		var a = $(this), cont = a.closest('.event-share-image');
		a.hide();
		cont.addClass('event-box').find('>div').show();
		return false;
	}
	//隐藏分享的大图
	var hideShareImage = function(){
		var a = $(this), cont = a.closest('.event-share-image');
		cont.removeClass('event-box').find('>div').hide();
		cont.find('>img').show();
		return false;
	}
	
	//关注、取消关注问题
	var unfollowQuestion = function(){
		var a = $(this), p = a.parent(), qid = p.attr('qid');
		$.get(options.unfollowQuestion, {"questionId": qid}, function(){
			p.find('>a').hide();
			p.find('>a[js="followQuestion"]').show();
		});
	}
	var followQuestion = function(){
		var a = $(this), p = a.parent(), qid = p.attr('qid');
		$.get(options.followQuestion, {"questionId": qid}, function(){
			p.find('>a').hide();
			p.find('>a[js="unfollowQuestion"]').show();
		});
	}
	
	//feed hover
	var feedEnter = function(){
		$('[weiboReport]', this).show();
		$('.common-close', this).css('display', 'inline-block');
	}
	var feedLeave = function(){
		$('[weiboReport]', this).hide();
		$('.common-close', this).hide();
	}

	return this.each(function(){
		var feed = $(this);
		
		//获取更多feed
		feed.delegate('[js=moreFeedDiv] a', 'click', function(){
			return getMoreFeed.call(this, feed);
		});
		//删除feed
		feed.delegate('[js=deleteFeed]', 'click', deleteFeed);
		//收藏
		feed.delegate('[js=fav_span] a', 'click', favFeed);

		//转发微博
		feed.delegate('[js=retweet_span] a', 'click', retweetFeed);
		feed.delegate('a[name="a_retweethistorylink"]', 'click', viewRetweetHistory);
		//微博举报
		feed.delegate('a[weiboReport]', 'click', weiboReport);
		//查看微博详情
		feed.delegate('a[viewblog]', 'click', viewBlog);
		
		//显示分享的大图
		feed.delegate('[js="shareImageM"]', 'click', showShareImage);
		//隐藏分享的大图
		feed.delegate('[js="shareImageS"]', 'click', hideShareImage);

		//显示评论
		feed.delegate('[js=insertComm]', 'click', showComment);
		feed.delegate('[js=textComm]', 'focus', function(){
			$(this).height(80).next().show();
		});
		feed.delegate('[js=textComm]', 'blur', function(){
			var text = $(this);
			if( text.val() == '' || text.val() == text.attr('defaultTips') ){
				setTimeout(function(){
					text.height(20).next().hide();
				}, 200);
			}
		});
		feed.delegate('[js="event-comments-more"] a', 'click', showMoreReply);
		//发送评论
		feed.delegate('[js=postComm]', 'click', postComment);
		//添加回复评论
		feed.delegate('[js=addComment]', 'click', addComment);
		//删除评论
		feed.delegate('[js=deleteComment]', 'click', deleteComment);
		//关注、取消关注问题
		feed.delegate('[js="unfollowQuestion"]', 'click', unfollowQuestion);
		feed.delegate('[js="followQuestion"]', 'click', followQuestion);

		//绑定feed hover
		feed.delegate('.feed-block', 'mouseenter', feedEnter);
		feed.delegate('.feed-block', 'mouseleave', feedLeave);
	});
	
}

//@系统组件
$.fn.atSystem=function(options){
	var defaults={
		cssClass:'atlist-frame ac-dp-list vcard header-ajax-list',
		recordField:'',
		maxAmount:5,
		ignoreCase:true,
		clearRecordField:true
	};
	var options=$.extend(defaults,options);
	var _atList=new Array();
	var _recentList=new Array();
	
	$.ajax({
		url:'/feed/feed!loadRecentFriends.jhtml',
		type:'POST',
		dataType:'text',
		cache:false,
		success:function(r){
			_recentList=eval(r);
		}
	})
	
	$.ajax({
		url:'/feed/feed!loadAllAtFriends.jhtml',
		type:'POST',
		dataType:'text',
		cache:false,
		success:function(r){
			_atList=eval(r);
		}
	});
	
	function at_autocomplete(_textarea,_event){
		var _str=_textarea.val();
		var _crtPos=get_cursort_position(_textarea[0]);
		var _searchStr;

		if (_str.slice(0,_crtPos).search('@')!=-1){
			var _lastAtPos=_str.slice(0,_crtPos).lastIndexOf("@")+1;
			var _strRpt;
			var _offset;
			var _left;
			var _top;
			
			if (_event.keyCode===13){
				select_default(_textarea,_lastAtPos,_crtPos);
			} else{
				$('[js="atlist_frame"]').remove();
			}

			_searchStr=_str.slice(_lastAtPos,_crtPos);		
			_strRpt=_str.slice(0,_lastAtPos)+'<span js="cursor">&nbsp;</span>'+_str.slice(_lastAtPos,_str.length);
			_strRpt=_strRpt.replace(/\n/g,'<br />');
			$('[js="text_copy"]').html(_strRpt).show();
			var _scroll=_textarea.scrollTop();
			$('[js="text_copy"]').scrollTop(_scroll);
			_offset=$('[js="cursor"]').offset();
			_left=_offset.left+3;
			_top=_offset.top+18;
			$('[js="text_copy"]').hide();
			
			if (_searchStr.length===0){
				var _nameBox=$('<div class="'+options.cssClass+'" js="atlist_frame"><ul><li js="at_title" class="quiet"></li>'+return_recent()+'</ul></div>');
				if (_nameBox.find('li').length>1){
					$("body").append(_nameBox);
					_nameBox.css({"z-index":"10000","left":_left,"top":_top});
					$('[js="at_title"]').html(lang.feed.at_choose);
				}
			} else{
				if (options.ignoreCase){
					_searchStr=_searchStr.toLowerCase();
				}
				var _patrn=new RegExp('^([a-zA-Z0-9]|[\u4e00-\u9fa5]|[_]){1,20}$');
				if (_patrn.exec(_searchStr)){
					var _nameBox=$('<div class="'+options.cssClass+'" js="atlist_frame"><ul><li js="at_title" class="quiet"></li>'+search_word(_searchStr)+'</ul></div>');
					$("body").append(_nameBox);
					_nameBox.css({"z-index":"10000","left":_left,"top":_top});
					if (_nameBox.find('li').length>1){
						$('[js="at_title"]').html(lang.feed.at_blank);
					} else{
						$('[js="at_title"]').html(lang.feed.at_miss);
					}
				}
			}
			namelist_click(_textarea,_lastAtPos,_crtPos);
		}
	}
	
	function search_word(_str){
		var _ret="";
		var _count=0;
		var _matchArr=[];

		if (_atList.length>0){
			for (i=0;i<_atList.length;i++){
				if (options.ignoreCase){
					_atList[i].fullname_=_atList[i].fullname_.toLowerCase();
				}
				var _rank=_atList[i].fullname_.indexOf(_str);
				if (_rank!=-1&&_count<options.maxAmount){
					_matchArr.push({"index":i,"rank":_rank,"name":_atList[i].fullname_});
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
					var _index=_matchArr[i].index;
					_ret+='<li js="at_item" class="at-item" uid="'+_atList[_index].userid_+'"><a><img src="'+_atList[_index].avatarEmail30_+'" /></a><dl><dt><a>'+_atList[_index].fullname_+'</a></dt><dd>'+_atList[_index].careerbrief_+'</dd></dl></li>';
				}
			}
		}
		return _ret;
	}
	
	function return_recent(){
		var _ret="";
		var _count=_recentList.length;
		for (i=0;i<_count;i++){
			_ret+='<li js="at_item" class="at-item" uid="'+_recentList[i].userid_+'"><a><img src="'+_recentList[i].avatarEmail30_+'" /></a><dl><dt><a>'+_recentList[i].fullname_+'</a></dt><dd>'+_recentList[i].careerbrief_+'</dd></dl></li>';
		}
		return _ret;
	}

	function namelist_click(_textarea,_atPos,_curPos){
		$('[js="at_item"]').click(function(){
			var _textStr=_textarea.val();
			var _nameStr=$(this).find("dt").children().html();
			var _userId=$(this).attr('uid');
			_textStr=_textStr.slice(0,_atPos)+_nameStr+" "+_textStr.slice(_curPos,_textStr.length);
			_textarea.val(_textStr).focus();

			if (_textarea[0].setSelectionRange){  
				_textarea[0].setSelectionRange(_textarea.val().length,_textarea.val().length);
			}
			
			$('[name="'+options.recordField+'"]').val($('[name="'+options.recordField+'"]').val()+'"'+_nameStr+'":'+_userId+';');
			$('[js="atlist_frame"]').remove();
		});

		setTimeout(function(){
			$(document).unbind('click.atSystem').bind('click.atSystem', function(){
				$('[js="atlist_frame"]').remove();
			});
		}, 50);
	}
	
	//键盘回车事件
	function select_default(_textarea,_atPos,_curPos){
		var _frame=$('[js="atlist_frame"]');
		if (_frame.length>0){
			var _textStr=_textarea.val();
			var _nameStr=_frame.find('dt').eq(0).children().html();
			var _userId=_frame.find('li').eq(0).attr('uid');
			_textStr=_textStr.slice(0,_atPos)+_nameStr+" "+_textStr.slice(_curPos,_textStr.length);
			_textarea.val(_textStr).focus();
	
			if (_textarea[0].setSelectionRange){  
				_textarea[0].setSelectionRange(_textarea.val().length,_textarea.val().length);
			}
			
			$('[name="'+options.recordField+'"]').val($('[name="'+options.recordField+'"]').val()+'"'+_nameStr+'":'+_userId+';');
			_frame.remove();
		}
	}

	//获取光标位置函数
	function get_cursort_position(_ctrl){
		var _caretPos=0;
		if (document.selection){
			_ctrl.focus();
			var _sel = document.selection.createRange();
			_sel.moveStart('character', -_ctrl.value.length);
			_caretPos = _sel.text.length;
		} else if (_ctrl.selectionStart || _ctrl.selectionStart==='0'){
			_caretPos=_ctrl.selectionStart;
		}
		return (_caretPos);
	}
	
	this.each(function(){
		var _this=$(this);
		_this.parent().css("position","relative");
		var _div=$('<div js="text_copy"></div>');
		var _position=_this.position();
		if (options.clearRecordField){
			$('[name="'+options.recordField+'"]').val('');
		}
		
		_this.parent().append(_div);
		_div.css({"position":"absolute","left":_position.left+parseInt(_this.css("margin-left")),"top":_position.top,
		 "overflow":"auto","width":_this.width(),"height":_this.height(),
		 "padding-top":_this.css("padding-top"),"padding-right":_this.css("padding-right"),"padding-bottom":_this.css("padding-bottom"),"padding-left":_this.css("padding-left"),
		 "border-top-width":_this.css("border-top-width"),"border-right-width":_this.css("border-right-width"),"border-bottom-width":_this.css("border-bottom-width"),"border-left-width":_this.css("border-left-width"),
		 "border-top-style":_this.css("border-top-style"),"border-right-style":_this.css("border-right-style"),"border-bottom-style":_this.css("border-bottom-style"),"border-left-style":_this.css("border-left-style"),
		 "border-top-color":_this.css("border-top-color"),"border-right-color":_this.css("border-right-color"),"border-bottom-color":_this.css("border-bottom-color"),"border-left-color":_this.css("border-left-color"),
		 "font-size":_this.css("font-size"),"font-family":_this.css("font-family"),"line-height":_this.css("line-height")});
		_div.hide();

		_this.bind({
			'keyup':function(e){at_autocomplete(_this,e);},
			'click':function(){at_autocomplete(_this,{});}
		});
		
	});
	return this;
}
