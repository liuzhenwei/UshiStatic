$(function(){
	if( window.iscroll == true ) $('html').addClass('iscroll');
	
	//设置默认内容页滚动效果
	var scrollContainer, $scrollCont = $('html.iscroll [data-role="scrollContainer"]');
	if( $scrollCont.length > 0 ){
		setTimeout(function(){
			scrollContainer = new iScroll($scrollCont[0], {bounce: false});
		}, 500);
	}
});
