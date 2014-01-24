var __nav = 'nav_job';


$(document).ready(function(){
	var _shareUrl=$("#ipt_share_url").attr("value");
	var _shareTitle=$("#ipt_share_title").attr("value");
	var _shareContent=$("#ipt_share_content").attr("value");
	var _shareImg=$("#ipt_share_img").attr("value");

	ushiBshare.init({
		url:_shareUrl,
		title:_shareTitle,
		content:_shareContent,
		summary:_shareContent,
		pic:_shareImg
	});
	ushiBshare.add('kaixin', {content: _shareContent + '，查看职位详情：' + _shareUrl});

	$(".share-slide-toggle1").mouseover(function(){
		$(".share-slide-menu").show();
	})
	
	$(".share-slide-toggle1").mouseleave(function(){
		$(".share-slide-menu").fadeOut(200);
	})
	
	$(".share-slide-toggle2").mouseenter(function(){
		$(".share-slide-menu2").show();
	})
	
	$(".share-slide-toggle2").mouseleave(function(){
		$(".share-slide-menu2").slideUp(200);
	})
	
	


	
//sharegroup1
 $('.sharegroup1').bind('click',function(){
 		var jobid = $(this).attr('jsid');
   		$.post("/job/recommend!getGroupArray.jhtml",{},function(data){
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
	   				$.post('/job/recommend!shareToInternal.jhtml?shareTo=2',{'groupIds':Arr,'jobId':jobid},function(data){
	  					pop_alert(lang.event.share_success,'',lang.invite.confirm);},'json')
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
});


//DigitalTime1	
	
$(function(){
	var DT = parseInt($('[js="DT"]').html());
	var HT = parseInt($('[js="HT"]').html());
	var MT = parseInt($('[js="MT"]').html());
	var ST = parseInt($('[js="ST"]').html());
	var DifT = DT*24*60*60*1000 + HT*60*60*1000 + MT*60*1000 + ST*1000

	function DigitalTime1(){ 
		var leave =  DifT;
		DifT = DifT-1000;
		var day = Math.floor(leave / (1000 * 60 * 60 * 24))
		var hour = Math.floor(leave / (1000*3600)) - (day * 24)
		var minute = Math.floor(leave / (1000*60)) - (day * 24 *60) - (hour * 60)
		var second = Math.floor(leave / (1000)) - (day * 24 *60*60) - (hour * 60 * 60) - (minute*60)
		$('[js="DT"]').html(day)
		$('[js="HT"]').html(hour)
		$('[js="MT"]').html(minute)
		$('[js="ST"]').html(second)
		setTimeout(DigitalTime1, 1000);
	}


	DigitalTime1();

});






