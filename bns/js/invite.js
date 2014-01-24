$(document).ready(function(){
	var attr = [], block = null,id_=[],type_= [],status_ = [],email_ = [],friends_ = [],times_ = [];
	
	(function(form){
		if(form.size() == 0) return null;
		var submit = $('input:submit',form);
		var type = $('[name="snsIntroduce.contacttype"]',form);
		var title = $('[name="snsIntroduce.title"]',form);
		var content = $('[name="snsIntroduce.body"]',form);
		var msg = $('[name="snsIntroduce.message"]',form);
		submit.click(function(){
			clearErrMsg();
			var Submit = true;
			if(type.val() == 0){
				setErrMsg(type,lang.friend.introduce_missconcattype_error);
				Submit = false;
			}
			if(title.val() == ''){
				setErrMsg(title,lang.friend.introduce_misstitle_error);
				setErrStyle(title);
				Submit = false;
			}
			if(content.val() == ''){
				setErrMsg(content,lang.friend.introduce_missbody_error);
				setErrStyle(content);
				Submit = false;
			}
			if(msg.val() == ''){
				setErrMsg(msg,lang.friend.introduce_missforwardmsg_error);
				setErrStyle(msg);
				Submit = false;
			}
			if(!Submit) return false;
		});
	})($('#introduce_step2'));
	
	/*tip_alert*/
	$('[js="viewLetter"]').bind('mouseover', function(){
		var a = $(this),
			block = a.closest('.event-block');
		a.data('mousein', true);
		if( block.data('inviteInfo') ){
			if( a.data('mousein') ){
				showLetter(a, block);
			}
		} else {
			a.data('getTM', setTimeout(function(){
				if( a.data('getTM') ){
					$.getJSON('/sns/reinvite!getTargetInfo.jhtml?inviteType=' + block.attr('invitetype') + '&inviteId=' + block.attr('inviteid'), function(data){
						if(data.body==''){
							return false;
						}
						block.data('inviteInfo', data);
						if( a.data('mousein') ){
							showLetter(a, block);
						}
					});
				}
			}, 200));
		}
	});
	$('[js="viewLetter"]').bind('mouseout', function(){
		var tm = $(this).data('getTM');
		if( tm ){
			clearTimeout(tm);
			$(this).data('getTM', null);
		}
		if( $('#viewInviteLetter').data('tipsLink') == this ){
			$('#viewInviteLetter').popupTips('destroy');
			$('#viewInviteLetter').data('tipsLink', null);
		}
		$(this).data('mousein', false);
	});
	var showLetter = function(a, block){
		var data = block.data('inviteInfo');
		if( ! data ){
			return false;
		}
		var tips = $('#viewInviteLetter');
		tips.find('p').text(data.title);
		tips.find('div').text(data.body);
		tips.data('tipsLink', a[0]);
		var pos = a.offset();
		tips.popupTips({
			tipsType: 1,
			arrow: 'left',
			width: 400,
			position: [pos.left + a.outerWidth() + 3, pos.top - 12]
		});
	}
	
	$('.event-block').hover(function(){
		$(this).addClass('current')
		$(this).contents().find('.dashed').addClass('blue')
	},function(){
		$(this).removeClass('current')
		$(this).contents().find('.dashed').removeClass('blue')
	})
	
	
	$('#reinviteSelDate').bind('click',function(){
		$('.tips_sort').show()
	})
	$('body').bind('click',function(event){
		var e = event || window.event;
		var src = e.srcElement || e.target;
		if((src.className!='tips_sort') && (src.className!='link-menu float-right')){
			$('.tips_sort').hide();
		}
		
	});
	
	var addParams = function(type){
		var selChk = $('.event-block :checked');
		var len = selChk.length;
		var parent_selChk = selChk.closest('.event-block');
		for(var i=0;i<len;i++){
			id_.push(selChk.eq(i).closest('.event-block').attr('inviteid'))
			type_.push(selChk.eq(i).closest('.event-block').attr('invitetype'))
			status_.push(selChk.eq(i).closest('.event-block').attr('inviteStatus'))
			email_.push(selChk.eq(i).closest('.event-block').attr('receiverEmail'))
			friends_.push(selChk.eq(i).closest('.event-block').attr('memberorfriend'))
			times_.push(selChk.eq(i).closest('.event-block').attr('reinvitetimes'))
		}
		if(type==1){
			if(len==0){
				pop_alert(lang.invite.choose,'',lang.invite.confirm);
			}else{
				pop_confirm(lang.invite.reinvite,lang.invite.sure1,function(){
					$('#invite_Id').val(id_.join(','));
					$('#invite_Type').val(type_.join(','));
					$('#invite_Email').val(email_.join(','));
					$('#invite_status').val(status_.join(','));
					$('#invite_friends').val(friends_.join(','));
					$('#invite_times').val(times_.join(','));
					$("#reinvite_form").submit();
					//return false;
				})
			}
		}else if(type==2){
			if(len==0){
				pop_alert(lang.invite.choosedel,'',lang.invite.confirm);
			}else{
				pop_confirm(lang.invite.invitedel,lang.invite.sure5,function(){
					$('#invite_Id_').val(id_.join(','))
					$('#invite_Type_').val(type_.join(','))
					$('#invite_Email_').val(email_.join(','))
					$('#invite_status_').val(status_.join(','))
					$('#invite_friends_').val(friends_.join(','))
					$('#invite_times_').val(times_.join(','))
					$("#delete_form").submit();
					//return false;
				})
			}
		}

	
	}
	
	$('.reinviteAll_submit').bind('click',function(){
		addParams(1);
	})
	
	$('.reinviteAll_Del').bind('click',function(){
		addParams(2);
	})
	
	//全选
	$('#chk_selAll').bind('click',function(){
		$('.event-block :checkbox').not($('.event-block :checkbox[disabled=true]')).attr('checked',this.checked);
		$('#have_selChk').html(Math.max($('.event-block :checked').length, 0));
	});
	
	var $selSign = $('.event-block input[type="checkbox"]');
	$selSign.bind('click',function(){
		var block_event = $(this).closest('.event-block');
		if($(this).attr("checked")){
			$('#have_selChk').html(parseInt($('#have_selChk').html())+1)	
		}else{
			$('#chk_selAll').attr('checked',false)
			$('#have_selChk').html(Math.max(parseInt($('#have_selChk').html())-1,0))
		}
	})
	
	/*删除提示*/
	$('.delInvite').bind('click',function(){
		var this_ = $(this).closest(".event-block")
		var user = $(this).attr('un');
		var id = this_.attr("inviteid")
		var type = this_.attr("invitetype")
		var status = this_.attr("inviteStatus")
		var email = this_.attr("receiverEmail");
		var url = "/sns/sns!removeInvite.jhtml?inviteType="+type+"&inviteId="+id+"&inviteStatus="+status
		pop_confirm(lang.invite.confirm_delete, lang.invite.sure3+'<span class="boldface">&nbsp;'+"("+email+")"+user+'&nbsp;</span>'+lang.invite.sure4,function(){
			$.get(url, function(){
				this_.closest('.event-block').slideUp('show',function(){
					this_.closest('.event-block').remove();//回调删除DOM节点
				});
				
				$('#have_selChk').html(Math.max(parseInt($('#have_selChk').html())-1,0))
			});
			
		})
	})

	/*重发邀请提交数据*/
	function submitInvite(){
		var data_ = {
			inviteId : $("#hid_id").val(),
			inviteType: $("#hid_type").val(),
			receiverEmail: $("#hid_email").val(),
			inviteTitle: $("#hid_title").val(),
			inviteBody: $("#hid_body").val(),
			receiverName: $("#hid_name").val(),
			reinvitetimes: $("#hid_time").val(),
			inviteStatus: $("#hid_status").val()
		}
		$.post("/sns/reinvite!reInviteByOne.jhtml", data_, function(r){
			if(r == '1'){
				var obj = block.data('inviteInfo') || {};
					obj = {
						"inviteId" : data_.inviteId,
						"inviteType" : data_.inviteType,
						"receiverEmail" : data_.receiverEmail,
						"receiverName" : data_.receiverName,
						"title" : data_.inviteTitle,
						"body" : data_.inviteBody
					}
				block.data('inviteInfo', obj);
					
				block.contents().find('.dashed').html("\""+data_.inviteBody.substring(0,20)+'..."')
				$('#reinvitePop').popupWin('destroy');
				pop_alert(lang.invite.reinvite_suc);
				block.contents().find('.haveResentTime').html(parseInt(data_.reinvitetimes)+1);
				block.attr("reinvitetimes", parseInt(data_.reinvitetimes)+1);
				block.attr("datediff","0");
			}
		})
	}

	/*重发邀请*/
	$('#resend_mial_Final').bind('click', submitInvite);
	$('#resend_mial_channel').bind('click',function(){
		$('#reinvitePop').popupWin('destroy')
	});
	$('#reinviteAllRecord').bind('click',function(){
		pop_confirm(lang.invite.confirm,lang.invite.sure2,function(){
			$('#reinviteAllRecord').addClass('loading')
			$('#reinviteAllRecord').html(lang.invite.inviteAllloading)
			setTimeout(function(){
				//pop_overlay();
				pop_loading();
				$('#reinviteAll_form').submit();
			}, 100)
		})
		return false;

	})
	$('.reinviteAgain').bind('click',function(){
		var this_ = $(this);
		block = $(this).closest(".event-block");
		var dates = block.attr("datediff")
		if(dates<10){
			pop_alert(lang.invite.sry,'',lang.invite.confirm);
			return false;
		}
		id = this_.closest(".event-block").attr("inviteid")
		type = this_.closest(".event-block").attr("invitetype")
		status = this_.closest(".event-block").attr("inviteStatus");
		time = this_.closest(".event-block").attr("reinvitetimes")
		$.getJSON("/sns/reinvite!getTargetInfo.jhtml?inviteType="+type+"&inviteId="+id,function(data){
			$('#reinvitePop').popupWin({
				title:lang.invite.reinvite,
				closeDestroy: true,
				reserve: true,
				width:600,
				open: function(){
					$('#hid_id').val(data.inviteId);
					$('#hid_time').val(time);
					$('#hid_type').val(type);
					$('#hid_status').val(status);
					$('#hid_name').val(data.receiverName);
					$('#hid_email').val(data.receiverEmail);
					$('#hid_title').val(data.title);
					$('#hid_body').val(data.body);
				}
			});
		})
	})
	
	
	
});