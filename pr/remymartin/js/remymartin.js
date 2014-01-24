$(function(){
	//发布活动
	$('[js="showAddEvent"]').click(showAddEvent);

	//上传照片
	$('[js="uploadEventPic"]').click(uploadEventPic);
	//修改照片
	$('[js="modifyPhoto"]').click(modifyEventPic);
	//删除照片
	$('[js="deletePhoto"]').click(function(){
		if( window.isLogin != true ){
			goLogin();
			return false;
		}
		var img = $('.remy-img1', '#imageCont'), imgId = parseInt(img.attr('del'), 10);
		if( imgId > 0 ){
			pop_confirm(null, '确实要删除该照片吗？',
				function(){
					$.get('/pr/remyMartin!deleteImg.jhtml?imgId=' + imgId, function(){
						location.reload(true);
					});
				}
			);
		}
	});
});

function goLogin(){
	location.href = '/login.jhtml';	
}

//上传照片 ************************************************
function uploadEventPic(event){
	if( window.isLogin != true ){
		goLogin();
		return false;
	}
	var pop = $($('#uploadEventPic').html());
	pop.popupLayer({
		width: 722,
		modal: true,
		overlay: 0.3,
		closeDestroy: true,
		reserve: false,
		clickClose: false,
		open: function(){
			_gaq.push(['_trackPageview', 'upload']);
			initUploadEvent(pop);
		},
		beforeClose: function(event, ui){
			var ias = ui.find('img[js="selectPhoto"]').data('imgAreaSelect');
			ias && ias.remove();
		}
	});
}
function modifyEventPic(event){
	if( window.isLogin != true ){
		goLogin();
		return false;
	}
	var img = $('.remy-img1', '#imageCont');
	var pop = $($('#uploadEventPic').html());
	pop.popupLayer({
		width: 722,
		modal: true,
		overlay: 0.3,
		closeDestroy: true,
		reserve: false,
		clickClose: false,
		open: function(){
			pop.find('form').attr('action', '/pr/remyMartin!editImg.jhtml');
			pop.find('[name="descriptions"]').val(img.attr('desc'));
			initUploadEvent2(pop, img.attr('photo'), function(){
				location.reload(true);
			});
		},
		beforeClose: function(event, ui){
			var ias = ui.find('img[js="selectPhoto"]').data('imgAreaSelect');
			ias && ias.remove();
		}
	});
}

