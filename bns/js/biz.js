//ajax正在关注
function loadFollow(page){
	page = parseInt(page || 1, 10);
	var div = $('div[tabdiv="HomeFollow"]'), url = div.attr('url');
	div.empty().append('<div class="a-center"><div class="loading_m" style="margin:20px auto;"></div></div>');
	$.get(url + '?pageNo=' + page, function(data){
		div.empty().append(data).attr('pageNo', page);
		$(window).scrollTop(0);
	});
}

//绑定搜索选项
function bindSearchOption(){
	var area = $(this), cont = area.find('[js="optionCont"]'), more = area.find('[js="showMore"] span');
	
	//点击更多选项
	more.bind('click', function(){
		if( more.hasClass('up') ){
			more.removeClass('up');
			cont.find('>dl:gt(1)').hide();
		} else {
			more.addClass('up');
			cont.find('>dl:gt(1)').show();
		}
	});
	
	//选项截字
	function cutOptionWord(el){
		var lbl = el.find('label[cw]');
		if( lbl.length == 0 || lbl.text().length < 6 ) return;
		lbl.text(cutWord(lbl.text(), parseInt(lbl.attr('cw') || 10, 10)));
	}
	if( lang.lang != 'en_US' ){
		cont.find('dl dd li span span').each(function(){
			cutOptionWord($(this));
		});
	}
	
	//初始化城市ID
	cont.find('dl[extDL="selectLocation"] li :checkbox').each(function(){
		$(this).val('CI_' + $(this).val());
	});
	
	//绑定label
	function checkShowAll(dl){
		setTimeout(function(){
			if( dl.find('li span.hover').length == 0 ) dl.find('dd.dd01 a').addClass('hover');
		}, 0);
	}
	function changeOptions(dl){
		if( dl.attr('extDL') ){
			var arr = [];
			dl.find('li span.hover').each(function(){
				var v = $(this).find(':checkbox').val();
				if( v.indexOf('_') < 0 && dl.attr('extDL') == 'selectLocation' ) v = 'CI_' + v;
				arr.push(v);
			});
			$('input[js="' + dl.attr('extDL') + '_id"]').val(arr.join(','));
		}
		$('#ajaxSearch input[name="pageNo"]').val('1');
		postSearch();
	}
	$('dl li label', cont).live('click', function(){
		var a = $(this), span = a.parent().parent(), chk = span.find(':checkbox'), dd = span.closest('dd'), dl = dd.parent();
		if( span.hasClass('hover') ){
			span.removeClass('hover');
			chk.removeAttr('checked');
			changeOptions(dl);
			checkShowAll(dl);
		} else {
			if( chk.length ){
				if( dd.find('span.hover').length < 5 ){
					span.addClass('hover');
					chk.attr('checked', true);
					changeOptions(dl);
				}
			} else {
				dd.find('span.hover').removeClass('hover');
				span.addClass('hover');
				changeOptions(dl);
			}
			dl.find('dd.dd01 a').removeClass('hover');
		}
	});
	$('dl li :checkbox', cont).live('click', function(){
		var chk = $(this), dl = chk.closest('dl');
		chk.parent().parent().removeClass('hover');
		changeOptions(dl);
		checkShowAll(dl);
	});
	cont.find('dd.dd01 a').bind('click', function(){
		var a = $(this), dl = a.closest('dl');
		if( ! a.hasClass('hover') ){
			dl.find('li span.hover :checkbox').removeAttr('checked');
			dl.find('li span.hover').removeClass('hover');
			a.addClass('hover');
			changeOptions(dl);
		}
	});
	
	var form = $('#ajaxSearch'), resultCont = $('#searchResultCont');
	form.ajaxForm({
		ajaxOptions: {
			success: function(data){
				$('#searchFormMask').hide();
				resultCont.empty();
				resultCont.append(data);
			}
		}
	});

	//选择更多回调
	function popSelectedCall(dl, selected, type){
		var sn = 0;
		dl.find('li span.hover').removeClass('hover')
		dl.find('li input:checkbox').removeAttr('checked');
		for( var key in selected){
			sn ++;
			var chk = dl.find('li input[value=' + selected[key]['id'] + ']');
			if( chk.length ){
				chk.attr('checked', true).parent().parent().addClass('hover');
			} else {
				var w =  lang.lang != 'en_US' ? cutWord(selected[key]['name'], 10) : selected[key]['name'];
				var html = '<li><span class="hover"><span><input type="checkbox" checked="true" value="' + selected[key]['id'] + '" name="' + type + '"><label title="' + selected[key]['name'] + '" cw="10">' + w + '</label></span></span></li>';
				if( dl.find('li').length == 10 ){
					dl.find('li:last').remove();
				}
				dl.find('ul').prepend(html);
			}
			dl.find('dd.dd01 a').removeClass('hover');
			setTimeout(function(){
				changeOptions(dl);
			}, 100);
		}
		if( sn == 0 ){
			dl.find('dd.dd01 a').trigger('click');
		}
	}
	//选择行业更多
	$('#industryContainer').data('selectedCall', function(selected){
		popSelectedCall(cont.find('[extDL="selectIndustry"]'), selected, 'industry');
	});
	//选择地区更多
	$('#locationContainer').data('selectedCall', function(selected){
		popSelectedCall(cont.find('[extDL="selectLocation"]'), selected, 'city');
	});
}
//提交搜索
function postSearch(){
	var form = $('#ajaxSearch'), cont = form.find('[js="optionCont"]');
	var chkdl = cont.find('dl:lt(4)'), lstdl = cont.find('dl:last');
	chkdl.each(function(){
		var dl = $(this), arr = [];
		dl.find('li span.hover').each(function(){
			arr.push($(':checkbox', this).val());
		});
		dl.find('input[js="option"]').val(arr.join(','));
	});
	lstdl.each(function(){
		var dl = $(this), hv = dl.find('li span.hover');
		var cnt = hv.length == 0 ? ['', ''] : hv.attr('cnt').split('-');
		dl.find('[name="followerCntMin"]').val(cnt[0]);
		dl.find('[name="followerCntMax"]').val(cnt[1]);
	});
	$('#searchFormMask').show().css('opacity', 0.5);
	form.submit();
}

