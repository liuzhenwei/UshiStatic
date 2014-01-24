$(document).ready(function(){
	selectCity();
	var companyName = $('#CompanyName');
	var onduty = $('#onduty');
	var editOneName = null;
	var showName = companyName.next();
	var editBtn = companyName.next().next();
	var attribute = editBtn.next();
	var companyNamePrevValue = null;
	var company_site = $('[name="company.site"]');
	var company_sizeid = $('[name="company.sizeid"]');
	var nextSubmit = $('#nextSubmit');
	var career_position = $('#career_position');
	var schoolEndDate = $('#schoolEndDate');
	var schoolEndDateCurrent = $('#schoolEndDateCurrent');
	
	var Submit = true ;
	$('#career_startyear').change(function(){
		clearErrMsg();
		var startDate = new Date ($('#career_startyear').val(),$('#career_startmonth').val()-1);
		var endDate = new Date ($('#career_endyear').val(),$('#career_endmonth').val()-1);
		if(!onduty.get(0).checked && startDate > endDate){
			setErrMsg($('#schoolEndDateCurrent'),lang.profile.endafterstart);
			$('#career_endmonth').next().removeClass('tips');
			Submit =false;
		}
	});
	$('#career_startmonth').change(function(){
		clearErrMsg();
		var startDate = new Date ($('#career_startyear').val(),$('#career_startmonth').val()-1);
		var endDate = new Date ($('#career_endyear').val(),$('#career_endmonth').val()-1);
		if(!onduty.get(0).checked && startDate > endDate){
			setErrMsg($('#schoolEndDateCurrent'),lang.profile.endafterstart);
			$('#career_endmonth').next().removeClass('tips');
			Submit =false;
		}
	});
	$('#career_endyear').change(function(){
		clearErrMsg();
		var startDate = new Date ($('#career_startyear').val(),$('#career_startmonth').val()-1);
		var endDate = new Date ($('#career_endyear').val(),$('#career_endmonth').val()-1);
		if(!onduty.get(0).checked && startDate > endDate){
			setErrMsg($('#schoolEndDateCurrent'),lang.profile.endafterstart);
			$('#career_endmonth').next().removeClass('tips');
			Submit =false;
		}
	});
	$('#career_endmonth').change(function(){
		clearErrMsg();
		var startDate = new Date ($('#career_startyear').val(),$('#career_startmonth').val()-1);
		var endDate = new Date ($('#career_endyear').val(),$('#career_endmonth').val()-1);
		if(!onduty.get(0).checked && startDate > endDate){
			setErrMsg($('#schoolEndDateCurrent'),lang.profile.endafterstart);
			$('#career_endmonth').next().removeClass('tips');
			Submit =false;
		}
	});

	(function(companyName){
		if(companyName.size()==0) return false;
		$('#companyID').val('0');
		var showName = companyName.next(),
			editBtn = showName.next(),
			attribute = editBtn.next();

		var oldName = companyName.val();
		var companyNamePrevValue = null;
		var company_site = $('[name="company.site"]');
		var company_sizeid = $('[name="company.sizeid"]');
		
		var showInfo = function(){
			companyName.hide();
			showName.text(companyName.val()).show();
			editBtn.show();
		};
		var showAttribute = function(){
			if( companyName.val() != '' && companyName.val() != oldName ){
				attribute.show();
				if(companyName.val() != companyNamePrevValue){
					companyNamePrevValue = companyName.val();
					company_site.val('');
					company_sizeid.val(0);
				}
			}
			if( companyName.val() != ''){
				showInfo();
			}
		};
		
		companyName.autocomplete({
			url: '/ajax/json!listCompanies.jhtml',
			ajax: 'companies',
			selected: function(event, li){
				companyName.val(li.text());
				$('#companyID').val(li.attr('index'));
				showInfo();
			},
			keydown: function(event, obj){
				$('#companyID').val('0');
			},
			unselected: function(event, obj){
				if( $('#companyID').val() != '0'  ){
					showInfo();
				} else {
					if(companyName.val().indexOf('<') !=-1 || companyName.val().indexOf('>') !=-1 )
					{
						companyName.after('<span class="tips tip-err" style="float:none;display:inline;">' + lang.profile.companyname_invalidate + '</span>');
					}
					else
					{	
						showAttribute();
					}
				}
			}
		});

		companyName.click(function(){
			clearErrMsg(this);
			return false;
		});
		editBtn.click(function(){
			companyName.show();
			setTimeout(function(){
				companyName.focus();
			}, 50);
			showName.text('');
			editBtn.hide();
			attribute.hide();
			return false;
		});
	})(companyName);
	
	onduty.click(function(){		  
		if(this.checked){
			schoolEndDate.hide();
			schoolEndDateCurrent.show();
			var tips = schoolEndDateCurrent.parent().parent().find('span.tips');
			if( tips.length > 1 ){ tips.filter(':first').remove(); }
			tips.removeClass('tip-err').text('');
		}else{
			schoolEndDate.show();
			schoolEndDateCurrent.hide();
		}
	});

	nextSubmit.click(function(){
		clearErrMsg();
		Submit = true;
		var startDate = new Date ($('#career_startyear').val(),$('#career_startmonth').val()-1);
	    var endDate = new Date ($('#career_endyear').val(),$('#career_endmonth').val()-1);
		var company_sizeid = $('#company_sizeid');
		if( companyName.val() == ''){
			setErrMsg(companyName, lang.profile.companyname_blank);
			companyName.next().removeClass('tips');
			setErrStyle(companyName);
			Submit =false;
		}
		if( companyName.val() != '' && $('#companyID').val() == '0' && company_sizeid.val() == 0){
			company_sizeid.after('<span class="errInfo">'+lang.profile.company_size_blank+'</span>');
			company_sizeid.next().removeClass('tips');
			setErrStyle(company_sizeid);
			Submit =false;
		}
		
		if( career_position.val() == ''){
			setErrMsg(career_position, lang.profile.position_blank);
			career_position.next().removeClass('tips');
			setErrStyle(career_position);
			Submit =false;
		}
		
		if(!onduty.get(0).checked && startDate > endDate){
			setErrMsg($('#schoolEndDateCurrent'),lang.profile.endafterstart);
			$('#career_endmonth').next().removeClass('tips');
			Submit =false;
		}
		
		if(startDate > new Date( new Date().getFullYear(),new Date().getMonth() ) ){
			setErrMsg($('#schoolEndDateCurrent'),lang.profile.job_starttime);//'开始日期不能大于当前日期'
			$('#career_endmonth').next().removeClass('tips');
			Submit =false;
		}
		
		if(endDate > new Date( new Date().getFullYear(),new Date().getMonth() ) ){
			setErrMsg($('#schoolEndDateCurrent'),lang.profile.job_endtime);//'结束日期不能大于当前日期'
			$('#career_endmonth').next().removeClass('tips');
			Submit =false;
		}
		if($("#profession").val()==0){
		    setErrMsg($('#profession'),lang.reg.industry);
		    setErrStyle($('#profession'));
		    Submit =false;
		}
		var region=true;
		if($("#selectRegion").val()==0){
			 setErrMsg($('#selectRegion'),lang.reg.region);
		     setErrStyle($('#selectRegion'));
		     Submit =false;
		     region=false;
		}
		if($("#selectCity").val()==0 && region){
			 setErrMsg($('#selectCity'),lang.reg.city);
		     setErrStyle($('#selectCity'));
		     Submit =false;
		}
		if(Submit) {
			document.reg_career_form.action='/user/regcareer!stepSave.jhtml';
			document.reg_career_form.submit();	
		}
		return false;
	});
	
	function setErrMsg(obj, text) {
	    obj.parent().parent().append("<span class='tips tip-err'>" + text + "</span>");
	}
	function clearErrMsg( obj ) {
		var div=$(obj).parent().parent().find('>*:last');
		if(obj && div.hasClass('tip-err')){
			div.remove();
		} else {
			$('.tip-err').remove();$('.errInfo').remove();
		}
		( obj ? $(obj) : $(".errTextInput")).removeClass('errTextInput');
    }
    onduty.attr('checked', true);
    onduty.click();
    onduty.attr('checked', true);
});
