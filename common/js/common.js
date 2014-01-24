$.extend(String.prototype,{
	is_email:function(){
		var s = $.trim(this);
		return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(s);
	},
	is_password:function(){
		return /^.{6,32}$/.test(this);
	},
	validate_name:function() {
		var name = this;
		if (name.length > 32) {
			return "too_long";
		}
		else if (/^.*[!-'*-,\/:-@[-`{-~0-9\u00B7\uFF01\uFFE5\u2026\u2014\u3010\u3011\uFF1B\uFF1A\u2018\u201C\uFF0C\u300A\u3002\u300B\u3001\uFF1F].*$/.test(name)) { // special symbol and numerical character
			return "invalid_symbol";
		}
		else if (/^\s*[a-zA-Z\s.\-]{2,}\s*$/.test(name)) { // pure English
			if (/^[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,}(\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+$/.test(name)) { // doesn't conform to English name format
				return "success_validation";
			}
			else {
				return "invalid_english";
			}
		}
		else if (/^\s*[\u4e00-\u9fa5\s]{1,}\s*$/.test(name)) { // pure Chinese
			if (/^[\u4e00-\u9fa5]{2,10}$/.test(name)) { // doesn't conform to Chinese name format
				return "server_validation";
			}
			else {
				return "invalid_chinese";
			}
		}
		else if (/^.*[\u4e00-\u9fa5].*[a-zA-Z].*$/.test(name)) { // Chinese(English)
			if (/^[\u4e00-\u9fa5]{2,10}\s*[\(\uFF08]?[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,4}((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+)?[\)\uFF09]?$/.test(name)) { // doesn't conform to format
				return "server_validation"
			}
			else {
				return "invalid_chinese_english";
			}
		}
		else if (/^.*[a-zA-Z].*[\u4e00-\u9fa5].*$/.test(name)) { // English(Chinese)
			if (/^[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,4}((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+)?\s*[[\(\uFF08]?[\u4e00-\u9fa5]{2,10}[\)\uFF09]?$/.test(name)) {
				return "server_validation";
			}
			else {
				return "invalid_english_chinese";
			}
		}
		else if (/^.*[\u3040-\u30FF\u31F0-\u31FF\uAC00-\uD7AF\u1100-\u11FF\u00C0-\u024F]+.*$/.test(name)) { // other language
			return "success_validation";
		}
		else {
			return "invalid_name";
		}
	},
	is_name:function(){
		//return /[\u4e00-\u9fa5\w\/\(\)\s]{2,}/.test(this) &&  !( this.indexOf("\'") != -1 || this.indexOf('>') != -1 || this.indexOf('<') != -1 || $.trim(this).length <=0 || this.length > 25);
		//return /(^\s*[\u4e00-\u9fa5]{2,4}\s*$)|(^\s*([a-zA-Z]+(\.{1}[a-zA-Z]+)?){2,32}\s*$)|(^\s*([a-zA-Z]+(\s{1}[a-zA-Z]+)?){2,32}\s*$)/.test(this);
		return /^.{2,25}$/.test(this) && ( ! /[^\u4e00-\u9fa5\w\/\(\)\s]/.test(this) );
	},
	is_illegalcontent:function(){
		return (/[^\w]/.test(this) );
	},
	is_url:function(){
		//var re = new RegExp('^http[s]?:\/\/(\\w+\\.\\w+\/?)([\\w.]+\/?)*(\\?.[^\\?\\s]*)?$', 'ig');
		var re = new RegExp('^http[s]?:\/\/([\\w.]+\/?)\\S*$', 'ig');
		return re.test(this);
	},
	is_qq:function(){
		return /^[\d]{5,10}$/.test(this);
	},
	is_mobile:function(){
		return /^[\d\s]{5,20}$/.test(this);
	},
	trim:function(){
		return this.replace(/\s{2,}/g,' ');
	},
	toText:function(){
		return this.replace(/<\/?[^>]+>/g,'');
	},
	nlTobr:function(){
		return this.replace(/\r\n|\r|\n/g,'<br />');
	},
	brTonl:function(){
		return this.replace(/<br[\s]*[\/]?>/ig,'\r\n');
	},
	htmlTostr:function(){
		var str=this.replace(/</g,'&lt;');
		str=str.replace(/>/g,'&gt;');
		str=str.replace(/ /g,'&nbsp;');
		return str.nlTobr();
	},
	strTohtml:function(){
		var str=this.brTonl();
		str=str.replace(/&lt;/g,'<');
		str=str.replace(/&gt;/g,'>');
		return str.replace(/&nbsp;/g,' ');
	}
});
$.extend(Date.prototype, {
	format: function(fmt) {
		if (!fmt) fmt = "yyyy-MM-dd hh:mm:ss";
		var o = {
			"M+": this.getMonth() + 1,
			"d+": this.getDate(),
			"h+": this.getHours(),
			"m+": this.getMinutes(),
			"s+": this.getSeconds(),
			"q+": Math.floor((this.getMonth() + 3) / 3),
			"S": this.getMilliseconds()
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	}
});

//扩展一些通用方法，判断是否为360，ie6,7浏览器
(function($){
	$.getOptions = function(str){
		var opt = {};
		if( str && typeof(str) == 'string' ){
			try{
				var sopt = str.slice(0, 1) == '{' ? str : '{' + str + '}';
				opt = (new Function('return ' + sopt))();
			} catch(e){}
		}
		return opt;
	}

	if( window.navigator.userAgent.toLowerCase().indexOf('360se') >= 0 ) $.browser.se360 = true;
	if( window.external && window.external.twGetRunPath ){
		var r = window.external.twGetRunPath();
		if( r && r.toLowerCase().indexOf("360se") >= 0 ) $.browser.se360 = true;
	}
	$.browser.msie6 = $.browser.msie && $.browser.version == '6.0';
	$.browser.msie7 = $.browser.msie && parseInt($.browser.version) <= 7;
})(jQuery);

/* 城市选择 ***********************************/
$.fn.addOption=function(text, value){
	return this.each(function(){
		this.options.add(new Option(text, value));
	});
}
function selectCity(Country,Region,City){
	var nat=Country || $("#selectCountry");
	var area=Region || $("#selectRegion");
	var city=City || $("#selectCity");
	function resetSelect(){
		nat.css('overflow', 'visible');
		area.css('overflow', 'visible');
		city.css('overflow', 'visible');
	}
	nat.bind('change', function(){
		area.empty().append('<option value="">' + lang.common.select + '</option>');
		city.empty().append('<option value="">' + lang.common.select + '</option>');
		var vnat = nat.val();
		if( vnat != '' || vnat != '0' ){
			$.getJSON("/ajax/json!listRegions.jhtml?countryId=" + vnat,function(data){
				$.each(data.regions, function(i, region){
					area.append('<option value="' + region.regionId + '">' + region.regionName + '</option>');
				});
				resetSelect();
			});
		}
	});
	if(city.length){
		area.change(function(){
			city.empty().append('<option value="">' + lang.common.select + '</option>');
			var varea = area.val();
			if( varea != '' ){
				$.getJSON("/ajax/json!listCities.jhtml?regionId=" + varea, function(data){
					if(data.cities.length == 1) city.empty();
					$.each(data.cities, function(i, ct){
						city.append('<option value="' + ct.cityId + '">' + ct.cityName + '</option>');
					});
					resetSelect();
				});
			}
		});
	}
}
function bindSelectCity(){
	function getRegions(id, area, callback){
		$.getJSON("/ajax/json!listRegions.jhtml?countryId=" + id, function(data){
			$.each(data.regions, function(i, re){
				area.append('<option value="' + re.regionId + '">' + re.regionName + '</option>');
			});
			callback();
		});
	}
	function getCities(id, city, callback){
		$.getJSON("/ajax/json!listCities.jhtml?regionId=" + id, function(data){
			if(data.cities.length == 1) city.empty();
			$.each(data.cities, function(i, ct){
				city.append('<option value="' + ct.cityId + '">' + ct.cityName + '</option>');
			});
			if(data.cities.length == 1) city.triggerHandler('change');
			callback();
		});
	}
	$('select[citySelect]').live('change', function(){
		var slt = $(this), v = slt.val(), type = slt.attr('citySelect'), parent = slt.parent();
		var nat = parent.find('[citySelect=co]'), area = parent.find('[citySelect=re]'), city = parent.find('[citySelect=ci]');
		function resetSelect(){
			nat.css('overflow', 'visible');
			area.css('overflow', 'visible');
			city.css('overflow', 'visible');
		}
		if( type == 'co' ){
			area.empty().append('<option value="">' + lang.common.select + '</option>').triggerHandler('change');
			city.empty().append('<option value="">' + lang.common.select + '</option>').triggerHandler('change');
			if( v != '' && v != '0' ){
				getRegions(v, area, resetSelect);
			}
		} else if( type == 're' ){
			city.empty().append('<option value="">' + lang.common.select + '</option>').triggerHandler('change');
			if( v != '' && v != '0' ){
				getCities(v, city, resetSelect);
			}
		}
	});
	$('[citySelectPanel]').each(function(){
		var panel = $(this), nat = panel.find('[citySelect=co]'), area = panel.find('[citySelect=re]'), city = panel.find('[citySelect=ci]');
		var ids = $.map(panel.attr('citySelectPanel').split(','), function(i){return parseInt(i, 0) || 0});
		if( ids[0] > 0 && ids[1] > 0 ){
			getRegions(ids[0], area, function(){
				area.val(ids[1]);
				area.triggerHandler('change');
				if( ids[2] > 0 ){
					getCities(ids[1], city, function(){
						city.val(ids[2]);
					});
				}
			});
		}
	});
}
/* 城市选择 end ******************************/


function float_tips(type,html,width){
	var id=('float_tips'+Math.random()).replace('.','');
	type=type|| 'tipsbox';
	width=typeof width == 'number' ? width + 'px' :(typeof width == 'string' ? width : '300px');
	html=html || '<br />';
	$(document.body).append('<div id="'+id+'" class="'+type+'" style="width:'+width+';display:none;position:absolute;z-index:12;">'+html+'</div>');
	var tips=$('#'+id);
	tips.css({left:($(document).width()-tips.outerWidth())/2,top:$(document).scrollTop()+$(window).height()/2-tips.outerHeight()/2});
	tips.fadeIn(500,function(){
		setTimeout(function(){
			tips.fadeOut(2000);
		},html.length*150);
	});
}

function floatDIV(options){
	if(typeof window.__floatDIV != 'undefined') window.__floatDIV.remove();
	var html = options.html || '',
		title = options.title || '',
		srcElement = $( options.srcElement ),
		url = options.url || '',
		func = options.func || function(){},
		btn = options.button ? ( typeof options.button === 'string' ? [ options.button ] : options.button ) : [],
		__left = srcElement.offset().left + srcElement.outerWidth() + 10,
		__top = srcElement.offset().top - 30;

	var div = '<div class="fl-outer" id="floatDIV">';
		div += '<div class="fl-block">';
		div += '<div class="fl-title"><h5>'+title+'</h5><a class="close"><span class="hide">'+lang.common.close+'</span></a></div>';
		div += '<div class="fl-content">';
		div += html;
		div += '</div>';
		if(btn.length>0){
			div += '<div class="fl-button">';
			for(var i=0;i<btn.length;i++){
				div += '<input type="button" class="common-button" value="'+btn[i]+'" />';
			}
			div += '</div>';
		}
		div += '<div class="arrow-l" style="top:35px;"></div>';
		div += '</div>';
		div += '</div>';

	$( document.body ).append(div);
	var id = $( '#floatDIV' );
	var content = id.find( '.fl-content' );
	var button = [];
	id.find('.fl-button input:button').each(function(){
		button.push($(this));
	});
	var exit  =id.find('.fl-title .close');
	var title = id.find('.fl-title h5');
	id.css({ left:__left, top:__top });
	var setlocation = setInterval(function(){
		id.animate({left:srcElement.offset().left + srcElement.outerWidth() + 10,top:srcElement.offset().top - 30 },450);
	},500);
	var close=function(){
		clearInterval(setlocation);
		id.fadeOut( 500,function(){
			$(this).remove();
		});
	};
	var callData ={"close":close, "title":title, "exit":exit, "float":id, "content":content, "button":(button.length==1)?button[0]:button};
	if(url!='') $.get( url,function(data){
		content.html(data);
		func.call(content ,callData);
	})
	else func.call(content,callData);
	id.find('.close').click(close);
	id.fadeIn(500);
	window.__floatDIV = id;
}

function checkall(selfObj, targetInputName) {
	$("input[name='"+targetInputName+"']").each(function() {
		var condition = selfObj.checked ? !this.checked : this.checked;
		if (condition) {
			$(this).trigger("click");
		}
	});
}

//截字，中文按2个英文
function cutWord_old(str, n, ex){
	var cn = str.replace(/[\x00-\xff]/g, ''), en = str.replace(/[^\x00-\xff]/g, '');
	if( cn.length * 2 + en.length > n ){
		var a = str.split(''), l = 0;
		for( var i = 0; i < a.length; i++ ){
			l += a[i].search(/[\x00-\xff]/g) > -1 ? 1 : 2;
			if( l >= n ){
				return str.slice(0, i) + (typeof(ex) == 'string' ? ex : '...');
			}
		}
	}
	return str;
};
function cutWord(str, n, ex){
	var s = (str + '').substr(0, n).replace(/([^\x00-\xff])/g, ' $1').substr(0, n).replace(/ ([^\x00-\xff])/g, '$1');
	if( s != str ) s += (typeof(ex) == 'string' ? ex : '...');
	return s;
};

//下拉菜单（旧版）
function dropDownMenu(btn, obj, h, r){
	btn.click(function(){
		if( typeof window.__dropDownMenu != 'undefined' ){
			window.__dropDownMenu.hide();
		}
		window.__dropDownMenu = obj;
		var objT = btn.offset().top + btn.outerHeight() + ( h || 2 );
		var objL = btn.offset().left;
		var right_ = r;
		if(right_){
			var objL = btn.offset().left-(obj.outerWidth()-btn.outerWidth());
		}
		obj.css({top:objT, left:objL, display:'block', position:'absolute', zIndex:999, margin:0});
		$(document).one('click',function(){
			obj.hide();
		});
		return false;
	});
}

// ** 所有弹出窗口调用函数 ************************************************
function pop_ajax(url, argm1, argm2, options){
	options = $.extend({closeDestroy: true}, options || {});
	var callback = function(){};
	if( $.isFunction(argm1) ) {
		options.title = '';
		callback = argm1;
	} else if( typeof(argm1) == 'string' ) {
		options.title = argm1;
		if( $.isFunction(argm2) ){
			callback = argm2;
		} else {
			options = $.extend(options, argm2 || {});
		}
	} else {
		options = $.extend(options, argm1 || {});
		if( $.isFunction(argm2) ){ callback = argm2; }
	}
	// 先显示loading层，在load完成后显示弹出窗，可自适应高度
	var loading = $('<div class="loading_l"/>');
	loading.popupLayer({
		modal: true,
		overlay: 0.25,
		clickClose: false,
		reserve: false
	});
	var ajaxWin = $('<div/>').appendTo('body').hide().load(url, function(){
		loading.popupLayer('destroy');
		if( ! $.isFunction(options.open) ) options.open = callback;
		ajaxWin.popupWin(options);
	});
}

function pop_html(html, options){
	options = $.extend({}, options || {});
	options.closeDestroy = true;
	if( typeof(html) == 'string' ){
		$('<div/>').html(html).popupWin(options);
	} else {
		options.reserve = true;
		$('<div/>').append(html).popupWin(options);
	}
}

function pop_confirm(title, info, func, func2, options){
	var buttons = {};
	buttons[lang.common.confirm] = function(){
		if( $.isFunction(func) ){
			if( func(this) === false ){ return false }
		}
		$(this).popupWin('destroy');
	};
	buttons[lang.common.cancel] = function(){
		if( $.isFunction(func2) ){ func2(this); }
		$(this).popupWin('destroy');
	};
	var el = $('#pop-confirm-win');
	if( el.length == 0 ){ el = $('<div id="pop-confirm-win" class="fl-alert-content" />'); }
	el.empty().html(info).popupWin($.extend({
		width: lang.lang == 'en_US' ? 500 : 400,
		title: ( title == null ) ? lang.common.prompt : title,
		buttons: buttons
	}, options || {}));
}

function pop_alert(info, func, title, options){
	var buttons = {};
	buttons[lang.common.confirm] = function(){
		if( $.isFunction(func) ){
			if( func(this) === false ){ return false }
		}
		$(this).popupWin('destroy');
	};
	var el = $('#pop-alert-win');
	if( el.length == 0 ){ el = $('<div id="pop-alert-win" class="fl-alert-content" />'); }
	el.empty().html(info).popupWin($.extend({
		width: lang.lang == 'en_US' ? 500 : 400,
		title: title || lang.common.prompt,
		buttons: buttons
	}, options || {}));
}

function pop_tips(link, options){
	$(link).each(function(){
		var a = $(this),
			tips = $('<div class="ushi-popupTips" />').append($(a.attr('popupTips')).show());
		a.mouseover(function(){
			var pos = a.offset();
			tips.popupTips($.extend({
				position: [pos.left + a.outerWidth() + 10, pos.top - 20]
			}, options));
		})
		a.mouseout(function(){
			tips.popupWin('destroy');
		});
	});
}

function pop_overlay(){
	var el = $('#pop-overlay-win');
	if( el.length == 0 ){ el = $('<div id="pop-overlay-win"/>'); }
	el.popupLayer({
		modal: true,
		overlay: 0,
		clickClose: false
	});
}
function hide_overlay(){
	var el = $('#pop-overlay-win');
	if( el.length ){
		el.popupLayer('close');
	}
}
function pop_loading(options){
	$('<div js="popLoadingOverlay" class="loading_l"/>').popupLayer($.extend({
		modal: true,
		overlay: 0.25,
		clickClose: false,
		reserve: false
	}, options || {}));
}
function hide_pop_loading(){
	var el = $('div[js="popLoadingOverlay"]');
	if( el.length ){
		el.popupLayer('destroy');
	}
}

//自动绑定下拉菜单
function livePopMenu(ctx, callfunc){
	ctx = ctx || 'popMenu';
	function getOpt(str){
		var opt = {};
		if( str ){
			if( str.match(/^\{|\}$/ig) == null ) str = '{' + str + '}';
			try{
				opt = (new Function('return ' + str))();
			} catch(e){}
		}
		return opt;
	}
	function init(a, setOpt){
		var deopt = {stopPropagation: false};
		var opt = getOpt(a.attr('pmOpt'));
		opt.pop = $(opt.pop);
		if( opt.pop.length == 0 ) return false;
		if( opt.html ){
			opt.pop = $(opt.pop.html());
			delete opt.html;
			deopt.closeDestroy = true;
			deopt.reserve = false;
		}
		var func = {};
		if( opt.func && $.isPlainObject(window[opt.func]) ){
			func = window[opt.func];
		} else if( $.isPlainObject(callfunc) ){
			func = callfunc;
		}
		for( var k in func ){
			if( opt[k] != 'null' && $.isFunction(func[k]) ){
				opt[k] = function(event, ui){
					return func[k](event, ui, a);
				}
			}
		}
		var pos = {of: a};
		if( opt.position ){
			opt.position = opt.position.split(/\s/);
			pos.at = opt.position[0], pos.my = opt.position[0];
			if( opt.position[1] && opt.position[1] == 'top' ){
				pos.at += ' top';
				pos.my += ' bottom';
			} else {
				pos.at += ' bottom';
				pos.my += ' top';
			}
		} else {
			pos.at = opt.at || 'left bottom';
			pos.my = opt.my || 'left top';
		}
		if( opt.offset ){
			pos.offset = opt.offset;
			delete opt.offset;
		}
		opt.position = pos;
		if( opt.ajax ){
			opt.pop.append('<ul><li class="loading" style="margin:0;">&nbsp;</li></ul>');
			$.get(opt.ajax, function(data){
				closePop(opt.pop);
				opt.pop.empty().width('auto').append(data);
				if( $.isFunction(func.ajaxLoaded) ) func.ajaxLoaded(opt.pop, a);
				showPop(a);
			});
			delete opt.ajax;
			deopt.reserve = true;
		}
		opt = $.extend(deopt, opt);
		if( $.isFunction(setOpt) ) setOpt(opt);
		a.data('popMenuOpt', opt);
		return opt;
	}
	function showPop(a, setOpt){
		if( a.attr('pmReset') ){
			var opt = init(a, setOpt);
		} else {
			var opt = a.data('popMenuOpt') || init(a, setOpt);
		}
		if( ! opt ) return false;
		if( opt.tips ){
			if( opt.tips > 0 ) opt.tipsType = opt.tips;
			opt.pop.popupTips(opt).data('popType', 'popupTips');
		} else {
			opt.pop.popupLayer(opt).data('popType', 'popupLayer');
		}
		return opt;
	}
	function closePop(pop){
		pop[pop.data('popType')]('close');
	}
	function bindClick(event){
		var a = $(this), type = a.attr(ctx);
		if( type != 'click' ) return;
		showPop(a);
		event.preventDefault();
	};
	function bindHover(event){
		var a = $(this), type = a.attr(ctx);
		if( type != 'hover' ) return;
		var opt = showPop(a, function(opt){
			var op = $.isFunction(opt.open) ? opt.open : function(){};
			opt.open = function(event, ui){
				var pop = $(this);
				ui.bind('mouseenter', function(){
				  	var lvtm = a.data('lvtm');
				  	if( lvtm ){
				  		clearTimeout(lvtm);
				  		a.removeData('lvtm');
				  	}
				});
				ui.bind('mouseleave', function(){
			 		closePop(pop);
			 	});
				op(event, ui, a);
			}
		});
		if( opt == false ) return false;
		a.one('mouseleave.popMenu', function(event){
			a.data('lvtm', setTimeout(function(){
				closePop(opt.pop);
			}, opt.lv || 200));
		});
	};
	var el = '[' + ctx + ']';
	$(el).die('.popMenu').live('click.popMenu', bindClick).live('mouseenter.popMenu', bindHover);
}
// ** 所有弹出窗口函数 end ************************************************


/**********************************
初始化行业、地区等选择窗口
Start *****************************/
function initJobSelectWin(options){
	if( $('#locationContainer').length == 0 && $('#industryContainer').length == 0 ) return null;

	options = $.extend({
		areaUrl: '/job/search!fetchWorkAreas.jhtml'
	}, options || {});

	var openSelectWin = function(cont, field, param){
		param = $.extend({
			reserve: true,
			width: 740,
			open: function(){
				var sid = $('input[js="' + cont.attr('rel') + '_id"]', field).val();
				cont.find(':checkbox').removeAttr('checked');
				if( sid ){
					var aid = sid.split(',');
					for( var i = 0; i < aid.length; i++ ){
						cont.find('input[rid="' + aid[i] + '"]').attr('checked', true);
					}
				}
				setTimeout(function(){
					refreshSelectWin(cont);
				}, 0);
			},
			clickPopup: function(){
				return false; //返回false，以使弹层事件冒泡，否则live事件失效
			}
		}, param || {});
		cont.popupWin(param);
	};
	var refreshSelectWin = function(cont){
		var selected = {}, html = '';
		var chks = cont.find(':checked');
		chks.each(function(){
			var r = {}, chk = $(this);
			r.id = chk.attr('rid');
			if( selected[r.id] ){
				return true;
			} else {
				r.name = chk.parent().text().replace(/^\s+|\s+$|\n+|\r+/g, '');
				selected[r.id] = r;
			}
		});
		for( var key in selected ){
			html += '<span rid="' + selected[key].id + '" class="common-selected">' + selected[key].name + ' <a class="friend-close" href="javascript:void(0);"></a></span>';
		}
		cont.data('selected', selected);
		cont.find('.popbox-subtit span').remove();
		cont.find('.popbox-subtit').append(html);
	};
	var bindSelectWin = function(cont, btn, field){
		function clickCommCheckbox(chk, cont){
			if( chk.checked ){
				if( checkChecked(cont) >= 5 ){
					chk.checked = false;
				} else {
					cont.find(':checkbox[rid="' + $(chk).attr('rid') + '"]').attr('checked', true);
				}
			} else {
				cont.find(':checkbox[rid="' + $(chk).attr('rid') + '"]').removeAttr('checked');
			}
		}
		function showSubLocation(chk, cont){
			var jqchk = $(chk), dd = jqchk.closest('dd'), dl = dd.closest('dl'), div = dd.find('.local-dropmenu');
			if( div.is(':hidden') ){
				dl.find('dd').removeClass('local-selected');
				var pos = dd.position();
				div.css({top: (dd.height() - 1) + 'px', left: (10 - pos.left) + 'px'});
				dd.addClass('local-selected');
				if( div.find(':checked').length ){
					jqchk.removeAttr('checked');
				} else {
					jqchk.attr('checked', true);
				}
				if( chk.checked ){
					if( checkChecked(cont) >= 5 ) jqchk.removeAttr('checked');
				}
			} else {
				if( chk.checked ){
					var subChecked = div.find(':checked')
					if( subChecked.length ){
						subChecked.removeAttr('checked');
					} else {
						if( checkChecked(cont) >= 5 ) $(chk).removeAttr('checked');
					}
				}
			}
		}
		function clickSubLoc(chk, cont){
			var dd = $(chk).closest('dd'), pchk = dd.find('.local-area :checkbox');
			if( chk.checked ){
				if( pchk.is(':checked') ){
					dd.find('.local-area :checkbox').removeAttr('checked');
				} else {
					if( checkChecked(cont) >= 5 ) chk.checked = false;
				}
			}
		}
		cont.find('dd').bind('click', function(event){
			if( ! $(this).hasClass('local-selected') ) cont.find('dd.local-selected').removeClass('local-selected');
			event.stopPropagation();
		});
		cont.find(':checkbox').removeAttr('checked').bind('click.selectWinCheck', function(event){
			var chk = $(this), chktype = chk.attr('chktype');
			if( chktype == 'showSub' ){
				showSubLocation(this, cont);
			} else if( chktype == 'subLoc' ){
				clickSubLoc(this, cont);
			} else {
				cont.find('dd').removeClass('local-selected');
				clickCommCheckbox(this, cont);
			}
			refreshSelectWin(cont);
			event.stopPropagation();
		});
		cont.find('.btn-line input.common-button').bind('click', function(){
			cont.find(':checkbox').attr('checked', false);
			cont.find('.popbox-subtit span').remove();
			cont.popupWin('close');
		});
		cont.find('.btn-line input.special-btn').bind('click', function(){
			var rel = cont.attr('rel'), selected = cont.data('selected'), callback = cont.data('selectedCall');
			if( selected ){
				var sname = [], sid = [];
				for( var key in selected ){
					sname.push(selected[key].name);
					sid.push(selected[key].id);
				}
				sname = sname.join(', ');
				sid = sid.join(',');
				if( sname != '' ){
					$('input[js="' + rel + '_id"]', field).val(sid);
					var max = btn.attr('maxlength') ? parseInt(btn.attr('maxlength'), 10) : 12;
					if( sname.length > max ){
						sname = sname.slice(0, max) + '...';
					}
					$('a[js="' + rel + '"] span', field).text(sname);
				} else {
					$('input[js="' + rel + '_id"]', field).val('');
					$('a[js="' + rel + '"] span', field).text(btn.attr('tips'));
				}
				if( $.isFunction(callback) ){
					callback(selected);
				}
			}
			cont.popupWin('close');
		});
	};
	var checkChecked = function(cont){
		var temp = {}, i = 0;
		cont.find('.popbox-subtit .common-selected').each(function(){
			var rid = $(this).attr('rid');
			if( ! temp[rid] ){
				temp[rid] = rid;
				i++;
			}
		});
		return i;
	};
	//删除已选
	$('div[js="jobSelectPopupwin"] .popbox-subtit a.friend-close').live('click', function(event){
		var span = $(this).parent(), cont = span.closest('div[js="jobSelectPopupwin"]'),
			selected = cont.data('selected');
		for( var i = 0; i < selected.length; i++ ){
			if( selected[i].id == span.attr('rid') ){
				selected.splice(i, 1);
				break;
			}
		}
		cont.find(':checked').filter('[rid="' + span.attr('rid') + '"]').attr('checked', false);
		cont.data('selected', selected);
		span.remove();
		refreshSelectWin(cont);
	});

	function getField(btn){
		var field = btn.closest('[jobWin="linkField"]');
		return ( field.length == 0 ) ? $('body') : field;
	}

	function bindLocationBtn(btn, field){
		if( loadingLocation == true ) return false;
		field = field || getField(btn);
		var cont = $('#locationContainer').clone().attr('id', 'loca' + new Date().getTime()).addClass('job-locationContainer').appendTo('body');
		btn.click(function(){
			cont.data('selectedCall', $('#locationContainer').data('selectedCall'));
			openSelectWin(cont, field, {
				title: lang.job.search_select_location_title + ' <span class="quiet" style="font-weight: normal;">' + lang.job.search_select_max + '</span>',
				hasOverflow: false,
				clickPopup: function(){
					$(this).find('dd.local-selected').removeClass('local-selected');
					return false; //返回false，以使弹层事件冒泡，否则live事件失效
				},
				beforeClose: function(){
					$(this).find('dd.local-selected').removeClass('local-selected');
				}
			});
			return false;
		});
		bindSelectWin(cont, btn, field);
	}
	function bindIndustryBtn(btn, field){
		field = field || getField(btn);
		var cont = $('#industryContainer').clone().attr('id', 'indu' + new Date().getTime()).appendTo('body');
		btn.click(function(){
			cont.data('selectedCall', $('#industryContainer').data('selectedCall'));
			openSelectWin(cont, field, {title: lang.job.search_select_industry_title + ' <span class="quiet" style="font-weight: normal;">' + lang.job.search_select_max + '</span>'});
			return false;
		});
		bindSelectWin(cont, btn, field);
	}
	function bindPositionBtn(btn, field){
		field = field || getField(btn);
		var cont = $('#positionContainer').clone().attr('id', 'posi' + new Date().getTime()).appendTo('body');
		btn.click(function(){
			cont.data('selectedCall', $('#positionContainer').data('selectedCall'));
			openSelectWin(cont, field, {title: lang.job.search_select_jobtype_title + ' <span class="quiet" style="font-weight: normal;">' + lang.job.search_select_max + '</span>'});
			return false;
		});
		bindSelectWin(cont, btn, field);
	}

	//载入地区选择弹层内容
	var loadingLocation = true;
	$('#locationContainer').each(function(){
		var cont = $(this);
		if($('[js="control_userid"]').val()==0){
			//如果为站外状态，则不取城市
			loadingLocation = false;
		}else{
			$.getJSON(options.areaUrl, function(data){
				if( data.state == '0' ){
					var html = '', i, loc;
					for( i = 0; i < data.common.length; i++ ){
						loc = data.common[i];
						html += '<dd><input rid="' + loc.id + '" type="checkbox" /><label>' + loc.name + '</label></dd>';
					}
					cont.find('dl:eq(0)').append(html);
					html = '';
					for( var key in data.other ){
						var rid = data.other[key][0].id;
						if( data.other[key].length > 1 ){
							html += '<dd><div class="local-area-hidden"><input type="checkbox" /><label>' + key + '</label></div>';
							html += '<div class="local-area"><input chktype="showSub" rid="' + rid + '" type="checkbox" /><label>' + key + '</label></div>';
							html += '<div class="local-dropmenu" id="subloc_' + rid + '"><ul>';
							for( i = 1; i < data.other[key].length; i++ ){
								loc = data.other[key][i];
								html += '<li><input chktype="subLoc" rid="' + loc.id + '" type="checkbox" /><label>' + loc.name + '</label></li>';
							}
							html += '</ul></div>';
						} else {
							html += '<dd><input rid="' + rid + '" type="checkbox" /><label>' + key + '</label>';
						}
						html += '</dd>';
					}
					var dl = cont.find('dl:eq(1)'), div = dl.parent();
					dl.append(html);
					loadingLocation = false;
					bindLocationBtn($('a[js="selectLocation"]'));
				}
			});
		}
	});
	//绑定默认行业选择链接
	bindPositionBtn($('a[js="selectPosition"]'));
	//绑定默认行业选择链接
	bindIndustryBtn($('a[js="selectIndustry"]'));

	return {
		bindLocationBtn: function(btn, field){
			bindLocationBtn(btn, field);
		},
		bindIndustryBtn: function(btn, field){
			bindIndustryBtn(btn, field);
		},
		bindPositionBtn: function(btn, field){
			bindPositionBtn(btn, field);
		}
	}
}
/* End *****************************/

// ** 通用设置输入框出错状态 *********************
function setErrMsg(obj, text, display) {
	obj = $(obj);
	if( obj.next('span.errInfo').length ){ return; }
	obj.after('<span class="tips errInfo"' + (( typeof(display) == 'string' ) ? ' style="display:' + display + ';margin-left:10px;"' : '') + '>' + text + "</span>");
}
function setErrStyle(obj) {
	obj = $(obj);
	obj.addClass("errTextInput");
}
function clearErrMsg( obj ) {
	if( obj ){
		obj = $(obj);
		if( obj.next('span.errInfo').length ){ $(obj).next('span.errInfo').remove(); }
		obj.removeClass('errTextInput');
	} else {
		$('span.errInfo').remove();
		$('.errTextInput').removeClass('errTextInput');
	}
}
//***************************

//发送直邮函数
function send_mail_fn(options){
	// 如果options是Event对象
	if( options.pageX && options.pageY ){
		options = {};
	}

	var link = $(this);
	if( link.attr('unverify') ) return; //如果未经验证则不绑定

	options = $.extend({width: 600}, options || {});
	var receiverId = link.attr("receiverId");
	var mail_type = link.attr("mail_type") || '';
	var uName = "";

	pop_ajax('/msg/message!sendMessageProfile.jhtml?receiverId=' + receiverId + '&mailType=' + mail_type + '&toUserid=' + receiverId, lang.msg.subject, function(options){
		var self = $(this), nameField = $('#Profile' + receiverId + 'Name'), clField = $('[js="connectLink"]');

		function check3dMsg(){
			var un = self.find('[fullname="msg"]');
			if( un.length > 0 && nameField.length > 0 ){
				un.text(nameField.text());
				if( un.is('a') ) un.attr('href', 'javascript:;');
			}
			var cl = self.find('[connectLink="3d"]');
			if( cl.length > 0 && clField.length > 0 ) cl.attr('href', clField.attr('href'));
		}
		
		function submitContent(send_type){
			var a = $("#send_mial_Final");
			var error = a.next('span.errInfo');
			var _msgType=$('[name="messageType"]:checked').val();

			if( error.length == 0 ){
				error = $('<span class="errInfo"></span>');
				a.after(error);
			}
			var title = self.find("[js='title']");
			var content = self.find("[js='content']");
			if( $.trim(title.val()) == '' ){
				error.html(lang.msg.subject_error);	//'标题不能为空'
				title.focus();
				return false;
			}
			if( $.trim(content.val()) == '' ){
				error.html(lang.msg.body_error);	//'内容不能为空'
				content.focus();
				return false;
			}
			if($('.oneDrageFlag').is(":visible")){
				receiverId = $('#receiverIds').val();
			}

			$.post('/msg/message!processSendMessage.jhtml?option=' + send_type, {subject:title.val(), body:content.val(), receiverId:receiverId, messageType:_msgType}, function(data){
				if(data==0){
					pop_alert(lang.common.submit_success);//发送成功
					self.popupWin('destroy');
				}else if(data==1){
					error.text(lang.msg.subject_error);	//'标题不能为空'
					title.focus();
				}else if(data==2){
					error.text(lang.msg.body_error);	//'内容不能为空'
					content.focus();
				}else{
					error.text(lang.common.submit_failure);	//发送失败
				}
			});
		}

		if( link.attr('toDegree') == '3d' ) check3dMsg();

		$("#send_mial_Final").click(function(){
			submitContent(0);
		});
		$("#send_mial_Final_2").click(function(){
			submitContent(2);
		});

		$.get('/msg/message!getUserName.jhtml?toUserid=' + receiverId, function(data){
			uName = data;
			$('#friendSelectListMsg').friendSelectList({
				url: '/msg/message!getFriends.jhtml',
				idField: '#receiverIds',
				inviteMax: 5,
				width: 401,
				fsParam: {
					prompt: lang.friend.fs_max_info(5),
					width: 826
				}
			});
			var u = {};
			u[receiverId] = {'name': uName, 'id': receiverId};
			$('#friendSelectListMsg').friendSelectList('option', 'selectedUsers', u);
		});

		//第一次显示的是选择页面
		self.find("[js='close']").click(function(){
			self.popupWin('destroy');
		});
		self.find("[js='submit']").click(function(){
			var send_type = self.find("[js='type']").attr("checked") ? 2 : 1;

			$.get('/msg/message!composeProfileMessage.jhtml?option=' + send_type + '&receiverId=' + receiverId + '&random='+Math.random(), function(data){
				self.html(data);
				if( link.attr('toDegree') == '3d' ) check3dMsg();
				$("#send_mial_Final").click(function(){
					submitContent(send_type);
				});
			});
		});
	}, options);
	return false;
}

// 向用户发送短信
function send_sms_fn(){
	var link = $(this), cm = link.attr('correctMobile');
	if( cm != 'true' ){  //判断手机号是否合法
		pop_alert(lang.profile.sms_mobile_err);
		return false;
	}
	pop_ajax('/currency/sms!requestSms.jhtml?targetUserId=' + $(this).attr('sendsms'), lang.profile.sms_popup_title, {
		width: 580,
		reserve: false,
		closeDestroy: true,
		stopPropagation: false,
		open: function(event, ui){
			var pop = $(this);
				uppanel = $('div[js="upgradePanel"]', this), send = $('div.pro-sendsms-pop', this);
				upgrade = $('div[div="upgrade"]', this), pay = $('div[div="paycoins"]', this);
			$().add(pay).add(upgrade).css('cursor', 'pointer').click(function(){
				var div = $(this);
				div.find("input[name='upgradeType']").attr('checked',true);
				uppanel.find('[btn]').hide();
				uppanel.find('[btn=' + div.attr('div') + ']').show();
			});
			if( upgrade.length == 0 ) pay.triggerHandler('click');
			$('a[js="gowrite"]', uppanel).click(function(){
				uppanel.hide();
				send.show();
			});
			if( $('#sendSMSExample').length == 0 ){
				$('div[js="sendSMSExample"]', this).attr('id', 'sendSMSExample').appendTo('body');
			}
			$('textarea', send).checkFieldLength({maxlength:140, cutWord:cutWord});
			$('form', send).ajaxForm({
				validate: {
					afterValidate: function(event, r){
						if( r.result ){
							send.find('.button').hide();
							send.find('.loading-inline').show();
						}
					}
				},
				success: function(data){
					pop.popupWin('destroy');
					pop_alert($.trim(data));
				}
			});
		}
	});
}

//加一度,请求引荐的验证
function checkInviteMember(a, event){
	var flag = parseInt(a.attr('checkInviteMember'), 10);	  //1:验证5000上限；2验证50上限
	var tid = a.attr('targetUserId'), href = a.attr('href');
	var agreeInvite = function(){
		if( a.attr('evt_click') ){
			var func = window[a.attr('evt_click')];
			if( $.isFunction(func) ){
				func(a[0]);
			}
		} else {
			location.href = href;
		}
	}
	$.get('/sns/sns!checkValidation.jhtml?uId=' + tid + '&requestCoinFlag=' + flag, function(data){
		if( parseInt(data) === 0 ){
			agreeInvite();
		} else {
			$(data).popupWin({
				title: lang.common.prompt,
				closeDestroy: true,
				open: function(){
					var pop = $(this);
					pop.find('[js=agreeInvite]').click(function(){
						pop.popupWin('close');
						agreeInvite();
					});
				}
			});
		}
	}, 'text');
	return false;
}

//显示用户及公司名片
function livePersonInfoPop(opt){
	var options = $.extend({
		type: 'person',
		attr: 'popPersonInfo',
		url: '/event/personinfo.jhtml?memberid='
	}, opt || {});
	var ctx = 'img[' + options.attr + '], a[' + options.attr + '], span[' + options.attr + ']', ajaxFlag = null, hoverFlag = null;
	var showTips = function(pop, link){
		$('div[id^="' + options.attr + '_"]').popupTips('destroy');
		var os = parseInt(link.attr('popCardOffset') || 0, 10);
		var tipsParam = {
			tipsType: 2,
			arrow: 'top',
			closeDestroy: true,
			detach: true,
			width: 330,
			position: {of: link, my: 'left top', at: 'center bottom', offset: (-38 + os) + ' 9'},
			open: function(event, ui){
				ui.bind('mouseenter', function(){
				  	if( hoverFlag != null ){
				  		clearTimeout(hoverFlag);
				  		hoverFlag = null;
				  	}
				});
				ui.bind('mouseleave', function(){
			 		pop.popupTips('close');
			 	});
			}
		};
		if( Math.abs(os) > 0 ) tipsParam.arrowPos = Math.abs(os) + 30;
		pop.popupTips(tipsParam);
	};
	var showCall = {
		person: function(pop){
			pop.find("[send_mail_id]").click(function(){
				send_mail_fn.call(this);
				return false;
			});
			pop.find('[js="concernPersonal"]').click(function(){
				var a = $(this);
				$.get("/sns/sns!addFollower.jhtml?targetUserId=" + a.attr("userid"), function(){
					a.replaceWith("<span class='quiet'>"+lang.connections.followed+"</span>");
				});
			});
		},
		company: function(pop){
			pop.find('a[follow]').click(function(){
				var a = $(this), id = a.attr('bizid');
				if( a.data('followAjax') == true ){
					return false;
				}
				a.data('followAjax', true);
				if( a.attr('follow') == '1' ){
					$.get('/biz/index!ajaxfollow.jhtml?bizid=' + id, function(){
						a.attr('follow', '0');
						a.removeClass('button').addClass('common-button').text(a.attr('cftext'));
						a.removeData('followAjax');
					});
				} else {
					$.get('/biz/index!ajaxCancelfollow.jhtml?bizid=' + id, function(){
						a.attr('follow', '1');
						a.removeClass('common-button').addClass('button').text(a.attr('ftext'));
						a.removeData('followAjax');
					});
				}
				return false;
			});
			pop.find('[js="descCont"]').each(function(){
				var s = $.trim($(this).text());
				if( s.slice(s.length - 3) == '...' ){
					$(this).next('a').show();
				}
			});
		}
	};
	$(ctx).live('mouseenter', function(){
		var link = $(this), pid = link.attr(options.attr), popid = options.attr + '_' + pid, linkFlag = '';
		if( link.attr('hasBind') == options.attr.replace('pop', 'show') ){
			return;
		}
		link.attr('piFocus', 'in');
		if( hoverFlag ){
			clearTimeout(hoverFlag);
			hoverFlag = null;
		}
		if( link.attr('piLink') ){
			linkFlag = '[piLink=' + link.attr('piLink') + ']';
		} else {
			linkFlag = new Date().getTime();
			link.attr('piLink', linkFlag);
			linkFlag = '[piLink=' + linkFlag + ']';
		}
		var pop = link.data('personInfoPop') || $('#' + popid);
		if( pop.length ){
			showTips(pop, link);
		} else {
			ajaxFlag = setTimeout(function(){
			   	$.get(options.url + pid, function(data){
			   		if( !checkAjaxData(data) ) return false;
					if( $(linkFlag).length == 0 ) return false;
			   		pop = $('<div id="' + popid + '">' + data + '</div>').appendTo('body').hide();
					showCall[options.type](pop);
					link.data('personInfoPop', pop);
			   		if( link.attr('piFocus') == 'in' ){
						showTips(pop, link);
			   		}
			   	});
			}, 200);
		}
	}).live('mouseleave', function(){
		var link = $(this), pid = link.attr(options.attr), popid = options.attr + '_' + pid;
		link.attr('piFocus', 'out');
		var pop = $('#' + popid);
		clearTimeout(ajaxFlag);
		if( pop.length && pop.popupTips('isOpen') == true ){
		 	hoverFlag = setTimeout(function(){
		 		pop.popupTips('close');
		 	}, 300);
		}
	});
}

//显示共同朋友
jQuery.fn.showMutualFriends = function(options){
	options = $.extend({
		url: '/sns/sns!getMutualFriends.jhtml?targetUserId=',
		idAttr: 'targetUserId'
	}, options || {});
	return this.each(function(){
		var link = $(this);
		if( link.attr('hasBind') == 'showMutualFriends' ){
			return;
		}
		link.attr('hasBind', 'showMutualFriends');
		link.bind('click', function(){
			pos = link.offset();
			if( link.data('friendsPopisOpen') ){
				$(link.data('friendsPopisOpen')).popupTips('destroy');
				return;
			}
			var p = {tipsType: 2, arrow: 'top', width: 405, closeDestroy: true,
				position: [pos.left - 27, pos.top + 22],
				beforeClose: function(){
					link.removeClass('showFriendsPopLink-up');
					link.removeData('friendsPopisOpen');
				},
				open: function(){
					link.addClass('showFriendsPopLink-up');
					link.data('friendsPopisOpen', this);
				}};
			link.addClass('showFriendsPopLink-up');
			if( link.data('friendsPop') ){
				var ul = link.data('friendsPop');
				ul.popupTips(p);
			} else {
				var div = $('<div class="a-center"></div>').append('<div class="loading" style="margin:30px auto;width:20px;"></div>');
				div.popupTips($.extend({reserve: false}, p));
				$.get(options.url + link.attr(options.idAttr), function(data){
			   		if( !checkAjaxData(data) )
			   			return false;
					var ul = $('<ul class="friendsPopList margin-top05e">' + data + '</ul>');
					link.data('friendsPop', ul);
					if( div.popupTips('isOpen') ){
						div.popupTips('destroy');
						ul.popupTips(p);
					}
				});
			}
		});
	});
};

//分享到其他网站
var share = (function(){
	return {
		sina:function(url, content){
			window.open('http://v.t.sina.com.cn/share/share.php?url='+encodeURIComponent(url)+'&title='+encodeURIComponent(content)+'&source=bookmark&content=gb2312','_blank','width=450,height=400')
		},
		kaixin:function(title, content, url){
			var su = 'http://www.kaixin001.com/repaste/bshare.php?rtitle='+encodeURIComponent(title)+'&rcontent='+encodeURIComponent(content)+'&rurl='+encodeURIComponent(url)
			window.open(su,'', 'width=650, height=420, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
		},
		renren:function(s,d,e){
			if (/renren\.com/.test(d.location)) return;
			var f = 'http://share.renren.com/share/buttonshare?link=',
				u = d.location,
				l = d.title,
				p = [e(u), '&title=', e(l)].join('');
			function a() {
				if (!window.open([f, p].join(''), 'xnshare', ['toolbar=0,status=0,resizable=1,width=626,height=436,left=', (s.width - 626) / 2, ',top=', (s.height - 436) / 2].join(''))){
					u.href = [f, p].join('');
				}
			};
			if (/Firefox/.test(navigator.userAgent)) setTimeout(a, 0);
			else a();
		},
		qq:function(t, u, s){
			var _t = encodeURI(t || document.title);
			var _url = encodeURIComponent(u || document.location);
			var _appkey = encodeURI("appkey");
			var _pic = encodeURI('');
			var _site = s || '';
			var _u = 'http://v.t.qq.com/share/share.php?url='+_url+'&appkey='+_appkey+'&site='+_site+'&pic='+_pic+'&title='+_t;
			window.open( _u,'', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no' );
		}
	}
})();

//互加关注后提醒加为一度
function eachFollowerInvite(a, event){
	var name = a.attr('eachFollower_Name'), tid = a.attr('eachFollower');
	$.get('/sns/sns!addFollower.jhtml?targetUserId=' + tid, function(data){
		a.remove();
		return false;
		if( parseInt(data, 10) === 0 ){
			var html = '<div style="padding:10px 10px 0 10px;"><p class="large">' + lang.invite.eachFollower_msg(name) + '</p><p class="a-center">' +
				'<a href="/sns/sns!inviteProfileByMutualFollow.jhtml?targetUserId=' + tid + '" class="button" target="_blank">' +
				lang.common.confirm + '</a><a href="javascript:;" class="common-button">' + lang.common.cancel + '</a></p></div>';
			var pop = $(html);
			pop.popupWin({
				title: lang.common.tips,
				width: 400,
				closeDestroy: true,
				reserve: false,
				open: function(){
					$('a', this).click(function(){
						pop.popupWin('close');
					});
				}
			});
			if( $.isFunction(window.afterAddFollower) ){
				window.afterAddFollower(a);
			}
		}
	}, 'text');
	return false;
}

//检查ajax返回，如果返回一个404或登录结果，则跳转
function checkAjaxData(data){
	if( typeof(data) == 'string' ){
		if( data.indexOf('<!--ThisLoginPage-->') > 0 ){
			//location.href = '/login.jhtml';
			return false;
		}
		if( data.indexOf('<!--ThisErrorPage-->') >= 0 ){
			//location.href = '/index.jhtml';
			return false;
		}
	}
	return true;
}

//绑定问题搜索框
function bindWendaAddSearch(qaInput){
	if( qaInput.length == 0 ) return false;
	var qDiv = qaInput.closest('[js="wdhomeSearchInput"], [wendaAjaxSearchCont]');
	if( qDiv.is(':hidden') || qaInput.attr('hasBind') == 'true' ) return false;
	qaInput.attr('hasBind', 'true');
	var qiPos = qDiv.offset();
	var baseUrl = '/wenda/search!searchTagAndQuestion.jhtml';
	var sUrl = baseUrl;
	var acKeydown = function(){};
	if( typeof(tagSearchTagName) == 'string' && qDiv.attr('wendaAjaxSearchCont') != 'header' ){
		var qiw = qaInput.width();
		var tag = tagSearchTagName;
		if( tag.length > 10 )
			tag = tag.slice(0, 9) + '...';
		tag += '：';
		var qTag = $('<span class="wd-search-curtag">' + tag + '</span>').appendTo(qDiv);
		var qtw = qTag.outerWidth();
		qaInput.css({
			marginLeft: qtw + 'px',
			width: (qiw - qtw) + 'px'
		});
		var delTag = $('<a class="wd-search-deltag" href="#">删</a>').appendTo(qDiv);
		qaInput.bind('focus', function(){
			delTag.css('display', 'none');
		}).bind('blur', function(){
			delTag.css('display', 'block');
		});
		var removeTag = function(){
			qTag.remove();
			qaInput.css({
				marginLeft: 0,
				width: qiw + 'px'
			});
			delTag.remove();
			qaInput.autocomplete('option', 'source', baseUrl);
		}
		delTag.bind('click', removeTag);
		var acKeydown = function(evt){
			if( evt.keyCode == 8 ){
				if( qaInput.val() == '' ){
					if( qDiv.find('.wd-search-curtag').length ){
						removeTag();
						return false;
					}
				}
			}
		};
		sUrl += '?tagId=' + tagSearchTagId;
	}
	function closeNullTip(){
		$('#mainSearchNullTip').each(function(){
			$(this).popupTips('destroy');
		});
	}
	var lt = '<li index="%1" logo="%6" class="wd-home-search-list%3" href="%3"><a href="%3"><p><span litext="yes">%2</span><span class="quiet">%4</span></p><p class="wd-home-search-list-sm">%5&nbsp;</p></a></li>';
	if( $.browser.se360 || $.browser.msie7 ){
		lt = '<li index="%1" logo="%6" class="wd-home-search-list%3" href="%3"><p><span class="blue" litext="yes">%2</span><span class="quiet">%4</span></p><p class="wd-home-search-list-sm">%5&nbsp;</p></li>';
	}
	qaInput.autocomplete({
		position: {of: qDiv},
		width: qDiv.outerWidth(),
		url: sUrl,
		ajaxKey: 'searchKey',
		ajax: 'results',
		listClass: 'ac-dp-list wd-home-search-list',
		li_id: ['id', 'name', 'type', 'typeName', 'summary', 'logo'],
		li_template: lt,
		showSelection: false,
		showEmptyList: true,
		igoneEmptyKey: false,
		listMax: 11,
		beforeShow: function(event, ul){
			closeNullTip();
			var key = $(this).data('searchKey'), linkurl = {'1': '/wenda/question!detail.jhtml?qid=', '2': '/wenda/tag!index.jhtml?id='};
			ul.find('li.wd-home-search-list2').prepend('<span class="wd-topic-img"></span>');
			var lis = ul.find('li');
			if( lis.length ){
				lis.each(function(){
					var li = $(this), a = li.find('>a'), t = li.find('[litext="yes"]');
					if( a.length ){
						a.attr('href', linkurl[a.attr('href')] + li.attr('index'));
					} else {
						li.attr('href', linkurl[li.attr('href')] + li.attr('index'));
					}
					if( li.attr('logo') != '' ){
						  var logo = li.find('> span.wd-topic-img').append('<img style="margin:0;" src="' + li.attr('logo') + '" />');
					}
					if( key != '' ){
						var re = new RegExp('(' + key + ')', 'ig'), ts = t.text();
						t.html(ts.replace(re, function($0, $1){
							return '<b>' + $1 + '</b>';
						}));
					}
				});
				if( lis.length > 10 ){
					lis.filter(':last').replaceWith('<li class="a-center" ac="isExt" style="padding:5px 0;"><a href="javascript:void(0)" js="submitSearchKey">' +
						( key != '' ? '查看更多搜索结果：<b>' + key + '</b>' : '查看更多结果' ) + '</a></li>');
					setTimeout(function(){
						ul.find('a[js="submitSearchKey"]').click(function(){
							setTimeout(function(){
								qaInput.closest('form').submit();
							}, 100);
						});
					}, 0);
				}
			} else {
				var ipt = $('.wd-home-search-ipt'), pos = qDiv.offset(), w = qDiv.outerWidth();
				var tip = $('<div id="mainSearchNullTip">没有搜索到任何话题或问题，可换关键字搜索，或在提问向导或问题页面添加新的话题</div>');
				tip.popupTips({
					position: [pos.left, pos.top + 42],
					width: w,
					tipsType: 3,
					arrow: 'top',
					closeDestroy: true,
					reserve: false,
					open: function(evt, ui){
						ui.find('.tip-close').remove();
					}
				});
				return false;
			}
		},
		selected: function(event, li){
			var a = li.find('>a');
			var href = ( a.length == 0 ) ? li.attr('href') : a.attr('href');
			location.href = href;
		},
		keydown: acKeydown,
		blur: closeNullTip
	});
}

//绑定活动搜索框
function bindEventAddSearch(esInput, listClass){
	if( esInput.length == 0 ) return false;
	var esInner = esInput.closest('.event_search_InnerIpt, [eventAjaxSearchCont]');
	if( esInner.is(':hidden') || esInput.attr('hasBind') == 'true' ) return false;
	esInput.attr('hasBind', 'true');
	var pos = esInner.offset();
	esInput.autocomplete({
		url: '/event/manage!getEventRecommend.jhtml',
		ajax: 'list',
		listContClass: 'common-search-outer',
		listClass: listClass || '',
		width: esInner.outerWidth(),
		hoverClass: 'hover',
		showEmptyList: true,
		position: [pos.left, pos.top + esInner.outerHeight()],
		li_id: ['id_','title_','addr_','time_','num_'],
		li_template: '<li class="border-bottom" index="%1" jsid="%1"><a href="/event/view!viewDetail.jhtml?id=%1">%2</a><br /><span class="quiet">%3</span> | <span class="quiet">%4</span><br /><span class="quiet">%5</span>人参加</li>',
		showSelection: false,
		ajaxKey: 'keyword',
		popupOptions: {
			stopPropagation: false
		},
		selected: function(event, li){
			var val = li.find('a').text();
			$(this).val(val);
		},
		beforeShow: function(event, ul){
			var pos1 = esInner.offset();
			$(this).autocomplete('option', 'position', [pos1.left, pos1.top + esInner.outerHeight()]);
			if(ul.html()==''){
				$(this).autocomplete('show', [{'id_':'-1'}]);
				ul.empty().append('<li style="padding:5px 10px;border:none" ac="isExt">'+lang.event.eventSearchNotFindanyeventInput+'!</li>')
			};
			if( ul.find('li').length >2 ){
				var key = $(this).val();
				setTimeout(function(){
			  		ul.append('<li class="a-center" ac="isExt" style="padding:10px 0;border:none"><a href="/event/searchbykeywords.jhtml?keywords='+key+'">'+lang.event.searchWatchMore+'</a></li>');
				},0)
			}else{
				setTimeout(function(){
					ul.find('li:last').css('border-bottom','none');
				},1000)
			}
		},
		focus: function(event, obj){
			if( obj.val() == '' ){
				obj.autocomplete('show', [{'id_':'-1'}]);
				$('.common-search-outer ul').empty();
				$('.common-search-outer ul').append('<li style="padding:5px 10px;border:none" ac="isExt">'+lang.event.searchEvent+'</li>')
				return false;
			}
		},
		pressEnter: function(event){
			var p = esInput.parent();
			if( p.is('form') ) p.submit();
		}
	});
}

//绑定一度人脉搜索
function bindSnsAjaxSearch(snsInput){
	if( snsInput.length == 0 ) return false;
	var snsDiv = snsInput.closest('.search-q, [snsAjaxSearchCont]');
	if( snsDiv.is(':hidden') || snsInput.attr('hasBind') == 'true' ) return false;
	snsInput.attr('hasBind', 'true');
	var pos = snsDiv.offset();
	var searchPopisShow = false;
	snsInput.autocomplete({
		width: snsDiv.outerWidth(),
		ajax: 'search_result',
		url: '/search/search!simpleSearch.jhtml',
		ajaxKey: 'keyword',
		position: [pos.left, pos.top + snsDiv.outerHeight()],
		listClass: 'ac-dp-list vcard header-ajax-list',
		li_template: '<li index="%1"><a js="jumpurl" href="/search/search!profileClick.jhtml?id=%1"><img src="%3" /></a><dl><dt><a js="uname" href="/search/search!profileClick.jhtml?id=%1" litext="%1">%2</a></dt><dd>%4</dd></dl></li>',
		li_id: ['id', 'name', 'thumb', 'title'],
		showSelection: false,
		beforeShow: function(event, ul){
			var key = $(this).val(),
				divtamp = new Date().getTime();
			ul.find('a').each(function(){
				$(this).attr('href', $(this).attr('href') + '&divtamp=' + divtamp);
			});
			ul.find('dd').each(function(){
				$(this).text(cutWord($(this).text(), 50));
			});
			searchPopisShow = true;
			setTimeout(function(){
				if( searchPopisShow )
					$.get('/search/search!popdivCallBack.jhtml?divtamp=' + divtamp);
			}, 1000);
			if( ul.find('li').length >4 ){
				ul.append('<li class="a-center" ac="isExt" style="padding:5px 0;"><a href="javascript:void(0)" js="submitSearchKey">' + lang.search.homepagepoptips1 + '<b>' + key + '</b>' + lang.search.homepagepoptips2 + '</a></li>');
				setTimeout(function(){
					ul.find('a[js="submitSearchKey"]').click(function(){
						snsInput.val(key);
						snsInput.closest('form').submit();
					});
				}, 0);
			}
		},
		hide: function(){
			searchPopisShow = false;
		},
		selected: function(event, li){
			$(this).val(li.find('[js="uname"]').text());
			location.href = li.find('a[js="jumpurl"]').attr('href');
		},
		pressEnter: function(event){
			snsInput.closest('form').submit();
		}
	});
}

//绑定编辑技能标签
jQuery.fn.editSkillTags = function(opt){
	var options = $.extend({
		submit: '[editSkill="submit"]',
		errMsg: '[editSkill="Error"]',
		loading: '[editSkill="loading"]',
		cancel: '[editSkill="cancelLink"]',
		saveUrl: '/ajax/json!saveTagChanges.jhtml?linkType=1',
		setParam: function(tags){
			var param = {};
			tags.each(function(i){
				var tag = $(this);
				param['tagList[' + i + '].id'] = tag.attr('tagId');
				param['tagList[' + i + '].tagname'] = $.trim(tag.text());
			});
			return param;
		},
		allowAddedHide: true,
		minTags: 0,
		maxTags: 30
	}, opt || {});

	return this.each(function(){
		var cont = $(this), recomm = cont.find('[js=recommList]'), added = cont.find('[js="addedCont"]'), taglist = cont.find('[js=tagList]'), text = cont.find('[js="skillText"]');
		if( typeof(options.submit) == 'string' ) options.submit = cont.find(options.submit);
		if( typeof(options.errMsg) == 'string' ) options.errMsg = cont.find(options.errMsg);
		if( typeof(options.loading) == 'string' ) options.loading = cont.find(options.loading);
		if( typeof(options.cancel) == 'string' ) options.cancel = cont.find(options.cancel);

		if( options.submit.length > 0 ){
			options.submit.click(function(){
				var a = $(this);
				var tags = taglist.find('>span[tagId]');
				if( tags.length < options.minTags ){
					options.errMsg.slideDown(200);
					options.loading.hide();
					options.cancel.show();
					if( $.isFunction(options.saveerror) ){
						options.saveerror(cont);
					}
					return false;
				}
				var param = options.setParam(tags);
				if( a.data('savingSkill') == true ) return false;
				a.data('savingSkill', true);
				options.errMsg.hide();
				options.loading.show();
				options.cancel.hide();
				$.post(options.saveUrl, param, function(data){
					a.removeData('savingSkill');
					options.loading.hide();
					options.cancel.show();
					if( $.isFunction(options.saveback) ){
						options.saveback(data);
					}
				});
				return false;
			});
		}

		text.autocomplete($.extend({
			source: '/ajax/json!searchUserTags.jhtml?linkType=1',
			ajaxKey: 'keyword',
			ajax: 'tags',
			li_id: ['id', 'tagname'],
			selected: function(event, li){
				addTag(li.attr('index'), li.text());
				resetText();
			},
			enterSelectFirst: true,
			pressEnter: function(event, li){
				var v = $.trim(text.val());
				if( li.length == 0 ){
					addTag('0', v);
				}
				resetText();
			}
		}, options.acOptions || {}));

		updateCount();

		cont.find('[js="addMySkill"]').click(function(){
			var li = text.autocomplete('getSelected', null, true);
			if( li.length == 0 ){
				addTag('0', $.trim(text.val()));
			}
			resetText();
		});
		recomm.delegate('a[tagId]', 'click', function(){
			var a = $(this);
			addTag(a.attr('tagId'), $.trim(a.text()));
		});
		taglist.delegate('span[tagId] a', 'click', function(){
			$(this).parent().remove();
			updateCount();
		});

		function resetText(){
			text.val('').focus();
			setTimeout(function(){
				text.focus().click();
			}, 100);
		}
		function addTag(tid, tname){
			var r = true, alltag = taglist.find('>span[tagId]');
			if( tname == '' || tname == text.attr('defaultTips') ) return false;
			if( alltag.length >= options.maxTags ) return false;
			tid = parseInt(tid);
			alltag.each(function(){
				var tag = $(this);
				if( (tid == 0 && tname == $.trim(tag.text())) || (tid != 0 && tid == parseInt(tag.attr('tagId'))) ){
					r = false;
					return false;
				}
			});
			if( r != true ) return false;
			taglist.append('<span class="skill-tag-del" tagId="' + tid + '">' + tname + '<a class="skill-ico-del" href="javascript:;">&nbsp</a></span>');
			updateCount();
			if( parseInt(tid) != 0 ) getRecommend(tid);
		}
		function updateCount(){
			var l = taglist.find('>span[tagId]').length, cnt = options.maxTags - l;
			added.find('[js="addedCnt"]').text(Math.max(0, cnt));
			if( cnt == options.maxTags ){
				if( options.allowAddedHide == true ) added.hide();
			} else {
				added.show();
			}
			if( cnt <= (options.maxTags - options.minTags) ) options.errMsg.slideUp(200);
			if( $.isFunction(options.updateCount) ){
				options.updateCount(l);
			}
		}
		function getRecommend(tid){
			var param = {"tagVo.id": tid, "topNum": 3}, rids = [];
			recomm.find('>a[tagId]').each(function(){
				rids.push($(this).attr('tagid'));
			});
			taglist.find('>span[tagId]').each(function(){
				rids.push($(this).attr('tagid'));
			});
			recomm.find('>a[tagId=' + tid + ']').hide();
			param['excludeIds'] = rids.join(',');
			$.post('/ajax/json!listRecommendUserTags.jhtml?linkType=1', param, function(json){
				for( var i = 0; i < json.tags.length; i++ ){
					recomm.append('<a class="skill-tag-add" href="javascript:;" tagId="' + json.tags[i].id + '">' + json.tags[i].tagname + '<span class="skill-ico-add">&nbsp</span></a>');
				}
				var l = recomm.find('>a[tagId]').length - options.maxTags;
				if( l > 0 ) recomm.find('>a[tagId]:lt(' + l + ')').hide();
			}, 'json');
		}
	});
}


//初始化页面header通用信息
function fillProfileInfo(firstLoad) {
	$.getJSON("/info!profile.jhtml", function (json) {
		document.userInfo = json;

		$("[jsonInfo='coinsCount']").html(json.coinsCnt);
		var ms = [lang.common.membership_co, lang.common.membership_pl, lang.common.membership_dm, lang.common.membership_ut];
		$("[jsonInfo='membership']").html(ms[json.membership]);

		var msgCount = json.newMessageCount + json.newNotifacationCount;
		var msg = $('[jsonInfo="newMessageCount"]');
		if( msgCount > 0 ){
			msg.data('count', {nf:json.newNotifacationCount, mail:json.newMessageCount}).addClass('hd-message-new').find('.hd-countnum').text(msgCount);
		}

		var rqCount = json.friendInviteCnt + json.requestIntroduceCnt + json.groupInviteCnt + json.groupeventInviteCnt + json.endorseInviteCnt;
		var rq = $('[jsonInfo="newRequestCount"]');
		if( rqCount > 0 ){
			rq.data('count', rqCount).addClass('hd-request-new').find('.hd-countnum').text(rqCount);
		}

		if( $.isFunction(window.checkInfoProfile) ){
			window.checkInfoProfile(json);
		}

		if( firstLoad === true ){
			if( rqCount > 0 && rq.length > 0 ) preloadRequest(rq);
			if( msgCount > 0 && msg.length > 0 ) preloadMessage(msg);
		}
	});
}

// 通知与直邮预加载
function preloadMessage(msg){
	var count = msg.data('count'), nfc = count.nf, mailc = count.mail, cc = nfc + mailc;
	var cont = msg.parent().find('.hd-message-cont');
	if( nfc > 0 ){
		var nfmenu = cont.find('a[type="notification"]'),
			nflist = cont.find('div[list="notification"]'),
			nfwrap = nflist.find('.hd-nav-sub-wrapper'),
			nfempty = nflist.find('[js=empty]');
			nids = '';
		nfmenu.find('span').show().find('b').text(nfc);
		nfempty.hide();

		function readNF(){
			var anid = [];
			nflist.find('.event-block').each(function(){
				anid.push($(this).attr('nid'));
			});
			if( anid.length > 0 ){
				nfc = Math.max(0, nfc - anid.length);
				cc = Math.max(0, cc - anid.length);
				if( nfc <= 0 ){
					nfmenu.find('span').hide().find('b').text(0);
				} else {
					nfmenu.find('b').text(nfc);
				}
				count.nf = nfc;
				msg.data('count', count).find('.hd-countnum').text(cc);
				if( cc <= 0 ){
					msg.removeClass('hd-message-new');
				}
				$.get('/msg/notification!readNotifications.jhtml?readnids=' + anid.join(','));
				anid.push(nids);
				nids = anid.join(',');
			}
		}
		function loadNF(read){
			nfempty.after('<div class="loading">&nbsp;</div>');
			$.ajax({
				url:"/msg/notification!listNotificationsPreLoad.jhtml",
				data:{"newPageSize": "5", "excludenids": nids},
				success:function(data){
					if( ! checkAjaxData(data) ) return false;  //返回数据错误
					nflist.find('.loading').remove();
					nflist.find('[js=list]').append(data);
					setTimeout(function(){
						checkMenuBoxHeight(nfwrap, 100);
						// 如果是拉后续的则设为已读
						if( read == true ) readNF();

						nflist.find('.event-block').hover(function(){
							$(this).addClass('event-block-hover');
						}, function(){
							$(this).removeClass('event-block-hover');
						});
						nflist.find('[js=feedCommonClose]').click(function(){
							var item = $(this).closest('.event-block');
							item.slideUp(300, function(){
								nfwrap.find('>div').triggerHandler('resize');
								item.remove();
								if( nflist.find('.event-block').length == 0 ){
									if( nfc > 0 ){
										loadNF(true);
									} else {
										nfempty.slideDown(300);
									}
								}
							});
						});
					}, 50);
				}
			});
		}
		// 标记所有通知为已读
		nfmenu.one('click', readNF);
		loadNF();
	}
	if( mailc > 0 ){
		var mmenu = cont.find('a[type="mail"]'),
			mlist = cont.find('[list="mail"]'),
			mwrap = mlist.find('.hd-nav-sub-wrapper'),
			mempty = mlist.find('[js=empty]');
		mmenu.find('span').show().find('b').text(mailc);
		mempty.hide();

		function loadMail(){
			mempty.after('<div class="loading">&nbsp;</div>');
			$.ajax({
				url: "/msg/message!getMessageInboxAjax.jhtml",
				type: "POST",
				data:{"msgcount":"5", inboxMessageFlg:'1'},
				success:function(data){
					if( ! checkAjaxData(data) ) return false;  //返回数据错误
					mlist.find('.loading').remove();
					mlist.find('[js=list]').append(data);
					setTimeout(function(){
						checkMenuBoxHeight(mwrap, 100);
						mlist.find('.event-block').hover(function(){
							$(this).addClass('event-block-hover');
						}, function(){
							$(this).removeClass('event-block-hover');
						});
						mlist.find('[js="mail_close"]').click(function(){
							var item = $(this).closest('.event-block');
							$.get('/msg/message!readMessageInboxAjax.jhtml', {messageId:item.attr('msgid'), inboxMessageFlg:1});
							mailc --;
							cc --;
							if( mailc <= 0 ){
								mmenu.find('span').hide().find('b').text(0);
								mempty.slideDown(300);
							} else {
								mmenu.find('b').text(mailc);
							}
							count.mail = mailc;
							msg.data('count', count).find('.hd-countnum').text(cc);
							if( cc <= 0 ){
								msg.removeClass('hd-message-new');
							}
							item.slideUp(300, function(){
								mwrap.find('>div').triggerHandler('resize');
								item.remove();
								if( mlist.find('.event-block').length == 0 && mailc > 0 ) loadMail();
							});
						});
					}, 50);
				}
			});
		}
		loadMail();
	}
}


// 请求预加载
function preloadRequest(rq){
	var href = rq.attr('href');
	rq.attr('href', 'javascript:;');
	var li = rq.parent();
	var sub = $('<div class="hd-nav-sub"><div class="hd-nav-sub-wrapper"><div class="hd-nav-sub-cont hd-request-cont"><div class="loading">&nbsp;</div></div></div></div>').appendTo(li);
	var wrapper = sub.find('.hd-nav-sub-wrapper'), cont = wrapper.find('.hd-request-cont');
	$.ajax({
		url:"/msg/request!listIndexRequest.jhtml",
		type:"POST",
		success:function(data){
			sub.find('.loading').remove();
			cont.append(data);
			cont.append('<p class="a-center pd-top"><a class="large" href="' + href + '">' + rq.attr(rq.data('count') > 5 ? 'linkAllText' : 'linkHisText') + '</a></p>');
			setTimeout(function(){
				cont.find('[url]').click(rq_operation);
				cont.find('.event-block').hover(function(){
					$(this).addClass('event-block-hover');
				}, function(){
					$(this).removeClass('event-block-hover');
				});

				checkMenuBoxHeight(wrapper);
			}, 50);
		}
	});

	function rq_operation(){
		var a = $(this), p = a.parent(),
			item = a.closest('.event-block'),
			rtype = a.attr('rtype');
		p.find('>*').hide();
		p.append('<span class="loading-inline">&nbsp;</span>');
		$.ajax({
			url: a.attr('url'),
			type: 'POST',
			data: a.attr('data'),
			success:function(){
				rq.data('count', rq.data('count') - 1);
				rq.find('.hd-countnum').text(rq.data('count'));
				if( rq.data('count') <= 0 ){
					rq.removeClass('hd-request-new');
				}

				var rhtml = cont.find('#req_popup').children('[rtype="' + rtype + '"]');
				if (item.find('[uname]').length>0){
					rhtml.find('span').html(item.find('[uname]').eq(0).attr('uname'));
				}
				if (item.find('[uid]').length>0){
					rhtml.find('[ulink]').attr('href','/u/'+item.find('[uid]').eq(0).attr('uid'));
					rhtml.find('[receiverid]').attr('receiverid',item.find('[uid]').eq(0).attr('uid'));
				}
				if (item.find('[gid]').length>0){
					rhtml.find('[glink]').attr('href','/group/groupDetail.jhtml?groupId='+item.find('[gid]').eq(0).attr('gid'));
				}
				if (item.find('[eventid]').length>0){
					rhtml.find('[elink]').attr('href','/event/view!viewDetail.jhtml?id='+item.find('[eventid]').eq(0).attr('eventid'));
				}
				if (item.find('span').find('i').length>0){
					rhtml.find('[js="pynk_event_name"]').html(item.find('span').find('i').html());
				}
				var wrap = item.closest('.hd-nav-sub-wrapper').find('>div');
				item.html(rhtml.html());
				wrap.triggerHandler('resize');
				setTimeout(function(){
					item.slideUp(300, function(){
						wrap.triggerHandler('resize');
						item.remove();
					});
				}, 2500);
			}
		});
	}
}
function checkMenuBoxHeight(wrapper, g){
	g = g || 60;
	var h = wrapper.height(), wh = $(window).height();
	if( wrapper.data('fixedHeight') == true ){
		wrapper.uiScrollBar('show');
		wrapper.uiScrollBar('option', 'height', wh - g);
		setTimeout(function(){
			wrapper.find('>div').triggerHandler('resize');
		}, 0);
		return;
	}
	if( h + g > wh ){
		wrapper.data('fixedHeight', true);
		wrapper.height(wh - g);
		wrapper.uiScrollBar({
			widgetClass: 'hd-scroll-bar',
			direction: 'vertical',
			opacity: 0.5,
			fixMaginTop: false,
			sbOptions: {
				gap: 8,
				width: 12
			},
			resize: function(event, wrap){
				var _cont = $(this);
				if( wrap.height() < _cont.height() ){
					wrap.css('margin-top', 0);
					wrapper.uiScrollBar('option', 'scrollTop', 0);
					wrapper.uiScrollBar('hide');
					_cont.height('auto');
					return;
				}
				// if( parseInt(wrap.css('margin-top')) + wrap.height() < _cont.height() ){
				// 	wrapper.uiScrollBar('option', 'scrollTop', wrap.height() - _cont.height());
				// }
			}
		});
	}
}

// 绑定页头导航栏
function bindHeader(){
	var header = $('.hd-wrapper');

	// 绑定下拉菜单
	var nav = $('.hd-nav');
	var li = nav.find('>li.hd-menu');
	li.mouseenter(function(){
		li.removeClass('hd-menu-cur');
		$(this).addClass('hd-menu-cur');
	});
	li.mouseleave(function(){
		$(this).removeClass('hd-menu-cur');
	});
	nav.find('>li[show="click"]').click(function(){
		var li = $(this);
		if( li.hasClass('hd-menu-cur') ){
			$(document).triggerHandler('click.hideHeaderSubMenu');
			return false;
		}
		li.addClass('hd-menu-cur');
		if( li.attr('subType') == 'message' ){
			li.find('[js=list]').each(function(){
				var list = $(this);
				if( list.find('>*').length > 0 ){
					li.find('a[type=' + list.closest('div[list]').attr('list') + ']').triggerHandler('click');
					return false;
				}
			});
		} else {
			setTimeout(function(){  // 检查请求模块是否存在高度问题
				checkMenuBoxHeight(li.find('.hd-nav-sub-wrapper'));
			}, 0);
		}
		setTimeout(function(){
			$(document).one('click.hideHeaderSubMenu', function(){
				li.removeClass('hd-menu-cur');
			});
		}, 200);
	}).delegate('.hd-nav-sub', 'click', function(event){
		event.stopPropagation();
	});

	// 绑定搜索框
	var sccont = header.find('.hd-search-cont'),
		scslt = sccont.find('.hd-search-type'),
		scexp = sccont.find('.hd-search-expend'),
		scbtn = sccont.find('.hd-search-button');

	scslt.click(function(event){
		if( scexp.is(':visible') ){
			$(document).trigger('click.closeHeaderSearchExpend');
		} else {
			scexp.show();
			setTimeout(function(){
				$(document).bind('click.closeHeaderSearchExpend', function(){
					$(document).unbind('click.closeHeaderSearchExpend');
					scexp.hide();
				});
			}, 50);
		}
		return false;
	});

	var bindSearchFunc = [function(f){
			bindSnsAjaxSearch(f.children(':text'));
		},
		function(){},
		function(f){
			bindEventAddSearch(f.children(':text'), 'ac-dp-list header-ajax-list');
		},
		function(){},
		function(f){
			bindWendaAddSearch(f.children(':text'));
		}];
	scexp.find("li").click(function(){
		var li = $(this), a = li.children('a'), t = parseInt(a.attr('js'), 10), lis = li.siblings('li');
		lis.removeClass("hide");
		li.addClass('hide');
		var forms = sccont.find('form');
		scslt.text(a.text()).attr('js', t);
		var key = forms.filter(':visible').find(':text').val();
		scexp.hide();
		var form = forms.hide().filter(':eq(' + t + ')').show();
		form.find(':text').val(key);
		if( form.attr('hasBind') == 'true' ) return;
		form.attr('hasBind', 'true');
		bindSearchFunc[t](form);
	});
	bindSnsAjaxSearch(sccont.find('form:eq(0)').children(':text'));

	scbtn.click(function(){
		sccont.find('form:visible').submit();
	});

	// 绑定消息操作事件
	$('.hd-message-cont').each(function(){
		var msg = $(this), menu = msg.find('[js="menu"] a[type]');
		menu.click(function(){
			var a = $(this);
			menu.removeClass('current');
			a.addClass('current');
			var list = msg.find('div[list]').hide().filter('[list=' + a.attr('type') + ']').show();
			checkMenuBoxHeight(list.find('.hd-nav-sub-wrapper'), 100);
			if( $.browser.msie6 ){
				msg.find('.hd-message-menu').height(list.outerHeight());
			}
		});
	});
}


//未经后台验证的操作，不做绑定
function unverifyAction(){
	popupUnverify($(this).attr('unverify'));
	return false;
}
function popupUnverify(type){
	pop_ajax('/emailverify!popUpEmailVerify.jhtml', lang.common.verify_email_pop_title, function(evt, ui){
		ui.find('[js="opeRegChgEmail"]').bind('click',function(){
			ui.find('form[js="changeRegEmail"]').toggle();
		});
	});
}

//绑定浮动列表的脚本
function bindExpandWord(list, opt, dw, pw){
	list = list || $('[js=expandWord]');
	opt = $.extend({w: 48, p: 14, h: 18}, opt || {});
	list.find('.epw-cont:visible').each(function(){
		var cont = $(this), word = cont.find('.epw-word'), w = word.find('span.epw-w');
		var ww = Math.min(w.width(), opt.w);
		cont.width(ww + opt.p);
		word.width(ww);
		if( w.width() > opt.w ){
			cont.width(ww + opt.p + 4);
			cont.append('<span class="epw-arrow"></span>');
			cont.find('.epw-block').css('padding-right', '10px').hover(function(){
				list.find('.epw-cont').css('z-index', 0);
				cont.css('z-index', 10).find('.epw-arrow').hide();
				word.width(w.width());
				$(this).width(w.width()).height(opt.h);
			}, function(){
				cont.css('z-index', 0).find('.epw-arrow').show();
				word.width(ww);
				$(this).width(ww);
			});
		}
	});
}
function bindExpandList(list, dh){
	list = list || $('[js=expandList]');
	dh = dh || 36;
	list.find('.epl-cont:visible').each(function(){
		var cont = $(this), div = cont.find('.epl-height'), h = cont.find('.epl-h');
		if( ! div.data('eplh') ){
			var lh = Math.min(h.height(), dh);
			div.height(lh).data('eplh', lh);
			cont.height(lh);
			if( h.height() > dh ){
				cont.append('<span class="epl-arrow"></span>');
				div.hover(function(){
					list.find('.epl-cont').css('z-index', 0);
					cont.css('z-index', 10).find('.epl-arrow').hide();
					div.addClass('epl-hover');
				}, function(){
					cont.css('z-index', 0).find('.epl-arrow').show();
					div.removeClass('epl-hover');
				});
			}
		}
	});
}

//绑定注册服务协议
function bindRegService(chk, submit){
	chk = $(chk || '#userService');
	submit = $(submit || '#userEnter');
	if( submit.length && submit.is('input') ){
		chk.bind('click', function(){
			if( this.checked ){
				submit.removeAttr('disabled').removeClass('disable-button').addClass('button');
			} else {
				submit.attr('disabled', 'true').removeClass('button special-btn').addClass('disable-button');
			}
		});
	}
}

//自动关闭页面提示条
function autoHideTips(){
	$('[autoHideTips]').each(function(){
		var tips = $(this), options = {type:'slide', speed:250}, opt = (new Function('return ' + tips.attr('autoHideTips')))();
		if( $.isPlainObject(opt) ){
			options = $.extend(options, opt);
		} else {
			options.time = opt;
		}
		setTimeout(function(){
			var close = tips.find('a.common-close');
			if( close.length ){
				close.trigger('click');
			} else {
				if( options.type == 'slide' ){
					tips.slideUp(options.speed);
				} else {
					tips.fadeOut(options.speed);
				}
			}
		}, parseInt(options.time, 10) || 5000);
	});
}

//***********************************************************************************
$(document).ready(function(){
	//设置全局ajax成功事件
	$.ajaxSetup({
		dataType: 'text',
		cache: false,
		headers: {"ushi-ajax": "true"},
		success: checkAjaxData
	});

	//未经后台验证的操作，不做绑定
	$('*[unverify]').live('click', unverifyAction);

	//导航及菜单
	if(typeof __subnav != 'undefined')
		$('#'+ __subnav.toLowerCase()).addClass('current');

	if(typeof __nav != 'undefined')
		$('#'+ __nav.toLowerCase()).addClass('nav-current');

	if(typeof __navoff != 'undefined')
		$('#'+ __navoff.toLowerCase()).removeClass('nav-current');

	// dropDownMenu($("#top_btn_userManage"), $("#top_menu_userManage"));
	// dropDownMenu($("#top_btn_set"), $("#top_menu_set"));
	// dropDownMenu($("#top_btn_request"), $("#top_menu_request"));
	// dropDownMenu($("#top_btn_lang"), $("#top_menu_lang"));

	//页头导航
	bindHeader();

	//切换中英文
	$('[js="top_menu_set_zh"]').click(function(){
		$.get("/user/index!toggle.jhtml?request_locale=zh_CN",function(data){
			window.location.reload(true);
		});
	});
	$('[js="top_menu_set_en"]').click(function(){
		$.get("/user/index!toggle.jhtml?request_locale=en_US",function(data){
			window.location.reload(true);
		});
	});

	//获取页面header通用信息
	fillProfileInfo(true);
	setInterval(fillProfileInfo, 300000);

	//绑定发送直邮函数
	$("[send_mail_id]").click(send_mail_fn).attr('hasBind', 'sendMail');

	//向其他用户发送短信
	$('[sendsms]').click(send_sms_fn).attr('hasBind', 'sendSMS');

	//为所有textarea自动绑定长度判断
	$('textarea[maxlength]').checkFieldLength();

	//为指定的submit按钮绑定模式等待提示
	$('input[submitwaiting]').bind('click', function(){
		var btn = $(this);
		var info = $('<span>' + btn.attr('submitwaiting') + '</span>').addClass('loading');
		btn.after(info);
		btn.hide();
		pop_overlay();
	});

	//为所有有defaultTips的文本框绑定显示
	$(':text[defaultTips], textarea[defaultTips]').showDefaultTips();

	//加一度,请求引荐的验证
	$('[checkInviteMember]').bind('click', function(event){
		return checkInviteMember($(this), event);
	}).attr('hasBind', 'checkInviteMember');

	//绑定显示用户名片
	livePersonInfoPop();

	//绑定公司名片
	livePersonInfoPop({
		type: 'company',
		attr: 'popCompanyInfo',
		url: '/biz/index!getAjaxBizInfo.jhtml?bizid='
	});

	//互加关注后提醒加为一度
	$('[eachFollower]').bind('click', function(event){
		return eachFollowerInvite($(this), event);
	}).attr('hasBind', 'eachFollower');

	//绑定注册页是否选中服务协议
	bindRegService();

	//绑定下拉菜单
	livePopMenu();

	//初始化职位选择弹层
	if( document.ignoreJobWin != true ) initJobSelectWin();

	//绑定城市选择
	bindSelectCity();

	//自动关闭页面提示条
	autoHideTips();

	//建议和反馈
	$('#side-feedback').click(function(){
		var options = {width: 570};
		pop_ajax('/feed_back/addFeedbackUI.jhtml', lang.feedback.title,
			function(){
				var self = $(this),
					form = self.find('form');
				var typename = form.find('[name=typename]'),
				title = form.find('[name=title]'),
				content = form.find('[name=content]'),
				phone = form.find('[name=phone]');
				form.find('input:button').click(function(){
					if(	typename.val() == 0) {
						pop_alert(lang.feedback.type_error);
					}else if( title.val() == ''){
						pop_alert(lang.feedback.title_error);
						title.focus();
					}else if( content.val() == ''){
						pop_alert(lang.feedback.body_error);
						content.focus();
					}else
					$.post('/feed_back/addFeedback.jhtml',{typename:typename.val(), title:title.val(), content:content.val(), phone:phone.val()},function(data){
						switch(data){
						case '1':
							pop_alert(lang.common.submit_failure);
						break;
						default:
							self.popupWin('destroy');
							pop_alert(data);
						}
					});
				});
			},
			options);
		return false;
	});
});


//AR发送直邮函数
function send_mail_ar(_receiverId,_jobId){
	var _rid=_receiverId.split(',');
	var uName = "";
	pop_ajax("/msg/message!sendMessageProfileByAr.jhtml?receiverId="+_receiverId+"&jobid="+_jobId+"&fjcMessage=1","发送猎才直邮",function(){
		var self = $(this);
		self.find('#receiverIds').val(_receiverId);

		function submitContent(send_type){
			var a = $("#send_mial_Final");
			var error = a.next('span.errInfo');
			var _msgType=$('[name="messageType"]:checked').val();

			if( error.length == 0 ){
				error = $('<span class="errInfo"></span>');
				a.after(error);
			}
			var title = self.find("[js='title']");
			var content = self.find("[js='content']");
			if( $.trim(title.val()) == '' ){
				error.html(lang.msg.subject_error);	//'标题不能为空'
				title.focus();
				return false;
			}
			if( $.trim(content.val()) == '' ){
				error.html(lang.msg.body_error);	//'内容不能为空'
				content.focus();
				return false;
			}

			if($('.oneDrageFlag').is(":visible")){
				_receiverId = $('#receiverIds').val();
			}

			$.post('/msg/message!processSendMessage.jhtml?option=' + send_type,
				{subject:title.val(), body:content.val(), receiverId: _receiverId, messageType:_msgType},
				function(data){
					if(data==0){
						pop_alert(lang.common.submit_success);//发送成功
						self.popupWin('destroy');
					}else if(data==1){
						error.text(lang.msg.subject_error);	//'标题不能为空'
						title.focus();
					}else if(data==2){
						error.text(lang.msg.body_error);	//'内容不能为空'
						content.focus();
					}else{
						error.text(lang.common.submit_failure);	//发送失败
					}
				}
			);
		}

		$("#send_mial_Final").click(function(){
			submitContent(0);
		});
		$("#send_mial_Final_2").click(function(){
			submitContent(2);
		});

		//第一次显示的是选择页面
		self.find("[js='close']").click(function(){
			self.popupWin('destroy');
		});

		self.find("[js='submit']").click(function(){
			var send_type = self.find("[js='type']").attr("checked") ? 2 : 1;

			for (i=0;i<_rid.length;i++)
			{
				$.get('/msg/message!composeProfileMessage.jhtml?option=' + send_type + '&receiverId=' + _rid[i] + '&random='+Math.random(), function(data){
					self.html(data);
					$("#send_mial_Final").click(function(){
						submitContent(send_type);
					});
				});
			}
		});

	});
	return false;
}