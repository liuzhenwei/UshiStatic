//首页A区广告
function showPromoA(options){
	options = $.extend({
		closeUrl: '/user/index!closePromotion.jhtml?type=1',
		showTime: 10000,
		nHeight: '200px'
	}, options || {});

	var asimple = $('#promoASimple'),
		anormal = $('#promoANormal'),
		asimpleCont = asimple.find('.promoACont'),
		anormalCont = anormal.find('.promoACont'),
		promos = anormalCont.find('> *').css({height: options.nHeight}),
		btns = anormal.find('.switch-btn a'),
		curani = null, tm = null;

	for( var i = 0; i < options.start; i++ ){
		anormalCont.append(anormalCont.find('> *:eq(0)'));
		asimpleCont.append(asimpleCont.find('> div:eq(0)'));
	}
	asimpleCont.find('> div').each(function(i){
		$(this).attr('idx', i + 1);
	});
	anormalCont.show().find('> *').each(function(i){
		$(this).attr('idx', i + 1);
	});
	btns.each(function(i){
		$(this).attr('idx', i + 1);
	})

	var show = function(idx){
		if( promos.length == 1 ){
			return false;
		}
		if( tm != null ){
			clearTimeout(tm);
		}
		if( asimple.is(':visible') ){
			showSimple(idx);
		} else {
			showNormal(idx);
		}
		if( promos.length != 1 ){
			tm = setTimeout(function(){ show(); }, options.showTime);
		}
	};
	var showSimple = function(lr){
		var p = asimpleCont.find('> div:eq(0)');
		if( lr == 'l' ){
			var l = asimpleCont.find('> div:last');
			l.css({marginTop: -30}).prependTo(asimpleCont);
			l.animate({marginTop: 0}, 250);
		} else {
			var n = p.next();
			p.animate({marginTop: -30}, 250, function(){
				asimpleCont.append(p.css({marginTop: 0}));
			});
		}
	}
	var showNormal = function(idx){
		if( idx == undefined || idx == null ){
			var p = anormalCont.find('> *:eq(0)'),
				n = p.next().css({opacity: 0});
			p.animate({opacity: 0}, 'fast', function(){
				anormalCont.append(p);
				n.animate({opacity: 1}, 'fast', function(){
					curani = null;
				});
				curani = n;
			});
			curani = p;
			idx = parseInt(n.attr('idx'), 10);
		} else {
			if( curani ){
				curani.stop().css({opacity: 0});
			}
			var n = promos.filter('[idx="' + idx + '"]');
			anormalCont.find('> *').css({opacity: 0}).each(function(){
				if( idx == parseInt($(this).attr('idx'), 10) ){
					return false;
				}
				anormalCont.append(this);
			});
			n.animate({opacity: 1}, 'fast', function(){
				curani = null;
			});
			curani = n;
		}
		btns.removeClass('current');
		btns.filter(':eq(' + (idx - 1) + ')').addClass('current');
	};
	anormal.find('.min-icon').bind('click', function(){
		if( tm != null ){
			clearTimeout(tm);
		}
		if( curani ){
			curani.stop();
		}
		var idx = parseInt(anormalCont.find('> *:eq(0)').attr('idx'), 10);
		asimpleCont.find('> div').each(function(){
			if( idx == parseInt($(this).attr('idx'), 10) ){
				return false;
			}
			asimpleCont.append(this);
		});
		anormal.animate({height: 0}, 'normal', function(){
			promos.css({opacity: 0});
			anormal.hide();
			asimple.css({height: 0}).show().animate({height: '30px'}, 'fast', function(){
				if( promos.length != 1 ){
					tm = setTimeout(function(){ show(); }, options.showTime);
				}
			});
		});
		$.ajax({url: options.closeUrl,
			type: 'GET',
			cache: false
		});
	});
	asimple.find('.max-icon').bind('click', function(){
		if( tm != null ){
			clearTimeout(tm);
		}
		var idx = parseInt(asimpleCont.find('> div:eq(0)').attr('idx'), 10);
		anormalCont.find('> *').each(function(){
			if( idx == parseInt($(this).attr('idx'), 10) ){
				return false;
			}
			anormalCont.append(this);
		});
		asimple.animate({height: 0}, 'fast', function(){
			promos.animate({opacity: 1});
			asimple.hide();
			anormal.css({height: 0}).show().animate({height: options.nHeight}, 'normal', function(){
				if( promos.length != 1 ){
					tm = setTimeout(function(){ show(); }, options.showTime);
				}
			});
		});
		btns.removeClass('current');
		btns.filter(':eq(' + (idx - 1) + ')').addClass('current');
		$.ajax({url: options.closeUrl,
			type: 'GET',
			cache: false
		});
		return false;
	});
	btns.bind('click', function(){
		var btn = $(this),
			idx = parseInt(btn.attr('idx'), 10);
		show(idx);

		return false;
	});
	asimple.find('.switch-btn a').bind('click', function(){
		if( $(this).hasClass('icon-btn-l') ){
			show('l');
		} else {
			show();
		}
		return false;
	});

	if( promos.length != 1 ){
		tm = setTimeout(function(){ show(); }, options.showTime);
	}

	//添加倒计时功能
	var showTimer = function(){
		anormal.find('[promoATimer]').each(function(){
			var tm = $(this);
			var now = new Date(), y2k = tm.data('y2k');
			if( ! y2k ){
				y2k = new Date(tm.attr('promoATimer'));
				tm.data('y2k', y2k);
			}
			var tmf = tm.attr('tmf');
			var d = Math.floor((y2k - now) / 1000 / 60 / 60 / 24),
				h = Math.floor((y2k - now) / 1000 / 60 / 60 - (24 * d)),
				m = Math.floor((y2k - now) / 1000 / 60 - (24 * 60 * d) - (60 * h)),
				s = Math.round((y2k - now) / 1000 - (24 * 60 * 60 * d) - (60 * 60 * h) - (60 * m));
			var l = 0, obj = {'D': d, 'H': h, 'M': m, 'S': s}, af = [];
			for( var k in obj ){
				var f = '';
				var re = new RegExp(k + '(.*?)' + k);
				if( tmf.search(re) == -1 ){
					break;
				}
				tmf = tmf.replace(re, function($1, $2){
					var re1 = new RegExp('{' + k.toLowerCase() + '}');
					f = $2.replace(re1, obj[k]);
					return obj[k] > 0 ? k : '';
				});
				if( obj[k] == 1 ){
					f = f.replace(/(day|hour|minute|second)s/, function($1, $2){
						return $2;
					});
				}
				obj[k] = l++;
				af.push(f);
			}
			tmf = tmf.replace(/#(.*?)#/, function($1, $2){
				af.splice(0, obj[$2.slice(0, 1)]);
				return af.join('');
			});
			tm.html(tmf);
		});
		setTimeout(showTimer, 1000);
	}
	anormal.find('[promoATimer]').each(function(){
		$(this).show().parent().css({'position': 'relative'});
	});
	showTimer();
};
