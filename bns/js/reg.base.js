function validateName(name) {
    if (name.length > 32) {
        return "too_long";
    } else if (/^.*[!-'*-,\/:-@[-`{-~0-9\u00B7\uFF01\uFFE5\u2026\u2014\u3010\u3011\uFF1B\uFF1A\u2018\u201C\uFF0C\u300A\u3002\u300B\u3001\uFF1F].*$/.test(name)) { // special symbol and numerical character
        return "invalid_symbol";
    } else if (/^\s*[a-zA-Z\s.\-]{2,}\s*$/.test(name)) { // pure English
        if (/^[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,}(\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+$/.test(name)) { // doesn't conform to English name format
            return "success_validation";
        } else {
            return "invalid_english";
        }
    } else if (/^\s*[\u4e00-\u9fa5\s]{1,}\s*$/.test(name)) { // pure Chinese
        if (/^[\u4e00-\u9fa5]{2,10}$/.test(name)) { // doesn't conform to Chinese name format
            return "server_validation";
        } else {
            return "invalid_chinese";
        }
    } else if (/^.*[\u4e00-\u9fa5].*[a-zA-Z].*$/.test(name)) { // Chinese(English)
        if (/^[\u4e00-\u9fa5]{2,10}\s*[\(\uFF08]?[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,4}((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+)?[\)\uFF09]?$/.test(name)) { // doesn't conform to format
            return "server_validation"
        } else {
            return "invalid_chinese_english";
        }
    } else if (/^.*[a-zA-Z].*[\u4e00-\u9fa5].*$/.test(name)) { // English(Chinese)
        if (/^[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,4}((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+)?\s*[[\(\uFF08]?[\u4e00-\u9fa5]{2,10}[\)\uFF09]?$/.test(name)) {
            return "server_validation";
        } else {
            return "invalid_english_chinese";
        }
    } else if (/^.*[\u3040-\u30FF\u31F0-\u31FF\uAC00-\uD7AF\u1100-\u11FF\u00C0-\u024F]+.*$/.test(name)) { // other language
        return "success_validation";
    } else {
        return "invalid_name";
    }
}

function updateTips(tips, str){
	var t = $(tips);
	if( t.find('.tips-box-inner').length ) t = t.find('.tips-box-inner');
	if( ! t.data('tips') ){
		t.data('tips', t.html());
	}
	str = str || t.data('tips');
	t.html(str);
};

function checkUserName(str, opt){
    var result = validateName(str);
    if( result == "success_validation" ){
		updateTips('[regTips="usernameTips"]');
		opt['field'].trigger('Validate', [true, 'suc']);
		return true;
    } else if( result == "server_validation" ){
        $.ajax({
            url: opt['url'],
            type: 'POST',
            dataType: 'text',
            data: {"nameString": str},
            success: function(data) {
			    if( data == "SUCCESS_VALIDATION" ){
			        updateTips('[regTips="usernameTips"]');
			        opt['field'].trigger('Validate', [true, 'suc']);
			    } else {
			        if (data == "UNPAIRED_PARENTHESIS") {
			            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_unpaired_parenthesis);
			        } else if (data == "INVALID_FAMILY_NAME") {
			            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_invalid_family_name);
			        } else if (data == "FORBIDDEN_WORDS") {
			            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_forbidden_words);
			        }
			        opt['field'].trigger('Validate', [false, 'err']);
			    }
        	}
        });
        return -2;
    } else {
        if (result == "too_long") {
            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_too_long);
        } else if (result == "invalid_symbol") {
            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_invalid_symbol);
        } else if (result == "invalid_chinese") {
            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_invalid_chinese);
        } else if (result == "invalid_english") {
            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_invalid_english);
        } else if (result == "invalid_chinese_english") {
            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_invalid_chinese_english);
        } else if (result == "invalid_english_chinese") {
            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_invalid_english_chinese);
        } else if (result == "invalid_name") {
            updateTips('[regTips="usernameTips"]', lang.reg.profile_name_invalid_name);
        }
        opt['field'].trigger('Validate', [false, 'err']);
        return false;
    }
};

function checkAjaxEmail(str, opt){
	var result = opt['tools']['isEmail'](str);
	if( result == true ){
        updateTips('[regTips="emailTips"]');
        $.ajax({
            url: opt['url'],
            type: 'POST',
            dataType: 'text',
            data: {'email': str},
            success: function(data) {
				if( data == '0' ){
			        opt['field'].trigger('Validate', [true, 'suc']);
				} else {
				    switch( data ){
				    case '2':
			            updateTips('[regTips="emailTips"]', lang.reg.check_email_err2);
				    	break;
				    case '3':
			            updateTips('[regTips="emailTips"]', lang.reg.check_email_err3);
				    	break;
				    case '5':
			            updateTips('[regTips="emailTips"]', lang.reg.check_email_err5);
				    	break;
				    default:
				    	updateTips('[regTips="emailTips"]', lang.reg.check_email_err2);
				    }
			        opt['field'].trigger('Validate', [false, 'err']);
				}
        	}
        });
        return -2;
	} else {
        updateTips('[regTips="emailTips"]', lang.reg.email_invaild);
        opt['field'].trigger('Validate', [false, 'err']);
		return false;
	}
}

function checkInviteCode(str, opt){
	if( str != '' ){
        $.ajax({
            url: opt['url'],
            type: 'POST',
            dataType: 'text',
            data: {'inviteCode': str},
            success: function(data) {
				if( data == '1' ){
			        opt['field'].trigger('Validate', [true, 'suc']);
				} else {
			        opt['field'].trigger('Validate', [false, 'err']);
				}
        	}
        });
        return -2;
	} else {
		opt['field'].trigger('Validate', [true, 'suc']);
		return -1;
	}
}