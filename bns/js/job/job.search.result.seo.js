var __nav = 'nav_job';
$(document).ready(function(){
	var _cityIds=$('[name="cityIds"]').val();
	var _industryIds=$('[name="industryIds"]').val();
	var _jobtypeIds=$('[name="jobTypeIds"]').val();
	var _keyword=$('[js="researchKeywordSEO"]').val();
	var _page=parseInt($('[js="page_current"]').val());
	
	if (_cityIds=="") {_cityIds="CI_8843,CI_8066,CI_8677,CI_8559,CI_8814,CI_8899";}
	
	var _city=$('[type="city"]').find('[js="'+_cityIds+'"]');
	var _industry=$('[type="industry"]').find('[js="'+_industryIds+'"]');
	var _jobtype=$('[type="jobtype"]').find('[js="'+_jobtypeIds+'"]');
	
	var _cityUrl=_city.attr("url");
	var _industryUrl=_industry.attr("url");
	var _jobtypeUrl=_jobtype.attr("url");
	
	var _cityStr=_city.html();
	var _industryStr=_industry.html();
	var _jobtypeStr=_jobtype.html();
	
	_city.parent().html(_cityStr).addClass("quiet333");
	_industry.parent().html(_industryStr).addClass("quiet333");
	_jobtype.parent().html(_jobtypeStr).addClass("quiet333");
	
	//console.log("keyword:"+_keyword+" page:"+_page);
	//console.log("city:"+_cityIds+" industry:"+_industryIds+" jobtype:"+_jobtypeIds);
	//console.log("city:"+_cityUrl+" industry:"+_industryUrl+" jobtype:"+_jobtypeUrl);
	
	
	$('[url]').click(function(){
		var _type=$(this).closest("dl").attr("type");
		var _keywordUrl="";
		var _pageUrl="";
		if (_type=="city") { _cityUrl=$(this).attr("url");}
		if (_type=="industry") { _industryUrl=$(this).attr("url");}
		if (_type=="jobtype") { _jobtypeUrl=$(this).attr("url");}
		if (_keyword.length>0) { _keywordUrl="/?keywords="+encodeURIComponent(_keyword);}
		if (_cityUrl+_industryUrl+_jobtypeUrl=="") { _cityUrl="/all";}
		var _url="/job"+_cityUrl+_industryUrl+_jobtypeUrl+_keywordUrl;
		location.href=_url;
	})

	function submitKeywordSEO(){
		var _keywordUrl="";
		var _keyword=$('[js="researchKeywordSEO"]').val();
		if (_keyword.length>0) { _keywordUrl="/?keywords="+encodeURIComponent(_keyword);}

		if ($('#isResearchSEO').attr("checked")==true)
		{
			if (_cityUrl+_industryUrl+_jobtypeUrl=="") { _cityUrl="/all";}
			var _url="/job"+_cityUrl+_industryUrl+_jobtypeUrl+_keywordUrl;
			location.href=_url;
		}
		else
		{
			if (_keywordUrl!="")
			{
				var _url="/job/all"+_keywordUrl;
				location.href=_url;
			}
		}
	}
	$('[js="submitKeywordSEO"]').click(submitKeywordSEO);
	$('[js="researchKeywordSEO"]').bind('keypress', function(event){
		if( event.keyCode == 13 ) submitKeywordSEO();
	});
	
	$('a[page]').click(function(){
		var _page=$(this).attr("page");
		
		var _pageUrl="";
		if (_page!=1) { _pageUrl="/pn"+_page;}
		if (_cityUrl+_industryUrl+_jobtypeUrl=="") { _cityUrl="/all";}
		var _url;
		if (_keyword.length>0) {
			var _keywordUrl="/?keywords="+encodeURIComponent(_keyword);
			_url="/job"+_cityUrl+_industryUrl+_jobtypeUrl+_pageUrl+_keywordUrl;
		}
		else
		{
			_url="/job"+_cityUrl+_industryUrl+_jobtypeUrl+_pageUrl;
		}
		location.href=_url;
	});
	
	$("#top_btn_lang").click(function(){
		var _offset=$(this).offset();
		var _popupWin=$("#top_menu_language");
		var p = {tipsType: '', arrow: '', width: 150, closeDestroy: true, position: [_offset.left,_offset.top+20]};
		_popupWin.popupTips(p);
	});
	
})

//showReg

function showReg(){
	openQuickReg({
		type: 'post',
		hiddenField: {"goingToURL": "/job/search!editSearchSetting.jhtml"},
		CBshow: function(pop){
			pop.find('>form.quickReg input[name="basicProfile.status"]').val(126);
			pop.find('[js="quickReg"]').parent().removeClass("current");
			pop.find('[js="formstyle"]').parent().addClass("current");
			pop.find('.formstyle').show();
			pop.find('.quickReg').hide();
		},
		regOK: function(){
			location.href="/openReg!validAccount.jhtml?goingToURL=/job/search!editSearchSetting.jhtml";
		}
	});
}