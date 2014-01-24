$(function(){
	$.ajaxSetup({cache:false});
	
	$('#awardInfoPop').each(function(){
		var pop = $(this);
		var curAward = 0;
		$('.tabs-common li > a', this).click(function(){
			pop.find('.tabs-common li').removeClass('current');
			$(this).parent().addClass('current');
			pop.find('> div').not('.tabs-common').hide();
			$($(this).attr('href')).show();
			curAward = parseInt($(this).attr('n'));
			return false;
		});
		
		$('.special-btn', this).click(function(){
			location.href = nextUrl + curAward;
		});
		
		$('.topic-msn-award-block li').click(function(){
			var self = this;
			var param = $.extend({
				width: 680,
				title: '梦想礼包详情',
				closeDestroy: true,
				reserve: true,
				open: function(){
					$('.tabs-common li > a', pop).filter('[href="#' + $(self).attr('js') + '"]').click();
				}
			}, window.popParam || {});
			pop.find('.msnnon_pop_cont').hide();
			$('#' + $(self).attr('js')).show();
			pop.popupWin(param);
			$('.topic-msn-award-block li').removeClass('select');
			$(this).addClass('select');
		});
		
		$('.topic-msn-award-block > li').hover(function(){
			$(this).addClass('current');
		}, function(){
			$(this).removeClass('current');
		});
	});
	
	$('#selectSign').each(function(){
		var div = $(this);
		div.find(':radio').click(function(){
			var s = $.trim($(this).parent().text()) + ' ' + inviteUrl;
			div.find(':text').val(s);
		});
		div.find(':radio:first').click();
		
		div.find(':button').click(function(){
			if (window.clipboardData) {
				window.clipboardData.setData("Text", div.find(':text').val());
			} else {
				pop_alert('<p>您的浏览器不允许访问计算机的剪贴板。</p><p>请使用 Ctrl-C 进行复制，使用 Ctrl-X 进行剪切和使用 Ctrl-V 进行粘贴，或者使用浏览器的“编辑”菜单。</p>', function(){
					div.find(':text').select();
				});
			}
			$.ajax({
				url: signUrl + div.find(':checked').val(),
				cache: false,
				type: 'GET'
			});
		});
	});

	$('#showUshitongInfo').hover(function(){
		var pos = $(this).offset();
		$('#ushitongInfo').popupTips({popupClass: 'msnnon_poptips', tipsType: 1, arrow: 'top', width: 360, position: [pos.left, pos.top+16]});
	}, function(){
		$('#ushitongInfo').popupLayer('close');
	});
	
	$('#msnMenu').each(function(){
		if( window.curMenu ){
			$(this).find('[js="' + window.curMenu + '"]').addClass('current');
		}
	});	
});
