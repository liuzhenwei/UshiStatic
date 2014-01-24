$(document).ready(function(){
	$('#addfollow').click(function() {
		var a = $(this), userid = $(this).attr('userid');
		$.get('/sns/sns!addFollower.jhtml?targetUserId='+userid+'&r='+Math.random());
		if( a.hasClass('link-follow-b') ){
			afterAddFollower(a);
			a.remove();
		} else {
			$("#addfollow").hide();
		}
	});

	//工作经历，公司名称
	(function(companyName){
		if(companyName.size()==0) return false;
		var showName = companyName.next(),
			editBtn = showName.next(),
			attribute = editBtn.next();

		var oldName = companyName.val();
		var companyNamePrevValue = null;
		var company_site = $('[name="company.site"]');
		var company_sizeid = $('[name="company.sizeid"]');

		var showInfo = function(){
			companyName.hide();
			showName.text(companyName.val()).show();
			editBtn.show();
		};
		var showAttribute = function(){
			companyName.val($.trim(companyName.val()));
			if( companyName.val() != '' && companyName.val() != oldName ){
				attribute.show();
				if(companyName.val() != companyNamePrevValue){
					companyNamePrevValue = companyName.val();
					company_site.val('');
					company_sizeid.val(0);
				}
			}
			if( companyName.val() != ''){
				showInfo();
			}
		};

		/*
		companyName.autocomplete({
			url: '/ajax/json!listCompanies.jhtml',
			ajax: 'companies',
			listClass: 'ac-dp-list vcard-auto',
			selected: function(event, li){
				_sltd=li.find("dt").children("a").html();
				_sltd=_sltd.replace(new RegExp("<b>","ig"),'');
				_sltd=_sltd.replace(new RegExp("</b>","ig"),'');
				companyName.val(_sltd);
				$('#companyID').val(li.attr('index'));
				showInfo();
			},
			keydown: function(event, obj){
				$('#companyID').val('0');
			},
			unselected: function(event, obj){
				if( $('#companyID').val() != '0' ){
					showInfo();
				} else {
					showAttribute();
				}
			},
			li_template: '<li index="%1"><a><img src="%3" /></a><dl><dt><a>%2</a></dt><dd><span style="margin-right:5px;">%4</span><span style="margin-right:5px;">%5</span><span>%6</span></dd></dl></li>',
			li_id: ['id_', 'name_', 'logo_', 'industryName_', 'size_', 'city_']
		});
		*/

		companyName.autocomplete({
			url: '/ajax/json!listCompanies.jhtml',
			ajax: 'companies',
			selected: function(event, li){
				companyName.val(li.text());
				$('#companyID').val(li.attr('index'));
				showInfo();
			},
			keydown: function(event, obj){
				$('#companyID').val('0');
			},
			unselected: function(event, obj){
				if( $('#companyID').val() != '0' ){
					showInfo();
				} else {
					showAttribute();
				}
			}
		});

		companyName.click(function(){
			clearErrMsg(this);
			return false;
		});
		editBtn.click(function(){
			companyName.show();
			setTimeout(function(){
				companyName.focus();
			}, 50);
			showName.text('');
			editBtn.hide();
			attribute.hide();
			return false;
		});
	})($('#CompanyName'));

	$('#SchoolName').autocomplete({
		url: '/ajax/json!listSchools.jhtml',
		ajax: 'schools',
		selected: function(event, li){
			$('#SchoolName').val(li.text());
			$('#schoolID').val(li.attr('index'));
		},
		keydown: function(event, obj){
			$('#schoolID').val('');
		}
	});

	try{selectCity()}catch(e){}
	try{selectCity($('#homeCountry'),$('#homeRegion'),$('#homeCity'))}catch(e){}

	//-----------------------preview.jsp------------------------
	/* 为他人档案添加备注
	(function(note){
		if(note.size()==0 ) return null;

		var show = note.find('>div:last'),
		edit = note.find('>div:first'),
		enter = note.find(':button:first'),
		cancel = note.find(':button:last'),
		content = note.find('textarea:first'),
		noteEditbtn = note.find('a:first'),
		noteText = note.find('p:first');

		content.bind('click focus', function(){
			enter.show();
			cancel.show();
		});
		content.blur(function(){
			if( this.value == '' || this.value == $(this).attr('defaultTips') ){
				enter.hide();
				cancel.hide();
			}
		});

		cancel.click(function(){
			enter.hide();
			cancel.hide();
			edit.hide();
			show.show();
		});

		enter.click(function(){
			$.post("/user/profile!editMemo.jhtml",{memo:content.val(),pid:content.attr('pid')},function(data){
				if( data ==0 ){
					noteText.html(content.val().htmlTostr());
					content.val('');
					edit.hide();
					show.show();
					enter.hide();
					cancel.hide();
				}
			});
		});
		noteEditbtn.click(function(){
			var s = noteText.text();
			content.val(s).attr('rel', s);
			edit.show();
			show.hide();
			content.unbind('click');
		});
	})($('#profile_note'));
	*/

	// 收藏档案
	$('[js="add_fav"]').live('click',function(){
		var _this=$(this);
		var _pid=_this.attr('pid');

		$.ajax({
			url:'/user/profile!editMemo.jhtml',
			data:{'pid':_pid},
			success:function(r){
				var _text=_this.html().slice(48,_this.html().length);
				_this.html('<span class="job-icon-new job-icon-new6"></span>'+_this.attr('text2'));
				_this.attr('text2',_text);
				_this.attr('js','remove_fav');
				_this.attr('mid',r);
				memo_popup('');
			}
		});
	});
	// 取消收藏
	$('[js="remove_fav"]').live('click',function(){
		var _this=$(this);
		var _offset=_this.offset();
		var _mid=_this.attr('mid');
		var _uname=_this.attr('uname');
		pop_confirm(lang.common.tips, lang.profile.cancle_Memo1 + _uname + lang.profile.cancle_Memo2 ,
			function(){
				$.ajax({
					url:'/sns/sns!removeMemo.jhtml',
					data:{'targetId':_mid},
					success:function(){
						var _text=_this.html().slice(48,_this.html().length);
						_this.html('<span class="job-icon-new job-icon-new6"></span>'+_this.attr('text2'));
						_this.attr('text2',_text);
						_this.attr('js','add_fav');
						$('[js="memo_content"]').html(lang.feed.feed_type_emtpy);
						$('[js="memo_modify"]').html(lang.profile.add_memo);
					}
				});
				$('.memo-done').hide();
			},{},{
				overlay:0,
				modal:false,
				width:240,
				position:[_offset.left+20,_offset.top+25]
			}
		)


	});

	$('[js="memo_modify"]').live('click',function(){
		var _text=$.trim($('[js="memo_content"]').html());
		if (_text!=lang.feed.feed_type_emtpy && _text!=lang.profile.add_memo){
			memo_popup(_text);
		} else{
			memo_popup('');
		}
	});

	function memo_popup(_content){
		$('.memo-done').parent().show();
		var _pop=$('<div><p style="padding:15px 15px 0 15px;"><input type="text" style="width:200px; height:20px;" defaultTips="'+lang.profile.tipNum+'" maxlength="50" /></p><p style="padding-right:10px; text-align:right;"><input class="button" type="button" value="'+lang.common.confirm+'" fav_btn="ok" /><input class="common-button" type="button" value="'+lang.common.cancel+'" fav_btn="cancel" /></p></div>');
		var _offset=$('.memo-done').show().offset();
		_pop.popupTips({
			tipsType:5,
			arrow:'top',
			overlay:0,
			modal:true,
			overlayEvents:'click',
			clickClose:true,
			reserve:false,
			closeDestroy: true,
			position: [_offset.left+10,_offset.top+25],
			title:lang.profile.addTip,
			width:240,
			modal:false,
			open:function(){
				_pop.find(':text').showDefaultTips().focus();
				if (_content.length>0){
					_pop.find(':text').val(_content);
				}

				_pop.find('[fav_btn="ok"]').click(function(){
					var _text=$.trim(_pop.find(':text').val());
					if (_text.length>0 && _text!=_pop.find(':text').attr('defaultTips')){
						$.ajax({
							url:'/user/profile!editMemo.jhtml',
							type:'POST',
							data:{'pid':$('[js="remove_fav"]').attr('pid'),'memo':_text},
							success:function(){
								$('[js="memo_modify"]').html(lang.common.modify);
								$('[js="memo_content"]').html(_text);
							}
						});
					} else{
						$.ajax({
							url:'/user/profile!editMemo.jhtml',
							type:'POST',
							data:{'pid':$('[js="remove_fav"]').attr('pid'),'memo':''},
							success:function(){
								$('[js="memo_content"]').html(lang.feed.feed_type_emtpy);
								$('[js="memo_modify"]').html(lang.profile.add_memo);
							}
						});
					}
					_pop.popupTips('close');
				})

				_pop.find('[fav_btn="cancel"]').click(function(){
					_pop.popupTips('close');
				})
			}
		});
	}


	//-----------------------基本信息------------------------
	(function(base){
		if(base.size()==0) return false;
		base.find('[js="submit"]').click(function(){
			clearErrMsg();
			var form = $(this).closest('form'),
				result = true;
			var indus = base.find('[js="industryid"]');
			if(indus.val()==0){
				indus.focus().next().addClass('tip-err').show();
				result = false;
			} else {
				indus.next().hide();
			}
			var city = $('#selectCity');
			if(city.val()==0){
				city.focus().next().addClass('tip-err').show();
				result = false;
			} else {
				city.next().hide();
			}
			var career=base.find('[js="career"]');
			if(career.val()==''){
				career.focus().next().addClass('tip-err').show();
				result = false;
			} else {
				career.next().hide();
			}
			var name = base.find('[js="name"]');
			user_name(name.val(), function(msg){
				var m = name.next();
				if( msg ){
					name.focus();
					m.addClass('tip-err').show().find('.tips-box-inner').html(msg);
				} else {
					m.hide();
					if( result ){
						form.submit();
					}
				}
			});

			return false;
		});
	})($('#edit_base'));

	//-----------------------职业------------------------
	(function(career){
		if(career.size()==0) return false;
		career.find('[js="submit"]').click(function(){
			clearErrMsg();
			var result = true;

			var careersumm=career.find('[id="profiledetail_careersumm"]');
			if(careersumm.val()==''){
				setErrMsg(careersumm, lang.profile.careerbrief_blank);
				setErrStyle(careersumm);
				careersumm.focus();
				result = false;
			}
			var expertskill=career.find('[id="profiledetail_expertskill"]');
			if(expertskill.val()==''){
				setErrMsg(expertskill, lang.profile.expertskill_blank);
				setErrStyle(expertskill);
				if (result) {
					expertskill.focus();
				}
				result = false;
			}

			return result;
		});
	})($('#edit_career'));


	//-----------------------联系信息------------------------
	/*
	(function(contact){
		if(contact.size()==0) return false;
		contact.find('[js="submit"]').click(function(){
			clearErrMsg();
			var result = true;

			var mobile=contact.find('[js="mobile"]');
			if(mobile.val()==''){
				setErrMsg($("#profiledetail_mobilesetting"), lang.profile.mobile_blank);
				setErrStyle(mobile);
				mobile.focus();
				result = false;
			}else if(!mobile.val().is_mobile()){
				setErrMsg($("#profiledetail_mobilesetting"), lang.profile.mobile_mustbenum);
				setErrStyle(mobile);
				mobile.focus();
				result = false;
			}
			return result;
		});
	})($('#edit_contact'));
	*/
	var imErrMsg = [{vali: 'isQQ', msg: lang.profile.update_contact+' QQ'},
		{vali: 'isEmail', msg: lang.profile.update_contact+ ' MSN'},
		{vali: 'isEmail', msg: lang.profile.update_contact+' Gtalk'},
		{vali: 'isSkype', msg: lang.profile.update_contact+' Skype'},
		{vali: 'isEmail', msg: lang.profile.update_contact+' Yahoo! Messenger'},
		{vali: 'isWangWang', msg: lang.profile.update_contact+' AliWangWang'},
		{vali: 'isEmail', msg: lang.profile.update_contact+' AIM'}];
	$('.profile-im-select').each(function(){
		var t = $(this), li = t.closest('li.middle');
		function imchange(){
			var em = imErrMsg[parseInt(t.val(), 10)];
			li.find('[vdErr]').text(em.msg);
			li.find(':text').attr('Validate', em.vali);
		}
		t.change(imchange);
		imchange();
	});
	$('#edit_contact').validate({
		validateAjax: false,
		bindBlur: false,
		fieldParent: 'li.middle',
		showErr: function(event, field){
			field.data('validateOpt')['parent'].find('[vdErr], [js="vdErr"]').css('display', 'block');
		}
	});

	$('select[js="contact_editGroup"]').each(function(index){
		var self = $(this);
		self.next().click(function(){
			var a = $(this),
				tips = $('<div />').append($('#mygroups').html()),
				pos = a.offset();
			pos.left += a.outerWidth();
			tips.popupTips({
				tipsType: 2,
				modal: false,
				overlay: 0,
				clickClose: true,
				reserve: false,
				arrow: 'left',
				width: 300,
				position: [pos.left + 10, pos.top - 20],
				open: function(){
					var eg = $('input[name="' + self.attr('eg') + '_groupsetting"]');
					var aeg = eg.val().split(',');
					for( var i = 0; i < aeg.length; i++ ){
						tips.find(':checkbox[value="' + aeg[i] + '"]').attr('checked', true);
					}
					tips.find('input[js="submit"]').click(function(){
						var data=[];
						tips.find(':checked').each(function(){
							data.push(this.value);
						});
						eg.val(data.join(','));
						tips.popupTips('close');
					});
				}
			});
		});
		self.change(function(){
			if(this.value==2){
				$(this).next().show();
			}else{
				$(this).next().hide();
			}
		});
	});
	//-----------------------教育经历------------------------
	(function(edu){
		if(edu.size()==0) return false;
		edu.find('[js="submit"]').click(function(){
			clearErrMsg();
			var SchoolName=$('#SchoolName');
			if(SchoolName.val()==''){
				setErrMsg(SchoolName, lang.profile.schoolname_blank);
				setErrStyle(SchoolName);
				SchoolName.focus();
				return false;
			}
			var major=edu.find('[js="major"]');
			if(major.val()==''){
				setErrMsg( major, lang.profile.major_blank );
				setErrStyle( major );
				major.focus();
				return false;
			}
			var degreeid=edu.find('[js="degreeid"]');
			if(degreeid.val()==0){
				setErrMsg( degreeid, lang.profile.degree_blank);
				setErrStyle( degreeid );
				return false;
			}
			var date = edu.find('[js="date"]');
			var edudate = date[1].value >= date[0].value;

			if(!edudate){
				setErrMsg( $(date[1]), lang.profile.endafterstart);
				return false;
			}

		});
	})($('#edit_edu'));

	var education_schoolList=$('#education_schoolList');
	if(education_schoolList.size()>0){
		education_schoolList.find('[js="delete"]').click(function(){
			var obj=this;
			//for endorse
			var id = $(this).attr('id');
			var categoryId = id.substring(0, id.indexOf("_"));
			var experienceId = id.substring(id.indexOf("_") + 1);
			$.post('/endorse/manage!checkHasEndorse.jhtml' ,{'categoryId':categoryId,'experienceId':experienceId} , function(data){
				if(data.indexOf('true') != -1){
					pop_confirm(lang.profile.delete_education_title,lang.profile.delete_career_description2,function(){
						window.location.href=obj.href;
					});
				} else {
					pop_confirm(lang.profile.delete_education_title,lang.profile.delete_education_description,function(){
						window.location.href=obj.href;
					});
				}
			});

			return false;
		});
	}
	//-----------------------工作经历------------------------
	(function(job){
		if(job.size()==0) return false;
		var career_companyid = $('#career_companyid');
		var currentDate = job.find('[js="currenDate"]');
		job.find('[js="isonduty"]').click(function(){
			if(this.checked){
				currentDate.hide();
				currentDate.prev().show();
				job.find('[js="jobHeadName"]').attr('checked', true);
				$('[js=jobHeadNameLi]').show();
			}else{
				currentDate.show();
				currentDate.prev().hide();
				job.find('[js="jobHeadName"]').removeAttr('checked');
				$('[js=jobHeadNameLi]').hide();
			}
		});

		job.find('[js="jobHeadName"]').bind('click',function(){
			if(this.checked){
				$('[js=jobHeadNameLi]').show();
			}else{
				$('[js=jobHeadNameLi]').hide();
			}
		})


		job.find('[js="submit"]').click(function(){
			clearErrMsg();
			var result = true;
			var CompanyName=$('#CompanyName');
			if($.trim(CompanyName.val())==''){
				setErrMsg(CompanyName, lang.profile.companyname_blank);
				setErrStyle(CompanyName);
				//CompanyName.focus();
				result = false;
			}
			if( $('#companyID').val() == '0' || $.trim($('#companyID').val()) == '' ){
				var company_sizeid = $('#company_sizeid');
				if(company_sizeid.val() == 0 ){
					setErrMsg(company_sizeid, lang.profile.company_size_blank);
					company_sizeid.next().removeClass('tips')
					setErrStyle(company_sizeid);
					result = false;
				}
			}

			var CompanyPosition = $("#career_position");
			if($.trim(CompanyPosition.val())==''){
				setErrMsg(CompanyPosition, lang.profile.position_blank);
				setErrStyle(CompanyPosition);
				if (result) {
					CompanyPosition.focus();
				}
				result = false;
			}
			var date = job.find('[js="date"]'), chktime = true;
			if( date[0].value == '-1' || date[1].value == '-1' ){
				chktime = result = false;
			} else {
				if( currentDate.css('display') != 'none' ){
					if( date[2].value == '-1' || date[3].value == '-1' ){
						chktime = result = false;
					}
				}
			}
			if( chktime == true ){
				var jobdate= new Date(date[2].value,date[3].value - 1) >=  new Date(date[0].value,date[1].value -1 );
				if( !jobdate && currentDate.css('display') != 'none' ){
					setErrMsg($("#career_endmonth"), lang.profile.endafterstart);
					setErrStyle($("#career_endyear"));
					setErrStyle($("#career_endmonth"));
					result = false;
				}else if( new Date( date[0].value,date[1].value -1 ) > new Date( new Date().getFullYear(),new Date().getMonth() ) ){
					setErrMsg($("#career_endmonth").parent(), lang.profile.job_starttime);//'开始日期不能大于当前日期'
					setErrStyle($("#career_startmonth"));
					setErrStyle($("#career_startyear"));
					result = false;
				}else if( new Date( date[2].value,date[3].value -1 ) > new Date( new Date().getFullYear(),new Date().getMonth() ) ){
					if(currentDate.css('display') != 'none'){
						setErrMsg($("#career_endmonth"), lang.profile.job_endtime);//'结束日期不能大于当前日期'
						setErrStyle($("#career_endmonth"));
						setErrStyle($("#career_endyear"));
						result = false;
					}
				}
			} else {
				date.each(function(){
					if( this.value == '-1' ){
						setErrStyle($(this));
					}
				});
				setErrMsg(currentDate, lang.profile.jobtime_err);
			}
			if( $('#selectCity').length ){
				var c = $('#selectCity').val();
				if( c == '' || c == '0' ){
					setErrMsg($("#selectCity"), lang.reg.city);
					setErrStyle($("#selectCity"));
					result = false;
				}
			}
			if( $('#profession').length ){
				var p = $('#profession').val();
				if( p == '' || p == '0' ){
					setErrMsg($("#profession"), lang.reg.industry);
					setErrStyle($("#profession"));
					result = false;
				}
			}
			if(result){
				career_companyid.val(CompanyName.attr('isIndex'));
				$(this).closest('form').submit();
			}
		});
	})($('#edit_job'));


	var job_List=$('#job_List');
	if(job_List.size()>0){
		job_List.find('[js="delete"]').click(function(){
			var obj=this;
			//for endorse
			var id = $(this).attr('id');
			var categoryId = id.substring(0, id.indexOf("_"));
			var experienceId = id.substring(id.indexOf("_") + 1);
			$.post('/endorse/manage!checkHasEndorse.jhtml' ,{'categoryId':categoryId,'experienceId':experienceId} , function(data){
				$.ajax({
					url:'/user/career!judgeTheLastCareer.jhtml',
					success:function(r){
						if (r=='1'){
							pop_alert(lang.profile.delete_warning);
						} else{
							if(data.indexOf('true') != -1){
								pop_confirm(lang.profile.delete_career_title,lang.profile.delete_career_description2,function(){
									window.location.href=obj.href;
								});
							} else {
								pop_confirm(lang.profile.delete_career_title,lang.profile.delete_career_description,function(){
									window.location.href=obj.href;
								});
							}
						}
					}
				})
			});
			return false;
		});
	}

	//-----------------------------------preview_self-----------------------------------
	$('#preview_self_new_info .common-close').click(function(){
			var li=$(this.parentNode);
			var feedId=$(this).attr('feedId');
			pop_confirm('',lang.profile.delete_feed_confirm,function(){
					$.get('/feed/feed!delete.jhtml?feedId='+feedId,function(data){
						if(data==0){
							li.remove();
						}
					});
			});

	});

	//显示大徽章
	$('a[js="showLargeBadge"]').mouseover(function(){
		var large = $(this).data('large'),
			pos = $('span', this).offset();
		if( ! large ){
			large = $(this).next('div.badge-show-big');
			if( large.length == 0){
				return;
			}
			$(this).data('large', large);
			var ls = 95, ss = 45, p = 11;
			p += ( ls - ss ) / 2;
			large.css({left: (pos.left - p) + 'px', top: (pos.top - p) + 'px', position: 'absolute'});
			large.appendTo('body');
		}
		$(this).data('tm', setTimeout(function(){
			large.fadeIn(200, function(){
				$(document).bind('mousemove.badge-show-big', function(event){
					if( $(event.target).parents('.badge-show-big').length == 0 ){
						large.hide();
						$(document).unbind('mouseout.badge-show-big');
					}
				});
			});
		}, 350));
	}).mouseout(function(){
		var tm = $(this).data('tm');
		if( tm ){
			clearTimeout(tm);
			$(this).data('tm', tm);
		}
	}).children('span').attr('title', '');

	//群组名称截字
	$('div.group-title').each(function(){
		var a = $('a', this);
		if( a.height() > 45 ){
			var t = a.text();
			var n = lang.lang == 'en_US' ? 32 : 28;
			a.text(t.slice(0, n - t.slice(0, n).replace(/[\x00-\xff]/g, '').length) + '...');
		}
	});

	//高亮内容关键字
	initFilterKey();

	//绑定赞同系统推荐的人脉技能
	$('#addRecommSkill').each(function(){
		var cont = $(this), list = cont.find('div[js="recommCont"]');

		list.delegate('a[js="agreeSkill"]', 'click', function(){
			var a = $(this), li = a.closest('li');
			if( a.data('loading') == true ) return;
			a.data('loading', true);
			$.post('/user/batchSaveTagsAjax.jhtml', {"stList[0].userId":li.attr('uid'), "stList[0].tagIds":li.attr('tid')});
			var param = {};
			list.find('li').each(function(i){
				param['userIdList[' + i + ']'] = $(this).attr('uid');
			});
			$.post('/user/getUserListForTagAjax.jhtml', param, function(data){
				if( $.trim(data) != '' ){
					li.replaceWith($(data).find('>li:first'));
				} else {
					if( list.find('li').length <= 1 ){
						cont.slideUp(400, function(){
							li.remove();
						});
					} else {
						li.fadeOut(200, function(){
							li.remove();
						});
					}
				}
			});
		});

		cont.delegate('a[js="closeAddRecommSkill"]', 'click', function(){
			cont.slideUp(400);
		});

		cont.find('a[js="getAllRecomm"]').click(function(){
			var a = $(this), param = {};
			if( a.data('loading') == true ) return;
			a.data('loading', true);
			param['userIdList[0]'] = list.attr('uid');
			list.find('li').each(function(i){
				param['userIdList[' + (i+1) + ']'] = $(this).attr('uid');
			});
			$.post('/user/getUserListForTagAjax.jhtml', param, function(data){
				a.removeData('loading');
				if( $.trim(data) != '' ){
					list.empty().append(data);
					if( parseInt(list.find('ul').attr('size')) < 7 ){
						a.remove();
					}
				} else {
					cont.slideUp(400, function(){
						list.empty();
					});
				}
			});
		});

		cont.find('a[js="submitAllRecomm"]').click(function(){
			var a = $(this), param = {};
			if( a.data('loading') == true ) return;
			a.data('loading', true);
			list.find('li').each(function(i){
				param['stList[' + i + '].userId'] = $(this).attr('uid');
				param['stList[' + i + '].tagIds'] = $(this).attr('tid');
			});
			if( cont.find('a[js="getAllRecomm"]').is(':visible') ){
				cont.find('a[js="getAllRecomm"]').triggerHandler('click');
			} else {
				cont.slideUp(400, function(){
					list.empty();
				});
			}
			$.post('/user/batchSaveTagsAjax.jhtml', param, function(data){
				a.removeData('loading');
			});
		});
	});

	//获取更多技能
	$('a[js="getAllSkill"]').click(function(){
		var a = $(this), p = a.parent(), url = a.attr('href');
		a.replaceWith('<span class="loading-inline">&nbsp;</span>');
		var param = {};
		$('.pro-skill-list .pro-skill-cont[tid]').each(function(i){
			param["tagIdList[" + i + "]"] = $(this).attr('tid');
		});
		$.post(url, param, function(data){
			data = $(data);
			p.replaceWith(data);
		});
		return false;
	});

	//获取赞同技能的所有人脉
	$('.pro-skill-list').delegate('a[js="getApprove1d"]', 'click', function(){
		var a = $(this), uid = a.closest('.pro-skill-list').attr('uid');
		pop_ajax(a.attr('href') + '&targetUserId=' + uid, lang.profile.skill_1dlist_title, {width:500});
		return false;
	});

});

