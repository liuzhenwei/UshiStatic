var urls = {
	search: '/job/home!showSearchTips.jhtml',
	viewLetter: '/job/apply!showCoverLetter.jhtml',
	addFavorite: '/job/apply!addFavorite.jhtml',
	removeFavorite: '/job/apply!removeFavorite.jhtml',
	locaList: '/job/search!fetchWorkAreas.jhtml',
	getMoreSearchType: '/job/search!fetchMoreConditionItems.jhtml',
	research: '/job/search!generateResearch.jhtml'
};

$.ajaxSetup({cache: false});

$(document).ready(function(){


	$('form[js="autoValidate"]').validate();

	//查看自己已应聘职位的求职信
	$('a[js="viewLetter"]').bind('click', function(){
		var job = $(this).closest('.jobs-list-block'),
			jobid = job.attr('jobId');
		$.getJSON(urls.viewLetter + '?applyId=' + jobid, function(data){
			if( data.state == '0' ){
				pop_html(data.cont, {
					title: lang.job.cover_letter,
					width: 550,
					minHeight: 250
				});
			}
		});
		return false;
	});

	//收藏职位
	$('a[js="addFavorite"]').bind('click', addFavorite);
	$('a[js^="addFavorite_"]').bind('click', function(){
		var a = $(this),
			jobid = a.attr('js').split('_')[1];
		$.getJSON(urls.addFavorite + '?jobId=' + jobid, function(data){
			if( data.state == '0' ){
				var aa = $('a[js^="addFavorite_"]');
				aa.children('span').text(lang.job.msg_favorite);
				aa.unbind('click');
			} else {
				pop_alert(lang.job.favorite_err);
			}
		});
		return false;
	});

	//我的职位事件绑定
	$('#my_jobs .jobs-list-block').each(function(){
		var job = $(this),
			jobid = job.attr('jobid');
		job.bind('mouseover', function(){
			$(this).addClass('list-box-hover');
			//$(this).find('a.common-close, .job-actions').show();
		}).bind('mouseout', function(){
			$(this).removeClass('list-box-hover');
			//$(this).find('a.common-close, .job-actions').hide();
		});

		//取消收藏
		job.find('[js="removeFavorite"]').bind('click', function(){
			$.getJSON(urls.removeFavorite + '?jobId=' + jobid, function(data){
				if( data.state == '0' ){
					job.animate({height: 0}, 'normal', function(){
						$('#allMyJob, #myFavoJob').each(function(){
							$(this).text(parseInt($(this).text(), 10) - 1);
						});
						job.remove();
					});
				}
			});
			return false;
		});

	});

	//职位搜索
	$('.jobs-search-keywords').each(function(){
		var text = $('input:text', this),
			pos = text.offset(),
			cid = $('input[js="selectLocation_id"]').val();
	        cid_seo = $('[js="search_city"]').val();
	    if(typeof(cid_seo) != "undefined"){
	    	cid="CI_8843,CI_8066,CI_8677,CI_8559,CI_8814,CI_8899";
			urls.search = "/jobs/home!showSearchTips.jhtml";
		}
		text.one('focus', function(){
			$(this).val('');
		}).autocomplete({
			url: urls.search + '?locations=' + cid,
			listContClass: 'input-dropmenu',
			listClass: '',
			hoverClass: 'msover',
			li_id: ['id', 'name'],
			li_template: '<li index="%1"><a href="javascript:void(0)">%2</a></li>',
			ajax: 'list',
			width: 310,
			position: {of: text},
			selected: function(event, li){
				text.val(li.text());
			},
			pressEnter: function(event){
				$(this).closest('form').submit();
			}
		});
	});

	//更新联系方式和求职信
	$('a[js="modiCommonModule"]').each(function(){
		var a = $(this),
			cont = a.closest('.jobs-common-module').find('div[js="commonModuleCont"]'),
			modi = a.closest('.jobs-common-module').find('div[action]');
		modi.validate();
		modi.find(':button').click(function(){
			var self = $(this), param = {};
			modi.find(':text, :hidden, textarea').each(function(){
				param[this.name] = this.value;
			});
			if( modi.validate('exec') == false){
				return false;
			}
			$.post(modi.attr('action'), param, function(data){
				if( data.state == '0' ){
					self[0].disabled = false;
					modi.hide();
					cont.show();
					for( var key in param ){
						cont.find('[js="' + key + '"]').html(param[key]);
					}
				}
			}, 'json');
			this.disabled = true;
			return false;
		});
		a.click(function(){
			cont.toggle();
			modi.toggle();
			return false;
		});
	});


	/**********************************
	职位搜索结果页面
	Start *****************************/
	var researchKeyword = function(form){
		var key = $.trim(form.find('input[name="searchKeyword"]').val())+"",
			isr = form.find('#isResearch').attr('checked') ? '1' : '0',
			url = urls.research + '?isResearch=' + isr;
		if( key != '' ){
			ajaxSearchAction(url, 1, {"searchKeyword": key});
		}
	};
	$('.search-aside a[js="getMore"]').live('click', function(){
		var a = $(this), dl = a.closest('dl'),
			type = dl.attr('type');
		dl.find('dd').show();
		a.closest('dd').hide();
		return false;
	});
	$('#searchChkArea :checkbox').live('click', function(){
		var self = $(this), dl = self.closest('dl'), type = dl.attr('type'), rid = '';
		var search_key = $(this).closest('form').find('input[name="searchKeyword"]').val();
		if( this.value == '0' ){
			if( this.checked ){
				dl.find(':checked').attr('checked', false);
			}
			self.attr('checked', true);
			$('#isResearch').attr('checked', false);
		} else {
			if( this.checked ){
				dl.find(':checkbox[value="0"]').attr('checked', false);
				$('#isResearch').attr('checked', true);
			} else {
				if( dl.find(':checked').length == 0 ){
					dl.find(':checkbox[value="0"]').attr('checked', true);
					$('#isResearch').attr('checked', false);
				}
			}
		}
		dl.find(':checked').each(function(){
			rid += this.value + ',';
		});
		var url = urls.research + '?conditionType=' + type;
		ajaxSearchAction(url, 1, {"excludeConditionId": rid.slice(0, rid.length - 1),"searchKeyword":search_key});
	});
	$('input:text[js="researchKeyword"]').live('keypress', function(event){
		if( event.keyCode == 13 ){ researchKeyword($(this).closest('form')); }
	});
	$('input[js="submitKeyword"]').live('click', function(){
		researchKeyword($(this).closest('form'));
	});
	/* End *****************************/

	/**********************************
	保存职位搜索器
	Start *****************************/
	$('form[js="searchEdit"]').each(function(){
		var form = $(this),
			autocreate = $('#autocreate'),
			saveSearch = $('#saveSearch'),
			searchKey = form.find('input[name="searchKeyword"]'),
			searchName = form.find('input[name="searchname"]');
		autocreate.click(function(){
			if( this.checked ){
				saveSearch.find('[js="vdErr"]').hide();
				saveSearch.show();
				if( searchKey.val() != searchKey.attr('defaultTips') && searchKey.val() != '' ){
					searchName.click();
					setTimeout(function(){
						if( searchName.val() == '' ){
							var dt = new Date();
							searchName.val(searchKey.val() + '' + dt.getFullYear() + (dt.getMonth() + 1) + dt.getDate());
						}
					}, 50);
				}
			} else {
				saveSearch.hide();
			}
		});
		saveSearch.find('select[name="frequency"]').change(function(){
			if( this.value == '3' ){
				saveSearch.find('[js="saveWeek"]').show();
			} else {
				saveSearch.find('[js="saveWeek"]').hide();
			}
		});
		form.find(':submit').click(function(){
			searchKey.add(searchName).click();
		});
		//form.find('[js="basicForm"], #saveSearch').validate();
		form.find('#saveSearch').validate();
		form.submit(function(){
			if( searchKey.val() == '' ){
				var n = 0;
				if( $('input[js="selectPosition_id"]').val() == '' ){
					n++;
				}
				if( $('input[js="selectIndustry_id"]').val() == '' ){
					n++;
				}
				if( $('input[js="selectLocation_id"]').val() == '' ){
					n++;
				}
				if( n > 1 ){
					$('#search_err_msg').show();
					return false;
				}
			}
			$('#search_err_msg').hide();
			if( autocreate.length == 0 || autocreate[0].checked ){
				if( form.find('#saveSearch').validate('exec') == false){
					return false;
				}
			}
		});
	});
	/* End *****************************/
	
	//应聘邮件转发
	$('a[forwardEmail]').bind('click', function(){
		var applyId = $(this).attr('forwardEmail');
		var dlg = $('<div>' + $('#popForwardEmail').html() + '</div>');
		dlg.popupWin({
			title: lang.job.forward_title,
			width: 400,
			closeDestroy: true,
			open: function(){
				dlg.find(':button').click(function(){
					var mail = $.trim(dlg.find(':text').val());
					if( mail.is_email() ){
						$.post('/job/recruitment!forwardApply.jhtml?applyId=' + applyId, {email: mail});
						dlg.popupWin('destroy');
					} else {
						pop_alert(lang.job.email_error);
					}
				});	
			}
		});
		return false;
	});
	
	//查看应聘时的求职信
	$('[viewApplyLetter]').bind('click', function(){
		var a = $(this), applyId = a.attr('viewApplyLetter');
		$.getJSON('/job/apply!showCoverLetter.jhtml?applyId=' + applyId, function(data){
			if( data.state == '0' ){
				var dlg = $('<div class="a-right"><div class="jobs_letter_cont">' + data.cont + '</div>' +
					'<input type="button" class="common-button" js="closePopup" value=" ' + lang.common.close + ' " /></div>');
				dlg.popupWin({
					title: lang.job.cover_letter,
					width: 550,
					closeDestroy: true
				});
			}
		});
		return false;
	});
	
	//更新职位有效期
	$('a[updateJob]').bind('click', function(){
		var a = $(this), jobId = a.attr('updateJob'), vd = parseInt(a.attr('validtime'));
		$.ajax({
			url:'/job/ar!checkPost.jhtml',
			success:function(r){
				if (r=="1")
				{
					pop_alert('猎头用户只有在成功完成招聘方认证后才能正常发布职位，<a href="job/ar!home.jhtml">马上认证</a>');
				}
				else
				{
					var update = function(cfm){
						var param = {
							'jobId': jobId,
							'confirm': cfm || window.updateConfirm
						} 
						$.post('/job/recruitment!refreshJob.jhtml', param, function(data){
							if( data.state == '1' ){
								a.closest('tr').find('td[js="jobStatus"]').html('<span class="green">' + lang.job.statusPost + '</span>');
								if( a.closest('td').find('a[pauseJob]').length == 0 ){
									$('<a href="#" pauseJob="' + jobId + '" class="spe-right">' + lang.job.linkPause + '</a>').insertAfter(a)
										.bind('click', pauseJob);
								}
								window.updateConfirm = param['confirm'];
								location.reload(true);
							}
						}, 'json');
					};
					var cf = ( a.closest('td').find('a').length == 2 ) ? window.pauseConfirm : window.updateConfirm;
					if( cf == '1' ){
						update();
					} else {
						if( a.closest('td').find('a').length == 2 ){
							var dlg = $('<div>' + $('#popPauseJob').html() + '</div>');
						} else {
							var dlg = $('<div>' + $('#popUpdateJob').html() + '</div>');
						}
						dlg.popupWin({
							title: lang.job.updatejob_title,
							width: 500,
							closeDestroy: true,
							open: function(){
								var now = (new Date()).getTime(), d = new Date(now + 30 * vd * 24 * 60 * 60 * 1000);
								var sd = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
								dlg.find('strong').text(sd);
								dlg.find('.special-btn').click(function(){
									update(dlg.find('input[js="nextConfirm"]')[0].checked ? '1' : '0');
									dlg.popupWin('destroy');
								});
							}
						});
					}
				}
			}
		})
		return false;
	});
	//批量更新职位
	$('#batchUpdate').click(function(){
		$.ajax({
			url:'/job/ar!checkPost.jhtml',
			success:function(r){
				if (r=="1")
				{
					pop_alert('猎头用户只有在成功完成招聘方认证后才能正常发布职位，<a href="job/ar!home.jhtml">马上认证</a>');
				}
				else
				{
					var jobId = '';
					$('tbody input:checked').each(function(){
						jobId += this.value + ',';
					});
					if( jobId != '' ){
						var param = {
							'jobId': jobId.slice(0, jobId.length - 1)
						} 
						$.post('/job/recruitment!refreshJob.jhtml', param, function(){
							location.reload(true);
						});
					}
				}
			}
		});
	});
	//暂停职位
	var pauseJob = function(){
		var a = $(this), jobId = a.attr('pauseJob');
		$.getJSON('/job/recruitment!pauseJob.jhtml?confirm=1&jobId=' + jobId, function(data){
			if( data.state == '1' ){
				a.closest('tr').find('td[js="jobStatus"]').html('<span class="quiet">' + lang.job.statusPause + '</span>');
				a.remove();
				location.reload(true);
			}
		});
		return false;
	}
	$('a[pauseJob]').bind('click', pauseJob);

	//添加工作地点
	$('#selectJobLocation').each(function(){
		var self = this;
		var bindChange = function(div){
			selectCity(div.children('[js="selectCountry"]'), div.children('[js="selectRegion"]'), div.children('[js="selectCity"]'));
			div.find('a').click(function(){
				if( $('> div', self).length > 1 ){
					div.remove();
				}
				$('a[js="addLocation"]', self).show();
				if( $('> div', self).length == 1 ){
					$('> div a', self).hide();
				}
				return false;
			})
		};
		
		$('> div', this).each(function(){
			bindChange($(this));
		});
		
		$('a[js="addLocation"]', this).click(function(){
			var a = $(this), slt = $('> div:first select', self);
			var html = '<div class="clearfix middle">\n<select class="input-w-140" js="selectRegion"></select>\n' +
				'<select class="input-w-140" js="selectCity"></select>\n<a href="#">' + lang.common.del + '</a></div>';
			var div = $(html).insertBefore(a.parent());
			div.prepend(slt.filter(':first').clone());
			div.find('select:eq(0)').val('0');
			div.find('select:eq(1)').append($('option:first', slt[0]).clone());
			div.find('select:eq(2)').append($('option:first', slt[0]).clone());
			bindChange(div);
			if( $('> div', self).length == 5 ){
				a.hide();
			}
			$('> div a', self).show();
		});
		
		if( $('> div', this).length == 1 ){
			$('> div a', this).hide();
		}
	});
	
     $('.common-close').live('click',function(){
         $('.tips').hide();
         $(this).prev('.tips').show()
     })
     $('body').bind('click',function(event){
         var e = event || window.event;
         var src = e.srcElement || e.target;
         if((src.className!='common-close') && (src.className!='tips_link')){
             $('.tips').hide();
         }
     });
	
	$('.jobs-list-block .tips a').live('click',function(){
		var this_ = $(this);
		var sessionId = $(this).closest('.tips').attr('sessionId');
		var id = $(this).closest('.tips').attr('paramsId');
		var status = $(this).attr("status");
		
		$.get('/job/home!closeRecommend.jhtml?userId='+sessionId+"&jobId="+id+"&status="+status,function(data){
			this_.closest('.jobs-list-block').slideUp('slow',function(){
				this_.closest('.jobs-list-block').remove();
				$('#recommend_jobs').append(data);
			})
			
		})
	});
	
	//绑定表格列表选中所有
	$('#tblistSelectAll').click(function(){
		var table = $(this).closest('table');
		table.find(':checkbox:enabled').attr('checked', this.checked);
	});

	//列表排序
	$('a[order]').each(function(){
		var a = $(this);
		if( a.attr('order') == window.curOrder ){
			a.find('span').show().addClass(window.curAsc == '1' ? 'link_order_up' : 'link_order_down');
			a.attr('href', a.attr('href') + '&asc=' +(window.curAsc == '1' ? '0' : '1'));
		} else {
			a.attr('href', a.attr('href') + '&asc=1');
		}
	});
	
	//显示审核失败原因
	$('a[checkFailInfo]').hover(function(){
		var a = $(this), pop = $('#' + a.attr('popid')), pos = a.offset();
		if( pop.length == 0 ){
			pop = $('<div id="' + a.attr('popid') + '">' + a.attr('checkFailInfo') + '</div>');
		}
		pop.popupTips({
			arrow: 'top',
			tipsType: 1,
			position: [pos.left - 23, pos.top + 18],
			width: 300
		});
	}, function(){
		$('#' + $(this).attr('popid')).popupTips('close');
	});
	
	//修改公司信息
	$('[js="job_editor_companyInfo"]').bind('click',function(){
		$('#jobs_post_form').show();
		$('#jobs_post_formedit').hide();
		return false;
	})
	

	$('[name="msg"]').live("change",function(){
		var _text=$.trim($(this).val());
		if (_text=="" || _text==null)
		{
			$('[js="weibo_sync"]').html("");
		}
		else
		{
			$('[js="weibo_sync"]').html(":"+_text);
		}
	});
	
	
	
	
	//AR 行业选择
	var bindSelectWinAR = function(cont, btn){
		function clickCommCheckbox(chk, cont){
			if( chk.checked ){
				if( checkChecked(cont) >= 5 ){
					chk.checked = false;
				} else {
					cont.find(':checkbox[rid="' + $(chk).attr('rid') + '"]').attr('checked', true);
				}
			} else {
				cont.find(':checkbox[rid="' + $(chk).attr('rid') + '"]').attr('checked', false);
			}
		}
		function showSubLocation(chk, cont){
			chk = $(chk);
			chk.attr('checked', false);
			cont.find('div.local-dropmenu').hide();
			var pos = chk.position(), div = $('#' + chk.attr('showSub'));
			div.css({top: (pos.top - 9) + 'px', left: (pos.left - 3) + 'px'}).show();
			if( div.find(':checked').length == 0 && checkChecked(cont) < 5 ){
				chk.attr('checked', true);
				div.find(':checkbox:eq(0)').attr('checked', true);	
			} else {
				if( div.find(':checkbox:eq(0)').is(':checked') ){
					chk.attr('checked', true);
				}
			}
		}
		function clickSubLoc(chk, cont){
			jqchk = $(chk);
			var div = jqchk.closest('div');
			if( jqchk.parent().hasClass('sel-all') ){
				if( chk.checked ){
					div.find(':checkbox:gt(0)').attr('checked', false);
				}
				clickCommCheckbox(chk, cont);
			} else {
				if( chk.checked ){
					var rid = div.find(':checkbox:eq(0)').attr('rid');
					cont.find(':checkbox[rid="' + rid + '"]').attr('checked', false);
				}
				clickCommCheckbox(chk, cont);
			}
		}
		cont.find(':checkbox').attr('checked', false).bind('click.selectWinCheck', function(event){
			var chk = $(this), chktype = chk.attr('chktype');
			if( chktype == 'showSub' ){
				showSubLocation(this, cont);
			} else if( chktype == 'subLoc' ){
				clickSubLoc(this, cont);
			} else {
				cont.find('div.local-dropmenu').hide();
				clickCommCheckbox(this, cont);
			}
			refreshSelectWin(cont);
			event.stopPropagation();
		});
		cont.find('.btn-line input.common-button').bind('click', function(){
			cont.find(':checkbox').attr('checked', false);
			cont.find('.popbox-subtit span').remove();
			cont.popupWin('close');
		});
		cont.find('.btn-line input.special-btn').bind('click', function(){
			var rel = cont.attr('rel'), selected = cont.data('selected'), sid = '';
			var frame = btn.closest('.itemmain').children('[js="tips_frame"]');
			
			frame.find('.wd-topic-outer').remove();
			if( selected ){
				for( var key in selected ){
					frame.append('<p class="wd-topic-outer"><span class="wd-topic" jsid="'+selected[key].id+'">'+selected[key].name+'<a class="common-close">close</a></span></p>');
					sid += selected[key].id + ',';
				}
				if( sid != '' ){
					var max = btn.attr('maxlength') ? parseInt(btn.attr('maxlength'), 10) : 12;
					$('input[js="' + rel + '_id"]').val(sid.slice(0, sid.length - 1));
					
				} else {
					$('input[js="' + rel + '_id"]').val('');
				}
			}
			
			$('.wd-topic').find('a').click(function(){
				var _removeId=$(this).parent().attr('jsid');
				$(this).closest('.wd-topic-outer').remove();
				cont.find('input[rid="'+_removeId+'"]').attr('checked',false);
				cont.find('.common-selected[rid="'+_removeId+'"]').remove();
				var _ids='';
				for (i=0;i<$('.wd-topic').length;i++)
				{
					_ids+=$('.wd-topic').eq(i).attr('jsid')+',';
				}
				$('[js="selectIndustry_id"]').val(_ids);
				
			})
			
			cont.popupWin('close');
		});
	};
	
	$('#industryContainerAR').each(function(){
		if ($('[js="industry_exist"]').length>0)
		{
		var cont = $(this), btn = $('a[js="selectIndustryAR"]');
		btn.click(function(){
			openSelectWin(cont, {title: lang.job.search_select_industry_title + ' <span class="quiet" style="font-weight: normal;">' + lang.job.search_select_max + '</span>'});
			return false;
		});
		
		var _industryTips=$('#selectIndustriesTip').val();
		var _industryIds=$('#companyInfo_industryid').val();
		$('[js="selectIndustry_id"]').val(_industryIds);
		var _industryId=[];
		if (_industryTips.length>0)
		{
			_industryId=_industryIds.split(',');
			_industryTip=_industryTips.split(',');
			var frame = btn.closest('.itemmain').children('[js="tips_frame"]');
	
			for (i=0;i<_industryId.length;i++)
			{
				frame.append('<p class="wd-topic-outer"><span class="wd-topic" jsid="'+_industryId[i]+'">'+_industryTip[i]+'<a class="common-close">close</a></span></p>');
			}
			
			$('.wd-topic').find('a').click(function(){
				var _removeId=$(this).parent().attr('jsid');
				$(this).closest('.wd-topic-outer').remove();
				cont.find('input[rid="'+_removeId+'"]').attr('checked',false);
				cont.find('.common-selected[rid="'+_removeId+'"]').remove();
				var _ids='';
				for (i=0;i<$('.wd-topic').length;i++)
				{
					_ids+=$('.wd-topic').eq(i).attr('jsid')+',';
				}
				$('[js="selectIndustry_id"]').val(_ids);
				
			})
		}
		
		bindSelectWinAR(cont, btn);
		}
	});


	//职位搜索页过滤条件显示tips
	$('label[js="hideFilterLabel"]').live('mouseenter', function(){
		var label = $(this), tip = $('#filterLabelTips');
		if( tip.length == 0 ){
			tip = $('<div id="filterLabelTips">' + label.attr('uTitle') + '</div>');
		}
		tip.popupTips({
			width: 200,
			tipsType: 13,
			reserve: false,
			position: {of:label, my:'left center', at:'right center', offset:'9 8'}
		});
	}).live('mouseleave', function(){
		var label = $(this), tip = $('#filterLabelTips');
		if( tip.length > 0 ) tip.popupTips('destroy');
	});
	//职位搜索页过滤条件显示
	$('input[js="hideFilter"]').live('change', function(){
		var chk = $(this), dl = $('[js="searchFilterList"]>dl').not('dl[type="CITY"], dl[type="city"]');
		if( this.checked == true ){
			document.showFilterList = true;
			dl.show('fade');
		} else {
			document.showFilterList = false;
			dl.hide();
		}
	});
	$('input[js="hideFilter"]').trigger('change');
});

