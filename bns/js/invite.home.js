$(function(){
	$('#inviteLink').bind('focus click', function(){
		this.select();
		return false;
	});
	$('#showMsnEmailList').click(function(){
		var pos = $(this).offset();
		var list = $('#msnEmailList');
		if( list.popupLayer('isOpen') == true ){
			list.popupLayer('close');
		} else {
			list.popupLayer({
				overlayEvents: 'click',
				width: 136,
				position: [pos.left, pos.top + $(this).outerHeight()]
			});
		}
	});
	$('#msnEmailList a').click(function(){
		var span = $('#showMsnEmailList').find('span:first'), a = $(this);
		span.text(a.text()).attr('js', a.attr('js') || '');
		if( a.attr('js') == 'other' ){
			$('form[checkForm="msnInvite"] [js="msnInviteEmailSep"]').css('visibility', 'hidden');
		} else {
			$('form[checkForm="msnInvite"] [js="msnInviteEmailSep"]').css('visibility', 'visible');
		}
		$('#msnEmailList').popupLayer('close');
		return false;
	});
	$('img[msnivt]').click(function(){
		$('span:first', '#showMsnEmailList').text($(this).attr('msnivt'));
	});
	$('input[name="csvFile"]').change(function(){
		$(this).parent().children('span:first').text($(this).val());
	});
	$('div[js="csvvcf"]').children('span:first').text($('input[name="csvFile"]').val());
});

function checkMsnInviteForm(form){
	var vali = new $.ushi.validate.tools();
	var suf = form.find('[js=email2] span:first'), email = form.find('[js=email1]').val();
	email = ( suf.attr('js') == 'other' ) ? email : email + '@' + (suf = suf.text());
	form.find('input[js="sendType"]').val(( suf == 'hotmail.com' || suf == 'msn.com' || suf == 'live.cn' ) ? '1' : '0');
	if( vali.isEmail(email) ){
		form.find('[js="emailerr"]').hide();
		form.find('input[js="msnEmail"]').val(email);
		return true;
	} else {
		form.find('[js="emailerr"]').show();
		var st = form.find(':submit');
		if( st.next().hasClass('loading') ){
			st.show().next().remove();
			hide_overlay();
		}
		return false;
	}
}
function checkEmailInviteForm(form, hname, hemail){
	var sents = form.data('inviteSents');
	if( typeof(sents) != 'number' ){
		$.get('/sns/sns!getSentsByMail.jhtml', function(data){
			form.data('inviteSents', parseInt(data));
			form.submit();
		});
		return false;
	}
	form.removeData('inviteSents');
	hname = hname || 'snsInviteInfo.name'; hemail = hemail || 'snsInviteInfo.emailAddress';
	form.find('input[name="' + hname + '"], input[name="' + hemail + '"]').remove();
	var vali = new $.ushi.validate.tools();
	var arr = [], emails = $.trim(form.find('textarea[js="emailList"], :text[js="emailList"]').val());
	emails = emails.split(/\n|\;|\,|，/g);
	for( var i = 0; i < emails.length; i++ ){
		var o = {}, email = $.trim(emails[i]);
		if( email == '' ) continue;
		email = email.split(/\<|\>/g);
		if( email.length == 1 ){
			o.email = $.trim(email[0]);
			if( vali.isEmail(o.email) ){
				o.name = o.email.slice(0, o.email.indexOf('@'));
				arr.push(o);
			}
		} else if( email.length >= 2 ){
			o.email = $.trim(email[1]);
			if( vali.isEmail(o.email) ){
				o.name = $.trim(email[0]);
				if( o.name == '' ){
					o.name = o.email.slice(0, o.email.indexOf('@'));
				} else {
					o.name = o.name.replace(/^(\'|\")|(\'|\")$/g, '');
				}
				o.name = $.trim(o.name);
				arr.push(o);
			}
		}
	}
	if( arr.length ){
		if( arr.length + sents > 5000 ){
			resetOverlay(form);
			pop_alert(lang.invite.emailInviteError1(sents));
			return false;
		}
		if( arr.length < 50 ){
			var btn = form.find(':submit');
			if( btn.length && btn.next('span').length )
				btn.next('span').text(lang.invite.emailInviteTip1);
		}
		for( i = 0; i < arr.length; i++ ){
			form.prepend('<input type="hidden" name="' + hname + '" value="' + arr[i].name + '"/><input type="hidden" name="' + hemail + '" value="' + arr[i].email + '"/>');
		}
		return true;
	} else {
		resetOverlay(form);
		pop_alert(lang.invite.emailInviteError);
		return false;
	}
}
function checkSMSInviteForm(form){
	var vali = new $.ushi.validate.tools();
	var cp = form.find('[js="cpList"]'), cps = cp.val().split(/\n|\,|，/), ncp = [];
	for( var i = 0; i < cps.length; i++ ){
		var n = $.trim(cps[i]);
		if( n != '' && vali.isCellphone(n) ){
			ncp.push(n);
		}
	}
	if( ncp.length ){
		if( ncp.length > 50 ){
			resetOverlay(form);
			pop_alert(lang.invite.smsInviteError1);
			return false;
		} else {
			cp.val(ncp.join(','));
			return true;
		}
	} else {
		resetOverlay(form);
		
		var _popup=$('<div class="notice" style="border:0; background-color:#FFF; margin:0;">'+lang.invite.smsInviteError+'</div>');
		var _offset=form.offset();
		_popup.popupWin({
			width:300,
			position:[_offset.left+200,_offset.top+40],
			modal:false,
			overlay:0,
			clickClose:true,
			open:function(){ setTimeout(function(){_popup.popupWin('close');},2000);}
		})
		
		return false;
	}
	return false;
}
function resetOverlay(form){
	var st = form.find(':submit');
	if( st.next().hasClass('loading') ){
		st.show().next().remove();
		hide_overlay();
	}
}
