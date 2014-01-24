function bindAjaxSchool(){
	var school = $(this), form = school.closest('[regForm]');
	school.autocomplete({
		url: '/ajax/json!listSchools.jhtml',
		ajax: 'schools',
		selected: function(event, li){
			$(this).val(li.text());
			form.find('[name="schoolId"]').val(li.attr('index'));
		},
		keydown: function(event, obj){
			form.find('[name="schoolId"]').val('');
		}
	});
}
function bindAjaxCompanySimple(){
	var companyName = $(this), form = companyName.closest('[regForm]');
	companyName.autocomplete({
		url: '/ajax/json!listCompanies.jhtml',
		ajax: 'companies',
		selected: function(event, li){
			$(this).val(li.text());
			form.find('[name="companyId"]').val(li.attr('index'));
		},
		keydown: function(event, obj){
			form.find('[name="companyId"]').val('');
		}
	});
}
function bindAjaxCompany(){
	var companyName = $(this), form = companyName.closest('[regForm]'),
		showName = form.find('[js="showCompanyName"]'),
		editBtn = showName.next(),
		edit = companyName.closest('div'),
		attribute = form.find('[js="companyAttr"]'),
		companySite = attribute.find('[name="company.site"]'),
		companySize = attribute.find('[name="company.sizeid"]'),
		oldName = companyName.val(),
		companyNamePrevValue = null;
	
	var showInfo = function(){
		companyName.hide();
		showName.text(companyName.val()).show();
		editBtn.show();
	};
	var showAttribute = function(){
		companyName.val($.trim(companyName.val()));
		attribute.find('.tips').hide();
		if( companyName.val() != '' && companyName.val() != oldName ){
			edit.find('.tips').hide();
			attribute.show();
			if(companyName.val() != companyNamePrevValue){
				companyNamePrevValue = companyName.val();
				companySite.val('');
				companySize.val('');
			}
		}
		if( companyName.val() != ''){
			edit.find('.tips').hide();
			showInfo();
		}
	};
	
	companyName.autocomplete({
		url: '/ajax/json!listCompanies.jhtml',
		ajax: 'companies',
		selected: function(event, li){
			companyName.val(li.text());
			form.find('[name="companyId"]').val(li.attr('index'));
			showInfo();
		},
		keydown: function(event, obj){
			form.find('[name="companyId"]').val('0');
		},
		unselected: function(event, obj){
			if( form.find('[name="companyId"]').val() != '0' ){
				showInfo();
			} else {
				showAttribute();
			}
		}
	});

	editBtn.click(function(){
		showName.text('');
		editBtn.hide();
		attribute.hide();
		companyName.show().focus();
		setTimeout(function(){
			companyName.focus();
		}, 0);
	});
}
function bindSelectState(){
	var state = $(this);
	state.bind('change', function(){
		$('[regForm]').hide().find('.tips').hide();
		$('[regForm="' + this.value + '"]').show().find('[js="myState"]').val(this.value);
	});
}
function bindGetVerifyCode(){
	var gvc = $(this);
	gvc.click(function(){
		if( $.browser.msie ){
			var span = $(this).closest('div').find('span').empty();
			var img = $('<img class="middle" src="/doc!getRand.jhtml?_=' + Math.random() + '" width="64" height="25" />');
			img.load(function(){
				span.append(img);
			});
		} else {
			$(this).closest('div').find('img').attr('src', '/doc!getRand.jhtml?_=' + Math.random());
		}
	});
}

$(function(){
	$('[js="selectMyState"]').each(bindSelectState);
	
	$('[js="schoolName"]').each(bindAjaxSchool);
	
	$('[js="companyName"]').each(bindAjaxCompany);
	
	$('[js="writeEdu"]').bind('click', function(){
		var edu = $(this).closest('form').find('[js="eduArea"]');
		var d = $(this).closest('div');
		d.replaceWith('<div class="margin-top"><h4>' + lang.reg.openreg_edu + '</h4></div>');
		edu.show();
		return false;
	});
	
	$('input[js="onduty"]').bind('change', function(){
		var c = $(this).closest('[regForm]').find('[js="currenDate"]'), p = c.prev();
		if( this.checked ){
			p.show(); c.hide();
		} else {
			p.hide(); c.show();
		}
	});

	$('div[js="eduArea"]').each(function(){
		var edu = $(this), fld = edu.find(':text, select');
		fld.filter(':gt(0)').attr({'disabled':true, 'vdIgnore':'yes'}).css({opacity:0.5});
		fld.filter(':first').bind('keyup, blur', function(){
			if( $.trim($(this).val()) == '' ){
				fld.filter(':gt(0)').attr({'disabled':true, 'vdIgnore':'yes'}).css({opacity:0.5});
				fld.filter('select').uiSelect('disabled');
			} else {
				fld.filter(':gt(0)').attr('vdIgnore', 'no').css({opacity:1}).removeAttr('disabled');
				fld.filter('select').uiSelect('enabled');
			}
		});
		setTimeout(function(){
			fld.filter('select').uiSelect('disabled');
		}, 500);
	});

	var forms = $('[regForm]');
	if( forms.length ){
		forms.validate({
			fieldParent: 'div.itemmain',
			ignoreHidden: true
		});
	}

	$('input[js="checkAllVcard"]').bind('change', function(){
		var cont = $('#openReg');
		cont.find(':checkbox').attr('checked', this.checked);
	});
});