var geocoder;
function showGoogleMap(address, mapCanvas, city){
	var showMap = function(g){
		var myOptions = {
			zoom: 14,
			center: g.location,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			streetViewControl: false
		}
		var map = new google.maps.Map(mapCanvas[0], myOptions);
		var marker = new google.maps.Marker({
			map: map, 
			position: g.location
		});
	};
	try{
		geocoder.geocode({"address": address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if( results.length == 1 ){
					showMap(results[0].geometry);
				} else {
					for( var i = 0; i < results.length; i++ ){
						if( getGoogleMapCity(results[i].address_components) == city ){
							showMap(results[i].geometry);
							return;
						}
					}
				}
			}
		});	
	} catch(e){}
}

$(function(){
	//切换首页tab
	$('a[js^=tabHome]').bind('click', function(){
		var a = $(this), type = a.attr('js').replace('tab', ''), li = a.closest('ul').find('li');
		li.removeClass('current');
		a.parent().addClass('current');
		var div = $('div[tabdiv^=Home]').hide();
		var curdiv = div.filter('[tabdiv=' + type + ']').show();
		if( type == 'HomeFollow' && curdiv.find('>*').length == 0 ){
			loadFollow();
		}
	});
	
	//换一换推荐的公司
	var recruitmentBizids = [];
	$('li[recruitmentBizids]').each(function(){
		recruitmentBizids.push($(this).attr('recruitmentBizids'));
	});
	$('a[js="switchRecomm"]').click(function(){
		var a = $(this), cont = $('[js="recommCont"]');
		cont.animate({opacity: 0}, 250);
		$.get(a.attr('href') + '?recruitmentBizids=' + recruitmentBizids.join(','), function(data){
			data = $.trim(data);
			if( data != '' ){
				var li = $(data).filter('li');
				if( li.length < 6 ){
					a.remove();
				}
				cont.empty().append(li);
			} else {
				a.remove();
			}
			cont.animate({opacity: 1}, 250);
		});
		return false;
	});
	
	//绑定动态区事件
	$('div[js="feedContent"]').newsfeed();
	
	//绑定已关注列表中的取消关注
	$('ul[js="followList"] li').live('mouseenter', function(){
		$('[js="followActionCont"]', this).show();
		$(this).addClass('hover');
	}).live('mouseleave', function(){
		$('[js="followActionCont"]', this).hide();
		$(this).removeClass('hover');
	});
	$('[js="followActionCont"] a[cf]').live('click', function(){
		var a = $(this), li = a.closest('li'), ul = li.parent();
		$.get('/biz/index!ajaxCancelfollow.jhtml?bizid=' + a.attr('cf'), function(){
			var fc = $.trim($('[js="naviFollowCnt"]').text());
			$('[js="naviFollowCnt"]').text(Math.max(0, fc-1));
			li.animate({height: 0}, 250, function(){
				li.remove();
				if( ul.find('>li').length == 0 ){
					loadFollow($('div[tabdiv="HomeFollow"]').attr('pageNo'));
				}
			});
		});
	});
	$('[js="followActionCont"] a[sf]').live('click', function(){
		var a = $(this);
		$.get('/biz/index!ajaxfollow.jhtml?bizid=' + a.attr('sf'), function(){
			a.hide();
			a.siblings('a').show();
		});
	});
	$('[js="followActionCont"] a[scf]').live('click', function(){
		var a = $(this);
		$.get('/biz/index!ajaxCancelfollow.jhtml?bizid=' + a.attr('scf'), function(){
			a.hide();
			a.siblings('a').show();
		});
	});
	
	//绑定搜索选项
	$('#searchOption').each(bindSearchOption);
	
	$('div[js="feedContent"] a[delBizFeed]').live('click', function(){
		var a = $(this), block = a.closest('.feed-block'), feed = block.closest('div[js="feedContent"]');
		if( feed.attr('bpid') ){
			pop_confirm(null, '确定要删除该条动态吗？', function(){
				$.get('/biz/manage!delete.jhtml?bizid=' + feed.attr('bpid') + '&feedId=' + a.attr('delBizFeed'), function(){
					block.css('overflow', 'hidden').animate({height: 0}, 250, function(){
						block.remove();
					});
				});
			});
		}
	});
	
	//显示地图
	try {
		geocoder = new google.maps.Geocoder();
		$('div[googleMap]').each(function(){
			var mapCont = $(this), address = mapCont.attr('googleMap'), city = mapCont.attr('city');
			showGoogleMap(address, mapCont, city) === false
		});
	} catch(e){};
});

