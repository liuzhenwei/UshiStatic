$(function(){
	updateTips('[regTips="usernameTips"]');
	updateTips('[regTips="emailTips"]');

	$('#regForm').validate({
		validateAjax: true,
		bindBlur: true,
		bindBlurCheck: false,
		fieldParent: 'div.form-item',
		hide: function(event, field){
			$('div[regPopTips]').popupTips('destroy');
			field.closest('span').removeClass('form-suc-text');
			field.closest('div.form-item').find('p.red').hide();
		},
		showNormal: function(event, field){
			field.closest('span').removeClass('form-suc-text');
			if( field.closest('div.form-item').find('p.red').is(':visible') ) return;
			$('div[regPopTips]').popupTips('destroy');
			var tips = field.data('normalTips').clone();
			tips.popupTips({
				tipsType: 11,
				width: 300,
				position: {of: field, my: 'left center', at: 'right center', offset: field.attr('tipsOffset') || '30 0'},
				closeDestroy: true,
				reserve: false,
				clickClose: false
			});
		},
		showSuc: function(event, field){
			field.closest('span').addClass('form-suc-text');
			field.closest('div.form-item').find('p.red').hide();
			$('div[regPopTips]').popupTips('destroy');
		},
		showErr: function(event, field){
			field.closest('span').removeClass('form-suc-text');
			field.closest('div.form-item').find('p.red').show();
			$('div[regPopTips]').popupTips('destroy');
		},
		extTools: {
			isUsername: checkUserName,
			isAjaxEmail: checkAjaxEmail,
			isInviteCode: checkInviteCode
		}
	});
	$('#regForm [Validate]').each(function(){
		var field = $(this), err = field.closest('.form-item').find('p.red');
		field.data('normalTips', $('<div regPopTips="' + field.attr('name') + '">' + (field.attr('tips') || err.html()) + '</div>'));
	});
});