//可用于快速注册的更新注册提示信息
function updateTips(tips, str, cont){
	tips = cont ? cont.find(tips) : $(tips);
	var t = tips.find('.tips-box-inner');
	if( t.length == 0 ) t = tips;
	if( ! t.data('tips') ){
		t.data('tips', t.html());
	}
	str = str || t.data('tips');
	t.html(str);
};

//快速注册
var quickRegPopupLoading = false;
function openQuickReg(options){
	options = $.extend({}, options || {});
	var popReg = $('#quickRegPopup');
	if( popReg.length ){
		showQuickReg(options.hiddenField.quickRegFrom);
	} else {
		if( quickRegPopupLoading == true ) return false;
		quickRegPopupLoading = true;
		var loading = $('<div class="loading_l"/>');
		loading.popupLayer({
			modal: true,
			overlay: 0.25,
			clickClose: false,
			reserve: false
		});
		$.ajax({
			url: '/user/openRegU!register_public.jhtml',
			type: 'post',
			data: options.hiddenField || {},
			dataType: 'text',
			success: function(data){
				$('body').append(data);
				popReg = $('#quickRegPopup');
				loading.popupLayer('destroy');
				showQuickReg(options.hiddenField.quickRegFrom);
			}
		});
	}
	
	function showQuickReg(from){
		quickRegPopupLoading = false;
		var pop = $(popReg.html());
		pop.popupLayer({
			title: lang.reg.openreg_pop_title,
			modal: true,
			clickClose: false,
			overlay: 0.25,
			closeDestroy: true,
			reserve: false,
			width: options.width || 780,
			open: function(){
				if (lang.lang=='en_US') {
					pop.css('min-height','360px');
				}
		
				updateTips('[regTips="usernameTips"]');
				updateTips('[regTips="emailTips"]');

				pop.find('#regForm').validate({
					validateAjax: true,
					bindBlur: true,
					fieldParent: 'div.form-item',
					hide: function(event, field){
						$('div[regPopTips]').popupTips('destroy');
						field.closest('span').removeClass('form-suc-text');
						field.closest('div.form-item').find('p.red').hide();
					},
					showNormal: function(event, field){
						field.closest('span').removeClass('form-suc-text');
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
					},
					showErr: function(event, field){
						field.closest('span').removeClass('form-suc-text');
						field.closest('div.form-item').find('p.red').show();
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
				
				pop.find(':text[defaultTips]').showDefaultTips();
				pop.find('[js="selectMyState"]').each(bindSelectState);
				pop.find('[js="schoolName"]').each(bindAjaxSchool);
				pop.find('[js="companyName"]').each(bindAjaxCompanySimple);
				pop.find('[regLinks="getCheckCode"]').each(bindGetVerifyCode);
				pop.find('[js="popMenu"] a').bind('click', function(){
					pop.find('>form').hide();
					pop.find('[js="popMenu"] li').removeClass('current');
					pop.find('>form.' + $(this).attr('js')).show();
					$(this).closest('li').addClass('current');
					return false;
				});
				if( $.isFunction(options.CBshow) ){
					options.CBshow(pop);
				}

				pop.find('form.quickReg').validate();
				
				pop.find('#userService').bind('click', function(){
					if( this.checked ){
						pop.find('[js="reg_submit"]').removeAttr('disabled').removeClass('disable-button').addClass('button');
					} else {
						pop.find('[js="reg_submit"]').attr('disabled', 'true').removeClass('button special-btn').addClass('disable-button');
					}
				});
				
				pop.find('.close').click(function(){
					pop.popupLayer('close');
				});
			}
		});
	}
}
