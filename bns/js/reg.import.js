function showPanel(rdo){
	if( rdo.length == 0 ) return;
	$('#inviteType').val(rdo.attr('inviteType'));
	var div = $('#' + rdo.attr('js')), errMsg = $('#errorMsg');
	if( errMsg.length ){
		div.find('.choose-box').prepend(errMsg.removeAttr('id').show());
	}
	var div_userinput = $('#div_userinput'), form = $('#form1');
	div_userinput.empty().append(div.html());
	div_userinput.find('select[uiSelect]').uiSelect({acOptions:{width:138}});
	if( typeof(importType) == 'string' ){
		div_userinput.find('select[name=importType]').val(importType.replace('@', ''));
	}
	if( submitErr ) div_userinput.find('input[type="password"]').focus();
	if( $.browser.msie ){
		div_userinput.find('[js="addCsvFile"]').each(function(){
			var btn = $(this), cont = btn.closest('.reg-upfile-cont'), file = cont.find(':file').show().css({opacity:0, position:'absolute', cursor:'pointer'});
			file.width(btn.outerWidth()).height(btn.outerHeight());
			file.css({left:btn.position().left, top:0});
		});
	} else {
		div_userinput.find('[js="addCsvFile"]').click(function(){
			div_userinput.find('input[name=csvFile]').trigger('click');
		});
	}
	div_userinput.find('input[name=csvFile]').change(function(){
		div_userinput.find('[js="csvFileText"]').val($(this).val());
	});
	div_userinput.find("input[type='submit']").bind('click',function(){
		form.attr('action', $(this).attr('action'));
		var email = $('<input type="hidden" name="email" value="" />').appendTo(div_userinput);
		var rc = $('<input type="hidden" name="radiochecked" value="" />').appendTo(div_userinput);
		var button_name = $(this).attr("name");
		rc.val(button_name);
		if( button_name == "submit_yahoo" || button_name=="submit_other" ){
			var emailName = $("input[name=emailName]", div_userinput).val();
			var emailsuffix = $("select[name=importType]", div_userinput).val();
			email.val(emailName+'@'+emailsuffix);
		}
        if( button_name == "submit_msn" ){
            email.val($("input[name=emailName]", div_userinput).val());
        }
		if( button_name == "submit_gmail" ){
			var emailName=$("input[name=emailName]", div_userinput).val();
			email.val(emailName+'@gmail.com');
		}
		div_userinput.find('[js="upoutlookwaiting"]').show();
		div_userinput.find('[js="importcancel"]').hide();
		form.find(':submit').attr('disabled', true);
		setTimeout(function(){
			form.submit();
		}, 200);
		return false;
	});
}

$(function(){
	$("input[name='radio']").click(function(){
		showPanel($(this));
	});

	var checkAll = $('input[js="check_all"]'), allCheck = $('[js="all_check"]'), submitCheck = $('[js="submitCheckAll"]');
	checkAll.change(function(){
		if( this.checked == true ){
			$('[type="checkbox"]', allCheck).attr('checked', true);
		} else {
			$('[type="checkbox"]', allCheck).removeAttr('checked');
		}
	});
	allCheck.find('[type="checkbox"]').change(function(){
		setTimeout(function(){
			if( $('[type="checkbox"]', allCheck).length == $('[type="checkbox"]:checked', allCheck).length ){
				checkAll.attr('checked', true);
			} else {
				checkAll.removeAttr('checked');
			}
		}, 50);
	});
	submitCheck.click(function(){
		var chked = $(':checked', allCheck).length, a = $(this), p = a.parent();
		if( chked == 0 ){
			$('[js="errorSubmitCheckAll"]').show();
		} else {
			$('[js="errorSubmitCheckAll"]').hide();
			p.find('[js="upwaiting"]').show();
			p.find('[ js="importcancel"]').hide();
			a.attr('disabled', true);
			a.closest('form').submit();
		}
	});
	
	
});