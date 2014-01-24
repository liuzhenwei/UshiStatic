$(function(){
	var hcok = $('.flaglike').attr('jsuserid');
	var cok = $.cookie(hcok);
	if(cok){
		$('[jsuserid]').removeClass('hby-ilike');
		$('[jsuserid]').addClass('hby-ilike_dis');
	}
	
	if($('[js="ifUnNamed"]').length>0){
		var cokN = $.cookie("comN");
		var cokEmail = $.cookie("comEmail");
		if(cokN && cokEmail){
			$('[name="yicaiVo.username"]').val(cokN);
			$('[name="yicaiVo.email"]').val(cokEmail);
		}
	}
	
	var validate_name = function(name) {
        if (name.length > 32) {
            return "too_long";
        }
        else if (/^.*[!-'*-,\/:-@[-`{-~0-9\u00B7\uFF01\uFFE5\u2026\u2014\u3010\u3011\uFF1B\uFF1A\u2018\u201C\uFF0C\u300A\u3002\u300B\u3001\uFF1F].*$/.test(name)) { // special symbol and numerical character
            return "invalid_symbol";
        }
        else if (/^\s*[a-zA-Z\s.\-]{2,}\s*$/.test(name)) { // pure English
            if (/^[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,}(\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+$/.test(name)) { // doesn't conform to English name format
                return "success_validation";
            }
            else {
                return "invalid_english";
            }
        }
        else if (/^\s*[\u4e00-\u9fa5\s]{1,}\s*$/.test(name)) { // pure Chinese
            if (/^[\u4e00-\u9fa5]{2,10}$/.test(name)) { // doesn't conform to Chinese name format
                return "server_validation";
            }
            else {
                return "invalid_chinese";
            }
        }
        else if (/^.*[\u4e00-\u9fa5].*[a-zA-Z].*$/.test(name)) { // Chinese(English)
            if (/^[\u4e00-\u9fa5]{2,10}\s*[\(\uFF08]?[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,4}((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+)?[\)\uFF09]?$/.test(name)) { // doesn't conform to format
                return "server_validation"
            }
            else {
                return "invalid_chinese_english";
            }
        }
        else if (/^.*[a-zA-Z].*[\u4e00-\u9fa5].*$/.test(name)) { // English(Chinese)
            if (/^[a-zA-Z]+((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+){0,4}((\s|\s?\.\s?|\s?-\s?)[a-zA-Z]+)?\s*[[\(\uFF08]?[\u4e00-\u9fa5]{2,10}[\)\uFF09]?$/.test(name)) {
                return "server_validation";
            }
            else {
                return "invalid_english_chinese";
            }
        }
        else if (/^.*[\u3040-\u30FF\u31F0-\u31FF\uAC00-\uD7AF\u1100-\u11FF\u00C0-\u024F]+.*$/.test(name)) { // other language
            return "success_validation";
        }
        else {
            return "invalid_name";
        }
    }
	
	
	
	function getStrLen(str) {
		return (str || "").replace(/[^\x00-\xff]/g, "--").length;
	}
	
	var is_email = function(s){
		return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(s);
	};
	
	$('.hby-ilike').one('click',function(){
		var this_ = $(this);
		var id_ = $(this).attr('id');
		var cookie_name=$.trim(this_.attr('jsuserid'));
		
		$.post('/pr/hby!like.jhtml',{"yicaiVo.yicaiUserId":id_},function(data){
			if(data>0){
				var no_ = this_.closest('dd').find('[js="likeNum"]');
				var num = parseInt(no_.text());
				no_.text(num+1);
				this_.removeClass('hby-ilike');
				this_.addClass('hby-ilike_dis');
				$.cookie((cookie_name).toString(),"1");
				$.cookie((cookie_name).toString(),"1",{expires:365, path:'/',domain:'',secure:false});
			}
		})
	});
	
	
	$('.hby-submit').bind('click',function(){
		$('[js="commondCot"]').text("");
		$('[js="commondName"]').text("");
		$('[js="commondEmail"]').text("");
		var tval = $.trim($('[name="yicaiVo.content"]').val());
		var t_chk = getStrLen(tval);
		if(tval==''){
			$('[js="commondCot"]').text("评论内容不能为空！");
			return false;
		}else if(t_chk>400){
			$('[js="commondCot"]').text("评论内容长度不能超过400个字符(即200个汉字)！");
			return false;
		}
		
		if($('[js="ifUnNamed"]').length>0){
			var nval = $.trim($('[name="yicaiVo.username"]').val());
			var emailval = $.trim($('[name="yicaiVo.email"]').val());
			
			

			
			var getVname = function(){
				var bol=false;
				if(validate_name(nval)=="success_validation"){
					bol = true;
				}else{
					$.ajax({
						url:'/user/reg!validateUserName.jhtml',
						async:false,
						data:{"nameString":nval},
						type:"POST",
						success:function(data){
							if(data!="SUCCESS_VALIDATION"){
								$('[js="commondName"]').text("姓名不合法");
								bol=false;
							}else{
								bol=true;
							}
						},
						error:function(data){
							bol=false;
						}
					});
				}

				return bol;
			}
			if(getVname()){
				var regExp = is_email(emailval);
				if(!regExp){
					$('[js="commondEmail"]').text("邮件格式不对！");
					return false;
				}
			}else{
				return false;
			}

		}
		$(this).removeClass('hby-submit');
		$(this).addClass('loading');
		$.cookie("comN",nval);
		$.cookie("comEmail",emailval);
		$.cookie("comN",nval,{expires:365, path:'/', domain:'',secure:false});
		$.cookie("comEmail",emailval,{expires:365,path:'/', domain:'',secure:false});
		
		var v_ = $('[js="chekTab"]').val();
		var v_s = $('[js="chekst"]').val();
		if((v_==3)&&(v_s!=v_) ){
			alert("您发表的评论将进入到专家点评区域")
		}else if((v_ ==1)&&(v_!=v_s)&&(v_s!=2)){
			alert("发表的评论将进入到网友互动区域")
		}else{
		
		}
		
		$(this).closest('form').submit();


	});
	
	$('[js="iwillcom"]').bind('click',function(){
		setTimeout(function(){
			$('[name="yicaiVo.content"]').focus();
		},100)
	});
	
	$('.successshare a').bind('click',function(){
		//var fd = $('.feed-block:first').find('.event-content').find('p:nth-child(2)').text();/
		var cot = $(this).closest('.successshare').attr('jscontentShare');
		jiathis_config = {
			data_track_clickback: true,
			url: window.location,
			title: cot
		};
	});
	
	
	$('.commonShare a').bind('click',function(){
		jiathis_config = {
			data_track_clickback: true,
			url: "http://v.ushi.com",
			title: "xxxxxxx"
		};
	});
	

	
	
	
	
	
});