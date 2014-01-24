$(function(){
	$("#totalTagsList .tagMan li").hover(function(){
		$('a',this).show();
		$(this).addClass('blueBg');
	
	},function(){
		$('a',this).hide();
		$(this).removeClass('blueBg')
	})
	
	$('#totalTagsList ul .common-close').bind('click',function(){
		var tagid=$(this).attr('js');
		var this_=$(this);
		pop_confirm(lang.invite.confirm,
					lang.event.removetagconfirm,
					function() {
					   $.get("/event/eventtags!cancelFollow.jhtml?tagid="+tagid,function(data){
					   		if(1 == data)
					   		{
					   			this_.parent().remove();
					   		}
						});
					}
		);
	})	 
   	
   	$('#viewAll_').bind('click',function(){
   		$(this).css('border','none')
   		$('.activeUserList a.hide').removeClass('hide');
   		$(this).hide();
   	})
		
	/*close用户信息*/
	$('.userBoardClose').bind('click',function(){
		$(this).closest('#personalInfo').hide();
	})
	
    /*打开分享活动窗口*/
    var sharePopLoading = false;
    $('a[name=a_shareevent]').bind('click',function(){
    	if( $(this).attr('unverify') ) return; //如果未经验证则不绑定
    	
    	var val_ = $('[js="event_search_input"]').val();
    	
    	if( sharePopLoading == true ) return false;
    	sharePopLoading = true;
    	$.ajax({
    		url: '/event/manage!toAdd.jhtml',
    		type: 'get',
    		dataType: 'text',
    		success: function(data){
    			sharePopLoading = false;
		    	if( $('#div_welcome').is(':visible') ){
		    		return;
		    	}
	    		$('#eventPopWin').remove();
	    		if(data == '0000'){
	    			pop_alert(lang.event.youarenotbetausercantshareevent);
	    		} else {
	    			$('body').append(data);
			    	$('#eventPopWin').popupWin({
			    		title:lang.event.sharemyevent,
						closeDestroy:true,
						reserve: false,
			    		width: 525,
			    		beforeClose:function(){
			    			$('.DateSelect').hide();
			    			if(closeFlag && retUrlEventDetail){
			    				window.location = retUrlEventDetail;
			    			}
			    		},
			    		open:function(){
					    	if((val_ != '')&&(val_ != lang.event.searchEventInput)){
					    		$('#hid_name').val(val_).attr('searchKey', val_);
					    	}
			    		}
			    	});
	    		}
    		}
    	});
    });
    
    $('#Event_start_ev a').bind('click',function(){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定
    	$('a[name=a_shareevent]').trigger('click');
    })
    
	$('#EventOutLink').bind('click',function(){
		window.location = "/event/myevent.jhtml?_="+new Date().getTime()+"#outLink";
	});
	
	var outLink = document.location.hash;
    if(outLink=='#outLink'){
    	$('.huge_BtnM').click();
    }


	/*现场签到*/
	$('.ushi_btn').bind('click',function(){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

		$('#remindPhone').popupWin({
			title:lang.invite.confirm,
			closeDestroy: true,
			reserve: true,
			width:570
		})
	})
	
	/*关闭面板*/
	$('.nofocus').bind("click",function(){
		$(this).parent().parent().popupWin("destroy");
	})
	/*google日历*/
	$('#sharegoogleId').bind('click',function(){
		$('#exportGoogle').popupWin({
			title:lang.invite.confirm,
			closeDestroy: true,
			reserve: true,
			width:600
		})
		setTimeout(function(){
			$('[js="googleSelIpt"]').select();
		},100)
		
	})
	 /*导出outlook*/ 
	$('.shareoutlook').bind('click',function(){
		$('#exportOutLook').popupWin({
			title:lang.invite.confirm,
			closeDestroy: true,
			reserve: true,
			width:600
		})
	}) 
	
	$('#moreEventA').bind('click',function(){
		var div=$('#moreHisEventPopup');
		div.empty();
		$.get('/event/myeventhistory.jhtml?pageNo=1',function(info){
			div.append(info);
			div.popupWin({
    		title:lang.event.myhistoryevents,
			closeDestroy:true,
			reserve: true,
    		width:570
			});
		});
		
	})

	$('#friendSelectList1').friendSelectList({
		url: '/msg/message!getFriends.jhtml',
		idField: '#receiverId',
		inviteMax:10,
		width: 249,
		fsParam: {
			prompt: lang.friend.fs_max_info(5),
			width: 826
		}
	});
	
	$('[js="defaultSetValue"]').bind('click',function(){
		$(this).select();
	})
			
	$('.innerULevent1 li').bind('click',function(){
		$(this).addClass("current");
		$(this).siblings().removeClass("current")
		var val = $('a',this).html();
		if(val==lang.event.onedegree){
			$('.FriendFromUshi1').show();
			$('.FriendFromOut1').hide();
		}else{
			$('.FriendFromOut1').show();
			$('.FriendFromUshi1').hide();
		}
	});
	
	/*编辑活动**/
	$('a[js="eventEditor"]').bind('click',function(){
		var id = $(this).attr('id');
		var name = $('[js="eventName"]').text();
		$.get('/event/manage!toEdit.jhtml?id='+id,function(data){
			$('#eventPopWin').remove();
			$('body').append(data)
	    	$('#eventPopWin').popupWin({
	    		title:lang.event.addpage_edit_title,
				closeDestroy:true,
				reserve: true,
	    		width:525,
	    		open:function(){
	    			if($('input[name="event.endDate"]').val()!==''){
	    				$('.endTimeli').css('display','block');
	    				$('.endTimea').css('display','none')
	    			}
	    			edId__ = id;
	    			edName__ = name;
	    			closeFlag = 1;
	    			retUrlEventDetail = "/event/view!viewDetail.jhtml?id="+edId__;
	    		},
	    		beforeClose:function(){
	    			if(closeFlag && retUrlEventDetail){
	    				window.location = retUrlEventDetail;
	    			}
	    		}
	    	})
		})
	});
	
	
	/*搜索活动*/
	$('[js="event_search_input"]').each(function(){
		bindEventAddSearch($(this));
	});
	
	/*撤销活动**/
	
	$('a[js="eventDelete"]').bind('click',function(){
		var id = $(this).attr('id');
		var name = $('[jsAddr]').html();
		$.post('/event/manage!toCancel.jhtml',{'id':id},function(data){
			if(data.state){
				pop_confirm(lang.invite.confirm,lang.event.cancel_confirm+'<span class="blue boldface">'+name+'</span> ？',function(){
					$.get("/event/manage!doCancel.jhtml?id="+id,function(data){
						window.location.href="/event/list!friendEvent.jhtml"
					})
				})

			}
		},'json')
	})
    
    
    $('a[js="Laterest"]').bind('click',function(){
    	$('form[js="formLaterest"]').submit();
    })
    
    $('a[js="morestFriend"]').bind('click',function(){
    	setTimeout(function(){
    		$('form[js="formmorestFriend"]').submit();
    	},0)
    	
    })
    
    $('a[js="allEventLink"]').bind('click',function(){
    	setTimeout(function(){
    		$('form[js="AllformmorestFriend"]').submit();
    	},0)
    });
    
    $('[js="orderByTime"]').bind('click',function(){
    	setTimeout(function(){
    		$('form[js="forRecentEvent"]').submit();
    	},0)
    })
    
    /*站内邀请*/
    $('a[js="submitInvite"]').bind('click',function(){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

    	var id = $('#receiverId').val();
    	if(id==''){
   			//pop_alert("您至少选择一个一度人脉",function(){},lang.invite.confirm);
   			return false;
    	}
    	var jsid = $('#receiverId').attr('jsid');
    	$.post("/event/view!inviteFriend.jhtml",{'inviteIds':id,'id':jsid},function(data){
    		if(data.state=='1'){
    			pop_alert(lang.event.invite_success,function(){
    				//$('.friend-selected').remove();
    				$('#friendSelectList1').friendSelectList('clear')
    			},lang.invite.confirm);
    		}
    	},'json')
    });
    
	// 分享到
	function getShareInfo(a){
		var title = $.trim($('[js="eventName"]').text()),
			url = window.location + '&shareUserId=' + a.attr('shareUserId');
		return {
			'title': title,
			'url': url,
			'content': "分享活动：" + title + ", 活动链接："
		}
	}; 
	$('.sharesina').bind('click',function(){
	    var info = getShareInfo($(this));
	    share.sina(info.url,info.content);
	});
   
   $('.sharekaixin').bind('click',function(){
	    var info = getShareInfo($(this));
	    share.kaixin(info.title, info.content, info.url);
   });
   
   $('.sharerenren').bind('click',function(){
		share.renren(screen,document,encodeURIComponent);
   });
   
   $('.share1du').bind('click',function(){
   		var id_ = $(this).attr('jsid');
   		$.post('/event/view!shareToInternal.jhtml?shareTo=1',{'id':id_},function(data){
   			pop_alert(lang.event.shareto1degree_success,'',lang.invite.confirm)
   		})
   });
   
   $('.sharegroup').bind('click',function(){
 		var eventId = $(this).attr('jsid');
   		$.post("/event/view!getGroupArray.jhtml",{},function(data){
   			var data = data.list;
   			var str ='';
   			$.each(data,function(i,n){
  				str	+= "<label style='clear:both;overflow:hidden;' class='border-bottom margin-bottom pd-bottom display-block'><input class='float-left' style='position:static;' type='checkbox' jsid="+n.id_+" /><span style='padding-top:2px;padding-left:3px' class='quiet display-block clearfloat'>"+n.name_+"</span></label>"
   			});
   			
   			if(str==''){
				pop_alert('<span class="red">'+lang.event.sharetogroup_tips1+'</span>','',lang.invite.confirm);
				return false;
   			}
   			str = (str == "")?"<span class='red'>"+lang.event.sharetogroup_tips1+"</span>":"<div class='margin-bottom border-bottom pd-bottom' style='overflow:hidden;zoom:1'><label><input js='EventGroupSelAll' type='checkbox'  />"+lang.event.selectall+"</label>&nbsp;&nbsp;&nbsp;<label><input js='EventGroupUnSelAll' type='checkbox'  />"+lang.event.selectinvert+"</label></div>"+str;
   			
   			var tmpStr = "<div id='selGroupShare' style='height:300px;overflow:hidden;overflow-y:auto'>"+str+"</div>";
   			
   			pop_confirm(lang.event.share_select_group,tmpStr,function(){
   				var Arr = [];
   				$('#selGroupShare :checked').each(function(){
   					if($(this).attr('jsid')){
   						Arr.push($(this).attr('jsid'));
   					}
   					
   				});
   				Arr = Arr.join(',');
   				if(Arr!=''){
	   				$.post('/event/view!shareToInternal.jhtml?shareTo=2',{'groupIds':Arr,'id':eventId},function(data){
	  					pop_alert(lang.event.share_success,'',lang.invite.confirm)
	   				},'json')
   				}else{
					pop_alert('<span class="red">'+lang.event.share_select_group_atleastone+'</span>','',lang.invite.confirm);
					return false;
   				}
   					
   					
   			},'',{
   				open:function(){
   					/*全选反选*/
   					var tarCheckBox = $('#selGroupShare :checkbox').not($('[js="EventGroupSelAll"]')).not($('[js="EventGroupUnSelAll"]'));
   					tarCheckBox.bind('click',function(){
   						$('[js="EventGroupSelAll"]').attr('checked',false)
   						$('[js="EventGroupUnSelAll"]').attr('checked',false)
   					}) 
   					
   					$('[js="EventGroupSelAll"]').bind('click',function(){
   						var tarCheckBox = $('#selGroupShare :checkbox').not($('[js="EventGroupSelAll"]')).not($('[js="EventGroupUnSelAll"]'));
   						tarCheckBox.attr('checked',this.checked);
   						$('[js="EventGroupUnSelAll"]').attr('checked',!this.checked)
   					});
   					
   					$('[js="EventGroupUnSelAll"]').bind('click',function(){
   						
   						if(this.checked){
   							var tarCheckBox = $('#selGroupShare :checkbox').not($('[js="EventGroupSelAll"]')).not($('[js="EventGroupUnSelAll"]'));
   							$('[js="EventGroupSelAll"]').attr('checked',false)
	   						
							tarCheckBox.each(function(){
								if($(this).attr('checked')){
									$(this).attr('checked',false)
								}else{
									$(this).attr('checked',true)
								}
							})
   						}else{
   							$('[js="EventGroupSelAll"]').attr('checked',true);
   							var tarCheckBox = $('#selGroupShare :checkbox').not($('[js="EventGroupSelAll"]')).not($('[js="EventGroupUnSelAll"]'));
   							tarCheckBox.each(function(){
   								$(this).attr('checked',true);
   							})
   						}
   					});
   					/*全选反选*/
   				}
   			})
   			
   		},'json')
   		
   	})

    $('a[js="addFocus"]').live('click',function(){
    	var id = $(this).attr('jsid');
    	var url;
    	var flag = $(this).hasClass('btn-gray');
    	if(!flag){
    		$.get('/sns/sns!addFollower.jhtml?targetUserId='+id,function(data){});
    		$(this).html('<span></span>&nbsp;&nbsp;'+lang.event.cancelattention+'&nbsp;&nbsp;');
    	}else{
    		$.get('/sns/sns!removeFollower.jhtml?targetUserId='+id,function(data){});
    		$(this).html('<span></span>&nbsp;&nbsp;'+lang.event.addattention+'&nbsp;&nbsp;');
    	}
    	$(this).toggleClass("btn-blue");
    	$(this).toggleClass("btn-gray");
    })
    
    /*站外的邀请*/
    function InviteFriendOut(this_,f){
		var id_ = this_.attr('jsid');
		if(f==1){
			var Arr = this_.parent().prev().val();
		}else if(f==2){
			var Arr = this_.val();
		}
    	
    	if(Arr.trim()==''){
   			pop_alert(lang.event.emailaddressnotempty,function(){
   				this_.val('');
   				this_.focus();
   			},lang.invite.confirm);
   			return false;
    	}
    	Arr = Arr.split(',');
    	var reg = /^(.+)@(.+)$/;
    	var num = 0;

    	for(var i=0;i < Arr.length;i++){
    		//if(Arr[i]!=''){
	    		if(!reg.test(Arr[i])){
	    			num = i+1;
	    			break;
	    		}
    		//}

    	}
    	
    	if(num==0){
    		$.post('/event/view!inviteFriend.jhtml',{'inviteMails':Arr.join(','),'id':id_},function(data){
    			pop_alert(lang.event.invite_success,function(){
    				this_.val('');
    			},lang.invite.confirm);
    		})
    	}else{
    		pop_alert(lang.event.invite_wrong_mail_part1+(num)+lang.event.invite_wrong_mail_part2,function(){
    		},lang.invite.confirm);
			
    	}
    	
    }
    
    $('[js="outerWebSet"]').bind('click',function(){
		var this_ = $(this)
    	InviteFriendOut(this_,1)
    });
});

//获取google地图服务城市名称
function getGoogleMapCity(addr){
	var a = $.merge([], addr);
	do {
		var city = a.pop();
	} while( a.length && city['types'][0] != 'locality');
	return city.long_name;
};
function getGoogleMapAddress(addr){
	var a = addr.split(' ');
	for( var i = a.length - 1; i >= 0; i-- ){
		if( new RegExp('邮政', 'g').test(a[i]) ){
			a.splice(i, 2);
			break;
		}
	}
	return a.join(' ');
};

//分享活动时通过地点获取google地址列表
function getGoogleMapList(addr, cb){
	geocoder.geocode({'address': addr}, function(results, status) {
		var list = [];
		if (status == google.maps.GeocoderStatus.OK) {
			for( var i = 0; i < results.length; i++ ){
				list.push({
					'id_': getGoogleMapCity(results[i].address_components),
					'addr_': getGoogleMapAddress(results[i].formatted_address)
				});
			}
		}
		if( $.isFunction(cb) ){
			cb(list);
		}
	});
}