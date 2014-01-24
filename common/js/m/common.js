/** 扩展 iui ***********************************************/
window.iui['showListByHtml'] = function(href, args, method, replace) {
	function spbhCB(xhr) {
		if (xhr.readyState == 4)
		{
			var frag = document.createElement("UL");
			frag.innerHTML = xhr.responseText;
			sendEvent("beforeinsert", document.body, {fragment:frag})
			appendDataList(replace, frag);
		}
	};
	iui.ajax(href, args, method, spbhCB);
};
window.iui['showFirstPage'] = function(href, args, method)
{
	function spbhCB(xhr)
	{
		if (xhr.readyState == 4)
		{
			var frag = document.createElement("div");
			frag.innerHTML = xhr.responseText;
			sendEvent("beforeinsert", document.body, {fragment:frag})
			iui.insertPages(frag);
		}
	};
	iui.ajax(href, args, method, spbhCB);
};
window.iui['getText'] = function(href, cb, post){
	function spbhCB(xhr) {
		if (xhr.readyState == 4) {
			if( cb ){
				cb(xhr.responseText);
			}
		}
	};
	iui.ajax(href, post, (post ? 'POST' : 'GET'), spbhCB);
};

/** common ***********************************************************/

var bgLoading = '<span class="icoPageLoading"></span>';

function scrollTop(toTop){
	var fromTop = window.pageYOffset, h = toTop - fromTop, t = 0;
	function start(){
		t ++;
		if( t <= 10 ){
			scrollTo(0, fromTop + h * easeOutCirc(t * 50 / 500, t * 50, 0, 1, 500));
			setTimeout(start, 50);
		}
	}
	start();
}
function easeOutCirc (x, t, b, c, d) {
	return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
}
function offset(node){
	var valueT = 0, valueL = 0;
	do {
		valueT += node.offsetTop  || 0;
		valueL += node.offsetLeft || 0;
		node = node.offsetParent;
	} while (node);
	return {'left': valueL, 'top': valueT};
}

function appendDataList(replace, frag)
{
	var page = replace.parentNode;
	var parent = replace;
	while ( page.getAttribute('type') != 'ajaxList' )
	{
		page = page.parentNode;
		parent = parent.parentNode;
	}
	var toTop = offset(parent)['top'];
	page.removeChild(parent);

    var docNode;
	while (frag.firstChild) {
		docNode = page.appendChild(frag.firstChild);
		sendEvent("afterinsert", document.body, {insertedNode:docNode});
    }

	setTimeout(function(){
		scrollTop(toTop);
	}, 100);
}

var dialogs = {
	_close: function(dlg, target){
		if( !dlg ) return false;
		if( dlg.beforeClose )
			dlg.beforeClose.apply(dlg.element, [target]);
		dlg.element.style.display = 'none';
		dlg.showing = false;
	},
	_open: function(dlg, cb){
		if( !dlg ) return false;
		if( dlg.showing ) return;
		if( dlg.beforeOpen )
			dlg.beforeOpen.apply(dlg.element);
		dlg.element.style.display = 'block';
		try{
			dlg.element.style.height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) + 'px';
			dlg.element.firstElementChild.style.marginTop = (window.pageYOffset + 30) + 'px';
		}catch(e){}
		dlg.showing = true;
		if( cb )
			cb.apply(dlg.element);
	}
};
function getDialog(dlg){
	if( typeof(dlg) == 'string' ){
		var obj = dialogs[dlg];
	} else {
		var obj = dialogs[dlg.id];
	}
	return obj || null;
}
function initDialog(dlg, beforeOpen, beforeClose){
	dlg = $(dlg);
	if( !dlg ) return null;
	if( !dlg.id ) dlg.id = 'dlg' + new Date().getTime();		
	var obj = dialogs[dlg.id];
	if( !obj ){
		obj = dialogs[dlg.id] = {};
		if( beforeOpen ) obj.beforeOpen = beforeOpen;
		if( beforeClose ) obj.beforeClose = beforeClose;
		obj.showing = false;
		obj.element = dlg;
		dlg.addEventListener("click", function(event){
			var div = findParent(event.target, "div");
			if( hasClass(div, 'dialog') ){
				dialogs._close(obj, div);
			} else {
				event.preventDefault();
			}
		}, true);
		var close = getElementsByClassName('closeDialogBtn', dlg, 'a');
		for( var i =0; i < close.length; i++ ){
			close[i].onclick = function(){
				dialogs._close(obj, close[i]);
			}
		}
	}
	return obj;
}
function openDialog(dlg, cb){
	var obj = getDialog(dlg);
	if( !obj )
		obj = initDialog(dlg);
	dialogs._open(obj, cb);
}
function closeDialog(dlg){
	dialogs._close(getDialog(dlg));
}

