$(document).ready(function(){
	try{selectCity();}catch(e){}
	$("#search-list>div").hover(function(){$(this).addClass("list-box-hover")},function(){$(this).removeClass("list-box-hover")});
	$("#moreSeach .link-collapsed,#moreSeach .link-expanded").click(function(){
		if(this.className=='link-collapsed')															  
			$(this).attr("class","link-expanded");	
		else
			$(this).attr("class","link-collapsed");	
		$(this.parentNode).next().toggle();
		return false;
	});
});