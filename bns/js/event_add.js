var addNum = 0;
var addFromIpt;

function trimString(str) {
	return (str || "").replace(/(^[\s\t\xa0\u3000]+)|([\s\t\xa0\u3000]+$)/g, "");
}
function checkLength(str) {
	return (str || "").replace(/[^\x00-\xff]/g, "--").length;
}

function formatDT(sdt){
	var dt = sdt.split(/-|:|\s/);
	return new Date(fd(dt[0]), fd(dt[1]) - 1, fd(dt[2]), fd(dt[3]), fd(dt[4]));
}
function ft(t){
	t = '0' + t;
	return t.slice(t.length - 2);
}
function fd(d){
	return parseInt(d, 10);
}
function getEndTime(dt){
	return new Date(dt.getTime() + 7200000);
}
function resetEndTime(sdt){
	var edt = getEndTime(formatDT(sdt));
	var sed = edt.format('yyyy-MM-dd');
	var set = edt.format('hh:mm');
	$('[name="event.endDate"]').val(sed);
	$('[name="event.endHourAndMinute"]').val(set);
}

function compareDate(sd, ed){
	sd = formatDT(sd);
	ed = formatDT(ed);
	if( ed <= new Date() ){
		return 1;
	} else if( sd >= ed ){
		return 2;
	} else {
		if( ed.getTime() - sd.getTime() > 3600000 * 24 * 30	){
			return 3;
		}
		return 0;
	}
}

function checkNeedEnd(sdt){
	if( getEndTime(formatDT(sdt)) < new Date() ){
		$('.endTimea').click();
	} else {
		if( $('.endTimeli').is(':visible') ){
			resetEndTime(sdt);
		}
	}
}

function removeTags(){
	$(this).parent().remove();
	addNum--;//删除一个标签
}

var closeFlag = null;
var edId__ = null;
var edName__ = null;
var retUrlEventDetail = null;

var addEvent_fn = function(form){
	$('.pac-container').hide();
	var url = '/event/manage!doAdd.jhtml';
	if(edId__){
		url = '/event/manage!doEdit.jhtml';
	}
	
	var paramsPost = form.find('[jsPost="forPost"]');
	var paramArr = [];
	var tt = {};
	paramsPost.each(function(i,n){
		tt[$(this).attr("name")]=$(this).val();
	});


	if( $(".endTimeli").is(':visible') ){
		var stTime = $('[name="event.beginDate"]').val()+' '+$('[name="event.beginHourAndMinute"]').val();
		var edTime = $('[name="event.endDate"]').val()+' '+$('[name="event.endHourAndMinute"]').val();
		var n = compareDate(stTime,edTime)
		if(n==1){
			$('.timetips').html(lang.event.add_time_err1)
			$('.timetips').show();
			form.find('a[js="shareSureSubmit"]').removeData('submiting');
			return false
		}else if(n==2){
			$('.timetips').html(lang.event.add_time_err2)
			$('.timetips').show();
			form.find('a[js="shareSureSubmit"]').removeData('submiting');
			return false
		}else if(n==3){
			$('.timetips').html(lang.event.add_time_err3)
			$('.timetips').show();
			form.find('a[js="shareSureSubmit"]').removeData('submiting');
			return false
		}
	};
	if($.trim($('[name="event.address"]').val())==""){
		$('[name="event.address"]').next().show();
		form.find('a[js="shareSureSubmit"]').removeData('submiting');
		return false
	}
	
	form.find('a[js="shareSureSubmit"]').data('submiting', true).parent().append('<span class="middle loading" style="display:inline-block">&nbsp;</span>');
	pop_overlay();

	$.post(url,tt,function(data){
		form.find('a[js="shareSureSubmit"]').removeData('submiting');
		hide_overlay();

		var arr = data.split(",");
		var id = arr[0];
		var name = arr[1];
		if(edId__){
			id = edId__;
		}
		if(edName__){
			name = edName__;
		}
		
		closeFlag = 1;
		retUrlEventDetail = "/event/view!viewDetail.jhtml?id="+id;
		var gid_ = $('[name="gid"]',form).val();
		if(gid_!=0){
			retUrlEventDetail = "/group/events.jhtml?groupId="+gid_;
		}

		//改写好友选择链接
		$('#friendSelectList').friendSelectList('option', 'url', '/msg/message!getFriends.jhtml?eventId=' + id);
		
		setTimeout(function(){
			bShare.addEntry({
				url:"http://www.ushi.com/event/view!viewDetail.jhtml?id="+id,
				title:"分享活动:　"+name,
				content:"分享活动:　"+name
		
			});
		},10)

		
		$('.nextStepAddEvent',form).show();
		form.find('li').not(".nextStepAddEvent").hide();//发布成功后模块显示
		form.find('[js="come_group_add"]').css("display","block");//显示邀请好友
		form.find('.innerULevent li').show();
		form.find('[js="addEvent_firstStep"]').hide();//隐藏发布按钮
		
		$('[js="sureShareAddEventSecond"]',form).bind('click',function(){
			if($('.FriendFromOut').is(':visible')){
				var val = $('[name="event.inviteMails"]').val();
				val = trimString(val);
				val = val.split(',');
				if(val.length>10){
					$('[js="outUshiMoreThan5"]').show();
					return false;
				}
			}
			var inviteIds = $('[name="receiverIds"]',form).val();
			var inviteMails = $('[name="event.inviteMails"]').val();
			$.post('/event/view!inviteFriend.jhtml',{"id":id,"inviteIds":inviteIds,"inviteMails":inviteMails},function(data_){
				if(data_ = 1){
					window.location = "/event/view!viewDetail.jhtml?id="+id
				}
			})
		})
	})
}