function initUploadEvent(pop){
	pop.find('[js="step1"]').show();
	pop.find('form').attr('action', '/pr/remyMartin!confirmUpload.jhtml');

	var evtslt = pop.find('select[name="eventId"]');
	var upcont = pop.find('[js="uploadLinkCont"]'), up = pop.find('[js="uploadLink"]');
	function unUpload(){
		upcont.find('[js="uploadMask"]').show();
		upcont.css('opacity', 0.3);
	}
	pop.find('[js="sltNum"]').change(function(){
		unUpload();
		if( $(this).val() == '' ){
			evtslt.val('');
			return false;
		}
		$.getJSON('/pr/remyMartin!getEventsByStageNum.jhtml?stageNum=' + $(this).val(), function(json){
			unUpload();
			evtslt.find('option:first').attr('selected', true);
			evtslt.find('option:gt(0)').remove();
			for( var i = 0; i < json.events.length; i++ ){
				evtslt.append('<option value="' + json.events[i].id + '">' + json.events[i].name + '</option>');
			}
		});
	});

	unUpload();
	upcont.find('[js="uploadMask"]').css('opacity', 0);
	evtslt.change(function(){
		if( $(this).val() == '' ){
			unUpload();
		} else {
			upcont.find('[js="uploadMask"]').hide();
			upcont.css('opacity', 1);
		}
	});

	up.uploadFile({
		type: 'ajax',
		action: '/pr/remyMartin!uploadImg.jhtml',
		dataType: 'text',
		name: 'eventImg',
		success: function(data){
			pop.find('div[js="popMask"]').hide();
			var r = data.split(',');
			var id = parseInt(r[0], 10);
			if( id < 0 ){
				pop_alert('仅支持上传5M以内的JPEG,PNG格式图片');
				return false;
			}
			initUploadEvent2(pop, data, function(){
				location.href = '/pr/remyMartin!share.jhtml';
			});
		},
		onChange: function(){
			pop.find('div[js="popMask"]').show();
		}
	});
}
function initUploadEvent2(pop, data, callback){
	pop.find('[js="step1"]').hide();
	var form = pop.find('form'), step2 = pop.find('[js="step2"]');
	form.width(690);
	form.ajaxForm({
		ajaxOptions: {
			success: function(){
				if( $.isFunction(callback) ) callback();
			}	
		}	
	});

	step2.show();
	var pic = data.split(',');
	step2.find('input[name="imgIds"], input[name="imgId"]').val(pic[0]);
	var img = step2.find('img[js="selectPhoto"]'), pimg = step2.find('[js="photoPreview"]');
	img.attr({
		"src": pic[1],
		"w": pic[2],
		"h": pic[3]
	}).load(photoLoaded);
	function photoLoaded(){
		var opt = {
			picW: 330,
			picH: 310,
			blockW: 300,
			blockH: 225,
			pic: $(this)
		}
		var dw = 447;

		var picArea = {x: 0, y: 0, z: 0, w1: 0, w2: 0}, w = parseInt(opt.pic.attr('w'), 10), h = parseInt(opt.pic.attr('h'), 10);
		var scale = Math.min(opt.picW / w, opt.picH / h, 1);

		opt.picW = scale * w;
		opt.picH = scale * h;
		opt.pic.css({width: Math.ceil(opt.picW) + 'px', height: Math.ceil(opt.picH) + 'px'});

		var box = {x1: 0, y1: 0, x2: opt.picW, y2: opt.picH, width: opt.picW, height: opt.picW * 3 / 4};
		if( h / w > 3 / 4 ){
			box.y1 = (opt.picH - box.height) / 2;
			box.y2 = box.y1 + box.height;
		} else {
			box.height = opt.picH;
			box.width = box.height / 3 * 4;
			box.x1 = (opt.picW - box.width) / 2;
			box.x2 = box.x1 + box.width;
		}

		var preview = function (img, selection) {
			var scaleX = opt.blockW / (selection.width || 1);
			var scaleY = opt.blockH / (selection.height || 1);
			pimg.find('>img').css({width: Math.round(scaleX * opt.picW) + 'px', height: Math.round(scaleY * opt.picH) + 'px', marginLeft: '-' + Math.round(scaleX * selection.x1) + 'px', marginTop: '-' + Math.round(scaleY * selection.y1) + 'px' });
		};

		opt.pic.imgAreaSelect({
			aspectRatio: '4:3',
			imageHeight: opt.picH,
			imageWidth: opt.picW,
			minWidth: 40,
			minHeight: 30,
			x1: box.x1,
			y1: box.y1,
			x2: box.x2,
			y2: box.y2,
			onSelectChange: function(img, selection){
				if( selection.width ){
					preview(img, selection);
				}
			},
			onSelectEnd: function(img, selection){
				if( selection.width ){
					/*
					var s = dw / selection.width;
					picArea.z = opt.picW / selection.width * (dw / w);
					picArea.x = selection.x1 * s;
					picArea.y = selection.y1 * s;
					*/
					picArea.x = selection.x1;
					picArea.y = selection.y1;
					picArea.w1 = selection.width;
					picArea.w2 = opt.picW;
				}
			}
		});
		pimg.css({position: 'relative', overflow: 'hidden', width: opt.blockW + 'px', height: opt.blockH + 'px'}).append('<img src="' + opt.pic.attr('src') + '" style="position: relative;" />');
		setTimeout(function(){
			preview(opt.pic, box);
			/*
			var s = dw / box.width;
			picArea.z = opt.picW / box.width * (dw / w);
			picArea.x = box.x1 * s;
			picArea.y = box.y1 * s;
			*/
			picArea.x = box.x1;
			picArea.y = box.y1;
			picArea.w1 = box.width;
			picArea.w2 = opt.picW;
		}, 200);

		step2.find('[js="upEnd"]').click(function(){
			$('[name=x]', step2).val(picArea.x);
			$('[name=y]', step2).val(picArea.y);
			$('[name=z]', step2).val(picArea.z);
			$('[name=w1]', step2).val(picArea.w1);
			$('[name=w2]', step2).val(picArea.w2);
			form.submit();
			setTimeout(function(){
				pop.popupLayer('close');
			}, 200);
		});
	}
}
function initUploadEvent3(pop, data){
	pop.find('[js="step1"]').hide();
	var step2 = pop.find('[js="step2"]'), list = pop.find('.uploading-photo'), uplink = step2.find('[js="upLink"]');
	var html = '<li><dl><dt><img src="#src#" alt="" /><input type="hidden" name="imgIds" value="#id#" /></dt><dd>照片描述：<br /><textarea name="descriptions" maxlength="100"></textarea></dd></dl></li>';
	step2.show();
	function insertImg(d, idx){
		pop.find('div[js="popMask"]').hide();
		d = d.split(',');
		var id = parseInt(d[0], 10);
		if( id < 0 ){
			if( id == -1 ){
				var msg = '仅支持上传5M以内的JPEG,PNG格式图片';
			} else if( id == -2 ){
				var msg = '仅支持上传5M以内的JPEG,PNG格式图片';
			} else if( id == -3 ){
				var msg = '该照片已在其他活动中上传过';
			}
			if( idx == 1 ){
				pop.find('[js="step1"]').show();
				step2.hide();
			}
			pop_alert(msg);
			return false;
		}
		var newli = $(html.replace('#id#', d[0]).replace('#src#', d[1]));
		uplink.closest('li').before(newli);
		newli.find('textarea').checkFieldLength();
		list.find('>li:gt(5)').hide();
		if( list.find('>li').length >= 7 ){
			step2.find('[js="upAgain"]').show();
		}
	}
	insertImg(data, 1);
	uplink.uploadFile({
		type: 'ajax',
		action: '/pr/remyMartin!uploadImg.jhtml',
		dataType: 'text',
		name: 'eventImg',
		success: insertImg,
		onChange: function(){
			pop.find('div[js="popMask"]').show();
		}
	});

	pop.ajaxForm({
		ajaxOptions: {
			success: function(){
				list.find('>li:last').show();
				list.find('>li').not(':last').remove();
			}
		}
	});

	step2.find('[js="upAgain"]').click(function(){
		$(this).hide();
		pop.submit();
	});
	step2.find('[js="upEnd"]').click(function(){
		pop.submit();
		setTimeout(function(){
			pop.popupLayer('close');
			//location.reload(true);
			location.href = '/pr/remyMartin!share.jhtml';
		}, 200);
	});
}