//发送职位查询ajax请求
function ajaxSearchAction(url, page, param){
	url += '&pageNo=' + page + '&_=' + new Date().getTime();
	param = param || {};
	
	var res_lurl = url.replace('Research', 'ResearchLeftSide');
	var res_rurl = url.replace('Research', 'ResearchRightSide');
	$('.column-2-2').animate({opacity: 0.3}, 250);
	$.post(res_rurl, param, function(rdata){
		$.post(res_lurl, param, function(ldata){
			$('.search-aside').replaceWith(ldata);
			$('input[js="hideFilter"]')[0].checked = document.showFilterList;
			$('input[js="hideFilter"]').trigger('change');
			$('.column-2-2').empty().append(rdata);
			$(document).scrollTop(0);
			$('.column-2-2').animate({opacity: 1}, 250, function(){
				$('a[js="addFavorite"]').bind('click', addFavorite);
			});
		});
	});
}
function topage(page){
	ajaxSearchAction(urls.research + '?refer=6', page);
	return false;
}

//收藏职位操作
function addFavorite(event){
	var a = $(this), job = a.closest('.jobs-list-block');
	if( job.length ){
		$.getJSON(urls.addFavorite + '?jobId=' + job.attr('jobid'), function(data){
			if( data.state == '0' ){
				a.replaceWith('<span class="quiet">' + lang.job.msg_favorite + '</span>');
			} else {
				pop_alert(lang.job.favorite_err);	
			}
		});
	}
	return false;
}




