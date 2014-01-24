$(document).ready(function(){
	$("#nextSubmit").click(function(){
			if($("input[name='acceptedRequestType']:checked").size() == 0)
			{
				$("#div_error").show();
				return false;
			}
			else
			{
				document.setting_form.submit();	
			}
										
	});
});