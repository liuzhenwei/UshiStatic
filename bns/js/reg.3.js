$(document).ready(function(){
	var SchoolName = $('#SchoolName');				   
	var nextSubmit = $('#nextSubmit');
	var degreeid = $('#degreeid');
	var education_major = $('#education_major');
	var education_startyear = $('#education_startyear');
	var education_endyear = $('#education_endyear');
	
	SchoolName.autocomplete({
		url: '/ajax/json!listSchools.jhtml',
		ajax: 'schools',
		selected: function(event, li){
			SchoolName.val(li.text());
		}
	});
	SchoolName.click(function(){
		clearErrMsg(this);
		return false;
	});
	nextSubmit.click(function(){
		clearErrMsg();
		var Submit = true ;
		if( SchoolName.val() == ''){
			setErrMsg(SchoolName, lang.profile.schoolname_blank);
			SchoolName.next().removeClass('tips');
			setErrStyle(SchoolName);
			Submit =false;
		}
		if( education_major.val() == ''){
			setErrMsg(education_major, lang.profile.major_blank);
			education_major.next().removeClass('tips');
			setErrStyle(education_major);
			Submit =false;
		}
		if(degreeid.val()==0){
			setErrMsg(degreeid, lang.profile.degree_blank);
			degreeid.next().removeClass('tips');
			Submit =false;
		}
		if(education_startyear.val()>education_endyear.val()){
			setErrMsg(education_endyear, lang.profile.endafterstart);
			education_endyear.next().removeClass('tips');
			Submit =false;
		}
		
		if(Submit) {
			var form = $('form[name="reg_career_form"]');
			form.attr('action', '/user/regeducate!stepSave.jhtml').submit();	
		}
		return false;
	});
	function setErrMsg(obj, text) {
	    obj.parent().parent().append("<span class='tips tip-err'>" + text + "</span>");
	}
	function clearErrMsg( obj ) {
		var div=$(obj).parent().parent().find('>*:last');
		if(obj && div.hasClass('tip-err'))	div.remove();
		else $('.tip-err').remove();$('.errInfo').remove();
		( obj ? $(obj) : $(".errTextInput")).removeClass('errTextInput');
    }
});