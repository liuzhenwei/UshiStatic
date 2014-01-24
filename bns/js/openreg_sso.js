$(function(){
	$('[js="selectMyState"]').bind('change', function(){
		$('div[js^=form]').hide().find('.tips').hide();
		$('div[js="form' + this.value + '"]').show();
		if( this.value == '4' ){
			$('div[js="industryItem"]').hide().find('.tips').hide();
		} else {
			$('div[js="industryItem"]').show();
		}
		$('[js="myState"]').val(this.value);
	});
	
	$('[js="writeEdu"]').bind('click', function(){
		var edu = $(this).closest('form').find('[js="eduArea"]');
		var d = $(this).closest('div');
		d.replaceWith('<div class="margin-top"><h4>' + lang.reg.openreg_edu + '</h4></div>');
		edu.show();
		return false;
	});
	
	$('input[js="onduty"]').bind('change', function(){
		var c = $(this).closest('form').find('[js="currenDate"]'), p = c.prev();
		if( this.checked ){
			p.show(); c.hide();
		} else {
			p.hide(); c.show();
		}
	});
	
	$('[js="schoolName"]').autocomplete({
		url: '/ajax/json!listSchools.jhtml',
		ajax: 'schools',
		selected: function(event, li){
			var form = $(this).closest('form');
			$(this).val(li.text());
			form.find('[name="schoolId"]').val(li.attr('index'));
		},
		keydown: function(event, obj){
			var form = $(this).closest('form');
			form.find('[name="schoolId"]').val('');
		}
	});
	
	$('[js="companyName"]').each(function(){
		var companyName = $(this), form = companyName.closest('div[js^=form]'),
			showName = form.find('[js="showCompanyName"]'),
			editBtn = showName.next(),
			edit = companyName.closest('div'),
			attribute = form.find('[js="companyAttr"]'),
			companySite = attribute.find('[name="company.site"]'),
			companySize = attribute.find('[name="company.sizeid"]'),
			oldName = companyName.val(),
			companyNamePrevValue = null;
		
		var showInfo = function(){
			//companyName.hide();
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
				companySize.attr('vdIgnore', 'no');
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
				companySize.attr('vdIgnore', 'yes');
				showInfo();
			},
			keydown: function(event, obj){
				form.find('[name="companyId"]').val('0');
			},
			unselected: function(event, obj){
				if( form.find('[name="companyId"]').val() != '0' ){
					companySize.attr('vdIgnore', 'yes');
					showInfo();
				} else {
					showAttribute();
				}
			}
		});

		editBtn.click(function(){
			companyName.show();
			setTimeout(function(){
				//companyName.focus();
			}, 50);
			showName.text('');
			editBtn.hide();
			attribute.hide();
			return false;
		});
	});
	
	var forms = $('form[js="openRegForm"]');
	forms.validate({
		validateAjax: true,
		bindBlur: false,
		fieldParent: 'div.form-item',
		ignoreHidden: true,
		CBexec: function(){
			var edu = $('div[js^=form]:visible', this).find('[js="eduArea"]');
			if( edu.length && edu.is(':visible') ){
				edu.find('.tips').hide();
				var sy = edu.find('[name="education.startyear"]').val(), ey = edu.find('[name="education.endyear"]').val();
				if( $.trim(edu.find('[name="schoolName"]').val()) == '' ){
					if( sy != '' || ey != '' ){
						edu.find('[vdErr="school"]').show();
						return false;
					}
				} else {
					var vt = new $.ushi.validate.tools(), p = edu.find('[name="education.startyear"]').closest('div.form-item');
					if( vt.compareYear('', {'parent': p, 'chk': 'ey', 'required': 'no'}) == false ){
						edu.find('[vdErr="time"]').show();
						return false;
					}
				}
			}
			return true;
		},
		afterValidate: function(evt, r){
			if( r.result ){
				$(this).find('div[js^=form]:hidden').remove();
			}
			return r.result;
		},
		extTools: {
			isUsername: checkUserName
		}
	});
	
	forms.each(function(){
		var f = $(this);
		selectCity(f.find('[js="selectCountry"]'), f.find('[js="selectRegion"]'), f.find('[js="selectCity"]'));
	});

	
	
	$('input[js="checkAllVcard"]').bind('change', function(){
		var cont = $('#openReg');
		cont.find(':checkbox').attr('checked', this.checked);
	});
});

