/*
* author : Bing
*/

var btn_remove_click = function(id,this_){
	
	$("#userIds").val(id);
	if($("#userIds").val() == '')
   	{
		pop_alert(lang.group.pleasechouseuse);
   	}
   	else
   	{
		pop_confirm('',
			$(this_).attr("confirmtext"),
			function() {
			   var myform=document.getElementById("myform");
			   myform.action='/group/member.delete.jhtml';
			   myform.submit();
			}
		);
   	}
};
/*
* author : Johnny
*/

var btn_block_click = function(id,this_){
	
	$("#userIds").val(id);
	if($("#userIds").val() == '')
   	{
		pop_alert(lang.group.pleasechouseuse);
   	}
   	else
   	{
		pop_confirm('',
			$(this_).attr("confirmtext"),
			function() {
			   var myform=document.getElementById("myform");
			   myform.action='/group/member.addBlock.jhtml';
			   myform.submit();
			}
		);
   	}
};

var btn_delblock_click = function(id,this_){
	
	$("#userIds").val(id);
	if($("#userIds").val() == '')
   	{
		pop_alert(lang.group.pleasechouseuse);
   	}
   	else
   	{
		pop_confirm('',
			$(this_).attr("confirmtext"),
			function() {
			   var myform=document.getElementById("myform");
			   myform.action='/group/member.delBlock.jhtml';
			   myform.submit();
			}
		);
   	}
};

$(document).ready(function(){
		var btn_remove=$("a[name='btn_remove']");
		var deleteUserIds=$("#userIds");
	    $("a[name='fall']").click(function()
	    {	
			var userid=$(this).attr("id");
			pop_confirm('',
				$(this).attr("confirmtext"),
				function() {
			    	var myform=document.getElementById("myform");
				   	myform.action='/group/member.modifyPow.jhtml';
				   	$("#type").val('4');
				   	deleteUserIds.val(userid);
				  	myform.submit();
				} 
			);
	    }
	    );
	    $("a[name='rise']").click(function()
	    {	
	    	var userid=$(this).attr("id");
			pop_confirm('',
				$(this).attr("confirmtext"),
				function() {
			    	  var myform=document.getElementById("myform");
				   	  myform.action='/group/member.modifyPow.jhtml';
				   	  $("#type").val('2');
				      deleteUserIds.val(userid);
				  	  myform.submit();
				}
			);
	    }
	    );
	    //----------------------------group.member.applyList.jsp----------------------------------
	    var findApplyUserList = function(){
	    	var t = $('[js="dchk"]');
	    	var arr=[];
	    	t.each(function(){
	    		if($(this).attr('checked')){
	    			arr.push($(this).val());
	    		}
	    	});
	    	deleteUserIds.val(arr.join(','));
	    
	    }
	    
	    $("input[name='btn_approve']").click(function(){
		   	$("#myform").attr('action','/group/member.approve.jhtml');
		   	findApplyUserList();
		   	if(deleteUserIds.val() == ''){
		   		pop_alert(lang.group.pleasechouseuse);
		   	}
		   	else{
		   		$("#myform").submit();
		   	}
	    }
	    );
	    $("input[name='btn_reject']").click(function(){
	    	var myform=document.getElementById("myform");
		   	myform.action='/group/member.reject.jhtml';
		   	findApplyUserList();
		    if(deleteUserIds.val() == ''){
		   		pop_alert(lang.group.pleasechouseuse);
		   	}
		   	else{
		   		myform.submit();
		   	}
	    }
	    );

		//---------------------------group.bbs.view.jsp--------------------------------
		$("a[name='a_reply']").click(function(){
			var div=$(this).closest('.event-content');
			var t=div.text().substring(0,div.text().lastIndexOf(lang.group.answer));
			$("#textarea_reply").val("<p class=\"quote-txt\" >"+lang.group.quota+"\r\n"+t+"\r\n</p>\r\n");
			$("#textarea_reply").focus();
		}
		);
		$("a[name='a_delete_reply']").click(function(){
			var deleteurl = $(this).attr("deleteurl");
			pop_confirm(lang.common.delete_confirm,
				lang.group.deleteTopicReply,
				function() {
					location.href = deleteurl;
				}
			);
		}
		);
//		(function(inviteout){
//			if(inviteout.size()==0) return false;
//			inviteout.find('[js="submit"]').click(function(){
//				var receiveremails = $("#grpInvitebymailReceiveremail").val();
//				var receiveremail = receiveremails.split(new RegExp( "[,\n]{1}", "g" ));
//				var receiveremail_fail = new Array();
//				for(var i=0; i<receiveremail.length; i++) { 
//					if(!receiveremail[i].is_email()) {
//						receiveremail_fail.push(receiveremail[i]);
//					}
//				}
//				$("#receiveremail_fail").val(receiveremail_fail);
//			});
//		})($('#invite_out_from'));
          $('[js="submit"]').click(function(){
				var receiveremails = $("#grpInvitebymailReceiveremail").val();
				var receiveremail = receiveremails.split(new RegExp( "[,\n]{1}", "g" ));
				var receiveremail_fail = new Array();
				for(var i=0; i<receiveremail.length; i++) {
					if(!receiveremail[i].is_email()) {
						receiveremail_fail.push(receiveremail[i]);
					}
				}
				if(receiveremail_fail == '')
				{
					$("#receiveremail_fail").val('');
					$('#invite_out_form').submit();
				}
				else
				{
					$("#receiveremail_fail").val(receiveremail_fail);
					setErrMsg($("#grpInvitebymailReceiveremail"),lang.group.invite_outer_invalidate+":"+receiveremail_fail);
	     			setErrStyle($("#grpInvitebymailReceiveremail"));
	     			$("#grpInvitebymailReceiveremail").focus();
	     			$("#invite_outer_label1").addClass("red");
				}
				return false;
		 });
		
		(function(){
			var list=$("#event_members_list");
			if(list.size()){
				$(".col-2a",list).hide();
				$(">div",list).hover(function(){
					$(this).addClass("list-box-hover");
					$(".col-2a",this).show();
				},function(){	
					$(this).removeClass("list-box-hover");
					$(".col-2a",this).hide();
				});	
			}
		 })();	
});