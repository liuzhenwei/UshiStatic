var __nav = 'nav_job';
var _timeout;
var _direction;

var _rightTimer;
var _leftTimer;

$(document).ready(function(){
	ad_img_toggle();
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
	 
	 
	 //mail_notification_popup//
	if ("${emailalerts}"=="1")
	{
		mail_notification_popup();
	}
	$('[js="mail-notification"]').click(function(){
		mail_notification_popup();
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

//banner//

var _crtImg=0;
var _imgSrc=[], _imgHref = [];

_imgSrc[0]="http://static.ushi.cn/s/bns/images/ad/job/img_banner.jpg";
_imgSrc[1]="http://static.ushi.cn/s/bns/images/ad/job/jobAd4.jpg";
//_imgSrc[2]="<%=com.m4g.bns.Constants.STATIC_WEB_URL%>/bns/images/ad/job/job_subscribe_02.jpg";

_imgHref[0]="http://www.ushi.com/doc.jhtml?key=success_stories";
_imgHref[1]="http://static.ushi.cn/s/download/ushipress/ushi_job_2011.pdf";
//_imgHref[2]="http://www.ushi.com/job/search!mySearcher.jhtml";

	
var _imgToggleDot0="http://static.ushi.cn/s/bns/images/ad/img_toggle_dot_unselected.png";
var _imgToggleDot1="http://static.ushi.cn/s/bns/images/ad/img_toggle_dot_selected.png";


function img_toggle(_crtNum){
	$(".jobAdMid").find("img").attr("src",_imgSrc[_crtNum]);
	$(".jobAdMid").find('>a').attr('href', _imgHref[_crtNum]);
	$(".img-show-frame").children("div").css("background-image","url("+_imgToggleDot0+")");
	$(".img-show-box"+_crtNum).css("background-image","url("+_imgToggleDot1+")");
	_crtImg=_crtNum;
}

function ad_img_toggle(){
	
	$(".img-show-box0").mousemove(function(){
		img_toggle(0);
	});
	$(".img-show-box1").mousemove(function(){
		img_toggle(1);
	});
	
/*	$(".img-show-box2").mousemove(function(){					
		img_toggle(2);
	});
*/
	timed_count();

	function timed_count(){
		switch (_crtImg)
		{
			case 0:img_toggle(1);break;
			case 1:img_toggle(0);break;
//			case 2:img_toggle(0);break;
		}
		setTimeout(function(){timed_count();},5000);
	}
}

//mail_notification_popup//

function mail_notification_popup()
{
	var _popup=$("#popup");
	_popup.popupWin({
		title: lang.job.mail_notification_title,
		width: 300,
		closeDestroy: true,
		open: function(){
			var _mailFrq=$("#mail-frequency").val();
			_popup.find('input[name=mail_friquency]:eq('+(parseInt(_mailFrq)-1)+')').attr("checked",true);
			
			var _checkedRadio=_popup.find('input[name=mail_friquency]:checked');
			var _saveBtn=_popup.find('[name="mn-save"]');
			
			if (_checkedRadio.length<1)
			{
				_saveBtn.removeClass("special-btn").addClass("disable-button").attr("js","0");
			}
			
			_popup.find('input[type="radio"]').click(function(){
				_saveBtn.removeClass("disable-button").addClass("special-btn").attr("js","1");
			});
			
			_saveBtn.click(function(){
				if (_saveBtn.attr("js")=="1")
				{
					_checkedRadio=_popup.find('input[name=mail_friquency]:checked');
					var _value=_checkedRadio.val();
					$("#mail-frequency").val(_value);
					$.ajax({
						url:"/job/recommend!saveRecommend.jhtml",
						type:"POST",
						data:{"frequency":_value}
					});
					
					_popup.popupWin('close');
					
					var _popupTips=$("#poptip");
					_popupTips.popupWin({
						title: lang.job.mail_notification_title,
						width: 250,
						closeDestroy: true,
						open: function(){
							_popupTips.find(".special-btn").click(function(){ _popupTips.popupWin('close');});
						}
					})
				}
			});
			
			_popup.find('[js="mn-close"]').click(function(){
				_popup.popupWin('close');
			});
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



