$(document).ready(function(){
	function getParam(paramName, str) {
		str = str || document.location.search;
		var reg = new RegExp("[?& ]"+paramName+"=([^&]*)");
		if(reg.test(str)) {
			return RegExp['$1'];
		} else {
			return null;
		}
	}
	$("a[name='gobutton']").live('click',function(){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定
		
		var himself=$(this);
		var eventid=$(this).attr('eventid');
		var state=$(this).attr('state');
		//showmode：1人脉活动，2:ta的活动 3我的活动,4同城活动，5活动详细
		var showmode=$(this).attr('showmode');
		var myevent=$('#myevent_'+eventid);
		if(state == 3)
		{
			var usertype=himself.attr('usertype');
			if(usertype.indexOf('fromMobile') == -1)
			{
				$('#remindPhone').popupWin({
					title:lang.invite.confirm,
					closeDestroy: true,
					reserve: true,
					width:570
				});
				return ;
			}
				
		}

		$.getJSON('/event/gobutton.jhtml?eventid='+eventid+'&state='+state, function(data){
			//1 我要参加，2我不去了，3现场签到
			if(data.result == 0)
			{
				//已签到
				himself.remove();
			}
			else if(data.result == 1)
			{
				if(showmode != 5)
				{
					himself.removeClass().attr('state',1).addClass('ushi_btn_blue special-btn').html('<span class="event_actFor_en">'+lang.event.gobuttonname_tips1+'</span>');
					var tar = himself.closest('.event-block').find('.picList').find('a');
					tar = tar.eq(0);
				
					if($('[js="numUserList"]').is(":visable")){
						var num = parseInt($('[js="numUserList"]').html())
						$('[js="numUserList"]').html(num-1)
					}
					tar.hide();	
				}
				else
				{
					
					himself.removeClass().attr('state',1).addClass('boldface large ushi_btn_Mblue special-btn large-btn').html('<span></span>'+lang.event.gobuttonname_tips1);
					var num = $('span[js="AllAddPerson"]').text();
					$('span[js="AllAddPerson"]').text(parseInt(num)-1);//参加活动的人减少一个
					var aparent = $('.activeUserList .picList a:first');
					var addA = aparent.clone(true);


					aparent.hide("slow");
					
				}
			}
			else if(data.result == 2)
			{
				if(showmode != 5){	
					himself.removeClass().attr('state',2).addClass('ushi_btn_white common-button').html('<span class="event_actFor_en">'+lang.event.gobuttonname_tips2+'</span>');
					var tar = himself.closest('.event-block').find('.picList').find('a');
					tar = tar.eq(0);
					tar.show();	
				
					if($('[js="numUserList"]').is(":visable")){
						var num = parseInt($('[js="numUserList"]').html())
						$('[js="numUserList"]').html(num+1)
					}
				}
				else{
					himself.removeClass().attr('state',2).addClass('ushi_btn_Mwhite large boldface common-button large-btn').text("").html('<span></span>'+lang.event.gobuttonname_tips2);
					var num = $('span[js="AllAddPerson"]').text();
					$('span[js="AllAddPerson"]').text(parseInt(num)+1);//参加活动的人增加一个
					var aparent = $('.activeUserList .picList a:first');
					var addA = aparent.clone(true);
					aparent.show("slow");
				}
			}
			else if(data.result == 3){
				if(showmode != 5){
					himself.removeClass().attr('state',3).addClass('ushi_btn boldface focus-btn').html('<span class="event_actFor_en">'+lang.event.gobuttonname_tips3+'</span>');
				}
				else{
					himself.removeClass().attr('state',3).addClass('large ushi_btnM boldface focus-btn large-btn').html('<span></span>'+lang.event.gobuttonname_tips3);
				}
			}
			else if (data.result == 4){
				if(showmode == 5)
				{
					var ieurl=location.href;
					var i=ieurl.lastIndexOf('gid');
					if(i>0)
					{
					    var gid = ieurl.substring(i,ieurl.length);
					    gid = gid.replace('gid', 'groupId');
						location.href="/group/events.jhtml?"+gid;
					}
					else
					{
						location.href="/event/myevent.jhtml";
					}
				}
				else
				{
					window.location.reload();
				}
			}
			else if (data.result == 5){
				pop_confirm(lang.event.notgowarn_title,
					lang.event.notgowarn,
					function() {
					   $.getJSON('/event/gobutton.jhtml?eventid='+eventid+'&state='+state+'&confirmNotGo=1', function(data){
					   		if(data.result == 0)
							{
								//已签到
								himself.remove();
							}
							else if(data.result == 1)
							{
								if(showmode != 5)
								{
									himself.removeClass().attr('state',1).addClass('ushi_btn_blue special-btn').html('<span class="event_actFor_en">'+lang.event.gobuttonname_tips1+'</span>');
									var tar = himself.closest('.event-block').find('.picList').find('a');
									tar = tar.eq(0);
								
									if($('[js="numUserList"]').is(":visable")){
										var num = parseInt($('[js="numUserList"]').html())
										$('[js="numUserList"]').html(num-1)
									}
									tar.hide();	
								}
								else
								{
									
									himself.removeClass().attr('state',1).addClass('boldface large ushi_btn_Mblue').html('<span></span>&nbsp;&nbsp;&nbsp;'+lang.event.gobuttonname_tips1+'&nbsp;&nbsp;&nbsp;');
									var num = $('span[js="AllAddPerson"]').text();
									$('span[js="AllAddPerson"]').text(parseInt(num)-1);//参加活动的人减少一个
									var aparent = $('.activeUserList .picList a:first');
									var addA = aparent.clone(true);
				
				
									aparent.hide("slow");
									
								}
							}
							else if(data.result == 2)
							{
								if(showmode != 5){	
									himself.removeClass().attr('state',2).addClass('ushi_btn_white common-button').html('<span class="event_actFor_en">'+lang.event.gobuttonname_tips2+'</span>');
									var tar = himself.closest('.event-block').find('.picList').find('a');
									tar = tar.eq(0);
									tar.show();	
								
									if($('[js="numUserList"]').is(":visable")){
										var num = parseInt($('[js="numUserList"]').html())
										$('[js="numUserList"]').html(num+1)
									}
								}
								else{
									himself.removeClass().attr('state',2).addClass('ushi_btn_Mwhite large boldface').text("").html('<span></span>&nbsp;&nbsp;&nbsp;'+lang.event.gobuttonname_tips2+'&nbsp;&nbsp;&nbsp;');
									var num = $('span[js="AllAddPerson"]').text();
									$('span[js="AllAddPerson"]').text(parseInt(num)+1);//参加活动的人增加一个
									var aparent = $('.activeUserList .picList a:first');
									var addA = aparent.clone(true);
									aparent.show("slow");
								}
							}
							else if(data.result == 3){
								if(showmode != 5){
									himself.removeClass().attr('state',3).addClass('ushi_btn boldface').html('<span class="event_actFor_en">'+lang.event.gobuttonname_tips3+'</span>');
								}
								else{
									himself.removeClass().attr('state',3).addClass('large ushi_btnM boldface').html('<span></span>&nbsp;&nbsp;&nbsp;'+lang.event.gobuttonname_tips3+'&nbsp;&nbsp;&nbsp;');
								}
							}
							else if (data.result == 4){
								if(showmode == 5)
								{
									var ieurl=location.href;
									var i=ieurl.lastIndexOf('gid');
									if(i>0)
									{
									    var gid = ieurl.substring(i,ieurl.length);
									    gid = gid.replace('gid', 'groupId');
										location.href="/group/events.jhtml?"+gid;
									}
									else
									{
										location.href="/event/myevent.jhtml";
									}
								}
								else
								{
									window.location.reload();
								}
							}
						});
					}
				);
			}
		});
	});
	
	
	
	
	$("#div_moreevent_myevent").live('click',function(){
		var himself=$(this);
		var _option=$("[name=showOption]").val();
		var actionurl="/event/moremyevent.jhtml?pageNo=";
		var div=$("#totalTagsList");
		var showMode=div.attr('showMode');
		var pageNo = parseInt(div.attr('pageNo')) + 1;
		div.attr('pageNo',pageNo);
		if(showMode == "1")
		{
			actionurl="/event/morerenmai.jhtml?showOption="+_option+"&pageNo=";
		}
		else if(showMode == "3"){
			actionurl="/event/moremyevent.jhtml?pageNo=";
		}
		else if(showMode == "4")
		{
			actionurl="/event/moresamecity.jhtml?";
			var tid = div.attr("tagId") || "-1";
			actionurl += "tagid=" + tid;
			if( tid != "-1" ){
				actionurl += "&cityid=" + div.attr("cityId");
			}
			actionurl += "&pageNo=";
		}
		$.get(actionurl+pageNo, function(data){
			himself.remove();
			$('#div_eventslist').empty();
			$('#div_eventslist').append(data);
		});
		
	});	
	
	$("a[name='a_event_searchbykeywords']").click(function(){
		var form=$(this).closest('form');
		form.validate({
			validateAjax: false
		})
		setTimeout(function(){
			form.submit();
		},100)
		
	});

	
	$('#input_event_matchtag').one('focus',function(){
			   		$(this).val('');
			   	}).autocomplete({
					url:'/event/matchtag.jhtml',
					ajax:'tags',
					listContClass:'input-dropmenu',
					listClass:'Event_Title_tagssearch',
					hoverClass:'msover',
					li_id:['id','tagname'],
					li_template: '<li class="border-bottom quiet" index="%1" jsid="%1">%2</li>',
					ajaxKey:'keywords',
					selected: function(event, li){
					   $(this).val(li.text())
					}
	});
	$('#a_attentiontag').click(function(){
		var this_ = $(this);
		var parent_ = $(this).parent();
		$.getJSON('/event/attentiontag.jhtml?tagid='+$(this).attr('tagid'),function(data){
			if(data.result == 0)
			{
				$('#a_attentiontag').remove();
				parent_.append('<span class="float-right margin-top15e date">'+lang.event.backend_attentionsuccess+'</span>')
			}
		});
	});
	$('#div_welcome').popupWin({
   		title:lang.event.innertest_title,
		closeDestroy:true,
   		width:800
			    		
	});
});