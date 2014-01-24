$(function(){	
	$('[js=pngFix]').pngFix({blankgif:'../../../common/images/space.gif', fixSelf:true});
	
	$('[js="reglogin"]').click(function(){
		var a = $(this), reg = $('#regArea'), login = $('#loginArea');
		if( a.data('waiting') == true ) return;
		a.data('waiting', true);
		if( reg.is(':visible') ){
			reg.animate({marginLeft:-100, opacity:0}, 200, function(){
				reg.hide();
				login.css({marginLeft:100, opacity:0}).show().animate({marginLeft:0, opacity:1}, 200, function(){
					a.removeData('waiting');
				});
			});
			a.text(a.attr('reg'));
		} else {
			login.animate({marginLeft:100, opacity:0}, 200, function(){
				login.hide();
				reg.show().animate({marginLeft:0, opacity:1}, 200, function(){
					a.removeData('waiting');
				});
			});
			a.text(a.attr('login'));
		}
	});
	
	$('.phome-story li').each(function(i){
		var li = $(this), cc = 'phome-ushi' + (i+1) + '-h', cont = $('.phome-stroy-cont'), stories = $('.phome-stroy-cont > div'), story = stories.filter(':eq(' + i + ')');
		var litop = li.offset().top;
		$('h2, a, strong', this).click(function(){
			var cur = stories.filter(':visible');
			if( cur.length ){
				if( li.find('strong').hasClass(cc) ){
					cont.css('min-height', 'auto');
					cur.slideUp(500);
				} else {
					cont.css('min-height', story.attr('height') + 'px');
					cur.slideUp(500, function(){
						cur.hide();
						li.find('strong').addClass(cc);
						story.slideDown(800, function(){
							cont.css('min-height', 'auto');
							//$(document).UscrollTop({to:litop, step:20});
						});
					});
				}
				$('.phome-story li strong').each(function(j){
					$(this).removeClass('phome-ushi' + (j+1) + '-h');
				});
			} else {
				li.find('strong').addClass(cc);
				story.slideDown(800, function(){
					$(document).UscrollTop({to:litop, step:20});
				});
			}
		})
	});
	
	$('.phome-form :password').passwordTips();
});

$.fn.passwordTips = function(options){
	options = $.extend({
		bindSubmit: true,
		tipsColor: '#999',
		textColor: $.browser.msie ? '#333' : 'inherit'
	}, options || {});
	return this.each(function(){
		var tf = $(this), tt = tf.parent().find(':text');
		if( 'placeholder' in this ){
			tf.attr('placeholder', tf.attr('defaultTips'));
			if( tf.val() == tf.attr('defaultTips') ) tf.val('');
			tf.css('color', options.tipsColor);
			tf.bind('input', function(){
				tf.css('color', (tf.val() == '') ? options.tipsColor : options.textColor);
			});
			tt.remove();
			return true;
		}
		tf.hide();
		tt.show();
		tt.bind('focus', function(){
			tt.hide();
			tf.show().focus();
		});
		tf.bind('blur', function(){
			if( tf.val() == '' ){
				tt.show();
				tf.hide();
			}
		});
	});
}