//发布活动 ************************************************
function showAddEvent(event){
	if( window.isLogin != true ){
		goLogin();
		return false;
	}
	var html = $('#addEventPop');
	if( html.length == 0 ) return;
	html = html.html();
	var pop = $(html);
	pop.popupLayer({
		width: 512,
		modal: true,
		overlay: 0.3,
		closeDestroy: true,
		reserve: false,
		clickClose: false,
		open: function(){
			_gaq.push(['_trackPageview', 'apply']);
			initAddEvent(pop);
		},
		clickPopup: function(){
			$('.DateSelect').hide();
		}
	});
}

function initAddEvent(pop){
	// 初始化的时候格式化时间
	var now = new Date();
	var sd = now.format('yyyy-MM-dd');
	var st = '0' + Math.min(now.getHours() + 3, 23);
	st = st.slice(st.length - 2) + ':30';
	pop.find('[name="event.beginHourAndMinute"]').val(st);
	pop.find('[name="event.beginDate"]').val(sd);
	pop.find('[showEndTime]').click(function(){
		pop.find('[js=' + $(this).hide().attr('showEndTime') + ']').show();
	});
	pop.find('[dateSelect]').attr('readonly', true).focus(function(){
		DateSelect({
			back: this,
			lang: lang.lang,
			onSelectBack:function(date){
				this.value = date.back;
				checkNeedEnd(this.value + '-' + pop.find('[name="event.beginHourAndMinute"]').val(), pop);
				return true;
			}
		});
	}).click(function(event){
		event.stopPropagation();
	});
	pop.find('[name="event.beginHourAndMinute"]').bind('change', function(){
		checkNeedEnd(pop.find('input[name="event.beginDate"]').val() + '-' + $(this).val(), pop);
	});

	var form = pop.find('form:first');
	form.ajaxForm({
		validate: {
			fieldParent: 'li',
			ignoreHidden: true,
			extTools: {
				isEndTime: checkEndTime
			},
			afterValidate: function(evt, r){
				if( r.result == true ) form.find('.loading').css('display', 'inline-block');
			}
		},
		ajaxOptions: {
			success: function(data){
				showShareEvent(data, pop);
			}
		}
	});
	pop.find('[js="shareSureSubmit"]').click(function(){
		form.submit();
	});

   	pop.find('[name="event.eventname"]').autocomplete({
		url:'/event/manage!getEventNameRecommend.jhtml',
		ajax:'list',
		listContClass:'input-dropmenu',
		listClass:'Event_Title_search',
		hoverClass:'msover',
		li_id:['id_','title_','addr_','time_','num_','more_'],
		li_template: '<li class="border-bottom" index="%1"><a style="color:#06a" href="/event/view!viewDetail.jhtml?id=%1" target="_blank" litext="y">%2</a><br /><span class="quiet">%3</span> | <span class="quiet">%4</span> | <span class="quiet">%5</span>人参加</li>',
		ajaxKey:'keyword',
		width:360,
		position:{offset:'-55 1'},
		selected: function(event, li){
			if(event.keyCode){
				if(event.keyCode==13){
					$(this).val(li.find('a').text())
				}else{
					window.location = li.find('a').attr('href'); //点击的时候跳转到活动页面
				}
			}
			return false;
		},
		onefocus:function(){
			returnValue = false;
		}
	});
}

