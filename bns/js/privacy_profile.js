$(document).ready(function(){
	
	(function(btn){
		if(btn.size()==0) return null;
		btn.click(function(){
			btn.next().toggle();
		});
		var inputText = btn.next().find('input:text:first');
		btn.next().find('input:button:first').click(function(){
			oldInputText = btn.prev().find('span:first');
			if(inputText.val()!=''){
				$.get('/security/profileset!updateDomain.jhtml?domain='+inputText.val(),function(data){
					switch(data.replace(/\s/g,'')){
						case '0':
							oldInputText.text(inputText.val());
							oldInputText.parent().attr('href','/p/'+inputText.val());
							inputText.val('');
							btn.next().hide();
						break;
						case '1':
							pop_alert(lang.domain.tips);//'域名只能是 5~30 个英文字符组成，不能包含中文、数字、特殊字符'
						break;
						case '2':
							pop_alert(lang.domain.occupy);//该域名已被占用
						break;
						default:
							pop_alert(lang.domain.failure);//域名修改失败
					}
				})
				
			}
			else
				pop_alert(lang.domain.blank); //域名不能为空
		});
	})($('#edit_domain'));
						   
	$("#hideAllBtn").click(function(){
		if(this.checked){
			$("#hideAll").hide();
			$('#custmize input:checkbox:gt(0)').attr('disabled',true);
		}
	});
	$("#setAllBtn").click(function(){
		if(this.checked){
			$("#hideAll").show();
			$('#custmize input:checkbox:gt(0)').attr('disabled',false);
		}
	});
	$("#box_face").click(function(){
		if(this.checked)
			$("#ppimg_face").show();	
		else
			$("#ppimg_face").hide();
	});
	$("#box_newsfeed").click(function(){
		if(this.checked)
			$("#ppimg_newsfeed").show();	
		else
			$("#ppimg_newsfeed").hide();
	});
	$("#box_sum").click(function(){
		if(this.checked)
			$("#ppimg_sum").show();	
		else
			$("#ppimg_sum").hide();
	});
	$("#box_sum2").click(function(){
		if(this.checked)
			$("#ppimg_sum2").show();	
		else
			$("#ppimg_sum2").hide();
	});
	$("#box_job_current").click(function(){
		if(this.checked){
			$("#ppimg_job_current").show();	
			$("#box_job").attr("checked","");
			$("#ppimg_job").hide();
		}
		else
			$("#ppimg_job_current").hide();
	});
	$("#box_job").click(function(){
		if(this.checked){
			$("#ppimg_job").show();
			$("#box_job_current").attr("checked","");
			$("#ppimg_job_current").hide();
		}
		else
			$("#ppimg_job").hide();
	});
	$("#box_edu_current").click(function(){
		if(this.checked){
			$("#ppimg_edu_current").show();	
			$("#box_edu").attr("checked","");
			$("#ppimg_edu").hide();
		}
		else
			$("#ppimg_edu_current").hide();
	});
	$("#box_edu").click(function(){
		if(this.checked){
			$("#ppimg_edu").show();
			$("#box_edu_current").attr("checked","");
			$("#ppimg_edu_current").hide();
		}
		else
			$("#ppimg_edu").hide();
	});
	$("#box_other").click(function(){
		if(this.checked)
			$("#ppimg_other").show();	
		else
			$("#ppimg_other").hide();
	});
	$("#box_group").click(function(){
		if(this.checked)
			$("#ppimg_group").show();	
		else
			$("#ppimg_group").hide();
	});
});