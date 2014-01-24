$(document).ready(function(){
	(function(form){
		if(form.size()==0) return false;
		var ccoinsnum=$('#ccoinsnum');
		var p5=$('#p5');
		p5.focus(function(){
			$(this).next().find('input:eq(0)').focus();
			$('#currencyCount').text(ccoinsnum.val()>=0 ? ccoinsnum.val() : 0+lang.currency.yuan);
		});
		ccoinsnum.keyup(function(){
			this.value=this.value.replace(/[^0-9]*/g,'');
			if(this.value.length>1 && this.value.indexOf(0)==0)this.value=this.value.substr(1);
			if(this.value=='') this.value=0;
			$('#currencyCount').text(this.value+lang.currency.yuan);
		});
		form.find('[js="submit"]').click(function(){
			if(p5.attr('checked'))
			if(ccoinsnum.val()>5000 || ccoinsnum.val() <1 || ccoinsnum.val()==0){
				float_tips('error',lang.currency.amount_nopermit);
				ccoinsnum.focus();
				return false;
			}
		});
		$('[name="coinsnum"]:lt(4)').click(function(){
			$('#currencyCount').text(this.value+lang.currency.yuan);										
		});
	})($('#currency'));
	
	var modifyEmail = function(){
		var label = $(this).prev(), ipt = label.find('input');
		var div = $('<p class="middle"><input type="text" class="formtext" mid="' + ipt.attr('emailid') + '" value="' + $.trim(label.text()) + '" /><input type="button" class="common-button" value="' + lang.common.save + '" /></p>');
		div.popupWin({
			title: lang.fapiao.updateemail_title,
			width: 350,
			closeDestroy: true,
			open: function(){
				div.find(':button').click(function(){
					var t = div.find(':text'), mail = $.trim(t.val()), mid = t.attr('mid');
					if( mail.is_email() ){
						$.post('/currency/faPiao!updateEmail.jhtml ', {'fapiaoEmail.email': mail, 'fapiaoEmail.id': mid}, function(data){
							data = parseInt(data);
							if( data == 0 ){
								pop_alert(lang.fapiao.emailsave_error);
							} else {
								label.find('span').text(mail);
								ipt.val(mail);
								div.popupWin('destroy');
							}
						});
					} else {
						pop_alert(lang.fapiao.email_error);
					}
				});
			}
		});
		return false;
	};
	
	$('label', '#emailList').each(function(){
		if( $(this).find('input').attr('emailid') != '' ){
			var a = $('<a class="spe-left2" href="#">' + lang.common.modify + '</a>').click(modifyEmail).insertAfter(this);
		}
	});
	
	$('#saveAddEmail').click(function(){
		var ipt = $(this), mail = $.trim(ipt.prev().val());
		if( mail.is_email() ){
			ipt[0].disabled = true;
			$.post('/currency/faPiao!saveEmail.jhtml', {'fapiaoEmail.email': mail}, function(data){
				data = parseInt('0' + data, 10);
				if( data == 0 ){
					pop_alert(lang.fapiao.emailsave_error);
				} else {
					ipt.prev().val('');
					var p = $('<p><label><input type="radio" name="fapiaoemail" value="' + mail + '" emailid="' + data + '" /> <span>' + mail + '</span></label>' +
								'<a class="spe-left2" href="#">' + lang.common.modify + '</a></p>');
					ipt.closest('td').prepend(p);
					p.find('a').click(modifyEmail);
					$('#addEmailArea').hide();
					var l = location.href.indexOf('#__ajax'), href = location.href.slice(0, (l == -1) ? 0 : l);
					location.href = href + '#__ajax';
					//location.reload(true);
				}
				ipt[0].disabled = false;
			});
		} else {
			pop_alert(lang.fapiao.email_error);
		}
		return false;
	});

	//升级账户表单操作
	$('form[js=upgradePay]').each(function(){
		var form = $(this), usb = $('input[name=usb]', form), price = 0;
		var showTips = function(tips){
			$('[js="usbTips"]', form).hide();
			$('[js="usbpayTips"]', form).hide();
			$('[js="payTips"]', form).hide();
			$('[js=' + tips + ']', form).show();
		}
		var setPayPrice = function(n){
			n = n || 0;
			price = parseInt($(':radio[name="packageId"]:checked', form).attr('usb'), 10);
			var pp = $('[js="payPrice"]', form), rate = parseFloat(pp.attr('rate') || 1);
			pp.text(Math.ceil((price - n) / rate));
			usb.attr('vdOpt', 'min:0;max:' + (price + 1)).val(n);
			showTips('payTips');
		}
		usb.val(0).blur(function(){
			if( $.isNumeric(usb.val()) ){
				var u = parseInt(usb.val(), 10);
				u = Math.min(Math.min(price, parseInt($('[js="myUSB"]', form).text(), 10)), Math.max(0, u));
				setPayPrice(u);
				if( u == price ){
					showTips('usbTips');
					$('[js="payUSB"]', form).text(u);
					$('#fapiaoField').hide();
				} else if ( u == 0 ){
					showTips('payTips');
					$('#fapiaoField').show();
				} else {
					showTips('usbpayTips');
					$('#fapiaoField').show();
				}
			} else {
				setPayPrice();
			}
		});
		$(':radio[name="packageId"]', form).click(function(){
			setPayPrice();
			$('[js="useUSB"]', form).removeAttr('checked').triggerHandler('change');
		});
		$('[js="useUSB"]', form).change(function(){
			if( this.checked ){
				usb.show().val('').focus();
			} else {
				usb.hide();
				setPayPrice();
				$('#fapiaoField').show();
			}
		});
		setPayPrice();
	});

	//是否需要发票操作
	var checkNeedFapiao = function(){
		var fp = $('#fapiaoDiv');
		if( $('#needFapiao')[0].checked ){
			fp.show();
		} else {
			fp.hide();
		}
	};
	var selectFapiaoType = function(){
		var rdo = $(this), t = rdo.attr('selectFapiaoType');
		$('#fapiaoDiv [js=vdErr]').hide();
		if( t == 'c' ){
			$('#fapiaoDiv tr[fapiaoType="c"]').show();
			$('#fapiaoDiv tr[fapiaoType="p"]').hide();
			$('#fapiaoDiv tr[fapiaoField="a"]').show();
		} else {
			$('#fapiaoDiv tr[fapiaoType="c"]').hide();
			$('#fapiaoDiv tr[fapiaoType="p"]').show();
			selectFapiaoCat();
		}
	};
	var selectFapiaoCat = function(){
		if( $('#selectFapiaoCat').val() == '1' ){
			$('#fapiaoDiv tr[fapiaoField="a"]').hide();
			$('#fapiaoDiv tr[fapiaoField="e"]').show();
		} else {
			$('#fapiaoDiv tr[fapiaoField="a"]').show();
			$('#fapiaoDiv tr[fapiaoField="e"]').hide();
		}
	};
	$('#fapiaoDiv').each(function(){
		$('#needFapiao').click(checkNeedFapiao);
		$(':radio[selectFapiaoType]').change(selectFapiaoType);
		$('#selectFapiaoCat').change(selectFapiaoCat);
		setTimeout(function(){
			checkNeedFapiao();
		}, 50);
	});
	
	//支付表单验证
	$('#fapiaoDiv').validate({
		ignoreHidden: true
	});
	$('#paySubmit').click(function(){
		$('#fapiaoDiv').triggerHandler('ValidateForm', [function(r){
			if( r == true ) $('form[payment]').submit();
		}]);
	});

});