function showShareEvent(data, pop){
	var evt = data.split(','), share = pop.find('[js="shareEventUl"]');
	pop.find('form:first').hide();
	share.show();
	_gaq.push(['_trackPageview', 'share']);

	ushiBshare.init({
		url: 'http://www.ushi.com/event/view!viewDetail.jhtml?id=' + evt[0],
		content: evt[1],
		summary: evt[1],
		title: '分享活动'
	});
	pop.find('a[class^=bshare]').bind('click', ushiBshareClick);

	pop.find('[js="friendSelectList"]').friendSelectList({
		url: '/msg/message!getFriends.jhtml',
		idField: pop.find('[js="receiverId_event"]'),
		inviteMax:10,
		width:460,
		fsParam: {
			prompt: lang.friend.fs_max_info(10),
			width: 826
		}
	});

	var tabli = share.find('.tabs-sub li');
	tabli.click(function(){
		tabli.removeClass('current');
		$(this).addClass('current');
		share.find('[invite]').hide().filter('[invite=' + $(this).attr('js') + ']').show();
	});

	var form = share.find('form');
	form.find('[js="inviteSubmit"]').click(function(){
		if( form.find('[invite="ushi"]').is(':visible') ){
			form.find('[name="inviteMails"]').val('');
		} else {
			form.find('[name="inviteIds"]').val('');
		}
		form.submit();
	});
	form.find('[js="eventId"]').val(evt[0]);
	form.ajaxForm({
		validate: {
			fieldParent: 'div'
		},
		ajaxOptions: {
			success: function(){
				pop.popupLayer('close');
				if( pageType == 'index' ) location.reload(true);
			}
		}
	});
}