/************************************************************/

// 返回首页
function goHome(){
	location.href = '/event/web2!main.jhtml';
}

//打开日历
function showStartCale(span, cb){
	cale.showCalendar(span.innerHTML, function(d){
		span.innerHTML = d;
		if( cb ){
			cb(d);
		} else {
			$('eventEndDate').innerHTML = d;
		}
	});
}
function showEndCale(span){
	cale.showCalendar(span.innerHTML, function(d){
		span.innerHTML = d;
	});
}

// ajax载入列表
function ajaxGetList(href, link, method, param){
	link.setAttribute("selected", "loading");
	href += href.indexOf('?') > -1 ? '&' : '?';
	var ul = findParent(link, 'ul'), pageNo = parseInt('0' + ul.getAttribute('pageNo'), 10);
	var lic = 0;
	for( var i = 0; i < ul.childNodes.length; i++ ){
		if( ul.childNodes[i].nodeType == 1 && hasClass(ul.childNodes[i], 'listCont') )
			lic++;
	}
	iui.showListByHtml(href + 'pageNo=' + (++pageNo) + '&n=' + lic, param || null, method || "GET", link);
	ul.setAttribute('pageNo', pageNo);
}

// 加为关注
function addFollow(uid, a){
	showPreload();
	iui.getText('/event/web2!addfollow.jhtml?userid=' + uid, function(data){
		data = parseInt(data, 10);
		if( data == 1 ){
			alert(lang.common.isfriend);
		} else {
			alert(lang.common.addfollowsuccess);
			a.innerHTML = lang.common.follower;
			a.className = 'whiteButton';
			a.onclick = null;
		}
		hidePreload();
	});
}

// 请求加为一度
function sendRequest(a){
	showPreload();
	var form = findParent(a, 'form');
	var param = encodeForm(form);
	iui.getText(form.action, function(data){
		data = parseInt(data, 10);
		if( data == 1 ){
			alert(lang.common.submiterr);
			hidePreload();
		} else {
			alert(lang.common.addfriendsuccess);
			setTimeout(function(){
				//iui.goBack();
				var h = location.href;
				location.href = h.slice(0, h.indexOf('#'));
			}, 0);
		}
	}, param);
}

