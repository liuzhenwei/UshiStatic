var __nav = 'nav_job';
var _timeout;
var _direction;
$(document).ready(function(){
	var _comlist1=$('[js="com-list1"]');
	var _comlist2=$('[js="com-list2"]');
	for (i=0;i<6;i++)
	{
		var _li1=$("<li>"+_comlist1.find("li").eq(i).html()+"</li>");
		var _li2=$("<li>"+_comlist2.find("li").eq(i).html()+"</li>");
		_comlist1.children().append(_li1);
		_comlist2.children().append(_li2);
	}
	
	var _comlist1Length=_comlist1.find("li").length;
	var _comlist2Length=_comlist2.find("li").length;
	_comlist1.css("width",_comlist1Length*103);
	_comlist2.css("width",_comlist2Length*103);
	
	com_item_scroll(1,100,2,1);
	
	 $('[js="com-logo-select1"]').click(function(){
		 $(this).addClass("current");
		 $('[js="com-logo-select2"]').removeClass("current");
		 clearTimeout(_timeout);
		 com_item_scroll(1,100,2,1);
		 $('.com-logo-frame[js="1"]').show();
		 $('.com-logo-frame[js="2"]').hide();
		 $('.com-logo-frame[js="1"]').attr("show","1");
	 })
	 
	 $('[js="com-logo-select2"]').click(function(){
		 $(this).addClass("current");
		 $('[js="com-logo-select1"]').removeClass("current");
		 clearTimeout(_timeout);
		 com_item_scroll(2,100,2,1);
		 $('.com-logo-frame[js="2"]').show();
		 $('.com-logo-frame[js="1"]').hide();
		 $('.com-logo-frame[js="1"]').attr("show","2");
	 })
	 
	 $('[js="com-logo-left1"]').mouseenter(function(){
		 clearTimeout(_timeout);
		 com_item_scroll(1,30,4,1);
	 })
	 
	 $('[js="com-logo-left1"]').mouseleave(function(){
		 clearTimeout(_timeout);
		 com_item_scroll(1,100,2,1);
	 })
	 
	 $('[js="com-logo-right1"]').mouseenter(function(){
		 clearTimeout(_timeout);
		 com_item_scroll(1,30,4,2);
	 })
	 
	 $('[js="com-logo-right1"]').mouseleave(function(){
		 clearTimeout(_timeout);
		 com_item_scroll(1,100,2,2);
	 })
	 
	 $('[js="com-logo-left2"]').mouseenter(function(){
		 clearTimeout(_timeout);
		 com_item_scroll(2,30,4,1);
	 })
	 
	 $('[js="com-logo-left2"]').mouseleave(function(){
		 clearTimeout(_timeout);
		 com_item_scroll(2,100,2,1);
	 })
	 
	 $('[js="com-logo-right2"]').mouseenter(function(){
		 clearTimeout(_timeout);
		 com_item_scroll(2,30,4,2);
	 })
	 
	 $('[js="com-logo-right2"]').mouseleave(function(){
		 clearTimeout(_timeout);
		 com_item_scroll(2,100,2,2);
	 })
	 
	 $('.com-logo-inner').mouseenter(function(){
		 clearTimeout(_timeout);
	 })
	 
	 $('.com-logo-inner').mouseleave(function(){
		 if ($('.com-logo-frame[js="1"]').attr("show")=="1")
		 {
			 com_item_scroll(1,100,2,_direction);
		 }
		 else
		 {
			 com_item_scroll(2,100,2,_direction);
		 }
	 })
	 
	 $(".job-classify li a").click(function()
		{
			
			var i=$(".job-classify li a").index(this);
			$(".job-classify li").removeClass("current");
			$(".job-classify li").eq(i).addClass("current");
			$(".job-industry-list").css("display","none");
			$(".job-industry-list").eq(i).css("display","block");
		});
		$(".job-trends li a").click(function()
		{
			
			var i=$(".job-trends li a").index(this);
			$(".job-trends li").removeClass("current");
			$(".job-trends li").eq(i).addClass("current");
			$(".job-trends-list").css("display","none");
			$(".job-trends-list").eq(i).css("display","block");
		});
		
		$("#top_btn_lang").click(function(){
			var _offset=$(this).offset();
			var _popupWin=$("#top_menu_language");
			var p = {tipsType: '', arrow: '', width: 150, closeDestroy: true, position: [_offset.left,_offset.top+20]};
			_popupWin.popupTips(p);
		});
		
		//search_jobs//
		$('[js="search_jobs"]').click(function(){
			var _keyword=$.trim($('[js="search_keywords"]').val());
			if (_keyword==$.trim($('[js="search_keywords"]').attr('defaulttips')))
			{
				_keyword="";
			}
				
			var _city=$('[js="search_city"]').val();
			var _url;
			
			if (_keyword.length<1 && _city=="/all")
			{
				$('[js="search_keywords"]').val("");
				$('[err="search_jobs_err"]').show();
			}
			else
			{
				if (_keyword.length<1)
				{
					_url="/job"+_city;
				}
				else
				{
					_url="/job"+_city+"/?keywords="+encodeURIComponent(_keyword);
				}
				location.href=_url;
			}
		});
});

function com_item_scroll(_frameNum,_speed,_pixel,_dir)
{
	_direction=_dir;
	scroll(_frameNum);
	function scroll(_frameNum){
		_timeout=setTimeout(function (){scroll(_frameNum)},_speed);
		var _frame=$('[js="com-list'+_frameNum+'"]');
		var _marginLeft=parseInt(_frame.css("margin-left"));
		var _width=parseInt(_frame.css("width"));
		
		if (_dir==2)
		{
			_frame.css("margin-left",_marginLeft+_pixel+"px");
			_marginLeft=parseInt(_frame.css("margin-left"));
			
			if (_marginLeft>0)
			{
				_frame.css("margin-left",-_width+618);
			}
		}
		else
		{
			_frame.css("margin-left",_marginLeft-_pixel+"px");
			if (_marginLeft<(-_width+618))
			{
				_frame.css("margin-left",0);
			}
		}
	}
}

//showReg

function showReg(_url){
	openQuickReg({
		type: 'post',
		hiddenField: {"goingToURL": _url},
		CBshow: function(pop){
			pop.find('>form.quickReg input[name="basicProfile.status"]').val(125);
			pop.find('[js="quickReg"]').parent().removeClass("current");
			pop.find('[js="formstyle"]').parent().addClass("current");
			pop.find('.formstyle').show();
			pop.find('.quickReg').hide();
		},
		regOK: function(){
			location.href="<%=com.m4g.bns.Constants.USHI_DOMAINNAME%>/openReg!validAccount.jhtml?goingToURL="+_url;
		}
	});
}


//searchForm

function tosearch(iid,position){
    $("#is_keyword").val("false");
    $("#is_keyword_nav").val("");
    $("#form_position").val(position);
    $("#form_industryIds").val(iid);
    $("#search_form").submit();
}
function submitForm() {
	$('[name="searchForm"]').submit();
}