//显示赞同系统推荐的人脉技能模块
function showAddRecommSkill(){
	$.post('/user/getUserListForTagAjax.jhtml', {"userIdList[0]":$('#addRecommSkill [js="recommCont"]').attr('uid')}, function(data){
		var cont = $('#addRecommSkill'), add = $('#memberAddSkill');
		add.find('div[js="tagList"]').empty();
		if( $.trim(data) == '' ){
			add.slideUp(400);
			return false;
		}
		cont.find('div[js="recommCont"]').empty().append(data);
		add.slideUp(400, function(){
			if( parseInt(cont.find('div[js="recommCont"] ul').attr('size')) < 7 ){
				cont.find('a[js="getAllRecomm"]').remove();
			}
			cont.slideDown(400);
		});
	});
}


//基本信息验证姓名
function user_name(nameString, updateTip){
	var validateResult = nameString.validate_name();
	if (validateResult == "success_validation") { // validation succeeded
		updateTip();
		return true;
	} else if (validateResult == "server_validation") { // pass to server for further validation
		var url = "/user/reg!validateUserName.jhtml";
		$.ajax({
			url: "/user/reg!validateUserName.jhtml",
			type: 'POST',
			dataType: 'text',
			data: {"nameString":nameString},
			success: function(result) {
				if (result == "SUCCESS_VALIDATION") {
					updateTip();
					return true;
				}
				else {
					if (result == "UNPAIRED_PARENTHESIS") {
						updateTip(lang.reg.profile_name_unpaired_parenthesis);
					}
					else if (result == "INVALID_FAMILY_NAME") {
						updateTip(lang.reg.profile_name_invalid_family_name);
					}
					else if (result == "FORBIDDEN_WORDS") {
						updateTip(lang.reg.profile_name_forbidden_words);
					}
					return false;
				}
				return false;
			}
		});
		return;
	} else { // validation failed
		if (validateResult == "too_long") {
			updateTip(lang.reg.profile_name_too_long);
		}
		else if (validateResult == "invalid_symbol") {
			updateTip(lang.reg.profile_name_invalid_symbol);
		}
		else if (validateResult == "invalid_chinese") {
			updateTip(lang.reg.profile_name_invalid_chinese);
		}
		else if (validateResult == "invalid_english") {
			updateTip(lang.reg.profile_name_invalid_english);
		}
		else if (validateResult == "invalid_chinese_english") {
			updateTip(lang.reg.profile_name_invalid_chinese_english);
		}
		else if (validateResult == "invalid_english_chinese") {
			updateTip(lang.reg.profile_name_invalid_english_chinese);
		}
		else if (validateResult == "invalid_name") {
			updateTip(lang.reg.profile_name_invalid_name);
		}
		return false;
	}
}

