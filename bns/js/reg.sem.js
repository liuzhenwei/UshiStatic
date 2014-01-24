function updateTips(tips, str){
	var t = $(tips);
	if( ! t.data('tips') ){
		t.data('tips', t.html());
	}
	str = str || t.data('tips');
	t.html(str);
};

$(function(){
	updateTips('[regTips="usernameTips"]');

	$('form[semRegForm]').validate({
		validateAjax: true,
		extTools: {
			isUsername: checkUserName,
			isAjaxEmail: checkAjaxEmail
		}
	});

	$('a[js="showReg"]').bind('click', function(){
		var _url=$(this).attr("href");
		var fb = $('#popRegForm');
		var userId = $("[js='userId']").val();

		if(userId != ""){
			
		}else{
		   if( fb.length == 0 ) return false;
		   var pop = $(fb.html());
		   pop.popupWin({
			  width: 370,
			  title: '注册',
			  closeDestroy: true,
			  reserve: false,
			  open: function(){
				  pop.find('[name="goingToURL"]').val(_url);
				  bindRegService(pop.find('[regService="checkbox"]'), pop.find('[regService="userEnter"]'));
				  pop.validate({
					validateAjax: true,
					extTools: {
						isUsername: checkUserName,
						isAjaxEmail: checkAjaxEmail
					}
				  });
			  }
		   });
		return false;
	 
		}

	});
});