function formatDT(sdt){
	var dt = sdt.split(/-|:|\s/);
	return new Date(fd(dt[0]), fd(dt[1]) - 1, fd(dt[2]), fd(dt[3]), fd(dt[4]));
}
function fd(d){
	return parseInt(d, 10);
}
function compareDate(sd, ed){
	sd = formatDT(sd);
	ed = formatDT(ed);
	if( ed <= new Date() ){
		return 1;
	} else if( sd >= ed ){
		return 2;
	} else {
		if( ed.getTime() - sd.getTime() > 3600000 * 24 * 30	){
			return 3;
		}
		return 0;
	}
}
function checkNeedEnd(sdt, pop){
	if( getEndTime(formatDT(sdt)) < new Date() ){
		pop.find('[showEndTime="endTimeli"]').click();
		resetEndTime(sdt, pop);
	} else {
		if( pop.find('[js=endTimeli]').is(':visible') ){
			resetEndTime(sdt, pop);
		}
	}
}
function getEndTime(dt){
	return new Date(dt.getTime() + 7200000);
}
function resetEndTime(sdt, pop){
	var edt = getEndTime(formatDT(sdt));
	var sed = edt.format('yyyy-MM-dd');
	var set = edt.format('hh:mm');
	pop.find('[name="event.endDate"]').val(sed);
	pop.find('[name="event.endHourAndMinute"]').val(set);
}

function checkEndTime(str, opt){
	if( str == '' ) return true;
	var field = opt['field'], form = field.closest('form'), p = opt['parent'], tips = p.find('[js="vdErr"]');
	var stTime = form.find('[name="event.beginDate"]').val() + ' ' + form.find('[name="event.beginHourAndMinute"]').val();
	var edTime = form.find('[name="event.endDate"]').val() + ' ' + form.find('[name="event.endHourAndMinute"]').val();
	var n = compareDate(stTime,edTime)
	if(n==1){
		tips.text(lang.event.add_time_err1)
		return false
	}else if(n==2){
		tips.text(lang.event.add_time_err2)
		return false
	}else if(n==3){
		tips.text(lang.event.add_time_err3)
		return false
	}
	return true;
}

//播放视频
function playVideo(index, autoplay){
	var video_txt = '<video width="446" height="310" id="player'+ index + '" controls="controls" preload="auto" autoplay="'+autoplay+'">' +
		'<!-- MP4 source must come first for iOS --><source type="video/mp4" src="http://remycentaure2012.macrode.com/video/video'+ index + '.mp4" />' +
		'<!-- WebM for Firefox 4 and Opera --><source type="video/webm" src="http://remycentaure2012.macrode.com/video/video'+ index + '.webm" />' +
		'<!-- OGG for Firefox 3 --><source type="video/ogg" src="http://remycentaure2012.macrode.com/video/video'+ index + '.ogv" />' +
		'<!-- Fallback flash player for no-HTML5 browsers with JavaScript turned off -->' +
		'<object width="446" height="310" type="application/x-shockwave-flash" data="http://remycentaure2012.macrode.com/js/flashmediaelement.swf">' +
		'<param name="movie" value="js/flashmediaelement.swf" />' +
		'<param name="allowFullScreen" value="true" />' +
		'<param name="flashvars" value="controls=true&amp;file=http://remycentaure2012.macrode.com/video/video'+ index + '.mp4" />' +
		'<!-- Image fall back for non-HTML5 browser with JavaScript turned off and no Flash player installed -->' +
		'<img src="http://remycentaure2012.macrode.com/img/video'+ index + '.jpg" width="446" height="310" alt="Here we are" title="No video playback capabilities" /></object></video>'

	$(".vBox").html("").html(video_txt);

	$('video').mediaelementplayer({
		success: function(player, node) {
			$('#' + node.id + '-mode').html('mode: ' + player.pluginType);
		}
	});
}