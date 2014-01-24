var recomm = '', jobId = '${detailVO.id}';
$.get('/job/recommend!loadRecommend.jhtml?jobId=' + jobId, function(data){
	recomm = data;
}, 'text');

function checkForm(form){
	form = $(form);
	var resume = form.find('select[name="resumeId"]');
	if( resume.val() == '0' ){
		if( form.find(':file').val() == '' ){
			resume.closest('li').find('[js="vdErr"]').show();
			return false;
		}
	}
	resume.closest('li').find('[js="vdErr"]').hide();
	var letter = form.find('textarea[name="coverLetter"]');
	if( letter.val().length > 60000 ){
		letter.closest('li').find('[js="vdErr"]').show();
		return false;
	}
	letter.closest('li').find('[js="vdErr"]').hide();
	return true;
}


$(document).ready(function(){
	var bindForwardJob = function(cont){
		cont.find('[js="showInviteMsgCont"]').bind('click', function(){
			$('#inviteMsgCont').toggle();
		});
		cont.find('.btn-line input.common-button').bind('click', function(){
			cont.popupWin('destroy');
		});
		var tabli = cont.find('.tabs-sub li');
		tabli.each(function(i){
			var li = $(this);
			$('a', this).click(function(){
				tabli.removeClass('current');
				li.addClass('current');
				cont.find('form').hide();
				cont.find('form:eq(' + i + ')').show();
				cont.find('input[js="inviteLink"]').select();
				return false;
			});
		});
		cont.find('#friendSelectList').friendSelectList({
			url: '/job/recommend!getRecommendFriendList.jhtml?jobId=' + cont.data('jobid'),
			idField: '#inviteFriendsId',
			inviteMax: 5,
			fsParam: {
				prompt: lang.friend.fs_max_info(5),
				width: 826
			}
		});
		cont.find('form input[name="jobId"]').val(jobId);
		cont.find('form[js="sharejob"]').ajaxForm({
			ajaxOptions: {
				success: function(data){
					cont.popupWin('destroy');
					pop_alert('分享成功');
					return false;
				}
			}
		})
		
		cont.find('form[js="recommtofriend"]').ajaxForm({
			beforeSubmit: function(event, form){
				if( form.find('input[name="rids"]').val() == '' ){
					form.find('span.red').show();
					return false;
				}
				form.find('span.red').hide();
				return true;
			},
			ajaxOptions: {
				success: function(data){
					cont.popupWin('destroy');
					pop_alert(lang.job.apply_intro_to_friend);
				}
			}
		});
		cont.find('form[js="recommtoouter"]').ajaxForm({
			beforeSubmit: function(event, form){
				var text = form.find('textarea[name="emails"]'),
					emails = text.val().split(/,|\n/),
					s = '';
				text.prev().find('span').hide();
				for( var i = 0; i < emails.length; i++ ){
					if( emails[i] == '' ){ continue; }
					if( emails[i].is_email() ){
						s += emails[i] + ',';
					} else {
						text.prev().find('span').show();
						return false;
					}
				}
				if( s == '' ){
					text.prev().find('span').show();
					return false;
				}
				text.val(s.slice(0, s.length - 1));
				return true;
			},
			ajaxOptions: {
				success: function(data){
					cont.popupWin('destroy');
					pop_alert(lang.job.apply_intro_to_friend);
				}
			}
		});
	};
	$('a[js="forwardJob"]').click(function(){
		if( recomm == '' ){ return false; }
		var cont = $(recomm);
		cont.data('jobid', jobId);
		cont.popupWin({
			title: lang.job.forward_title2,
			width: 650,
			closeDestroy: true
		});
		bindForwardJob(cont);
		
		
		if ($(this).attr("typeid")=="1")
		{
			$("#sharejobview").addClass("current");
			$("#invite1degree").hide();
			$("#inviteexternal").hide();
		}
		
		if ($(this).attr("typeid")=="2")
		{
			$("#sharejobview").hide();
			$("#invite1degree").addClass("current");
			cont.find('form').hide();
			cont.find('form:eq(1)').show();
			cont.find('input[js="inviteLink"]').select();
		}
		
		return false;
	});
	
	$('[js="job_url_company"]').bind('click',function(){
		var urlAdd = $(this).attr('href');
		var strRegex = "^(https|http|ftp|rtsp|mms)?://.+" ;
		var re = new RegExp(strRegex); 
		a = re.test(urlAdd)?urlAdd:('http://'+urlAdd);
		$(this).attr('href',a);
		
	})
	
	$('a[forwardJob]').click(function(){
		if( recomm == '' ){ return false; }
		var cont = $(recomm);
		cont.data('jobid', jobId);
		var a = $(this),
			rid = a.attr('forwardJob'),
			uname = a.closest('dl').find('dt a').text();
		cont.find('.tabs-feed, form[js="recommtoouter"]').remove();
		cont.find('#inviteFriendsId').val(rid);
		cont.find('span.quiet').remove();
		cont.find('#friendSelectList').replaceWith('<div class="mult-selector"><span class="large">' + uname + '</span></div>');
		cont.popupWin({
			title: lang.job.forward_title2,
			width: 650,
			closeDestroy: true
		});
		bindForwardJob(cont);
		
		$("#sharejobview").hide();
			$("#invite1degree").addClass("current");
			cont.find('form').hide();
			cont.find('form:eq(1)').show();
			cont.find('input[js="inviteLink"]').select();
		
		return false;
	});
	$('a[showApplyButton]').click(function(){
		if( $(this).attr('unverify') ) return; //如果未经验证则不绑定

		var a = $(this), tips = a.html();
		if( a.next().hasClass('loading') ) return false;
		var as = $('a[showApplyButton]');
		var loading = $('<span class="loading" style="margin:0;color:#FFF;display:inline-block;">&nbsp;</span>').insertAfter(as);
		$.getJSON('/job/apply!hasApplyRecent1Week.jhtml?jobId=' + a.attr('showApplyButton'), function(data){
			loading.remove();
			if( data.state == 0 ){
				var pop = $('#forward_job');
				pop.popupWin({
					title: lang.job.apply_title,
					closeDestroy: true,
					reserve: true,
					width: 560
				});
			} else {
				pop_alert(lang.job.detail_not_reply_apply);
			}
		});
		return false;
	});
});