//加为关注后link样式修改
function afterAddFollower(a){
	a.after("<a class='link-followed-b' href='javascript:void(0);'>"+lang.profile.preview_added_follower+"</a>");
}

//高亮内容关键字
function initFilterKey(){
	$('[filterKey]').each(function(){
		var key = $(this).attr('filterKey');
		if( key ){
			checkKey(this, key);
		}
	});

	function checkKey(node, key){
		var childs = [];
		for( var i = 0; i < node.childNodes.length; i++ ){
			childs.push(node.childNodes[i]);
		}
		for( var i = 0; i < childs.length; i++ ){
			var child = childs[i];
			if( child.nodeType == 1 ){
				checkKey(child, key);
			} else if( child.nodeType == 3 ){
				var text = child.nodeValue, nextChild = i == childs.length ? null : childs[i + 1];
				if( $.trim(text) == '' ) continue;
				var atext = [];
				splitText(text, atext, key);
				var first = isKey(atext[0], key) ? createKey(atext[0]) : createText(atext[0]);
				node.replaceChild(first, child);
				for( var j = 1; j < atext.length; j++ ){
					var next = isKey(atext[j], key) ? createKey(atext[j]) : createText(atext[j]);
					if( nextChild ) node.insertBefore(next, nextChild);
					else node.appendChild(next);
				}
			}
		}
	}
	function isKey(text, key){
		key = ('|' + key.replace(/\s+/g, '|') + '|').toLowerCase();
		return key.indexOf('|' + text.toLowerCase() + '|') >= 0;
	}
	function splitText(text, atext, key){
		var re = new RegExp('(.*?)('+key.replace(/\s+/g, '|')+')(.*)', 'ig');
		var g = re.exec(text);
		if( g ){
			atext.push(g[1]);
			atext.push(g[2]);
			if( g[3] ) splitText(g[3], atext, key);
		} else {
			atext.push(text);
		}
	}
	function createKey(key){
		var el = document.createElement('font');
		el.innerHTML = key;
		el.style.backgroundColor = '#FFCC00';
		return el;
	}
	function createText(text){
		return document.createTextNode(text);
	}
}
//社交动态
var selfdt = '';
$.fn.socialEvent=function(options){
	var defaults={
		url: '/user/profile!listSelf.jhtml'
	};
	var options=$.extend(defaults,options);

	function load_social_event(_frame){
		var _page=parseInt(_frame.attr('page'));
		$.ajax({
			url:options.url,
			type:'POST',
			data:{'pageNo':_page, 'datetime':selfdt},
			success:function(r){
				var _nobg=$('.nobg').html();
				$('.nobg').remove();
				_nobg=$('<div class="nobg">'+_nobg+'</div>');
				_frame.attr('loading','0').attr('page',_page+1).append($(r)).append(_nobg);
			}
		});
	}

	this.each(function(){
		var _this=$(this);
		load_social_event(_this)

		$(window).scroll(function(){
			if( ! _this.is(':visible') ) return;
			if ($(document).scrollTop()+$(window).height()===$(document).height() && _this.attr('loading')!='1'){
				_this.attr('loading','1');
				load_social_event(_this);
			}
		})
	});
	return this;
}