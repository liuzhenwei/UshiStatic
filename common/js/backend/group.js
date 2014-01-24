$(document).ready(function() {

	var deleteUserIds=$("#itemids");
	var deleteCheck=$("input[name='deleteCheck']");
	deleteCheck.click(function()
	{
	        if($(this).attr("checked") == true){
	            deleteUserIds.val(deleteUserIds.val()+','+$(this).attr("value")+',');
	        }
	        else
	        {
        		if(deleteUserIds.val().indexOf(','+$(this).attr("value")+',') >=0)
        		{
        			var reg=new RegExp(","+$(this).attr("value")+",","g");
        			deleteUserIds.val(deleteUserIds.val().replace(reg,''));
        		}
	        	
	        }
	     	
	});
	
	$("#deletegroup").click(function(){
		if(confirm("确定要删除吗？")){
			var groupIds = '';
			$(this).closest('table.datalist').find(':checked').each(function(){
				groupIds += this.value + ',';
			});
			groupIds = groupIds.slice(0, groupIds.length - 1);
			if( groupIds != '' ){
				$.getJSON('/backend/groupManage!removeGroup.jhtml?groupIds=' + groupIds, function(data){
					if( data.state == '1' ){
						location.reload(true);
					}
				});
			}
			return false;
		}
	});
	$('#groupbacksearchsumbit').click(function(){
		deleteUserIds.val('');
		$('#searchform').submit();
		return false;
	});
	
});