/* 新职位频道 知名企业、最新招聘滚动广告 */
function import_com_logo()
{
	var _amount1=$('[js="com-logo-1"]').children().length;
	var _amount2=$('[js="com-logo-2"]').children().length;
	var _list1=$('[js="com-list1"]');
	var _list2=$('[js="com-list2"]');
	var _item;
	
	for (i=2;i<_amount1;i=i+3)
	{
		_list1.append('<li><dl>');
		var _innerList=_list1.find("dl");
		
		_item=$('[js="com-logo-1"]').children().eq(i-2);
		_innerList.append('<dd><a href="'+_item.attr("js")+'"><img src="'+_item.val()+'" /></a></dd>');
		_item=$('[js="com-logo-1"]').children().eq(i-1);
		_innerList.append('<dd><a href="'+_item.attr("js")+'"><img src="'+_item.val()+'" /></a></dd>');
		_item=$('[js="com-logo-1"]').children().eq(i);
		_innerList.append('<dd><a href="'+_item.attr("js")+'"><img src="'+_item.val()+'" /></a></dd>');
	}
	
	for (i=2;i<_amount2;i=i+3)
	{
		_list2.append('<li><dl>');
		var _innerList=_list2.find("dl");
		
		_item=$('[js="com-logo-2"]').children().eq(i-2);
		_innerList.append('<dd><a href="'+_item.attr("js")+'"><img src="'+_item.val()+'" /></a></dd>');
		_item=$('[js="com-logo-2"]').children().eq(i-1);
		_innerList.append('<dd><a href="'+_item.attr("js")+'"><img src="'+_item.val()+'" /></a></dd>');
		_item=$('[js="com-logo-2"]').children().eq(i);
		_innerList.append('<dd><a href="'+_item.attr("js")+'"><img src="'+_item.val()+'" /></a></dd>');
	}
	
}

//职位编辑
$(function(){
	$('[jobEdit]').click(function(){
		var _jobId=$(this).attr('jobEdit');
		$.ajax({
			url:'/job/ar!checkPost.jhtml',
			success:function(r){
				if (r=="1")
				{
					pop_alert('猎头用户只有在成功完成招聘方认证后才能正常发布职位，<a href="job/ar!home.jhtml">马上认证</a>');
				}
				else
				{
					location.href="/job/recruitment!viewPostForm.jhtml?jobDetailId="+_jobId;
				}
			}
		});
	})
});