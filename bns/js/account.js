$(document).ready(function(){
	$("#selectUpgrade tr").hover(
		function(){
			$(this).addClass("highlight");	
		},
		function(){
			$(this).removeClass("highlight");	
		}
	);
});