//提交新加活动
function submitShare(form){
	form.triggerHandler('ValidateForm', [function(result){
		if( result == true ){
			try{
				geocoder.geocode({'address': addr}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if( results.length == 1 ){
							form.find('input[name="event.cityName"]').val(getGoogleMapCity(results[0].address_components));
						}
					}
					setTimeout(function(){
						addEvent_fn(form)
					},0)
				});
			} catch(e){
				addEvent_fn(form)
			}
		}
	}]);
}

function eventAddInit(){
	var now = new Date();
	var sd = now.format('yyyy-MM-dd');
	var st = ft(now.getHours()+3) + ':30';//初始化时间

	/*初始化的时候格式化时间*/
	if($.trim($('[name="event.beginDate"]').val()) == ''){
		$('[name="event.beginHourAndMinute"]').val(st);
		$('[name="event.beginDate"]').val(sd);
	}
	$('input[name="event.beginDate"]').bind('focus click', function(){
		$('.timetipsErr').hide();
		$('.timetips').hide();
		DateSelect({
			back:this,lang:'zh_CN',
			onSelectBack:function(date){
				this.value=date.back;
				checkNeedEnd(this.value + '-' + $('[name="event.beginHourAndMinute"]').val());
				return true;
			}
		});
	});

	$('#event_beginHourAndMinute').bind('change',function(){
		checkNeedEnd($('input[name="event.beginDate"]').val() + '-' + $(this).val());
	});

	$('[name="event.endDate"]').bind('focus click',function(){
		$('.timetipsErr').hide();
		$('.timetips').hide();
		DateSelect({
			back:this,lang:'zh_CN',
			onSelectBack:function(date){
				this.value=date.back;
				return true;
			}
		});
	});

	$('#eventPopWin').bind('click',function(){
		$('.DateSelect').hide();
	});
	
	$('#eventPopWin').bind('click',function(){
		$('.DateSelect').hide();
	});
	
	/*时间面板自动消失*/
	$('#eventPopWin input').not($('[name="event.endDate"]')).end().not($('[name="event.beginDate"]')).bind('focus',function(){
		$('.DateSelect').hide();
	});
	
	$('.endTimea').bind('click',function(){
		var this_ = $(this);
		this_.hide();
		
		$('.endTimeli').show();
		
		$('.eventAddItem').trigger('showOrnot');
		resetEndTime($('input[name="event.beginDate"]').val() + '-' + $('#event_beginHourAndMinute').val());
	});

	$('.eventAddItem').bind('showOrnot',function(){
		var sh1 = $('.eventNet').css('display');
		if((sh1=="block")){
			$(this).hide();
			$(this).closest('li').css({'height':'20px','overflow':'hidden'})
		}
	});
	
	$('.eventAddItem').show();
	$('.eventAddItem').closest('li').css({'height':'auto','overflow':'hidden'})
	$('.tags_li_instr').hide();
	$('.endTimeli').hide();
	$('.eventNeta').show();
	$('.detail_instra').show();
	$('.tagslia').show();


	$('#friendSelectList').friendSelectList({
		url: '/msg/message!getFriends.jhtml',
		idField: '#receiverId_event',
		inviteMax:10,
		fsParam: {
			prompt: lang.friend.fs_max_info(10),
			width: 826
		}
	});

	$('.innerULevent li').bind('click',function(){
		$(this).addClass("current");
		$(this).siblings().removeClass("current");

		var val = $('a',this).html();
		if(val==lang.event.onedegree){
			$('.FriendFromUshi').show();
			$('.FriendFromOut').hide();
		}else{
			$('.FriendFromOut').show();
			$('.FriendFromUshi').hide();
		}
	});

	/*活动主题搜索*/
	$('#hid_name').bind('focus blur',function(){
		$(this).next().hide();
	});
   	$('#hid_name').autocomplete({
		url:'/event/manage!getEventNameRecommend.jhtml',
		ajax:'list',
		listContClass:'input-dropmenu',
		listClass:'Event_Title_search',
		hoverClass:'msover',
		li_id:['id_','title_','addr_','time_','num_','more_'],
		li_template: '<li class="border-bottom" index="%1"><a style="color:#06a" href="/event/view!viewDetail.jhtml?id=%1" target="_blank" litext="y">%2</a><br /><span class="quiet">%3</span> | <span class="quiet">%4</span> | <span class="quiet">%5</span>人参加</li>',
		ajaxKey:'keyword',
		selected: function(event, li){
			if(addFromIpt){
				clearTimeout(addFromIpt);
			}
			if(event.keyCode){
				if(event.keyCode==13){
					$(this).val(li.find('a').text())
				}else{
					window.location = li.find('a').attr('href');//点击的时候跳转到活动页面
				}
			}
			return false;
		},
		onefocus:function(){
			returnValue = false;
		}
	});

   	$('#hid_add').bind('focus blur',function(){
   		$(this).next().hide();
   	});
	setTimeout(function(){
		try{
			var autocomplete = new google.maps.places.Autocomplete($('#hid_add')[0]);
			$('#hid_add').width(390);
		} catch(e){}
	}, 100);

	$('.eventNeta').bind('click',function(){
		$('.eventNet').show('fast',function(){
			$('.eventNeta').hide();
			$('.eventAddItem').trigger('showOrnot');
			$('#hid_title').attr("vdIgnore","no");
		});

	});
		
	//添加标签搜索
	$('#eventPopWin').delegate('.selectedTag .common-close', 'click', removeTags);
	addNum = $('.selectedTag').length; //添加了几个标签了;
	if(addNum>0){
		$('.selectedTagOut').show();
	}
	var addTag = function(val,from,id){
		var chkAdd = 0;
		if(addNum<5){
			$('.selectedTag').each(function(){
				if($(this).text()==val){
					chkAdd++;
					$('.tagsAddTips').html(lang.event.add_addtag_tip1);
					$('.tagsAddTips').show();
				}
			})
			if(chkAdd==0){
				$('.selectedTagOut').show();
				$('.selectedTagOut').append('<span comfrom='+from+' jsid='+id+' class="selectedTag" style="margin-right:3px;">'+val+'<a class="common-close"></a></span>');
				$('.input-dropmenu').hide();
				addNum++;//添加了一个标签
			}
		}else{
			$('.tagsAddTips').html(lang.event.add_addtag_tip2);
			$('.tagsAddTips').show();
		}
	}
	var addTagApart = function(val){
		var len = checkLength(val);
		if( val != '' && len <= 24 ){
			addTag(val, 1);
			$('#hid_tagAdd').val("").data('searchKey', '');
		} else if( val=='' ){
			return false;
		} else {
			$('.tagsAddTips').html(lang.event.add_addtag_tip3);
			$('.tagsAddTips').show()
		}
	}
	var attachEventTag = function(){
		var val = $.trim($('#hid_tagAdd').val());
		if( val.indexOf(',') ){
			val = val.split(',');
			$.each(val, function(i, n){
				if(trimString(n)!=''){
					addTagApart(trimString(n));
				}
			})
		}
	}

	$('[js="eventAddTags"]').bind('click', attachEventTag);

	$('#hid_tagAdd').bind('blur',function(){
		if( $.trim($(this).val()) != '' ){
			return false;
		}
	});
   	$('#hid_tagAdd').autocomplete({
		url:'/event/manage!getTagNameRecommend.jhtml',
		ajax:'list',
		listContClass:'Event_Tag_search',
		listClass:'',
		hoverClass:'hover',
		li_id:['id_','name'],
		li_template: '<li class="border-bottom quiet" jsid="%1">%2</li>',
		ajaxKey:'keyword',
		position: {of: $('.selectedTagOutKK')},
		width:402,
		selected: function(event, li){
			var jsid = li.attr('jsid');
			if( jsid ){
				addTag(li.text(), 2, jsid);
			}else{
				addTag(li.text(), 1);
			}
			$(this).data('searchKey', '').val('');
		},
		keydown: function(event){
			var key_ = event.keyCode;
			if( (key_==13) || (key_==188) || (key_==59) || (key_==186) ){
				attachEventTag();
				$(".Event_Tag_search").hide();
				return false;
			}
		},
		keyup: function(event){
			var key_ = event.keyCode;
			if( key_ == 13 ) return false;
			var s = $(this).val(), s1 = s.slice(s.length - 1);
			if( key_==188 || key_==59 || key_==186 || s1=='，' || s1=='；' ){
				$(this).val(s.slice(0, s.length - 1));
				attachEventTag();
				return false;
			}
		},
		focus:function(event, obj){
			$('.tagsAddTips').hide();
			if( obj.val() == '' ){
				$(this).autocomplete('show', [{"id_":'','name':'商务会议'},{"id_":'','name':'教育培训'},{"id_":'','name':'文化演艺'},{"id_":'','name':'讲座沙龙'},{"id_":'','name':'聚会派对'}]);//默认进来的时候显示的内容
				return false;
			}
		}
	});
	
	$('.selectedTagOutKK').bind('click',function(){
		$('[name="event.tagName"]').focus();
	});
	
	$('[name="event.externalurl"]').bind('focus blur',function(){
		$('.eventErrNet').hide();
	});
	
	$('[name="event.inviteMails"]').bind('click blur',function(){
		$('[js="outUshiMoreThan5"]').hide();
	});

	$('#eventPopWin .formstyle').validate({
		bindSubmit: false,
		fieldParent: 'li',
		extTools: {
			isnotURL:function(str_url){
				var strRegex = "^((https|http|ftp|rtsp|mms)?://)?.+$"; 
				var re=new RegExp(strRegex); 
				if(trimString(str_url)==''){
					return (true); 
				}else{
					if(re.test(str_url)){
						return (true); 
					}else{ 
						return (false); 
					}
				}
			}
		}
	});

	if( __nav != "nav_home"	){  //如果不在首页添加活动，则删除分享链接上的click事件
		$('#eventPopWin .bshare-custom a').removeAttr('onclick');
	}

	function uniquerArray(arr) {
		var cache = {}, index = 0;
		while(index < arr.length) {
			if(cache[arr[index]] === typeof arr[index]) {
				arr.splice(index, 1);
				continue;
			}
			cache[arr[index] + ""] = typeof arr[index];
			++index;
		}
		return arr;
	}

	$('a[js="shareSureSubmit"]').bind('click',function(){
		var from2 = [];
		var from1 = [];
		
		$('.selectedTag[comfrom=2]').each(function(){
			from2.push($(this).attr('jsid'));
		});
		$('.selectedTag[comfrom=1]').each(function(){
			from1.push($(this).text());
		});

		from2 = uniquerArray(from2)
		from1 = uniquerArray(from1)
		$('#popHiddenTags').val(from2.join(','))
		$('#popHiddenNames').val(from1.join(','))

		submitShare($('#eventPopWin .formstyle'));
	});
}