//验证公司邮箱域
function checkBizMail(str, opt){
	var err = opt['parent'].find('[vdErr]');
	err.find('span[js="tips1"]').show();
	err.find('span[js="tips2"]').hide();
	if( $.trim(str) == '' ){
		return false;
	} else {
		if( ! str.is_email() ) return false;
		var domain = str.split('@')[1];
		err.find('span[js="tips1"]').hide();
		err.find('span[js="tips2"]').show().find('[js="domain"]').text(domain);
		if( $.inArray(domain.toLowerCase(), supportEmail) >= 0 ){
			return false;
		}
		if( opt['url'] ){
			var param = {};
			if( opt['key'] ){ param[opt['key']] = domain; }
	        $.ajax({
	            url: opt['url'],
	            cache: false,
	            type: 'POST',
	            dataType: 'JSON',
	            data: param,
	            success: function(json) {
				    if( parseInt(json.id) == 0 ){
				        opt['field'].trigger('Validate', [true, 'suc']);
				    } else {
				    	err.find('span[js="tips2"]').hide();
						err.find('span[js="tips3"]').show().find('[js="company"]').text(json.name).attr('href', '/biz/' + json.id);
				        opt['field'].trigger('Validate', [false, 'err']);
				    }
	        	}
	        });
		}
		return -1;
	}
}
var supportEmail = [
'hotmail.com',
'gmail.com',
'163.com',
'126.com',
'qq.com',
'yahoo.com',
'yahoo.com.cn',
'sina.com',
'msn.com',
'live.cn',
'sohu.com',
'yahoo.cn',
'vip.sina.com',
'139.com',
'live.com',
'vip.163.com',
'yeah.net',
'foxmail.com',
'aol.com',
'mac.com',
'yahoo.co.uk',
'vip.qq.com',
'googlemail.com',
'yahoo.com.hk',
'tom.com',
'msn.cn',
'yahoo.fr',
'yahoo.co.in',
'me.com',
'yahoo.com.sg',
'sina.com.cn',
'21cn.com',
'263.net',
'yahoo.com.tw',
'rediffmail.com',
'ymail.com',
'web.de',
'sina.cn',
'netvigator.com',
'gmx.de',
'yahoo.ca',
'hotmail.co.uk',
'yahoo.de',
'yahoo.co.jp',
'yahoo.it',
'188.com',
'singnet.com.sg',
'btinternet.com',
'yahoo.com.au',
'hotmail.fr',
'189.cn',
'vip.sohu.com',
'sh163.net',
'earthlink.net',
'pacific.net.sg',
'virgilio.it',
'rocketmail.com',
't-online.de',
'hotmail.de',
'hotmail.co.jp',
'gmx.net'
];