// 发布活动
function addEvent(a){
	var form = findParent(a, 'form'), param = encodeForm(form);
	if( param['eventname'] == '' ){
		alert(lang.common.nameenter);
		$('addEventName').focus();
		return false;
	}
	if( param['address'] == '' ){
		alert(lang.common.addressenter);
		$('addAddress').focus();
		return false;
	}
	param['begintime'] = $('eventStartDate').innerHTML + ' ' + $('eventStartTime').innerHTML;
	param['endtime'] = $('eventEndDate').innerHTML + ' ' + $('eventEndTime').innerHTML;
	var cdt = checkDateTime(param['begintime'], param['endtime']);
	switch( cdt ){
	case 1:
		alert(lang.event.share_errtime1);
		return false;
	case 2:
		alert(lang.event.share_errtime2);
		return false;
	case 3:
		alert(lang.event.share_errtime3);
		return false;
	}
	param['cityName'] = '';
	
	var postEvent = function(){
		iui.getText(form.action, function(data){
			data = parseInt(data, 10);
			if( data == 0 ){
				alert(lang.common.submiterr);
			} else {
				setTimeout(function(){
					iui.showPageByHref('/event/web2!eventDetail.jhtml?eventId=' + data, null, 'GET', null);
				}, 0);
			}
			hidePreload();
		}, param);
	}
	
	showPreload();
	try{
		geocoder.geocode({'address': param['address']}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if( results.length == 1 ){
					param['cityName'] = getGoogleMapCity(results[0].address_components);
				}
			}
			postEvent();
		});
	} catch(e) {
		postEvent();
	}
}
// 验证时间
function checkDateTime(sd, ed){
	function formatDT(sdt){
		var dt = sdt.split(' ');
		dt[0] = dt[0].split('-');
		dt[1] = dt[1].split(':');
		return new Date(fd(dt[0][0]), fd(dt[0][1]) - 1, fd(dt[0][2]), fd(dt[1][0]), fd(dt[1][1]));
	};
	ed = formatDT(ed);
	sd = formatDT(sd);
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
//获取google地址中的城市
function getGoogleMapCity(addr){
	var a = [];
	for( var i = 0; i < addr.length; i++ ){
		a.push(addr[i]);	
	}
	do {
		var city = a.pop();
	} while( a.length && city['types'][0] != 'locality');
	return city.long_name;
};


// 参加活动
function changeStatus(a, eventId, state, cb){
	showPreload();
	iui.getText('/event/web2!changeState.jhtml?eventId=' + eventId + '&state=' + state, function(data){
		data = parseInt(data, 10);
		if(	cb ){
			cb(data);
		} else {
			if( data == 1 || data == 4 ){
				var mp = getElementsByClassName('myPhoteEvent', a.parentNode.parentNode, 'a');
				if( mp.length )
					mp[0].style.display = 'none';
				a.className = 'blueButton';
				a.innerHTML = lang.event.count_in;
				a.onclick = function(){
					iWillGo(a, eventId);
				}
			} else if( data == 2 ) {
				var mp = getElementsByClassName('myPhoteEvent', a.parentNode.parentNode, 'a');
				if( mp.length )
					mp[0].style.display = 'inline';
				a.className = 'whiteButton';
				a.innerHTML = lang.event.count_out;
				a.onclick = function(){
					iNotGo(a, eventId);
				}
			} else if( data == 3 ) {
				a.className = 'redButton';
				a.innerHTML = lang.event.check_in;
				a.onclick = function(){};
				a.target = '_self';
				a.href = '/event/web2!siteNS.jhtml?eventId=' + eventId;
			}
		}
		hidePreload();
	});
}
function iWillGo(a, eventId){
	changeStatus(a, eventId, 1)
}
function iNotGo(a, eventId, cb){
	var ul = findParent(a, 'ul'), div = ul ? ul.parentNode : null;
	if( div && div.id && div.id == 'eventMy' ){
		changeStatus(a, eventId, 2, function(){
			var li = findParent(a, 'li'), prev = getPrevious(li), next = getNext(li);
			var parent = li.parentNode;
			parent.removeChild(li);
			if( ! (next && hasClass(next, 'listCont')) ){
				if( hasClass(prev, 'blockTitle') )
					parent.removeChild(prev);	
			}
		});
	} else {
		changeStatus(a, eventId, 2);
	}
}

// 现场签到
function siteSignin(a){
	var form = findParent(a, 'form'), param = encodeForm(form);
	var nd = document.getElementsByName('notdisturb')[0];
	param['notdisturb'] = nd.checked ? '1' : '0';
	if( param['signmessage'].length > 100 ){
		alert(lang.common.limit100);
		return false;
	}
	showPreload();
	iui.getText(form.action, function(data){
		data = parseInt(data, 10);
		if( data == 0 ){
			location.href = '/event/web2!siteS.jhtml?eventId=' + param.eventId;
		} else {
			alert(lang.common.submiterr);
			hidePreload();
		}
	}, param);
}

// 同意一度请求
function approveRequest(rid, a){
	showPreload();
	iui.getText('/event/web2!approveRequest.jhtml?requestid=' + rid, function(data){
		data = parseInt(data, 10);
		if( data == 0 ){
			var div = findParent(a, 'div');
			div.innerHTML = '<span class="green">'+lang.common.approved+'</span>';
		} else {
			alert(lang.common.submiterr);
		}
		hidePreload();
	});
}

// 忽略一度请求
function neglectRequest(rid, a){
	showPreload();
	iui.getText('/event/web2!neglectRequest.jhtml?requestid=' + rid, function(data){
		data = parseInt(data, 10);
		if( data == 0 ){
			var div = findParent(a, 'div');
			div.innerHTML = '<span class="gray">'+lang.common.neglected+'</span>';
		} else {
			alert(lang.common.submiterr);
		}
		hidePreload();
	});
}

// 切换免打扰状态
function changeDisturbStatus(eid, d){
	var t = d.getAttribute('toggled');
	t = t == 'true' ? 1 : 0;
	iui.getText('/event/web2!changeDisturbStatus.jhtml?eventId=' + eid + '&disturbStatus=' + t, function(data){
		data = parseInt(data, 10);
		if( data == 0 ){
			var div = getElementsByClassName('toggle', document.body, 'div');
			for( var i = 0; i < div.length; i++ ){
				div[i].setAttribute('toggled', t == 1 ? 'true' : 'false');
			}
		} else {
			alert(lang.common.submiterr);
		}
	});
}

// 重设searchInput
function resetSearchInput(){
	var ipts = document.getElementsByName('keywords');
	for( var i = 0; i < ipts.length; i++ ){
		ipts[i].style.color = '#AAA';
		ipts[i].value = ipts[i].title;
	}
}

// 添加讨论主题
function postFeed(a){
	var form = findParent(a, 'form'), param = encodeForm(form);
	if( param['freetext'].length > 200 || param['freetext'].length == 0 ){
		alert(lang.common.limit200);
		return false;
	}
	showPreload();
	iui.getText(form.action, function(data){
		data = parseInt(data, 10);
		if( data != 0 ){
			form.getElementsByTagName('textarea')[0].value = '';
			prependFeed(param['freetext'], data);		
		} else {
			alert(lang.common.submiterr);
		}
		hidePreload();
	}, param);
}
// 发表评论
function addComment(a, fid){
	openDialog('addComment', function(){
		resetCommentParam({feedId: fid, commBody: '', pid: '', pname: ''});
	});
}
function postComment(a){
	var form = findParent(a, 'form'), param = encodeForm(form);
	if( param['commBody'].length > 200 || param['commBody'].length == 0 ){
		alert(lang.common.limit200);
		return false;
	}
	showPreload();
	iui.getText(form.action, function(data){
		data = parseInt(data, 10);
		if( data != 0 ){
			appendComment(param['feedId'], param['commBody'], data);		
		} else {
			alert(lang.common.submiterr);
		}
		closeDialog('addComment');
		hidePreload();
	}, param);
}
function resetCommentParam(param){
	var form = $('postCommentForm');
	var hd = form.getElementsByTagName('input');
	for( var i = 0; i < hd.length; i++ ){
		hd[i].value = param[hd[i].name];
	}
	var comm = form.getElementsByTagName('textarea')[0];
	comm.value = param['commBody'];
	comm.focus();
}
//删除评论
function delComment(a, cid){
	var li = findParent(a, 'li');
	li.parentNode.removeChild(li);
	iui.getText('/feed/feed!removeComment.jhtml?commentId=' + cid);	
}
//回复评论
function addReply(a, fid, pid, pname){
	var param = {
		'feedId': fid,
		'commBody': lang.common.reply+' ' + pname + ': ',
		'pid': pid,
		'pname': pname
	}
	openDialog('addComment', function(){
		resetCommentParam(param);
	});
}

//显示所有要去的人
function showAllGoUser(a){
	var li = findParent(a, 'li'), ul = findParent(li, 'ul');
	li.parentNode.removeChild(li);
	var all = getElementsByClassName('hide', ul, 'li');
	for( var i = 0; i < all.length; i++ ){
		var a = all[i].getElementsByTagName('a')[0];
		a.innerHTML = '<img src="' + all[i].getAttribute('imgsrc') + '" width="30" height="30" alt="" />';
		all[i].className = '';
	}
}