var mUrl = {
	ushi: '/sns/contactMgt!getUshiContactVoListByUserId.jhtml',
	local: '/sns/contactMgt!getLocalContactVoListByUserId.jhtml',
	sina: '/sns/contactMgt!getSocialContactVoListByUserId.jhtml',
	card: '/sns/contactMgt!getCardContactVoListByUserId.jhtml'
};
var contactType = {ushi:3, local:2, sina:1, card:4};
var contactTypeS = ['', 'sina', 'local', 'ushi', 'card'];

$(function(){
	var contact = $('#contactContainer'), letter = $('[fs="fsLetter"]'),
		sortMenu = $('[fs="fsSortMenu"]'), sortLink = $('[fs="fsShowSort"]'), sortul = sortLink.closest('.contact-sort');;
	var fsParam = {
		popupWin: false,
		url: mUrl,
		showMember: function(event, lt){
			letter.find('a').removeClass('on').addClass('quiet')
				.each(function(){
					var a = $(this);
					if( lt[a.text()] ) a.removeClass('quiet');
				}).filter(':first').removeClass('quiet')
		},
		refreshMember: function(event, lt){
			letter.find('a:first').addClass('on');
		},
		resetNavi: function(){
			sortLink.text(sortMenu.find('a:first').text()).attr('sort', sortMenu.find('a:first').attr('fsSort'));
		},
		changeFilter: function(event, a){
			var detail = $('#memberDetail');
			if( detail.is(':visible') ){
				showUshiInvite();
			}
		},
		onSelect: function(event, li){
			if( li.hasClass('ctl-member-empty') ) return false;
			//选中列表中的联系人，并显示联系人详情
			var md = $('#memberDetail');
			if( md.find('.loading').length ){
				return false;
			}
			var ajax = '/sns/contactMgt!userInfo.jhtml?contactType=' + contactType[li.attr('tp')] + '&pkId=' + li.attr('d');
			$.ajax({
				url: ajax,
				type: 'get',
				cache: false,
				dataType: 'text',
				success: function(data){
					showDetail(data, li);
				}
			});
			rightCont.hide();
			md.empty().show().append('<div class="loading">' + lang.contact.detail_loading + '</div>');
		},
		initushi: function(event, list){
			var cur = parseInt(location.hash.slice(1) || '0', 10);
			if( cur > 0 && list[cur.toString()] ){
				var show = {};
				show[cur.toString()] = list[cur.toString()];
				contact.friendSelect('refreshMember', show);
				setTimeout(function(){
					console.log($('#ushi_' + cur).length);
					$('#ushi_' + cur).trigger('click');
				}, 500);
				return false;
			}
			return true;
		}
	};
	if( typeof(fsMember) != 'undefined' ){
		fsParam['initMember'] = fsMember;
	}
	contact.friendSelect(fsParam);

	//排序
	sortLink.text(sortMenu.find('a:first').text()).attr('sort', sortMenu.find('a:first').attr('fsSort'));
	sortLink.bind('click', function(){
		var pos = sortLink.offset();
		if( $('ul[fs="fsFriendsList"] li.ctl-member-empty').length ){
			return false;
		}
		if( sortMenu.popupLayer('isOpen') == true ){
			sortMenu.popupLayer('close');
		} else {
			sortul.addClass('contact-sort-on');
			sortMenu.find('li').show();
			sortMenu.find('a[fsSort="' + sortLink.attr('sort') + '"]').closest('li').hide();
			sortMenu.popupLayer({
				position: [pos.left-16, pos.top+14],
				reserve: true,
				clickClose: true,
				modal: true,
				overlay: 0,
				beforeClose: function(){
					sortul.removeClass('contact-sort-on');
				}
			});
		}
		return false;
	});
	sortMenu.find('[fsSort]').bind('click', function(){
		if( contact.friendSelect('checkLoading') == true ) return false;
		var type = $(this).attr('fsSort');
		sortMenu.popupLayer('close');
		sortLink.text($(this).text()).attr('sort', type);
		var clt = letter.find('a.on');
		contact.friendSelect('showMember', null, null, type, function(){
			clt.addClass('on');
		});
		return false;
	});
	//首字母
	$('a', letter).bind('click', function(){
		if( contact.friendSelect('checkLoading') == true ) return false;
		var a = $(this);
		if( ! a.hasClass('quiet') && ! a.hasClass('on') ){
			var lt = a.text(), list = contact.friendSelect('option', 'currentList');
			var sort = sortLink.attr('sort');
			var cb = function(){
				a.addClass('on');
				contact.friendSelect('option', 'dataLoading', false);
			}
			contact.friendSelect('option', 'dataLoading', true);
			if( lt == '#' ){
				contact.friendSelect('showMember', list, null, sort, cb);
			} else {
				var arr = [];
				for( var i = 0; i < list.length; i++ ){
					var o = list[i];
					if( o.lt == lt ){
						arr.push(o);
					}
				}
				contact.friendSelect('showMember', arr, 10000, sort, cb);
			}
		}
		return false;
	});

	//用户组管理
	var tmCMGE = null;
	function closeMenuGroupEdit(menu){
		tmCMGE = null;
		menu = typeof(menu) == 'string' ? $('#menuGroupEdit_' + menu) : menu;
		if( menu && menu.length ){
			menu.popupLayer('close');
		}
	}
	$('span.ct-group-edit').live('mouseover', function(){
		closeMenuGroupEdit($('ul[id^=menuGroupEdit_]'));
		var a = $(this), pos = a.offset(), g = a.parent(), gid = g.attr('group');
		g.addClass('hover');
		var menu = $($('#menuGroupEdit').html()).attr('id', 'menuGroupEdit_' + gid);
		menu.popupLayer({
			popupClass: 'dp-menu',
			width: 120,
			clickClose: true,
			closeDestroy: true,
			reserve: false,
			position: [pos.left - 1, pos.top + 15],
			open: function(){
				menu.bind('mouseenter', function(){
					if( tmCMGE != null ){
						clearTimeout(tmCMGE);
						tmCMGE = null;
					}
				});
				menu.bind('mouseleave', function(){
					closeMenuGroupEdit(menu);
				});
				menu.find('[fsEditGroup="rename"]').click(function(){
					menu.popupLayer('close');
					editGroupName(g);
					return false;
				});
				menu.find('[fsEditGroup="delete"]').click(function(){
					menu.popupLayer('close');
					delGroup(g);
					return false;
				});
				menu.find('[fsEditGroup="member"]').click(function(){
					menu.popupLayer('close');
					var o = {d:g.attr('group'), n:$.trim(g.find('[fs=gn]').text())};
					var list = $('#contactContainer').friendSelect('search', o.d, 'g');
					addGroupMembers(o, list);
					return false;
				});
			},
			beforeClose: function(){
				g.removeClass('hover');
			}
		});
		return false;
	});
	$('span.ct-group-edit').live('mouseout', function(){
		var a = $(this), g = a.parent(), gid = g.attr('group');
		tmCMGE = setTimeout(function(){
			closeMenuGroupEdit(gid);
		}, 200);
		return false;
	});

	//新增分组
	$('[fs="fsAddGroup"]').bind('click', function(){
		addGroup(function(g){
			addGroupMembers(g);
		});
		return false;
	});

	//切换右边部分
	var rightCont = $('#rightInviteCont > div');
	$('[fsNavi="ushi"]>a').click(showUshiInvite);
	$('[fsNavi="sina"]>a').click(function(){
		rightCont.hide();
		$('#sinaInvite').show();
	});
	$('[fsNavi="local"]>a').click(function(){
		rightCont.hide();
		$('#localInvite').show().find('[fs="fsInviteCont"]').append($('#baseInvite'));
		$('[fs="fsBaseInviteTitle"]', '#baseInvite').hide();
		$('[fs="fsTabInviteType"] :radio:first').trigger('click');
	});
	$('[fsNavi="card"]>a').click(function(){
		rightCont.hide();
		$('#cardInvite').show();
	});

	//弹出邀请链接
	$('[js="showInviteLink"]').bind('click', function(){
		$('#showInviteLinkPop').popupWin({
			title: '',
			width:600,
			open: function(){
				$(this).find(':text').select();
			}
		});
		return false;
	});

	//切换邀请类型
	var inviteForm = $('[ct="ctInviteForm"] form');
	$('[fs="fsTabInviteType"] :radio').bind('click', function(){
		inviteForm.hide();
		inviteForm.filter('[ct="' + this.id + '"]').show();
	});
	inviteForm.validate({
		afterValidate: function(event, r){
			if( r.result != true ){
				hide_overlay();
				$(this).find(':submit').show().next().remove();
			}
		}
	});

	//添加email邀请人
	$('a[fs="addEmailInvite"]').bind('click', function(){
		var a = $(this), tb = a.closest('div').find('table'), tr = tb.find('tr:first').clone().show();
		tb.find('tr:last').after(tr);
		tr.find(':text[defaultTips]').showDefaultTips();
		return false;
	});
	$('form[fs="emailInviteForm"]').validate({
		ignoreHidden: true
	});
	$('form[fs="emailInviteForm"] :submit').bind('click', function(){
		$('form[fs="emailInviteForm"]').validate('init');
	});

	//添加名片联系人
	$('form[fs="addLocalForm"]').ajaxForm({
		ajaxOptions: {
			cache: false,
			success: function(data){
				if( data == '-1' ){//如果数量超标，给出提示
					pop_alert(lang.contact.total_number);
					return;
				}
				var form = $(this), m = {};
				m.d = data; m.u = '0';
				m.n = $.trim(form.find('[name="contactProfile.name"]').val());
				m.p = m.n; m.tp = 'card'; m.r = -1;
				m.lt = m.p.slice(0, 1).toUpperCase();
				m.b = $.trim(form.find('[name="contactProfile.companyName"]').val()) + ' ' + $.trim(form.find('[name="contactProfile.position"]').val());
				m.m = 'http://static.ushi.cn/s/common/images/face_30.png';
				contact.friendSelect('addMember', m);
				if( $('[fsNavi=' + m.tp + '] > a').hasClass('current') ){
					var html = '<li class="vcard v-30" id="' + m.tp + '_' + m.d + '" d="' + m.d + '" lt="' + m.lt + '" r="' + m.r + '" tp="' + m.tp + '" ct="list">' +
						'<img src="' + m.m + '" width="30" height="30" alt=""><dl><dt class="blue">' + m.n + '</dt><dd class="quiet">' + m.b + '</dd></dl></li>';
					var ul = $('ul[fs="fsFriendsList"]');
					ul.find('.ctl-member-empty').remove();
					ul.append(html);
				}
				form.parent().scrollTop(0);
				form.find(':text').val('');
				form.find('select').each(function(){
					$(this).children('option:first').attr('selected', true);
				});
				form.find('[fs="hdAL"]').hide();
				form.find('[fs="swAL"]').show();
				var span = $('[fsNavi=' + m.tp + '] span');
				span.text('(' + (parseInt(span.text().replace(/[\(\)]/, ''), 10) + 1) + ')');
				showSuccessTips(lang.contact.suc_add_local);
			}
		},
		validate: {
			validateAjax: true,
			beforeValidate: function(){
				$(this).removeData('validateEnd');
			},
			afterValidate: function(){
				$(this).data('validateEnd', true);
			},
			extTools: {"isCardEmail": checkAddCardEmail, "isCardPhone": checkAddCardPhone}
		}
	});
	//绑定autocomplete公司
	$('form[fs="addLocalForm"]').find('[name="contactProfile.companyName"]').autocomplete({
		url: '/ajax/json!listCompanies.jhtml',
		ajax: 'companies',
		selected: function(event, li){
			$(this).val(li.text());
		}
	});

	//关闭详情
	$('.ct-close-detail').live('click', function(){
		$('#memberDetail').hide();
		var navi = $('li[fsNavi] a.current');
		var type = ( navi.length ) ? navi.closest('li').attr('fsNavi') : 'ushi';
		$('#' + type + 'Invite').show().find('[fs="fsInviteCont"]').append($('#baseInvite'));
		$('ul[fs="fsFriendsList"] li.select').removeClass('select');
	});

	//显示隐藏详情编辑删除链接
	$('.detail-message div.dm-item').live('mouseenter', function(){
		$(this).addClass('dm-item-hover').find('>a').show();
	}).live('mouseleave', function(){
		$(this).removeClass('dm-item-hover').find('>a').hide();
	});

	//移出用户组
	$('span.del-group').live('click', function(){
		var a = $(this).parent(), div = a.closest('div'), dd = div.closest('dd'), mdc = div.closest('[contactType]')
		var id = mdc.attr('pkId'), tp = mdc.attr('contactType'), gid = a.attr('gid');
		$.post('/sns/contactMgt!deleteMemberFromFriendGrp.jhtml?_=' + (new Date()).getTime(), {grpId: gid, outerId: id, contactType: tp}, function(){
			div.remove();
			//移出组的后续
			var gs = [];
			dd.find('>div a').each(function(){
				gs.push($(this).attr('gid'));
			});
			contact.friendSelect('changeMember', id, contactTypeS[tp], {g: gs.join(',')});
			var span = $('li[fsfilter="group"] ul[fs="fsFilterList"] a[group="' + gid + '"] span.quiet');
			span.text('(' + (parseInt(span.text().replace(/[\(\)]/, ''), 10) - 1) + ')');
		});
		return false;
	});
	
	//点击用户组
	$('a.wd-topic').live('click', function(){
		var gid = $(this).attr('gid');
		var ga = $('li[fsfilter="group"]>a');
		if( ! ga.hasClass('current') ) ga.trigger('click');
		$('li[fsfilter="group"] ul[fs="fsFilterList"] a[group="' + gid + '"]').trigger('click');
		return false;
	});

	//更新详情
	updateDetail();

	//删除详情
	deleteDetail();
	
	//修改导入设置
	$('#popModiImport .button').click(function(){
		var v = $('#popModiImport :checkbox')[0].checked;
		$.get('/sns/contactMgt!updateAutoSocialContact.jhtml?autoSocialContact=' + v);
		$('#popModiImport').popupWin('close');
	});
	$('[ct="modiImport"]').click(function(){
		$('#popModiImport').popupWin({
			width: 450,
			title: $('#popModiImport').attr('popTitle'),
			closeDestroy: false,
			reserve: true
		});
		return false;
	});
	
	//显示新手向导
	$('#popGuide').each(function(){
		var pop = $($(this).html()), tm = null;
		pop.popupLayer({
			modal: true,
			overlay: 0.25,
			width: 789,
			reserve: false,
			closeDestroy: true,
			clickClose: false,
			open: function(event, ui){
				var guide = pop.find('div[ct^=guide]');
				var swa = pop.find('.ct-guide-sw a');
				var sw = pop.find('a[ct="guideSW"]');
				function showGuide2(){
					guide.filter(':first').hide('fade', 250, function(){
						swa.removeClass('ct-guide-sw1-sel ct-guide-sw2-sel');
						swa.filter(':last').addClass('ct-guide-sw2-sel');
						sw.filter('.ct-guide-prev').show();
						sw.filter('.ct-guide-next').hide();
						guide.filter(':last').show('fade', 250);
					});
				}
				function showGuide1(){
					guide.filter(':last').hide('fade', 250, function(){
						swa.removeClass('ct-guide-sw1-sel ct-guide-sw2-sel');
						swa.filter(':first').addClass('ct-guide-sw1-sel');
						sw.filter('.ct-guide-prev').hide();
						sw.filter('.ct-guide-next').show();
						guide.filter(':first').show('fade', 250);
					});
				}
				swa.click(function(){
					var a = $(this);
					if( a.hasClass('ct-guide-sw1-sel, ct-guide-sw2-sel') ) return false;
					if( a.hasClass('ct-guide-sw1') ){
						showGuide1();
					} else {
						showGuide2();
					}
					return false;
				});
				sw.click(function(){
					var a = $(this);
					if( a.hasClass('ct-guide-next') ){
						showGuide2();
					} else {
						showGuide1();
					}
					return false;
				});
			}
		});
	});
});

//显示右侧面板
function showUshiInvite(){
	$('#rightInviteCont > div').hide();
	$('#ushiInvite').show().find('[fs="fsInviteCont"]').append($('#baseInvite'));
	$('[fs="fsBaseInviteTitle"]', '#baseInvite').show();
	$('[fs="fsTabInviteType"] :radio:first').trigger('click');
}
function showSinaInvite(){
	$('#rightInviteCont > div').hide();
	$('#sinaInvite').show();
}


// ** 显示联系人详情 ****
function showDetail(data, li){
	var contact = $('#contactContainer'), mdc = $('#memberDetail');
	mdc.empty().show().append(data);

	var id = li.attr('d'), tp = contactType[li.attr('tp')], member = contact.friendSelect('getMember', id, contactTypeS[tp]);
	mdc.find(':hidden[name=contactType]').val(tp);
	mdc.find(':hidden[name=pkId]').val(id);
	mdc.find('.contact-detail').attr('pkId', id);

	//分配群组
	mdc.find('a.add-group').bind('click', function(){
		var html = '<div id="menuGroupList" style="display:none;"><ul class="dp-menulist">';
		for( var i = 0; i < window.fsData['0'].filter.group.length; i++ ){
			var o = window.fsData['0'].filter.group[i];
			if( o.d != 0 ) html += '<li><a href="#" gid="' + o.d + '">' + o.n + '</a></li>';
		}
		html += '<li><a href="#" gid="-1" class="blue">' + lang.contact.group_add + '</a></li></ul></div>';
		var a = $(this), menu = $(html), pos = $(this).offset();
		a.closest('dd').find('a[gid]').each(function(){
			menu.find('a[gid=' + $(this).attr('gid') + ']').parent().remove();
		});
		if( menu.find('li').length == 0 ){
			pop_alert(lang.contact.add_group_err1);
			return false;	
		}
		function distributeGroup(gid, gn){
			$.post('/sns/contactMgt!addContactsToGroup.jhtml?_=' + (new Date()).getTime(), {grpId: gid, contactIdAndTypes: tp + '_' + id}, function(){
				a.before('<div class="wd-topic-outer middle"><a class="wd-topic" href="javascript:;" gid="' + gid + '">' + gn + '<span class="del-group"></span></a></div>\n');
				//分配组的后续
				var gs = [];
				a.closest('dd').find('>div a').each(function(){
					gs.push($(this).attr('gid'));
				});
				contact.friendSelect('changeMember', id, contactTypeS[tp], {g: gs.join(',')});
				var span = $('li[fsfilter="group"] ul[fs="fsFilterList"] a[group="' + gid + '"] span.quiet');
				span.text('(' + (parseInt(span.text().replace(/[\(\)]/, ''), 10) + 1) + ')');
			});
		}
		menu.popupLayer({
			popupClass: 'dp-menu',
			width: 120,
			modal: true,
			overlay: 0,
			clickClose: true,
			reserve: false,
			position: [pos.left - 1, pos.top + 18],
			open: function(){
				var cont = $(this);
				cont.find('a').click(function(){
					var gid = $(this).attr('gid'), gn = $(this).text();
					menu.popupLayer('close');
					if( gid == '-1' ){
						addGroup(function(g){
							distributeGroup(g.d, g.n);
						});
					} else {
						distributeGroup(gid, gn);
					}
					return false;
				});
			}
		});
		return false;
	});

	//添加详情
	addDetail(mdc);

	//取消编辑详情
	mdc.find('[ct=dmEdit]').each(function(){
		var de = $(this), link = de.find('>a'), ec = de.find('[ct^=dmEdit]'), cc = de.find('[ct="dmEditCancel"]');
		link.click(function(){
			link.hide();
			ec.show();
			ec.find(':text, select')[0].focus();
			return false;
		});
		cc.click(function(){
			link.show();
			ec.hide();
			ec.find('[vdErr]').hide();
			var dl = de.closest('dl');
			if( dl.attr('exp') ){
				setTimeout(function(){
					if( dl.find('dd>p.dm-item:visible, dd>div.clearfix:visible').length == 0 ){
						dl.hide();
						if( mdc.find('dl[exp]:hidden').length > 0 ){
							mdc.find('[dm="addMore"]').show();
						}
					}
				}, 0);
			}
			return false;
		});
	});
	
	//更新备注
	mdc.find('[name="contactProfile.notes"]').focus(function(){
		$(this).parent().next().show();
	});
	mdc.find('[name="contactProfile.notes"]').blur(function(){
		var save = $(this).parent().next();
		setTimeout(function(){
			save.hide();
		}, 200);
	});
	mdc.find('form[ct="dmEditNote"]').ajaxForm({
		cache: false
	});
	
	//发直邮
	mdc.find('a[dm="sendMail"]').click(send_mail_fn);
	
	//编辑本地人姓名
	mdc.find('[dm="dmEditName"]').each(function(){
		var form = $(this), cont = form.prev(), a = cont.find('a');
		a.click(function(){
			form.show();
			form.find(':text').val(cont.find('b:first').text());
			cont.hide();
			return false;
		});
		form.find('a[ct="dmEditCancel"]').click(function(){
			form.hide();
			cont.show();
			return false;
		});
		form.ajaxForm({
			validate: true,
			ajaxOptions: {
				cache: false,
				success: function(){
					var nm = $.trim(form.find(':text').val());
					cont.find('b:first').text(nm);
					contact.friendSelect('changeMember', id, contactTypeS[tp], {n: nm});
					form.hide();
					cont.show();
				}
			}
		});
	});
	
	//编辑城市
	mdc.find('[dm="dmEditCity"]').each(function(){
		var form = $(this), dd = form.parent(), cont = dd.find('>div'), add = dd.find('>a'), edit = cont.find('a');
		add.click(function(){
			form.show();
			form.find(':text').val(cont.find('b:first').text());
			add.hide();
			return false;
		});
		edit.click(function(){
			form.show();
			form.find(':text').val(cont.find('b:first').text());
			cont.hide();
			return false;
		});
		form.find('a[ct="dmEditCancel"]').click(function(){
			form.hide();
			if( dd.find('>a').length ){
				add.show();
			} else {
				cont.show();
			}
			return false;
		});
		form.ajaxForm({
			validate: true,
			ajaxOptions: {
				cache: false,
				success: function(){
					var arr = [];
					form.find('select').each(function(){
						arr.push($('option:selected', this).text());
					});
					cont.show().find('span').text(arr.join(' - '));
					form.find('.selectCountry').trigger('change');
					form.hide();
					add.remove();
				}
			}
		});
		selectCity(form.find('.selectCountry'), form.find('.selectRegion'), form.find('.selectCity'));
		form.find('.selectCountry').trigger('change');
	});
	
	//邀请本地人
	mdc.find('[inviteLocal]').click(function(){
		$.get('/sns/contactMgt!inviteLocal.jhtml?cpId=' + $(this).attr('inviteLocal'), function(data){
			var msg = ['', lang.contact.invite_msg1, lang.contact.invite_msg2, lang.contact.invite_msg3];
			pop_alert(msg[parseInt(data)]);
		});
		return false;
	});
	//邀请新浪人
	mdc.find('[inviteSina]').click(function(){
		var cpid = $(this).attr('inviteSina');
		var nm = $('#sinaBaseCont dt[dm="sinaName"]').text();
		var pop = $($('#popInviteSina').html().replace('XXX', nm));
		pop.popupWin({
			width: 460,
			title: $('#popInviteSina').attr('popTitle'),
			closeDestroy: true,
			reserve: false,
			open: function(){
				var text = pop.find('textarea[maxlength]');
				text.val('@' + nm + ' ' + text.val()).checkFieldLength();
				pop.find(':button').click(function(){
					var cont = $.trim(pop.find('textarea').val());
					if( cont == '' ){
						pop_alert(lang.contact.invite_wb_err);
						return false;
					}
					$.post('/sns/contactMgt!inviteSocial.jhtml?cpId=' + cpid, {content: cont}, function(data){
						pop.popupWin('close');
						pop_alert(lang.contact.invite_wb_suc);
					});
					return false;
				});
			}
		});
		return false;
	});
	
	//更多选项菜单
	var tmPMA = null;
	function closePopMoreAction(menu){
		tmPMA = null;
		menu = menu || $('#popMoreAction');
		if( menu && menu.length ){
			menu.popupLayer('close');
		}
	}
	mdc.find('[moreAction]').bind('mouseleave', function(){
		tmPMA = setTimeout(function(){
			closePopMoreAction();
		}, 200);
		return false;
	});
	mdc.find('[moreAction]').bind('mouseenter', function(){
		var a = $(this), pos = a.offset();
		var html = $('#' + a.attr('moreAction')).html();
		var menu = $(html.replace(/#d#/g, a.attr('uid')).replace(/#n#/g, a.attr('un')).replace(/#tp#/g, member.tp));
		menu.attr('id', 'popMoreAction');
		menu.popupLayer({
			popupClass: 'dp-menu',
			width: 120,
			clickClose: true,
			closeDestroy: true,
			reserve: false,
			position: [pos.left - 1, pos.top + 20],
			open: function(){
				menu.bind('mouseenter', function(){
					if( tmPMA != null ){
						clearTimeout(tmPMA);
						tmPMA = null;
					}
				});
				menu.bind('mouseleave', function(){
					closePopMoreAction(menu);
				});
			}
		});
		return false;
	});
	
	//上传照片
	mdc.find('[dm="uploadImage"]').click(function(){
		var pop = $($('#uploadImage').html());
		pop.find('[name=contactType]').val(tp);
		pop.find('[name=pkId]').val(id);
		pop.find(':file').attr('id', 'uploadAvatar');
		pop.popupWin({
			width: 400,
			title: $('#uploadImage').attr('popTitle'),
			closeDestroy: true,
			reserve: false,
			open: function(){
				pop.find('.button').click(function(){
					$.ajaxFileUpload({
						fileElementId: 'uploadAvatar',
						secureuri: false,
						dataType: 'text',
						url: pop.attr('action'),
						success: function(data, status){
							data = data.toString();
							if( data == '1' ){
								pop_alert(lang.contact.upimage_oversize);
							} else if( data == '2' ){
								pop_alert(lang.contact.upimage_nojpg);
							} else if( data == '3' ){
								pop_alert(lang.contact.upimage_empty);
							} else {
								pop.popupWin('close');
								contact.friendSelect('changeMember', id, contactTypeS[tp], {m: data});
								mdc.find('div.avatar img').attr('src', data);
							}
							return false;	
						}
					});
				});
			}
		});
		return false;
	});
}

//添加详情
function addDetail(mdc){
	var addDetailParam = {
		validate: {
			validateAjax: true,
			extTools: {"isCardEmail": checkCardEmail, "isCardPhone": checkCardPhone}
		},
		ajaxOptions: {
			cache: false,
			success: function(data){
				var form = $(this), de = form.parent();
				var div = form.next('div').clone().removeClass('hide').attr('rid', data);
				div.insertBefore(de)
				form.find(':text').each(function(i){
					div.find('span:eq(' + i + ')').text($(this).val());
				});
				form.find('select').each(function(i){
					div.attr($(this).attr('name'), $(this).val());
					div.find('i.quiet:eq(' + i + ')').text('(' + $('option:selected', this).text() + ')');
				});
				form.find(':text').val('');
				form.find('select').children('option:first').attr('selected', true);
				form.find('[vdErr]').hide();
				var a = de.find('>a'), cnt = parseInt(a.attr('add') || 0, 10) + 1;
				a.attr('add', cnt);
				if( parseInt(a.attr('count')) <= cnt ){
					a.hide();
				} else {
					a.show();
				}
				form.hide();
			}
		}
	}
	var updateDetailParam = {
		bindSubmit: function(){
			var t = $(':text', this);
			t.val($.trim(t.val()));
		},
		validate: true,
		ajaxOptions: {
			cache: false,
			success: function(data){
				var form = $(this), de = form.parent();
				var div = de.prev('div');
				de.find('>a').show();
				form.hide();
				if( form.find(':text').val() == '' ){
					div.hide();
					de.show();
				} else {
					div.find('span[dm=detail]').text(form.find(':text').val());
					div.show();
					de.hide();
					form.find(':text').val('');
				}
			}
		}
	}
	mdc.find('form[ct="dmEditEmail"]').ajaxForm(addDetailParam);
	mdc.find('form[ct="dmEditPhone"]').ajaxForm(addDetailParam);
	mdc.find('form[ct="dmEditCareer"]').ajaxForm(addDetailParam);
	mdc.find('form[ct="dmEditIM"]').ajaxForm(addDetailParam);
	mdc.find('form[ct="dmEditWeibo"]').ajaxForm(addDetailParam);

	mdc.find('form[ct="dmEditAddr"]').ajaxForm(updateDetailParam);
	mdc.find('form[ct="dmEditCode"]').ajaxForm(updateDetailParam);
	mdc.find('form[ct="dmEditFax"]').ajaxForm(updateDetailParam);

	mdc.find('form[ct="dmEditBirthday"]').ajaxForm({
		validate: true,
		ajaxOptions: {
			cache: false,
			success: function(data){
				var form = $(this), de = form.parent();
				var div = de.prev('div').show(), bd = [];
				form.find('select').each(function(){
					bd.push($(this).val());
				});
				div.find('span:first').text(bd.join('-'));
				form.find('select').children('option:first').attr('selected', true);
				de.find('>a').show();
				form.hide();
				de.hide();
			}
		}
	});
	
	//绑定autocomplete公司
	mdc.find('[name="companyName"]').autocomplete({
		url: '/ajax/json!listCompanies.jhtml',
		ajax: 'companies',
		selected: function(event, li){
			$(this).val(li.text());
		}
	});
	
	//隐藏未添加
	mdc.find('dl[exp]').each(function(){
		var dl = $(this);
		if( dl.find('dd>p.dm-item:visible, dd>div.clearfix:visible').length == 0 ){
			dl.hide();
		}
	});
	if( mdc.find('dl[exp]:hidden').length ){
		mdc.find('[dm="addMore"]').show().find('a').click(function(){
			var a = $(this), pos = a.offset(), hdl = mdc.find('dl[exp]:hidden'), html = '<ul class="dp-menulist">';
			hdl.each(function(){
				html += '<li><a href="#" dm="' + $(this).attr('dm') + '">' + $(this).attr('exp') + '</a></li>';
			});
			html += '</ul>';
			var menu = $(html);
			menu.attr('id', 'popAddMore');
			menu.popupLayer({
				popupClass: 'dp-menu',
				width: 100,
				modal: true,
				overlay: 0,
				clickClose: true,
				closeDestroy: true,
				reserve: false,
				position: [pos.left - 2, pos.top + 16],
				open: function(){
					var cont = $(this);
					cont.find('a').click(function(){
						var dm = $(this).attr('dm');
						menu.popupLayer('close');
						var dl = mdc.find('dl[dm=' + dm + ']');
						dl.show();
						dl.find('[ct="dmEdit"]>a').trigger('click');
						if( mdc.find('dl[exp]:hidden').length == 0 ){
							mdc.find('[dm="addMore"]').hide();
						}
						return false;
					});
				}
			});
			return false;
		});
	}
}

//更新详情
function updateDetail(){
	function initEdit(dm, a, div, form, type){
		function editCareer(){
			form.find('input:hidden').remove();
			var rid = div.attr('rid');
			form.append('<input type="hidden" name="id" value="' + rid + '" />');
			form.find('input[name="email"], input[name="phoneNumber"]').each(function(){
				if( $(this).attr('vdOpt') ) $(this).attr('vdOpt', $(this).attr('vdOpt').replace('?id=0', '?id=' + rid));				
			});
			form.find(':text').each(function(i){
				$(this).val(div.find('span:eq(' + i + ')').text());
			});
			form.find('select').each(function(){
				$(this).val(div.attr($(this).attr('name')));
			});
			form.find(':text, select')[0].focus();
			form.ajaxForm({
				validate: {
					validateAjax: true,
					extTools: {"isCardEmail": checkCardEmail, "isCardPhone": checkCardPhone}
				},
				ajaxOptions: {
					cache: false,
					success: function(data){
						var form = $(this), div = form.parent();
						div.find('>div').show();
						form.find(':text').each(function(i){
							div.find('span:eq(' + i + ')').text($(this).val());
						});
						form.find('select').each(function(i){
							div.attr($(this).attr('name'), $(this).val());
							div.find('i.quiet:eq(' + i + ')').text('(' + $('option:selected', this).text() + ')');
						});
						form.remove();
					}
				}
			});
		}
		function editAddr(){
			form.find(':text').val(div.find('span[dm=detail]').text());
			form.find(':text:first').focus();
			form.ajaxForm({
				validate: true,
				ajaxOptions: {
					cache: false,
					success: function(data){
						var form = $(this), de = div.next();
						de.find('>a').show().end().find('>form').hide();
						div.find('>div').show();
						if( form.find(':text').val() == '' ){
							div.hide();
							de.show();
						} else {
							div.find('span[dm=detail]').text(form.find(':text').val());
							div.show();
							de.hide();
						}
						form.remove();
					}
				}
			});
		}

		switch(dm){
		case 'Email':
		case 'Phone':
		case 'Career':
		case 'IM':
		case 'Weibo':
			editCareer();
			break;
		case 'Addr':
		case 'Postcode':
		case 'Fax':
			editAddr();
			break;
		case 'Birthday':
			var bd = div.find('span:first').text().split(' ')[0].split('-');
			form.find('select').each(function(i){
				$(this).val(parseInt(bd[i], 10));
			});
			form.find('select:first').focus();
			form.ajaxForm({
				validate: true,
				ajaxOptions: {
					cache: false,
					success: function(data){
						div.find('>div').show();
						bd = [];
						form.find('select').each(function(){
							bd.push($(this).val());
						});
						div.find('span:first').text(bd.join('-'));
						form.remove();
					}
				}
			});
			break;
		}
	}
	$('.detail-message .update').live('click', function(){
		var a = $(this), div = a.closest('div.clearfix'), dm = div.closest('dl').attr('dm'), form = div.parent().find('[ct="dmEdit"] form').clone();
		var type = a.closest('div[contactType]').attr('contactType');
		div.append(form.show()).find('>div').hide();
		form.find('[ct="dmEditCancel"]').click(function(){
			div.find('>div').show();
			form.remove();
			return false;
		});
		form.attr('action', '/sns/contactMgt!update' + dm + '.jhtml').find(':submit').val(lang.common.save);
		initEdit(dm, a, div, form, type);
		setTimeout(function(){
			form.find('[name="companyName"]').autocomplete({
				url: '/ajax/json!listCompanies.jhtml',
				ajax: 'companies',
				selected: function(event, li){
					$(this).val(li.text());
				}
			});
		}, 50);
		return false;
	});
}

//删除详情
function deleteDetail(){
	$('.detail-message .delete').live('click', function(){
		var a = $(this), div = a.closest('div.clearfix'), dm = div.closest('dl').attr('dm');
		pop_confirm(null, lang.contact.delete_msg, function(){
			if( ('|Addr|Postcode|Fax|').indexOf(dm) > 0 ){
				var mdc = div.closest('[contactType]');
				var param = {contactType: mdc.attr('contactType'), pkId: mdc.attr('pkId')};
				param[dm.toLowerCase().replace('code', 'Code')] = '';
				$.post('/sns/contactMgt!update' + dm + '.jhtml', param, function(){
					div.hide();
					div.next().show().find('>a').show();
				});
			} else {
				$.get('/sns/contactMgt!delete' + dm + '.jhtml?id=' + div.attr('rid'), function(){
					div.siblings('[ct="dmEdit"]').show().find('>a').show();
					div.remove();
				});
			}
		});
		return false;
	});
}
// ** 联系人详情 ****

function editGroupName(g){
	var id = g.attr('group'), gn = g.find('[fs=gn]'), name = $.trim(gn.text());
	var pop = $($('#popEditGroup').html());
	var buttons = {};
	buttons[lang.common.confirm] = function(){
		var ngn = $.trim($('[fs="editGroupName"]', this).val());
		if( ngn == '' ){
			pop_alert(lang.connections.nameerror);
			return false;
		}
		$.post('/sns/sns!updateSNSGroup.jhtml?snsGroupId=' + id, {groupName: ngn}, function(data) {
			if( data == '' ) {
				gn.text(ngn);
				pop.popupWin('destroy');
			} else {
				pop_alert(lang.connections.duplicatedname);
			}
		});
	};
	buttons[lang.common.cancel] = function(){
		pop.popupWin('destroy');
	};
	pop.popupWin({
		title: lang.connections.changename + name,
		buttons: buttons,
		width: 360,
		closeDestroy: true,
		reserve: false,
		open: function(){
			pop.find('[fs="editGroupName"]').val(name).focus();
		}
	});
}
function delGroup(g){
	var id = g.attr('group'), gn = g.find('[fs=gn]'), name = $.trim(gn.text());
	pop_confirm(lang.common.prompt,
		lang.connections.delete_group(name),
		function(pop){
			$.post('/sns/contactMgt!deleteGroup.jhtml?grpId=' + id, function() {
//				$(pop).popupWin('destroy');
//				if( g.hasClass('current') ){
//					$('[fsNavi="ushi"] a').trigger('click');
//				}
//				g.parent().remove();
				location.reload(true);
			});
			return false;
 		}
 	);
}
function addGroup(callback){
	var pop = $($('#popEditGroup').html());
	var buttons = {};
	buttons[lang.connections.create] = function(){
		var ngn = $.trim($('[fs="editGroupName"]', this).val());
		if( ngn == '' ){
			pop_alert(lang.connections.nameerror);
			return false;
		}
		$.post('/sns/sns!addSNSGroup.jhtml?_=' + (new Date()).getTime(), {groupName: ngn}, function(data) {
			var groupId = parseInt(data);
			if( isNaN(groupId) ){
				pop_alert(lang.connections.duplicatedname);
			} else {
				pop.popupWin('close');
				var g = {d: groupId, n: ngn, c: 0};
				var ul = $('[fsFilter="group"] ul.ct-navi-list');
				ul.append('<li><a href="#" group="' + g.d + '"><span class="btn-next ct-group-edit"></span><span fs="gn">' + g.n + '</span> <span class="quiet">(0)</span></li>');
				window.fsData['0'].filter.group.push(g);
				if( $.isFunction(callback) ) callback(g);
			}
		});
	};
	buttons[lang.common.cancel] = function(){
		pop.popupWin('close');
	};

	pop.popupWin({
		title: lang.connections.creategroup,
		buttons: buttons,
		width: 360,
		closeDestroy: true,
		reserve: false,
		open: function(){
			pop.find('[fs="editGroupName"]').focus();
 		}
 	});
}
function addGroupMembers(g, list){
	var pop = $('<div id="friend-selector" class="contact-container" style="display:none;" />').appendTo('body');
	pop.popupWin({
		popupClass: 'ushi-popup-friendselect',
		title: g.n,
		reserve: false,
		closeDestroy: true,
		width: 826,
		open: function(){
			$(this).friendSelect({
				url: mUrl,
				selectedUsers: $.isArray(list) ? list : null,
				onOK: function(event, selectedUsers){
					var pIds = '';
					for( var i in selectedUsers ){
						var o = selectedUsers[i];
						pIds += contactType[o.tp] + '_' + o.d + ',';
					}
					$.post('/sns/contactMgt!addContactsExceptOtherToGroup.jhtml', {grpId: g.d, contactIdAndTypes: pIds}, function(){
						location.reload(true);
					});
				}
			});
		},
		beforeClose: function(){
			$(this).friendSelect('destroy');
		}
	});
}

//删除联系人
function deleteSns(userid, username, tp) {
	var menu = $('#popMoreAction');
	if( menu.length ){
		menu.popupLayer('close');
	}
	pop_confirm(
		null,
		lang.connections.delete_friend(username),
		function() {
			$.get("/sns/sns!removeFriend.jhtml?friendId=" + userid, function() {
				//location.reload(true);
				$('#contactContainer').friendSelect('deleteMember', userid, tp);
				$('li#' + tp + '_' + userid).remove();
				var span = $('li[fsNavi=' + tp + '] span');
				span.text('(' + (parseInt(span.text().replace(/[\(\)]/, ''), 10) - 1) + ')');
				var detail = $('#memberDetail');
				if( detail.is(':visible') ){
					showUshiInvite();
				}
			});
		}
	);
	return false;
}

//显示ajax操作成功提示
function showSuccessTips(msg){
	var tips = $('<div class="large">' + msg + '</div>');
	tips.popupTips({
		width: 250,
		tipsType: 3,
		arrow: 'bottom',
		reserve: false,
		closeDestroy: true,
		minTop: 1,
		position: ['center', 'center'],
		open: function(event, ui){
			setTimeout(function(){
				tips.popupTips('close');
			}, 1000);
		}
	});
}

//撰写评价
function writeEvaluation(rid, rn){
	var menu = $('#popMoreAction');
	if( menu.length ){
		menu.popupLayer('close');
	}
	var pop = $('<div>' + $('#selectRightEndorse').html() + '</div>');
	pop.popupWin({
		width: 500,
		closeDestroy: true,
		reserve: false,
		title: lang.endorse.write_title(rn),
		open: function(){
			pop.find('.layerSubmit').click(function() {
				pop.popupWin('destroy');

				var cid = pop.find('input[name="categoryType"]:checked').val();
				var surl = '/endorse/write!toWriteEndorse.jhtml?categoryId=' + cid;
				surl += '&receiverId=' + rid;
				
				var expeId = 0;
				var userId = rid;
				$.post('/endorse/write!checkCanWriteInViewPage.jhtml?_=' + (new Date()).getTime(), {'categoryId':cid,'experienceId':expeId,'receiverId':userId} , function(data){
					if(data.indexOf('1') != -1){
						pop_alert(lang.endorse.err_hasendorse(rn));
						return false;
					} else if(data.indexOf('2') != -1) {
						window.location.href = surl;
					} else if(data.indexOf('3') != -1) {
						pop_alert(lang.endorse.err_noexp(rn));
						return false;
					}
				});
			});
		}
	});
}

//介绍朋友
function openRecommend(rid, rn){
	var menu = $('#popMoreAction');
	if( menu.length ){
		menu.popupLayer('close');
	}
	var pop = $($('#recommendFriend').html());
	pop.popupWin({
		width: 532,
		closeDestroy: true,
		reserve: false,
		title: lang.contact.recommend_friend_to + rn,
		open: function(){
			pop.find('[rec=rn]').text(rn);
			pop.find('textarea[maxlength]').checkFieldLength();
			var fsl = pop.find('[rec="friendSelectList"]');
			fsl.friendSelectList({
				url: '/sns/sns!getSNSRecommendFriendList.jhtml?friendId=' + rid,
				idField: pop.find('[rec="recommFriendId"]'),
				inviteMax: 5,
				listMax: 10,
				fsParam: {
					prompt: lang.friend.fs_max_info(5),
					width: 826
				}
			});
			pop.find('.button').click(function(){
				var _btn=$(this);
				var uid = pop.find('[rec=recommFriendId]').val(),
					msg = $.trim(pop.find('[rec=recommMsg]').val());
				if( uid == '' ){
					pop_alert(lang.contact.friend_empty);
				} else if( msg == '' ){
					pop_alert(lang.contact.content_empty);
				} else if( msg.length > 300 ){
					pop_alert(lang.contact.content_toolong);
				} else {
					_btn.attr('disabled',true);
					$.post('/sns/sns!recommendFriends.jhtml?targetUserId=' + rid, {'ids': uid, 'content': msg}, function(data){
						pop.popupWin('close');
						pop_alert(lang.contact.recommend_suc);
					}); 
				}
			});
		}
	});	
}

function checkCardEmail(str, opt){
	var result = opt['tools']['isEmail'](str);
	if( result == true ){
		$.ajax({
			url: opt['url'],
			type: 'POST',
			dataType: 'text',
			data: {'email': str},
			success: function(data) {
				data = parseInt(data, 10);
				if( data == 0 ){
					opt['field'].trigger('Validate', [true, 'suc']);
				} else {
					opt['field'].trigger('Validate', [-1, 'err']);
					if( data > 0 ){
						pop_alert(lang.contact.email_exist1);
					} else {
						pop_alert(lang.contact.email_exist);
					}
				}
			}
		});
		return -2;
	} else {
		return false;
	}
}
function checkCardPhone(str, opt){
	var result = opt['tools']['isPhone'](str);
	if( result == true ){
		if( opt.field.prev('select').val() == '1' ){
			$.ajax({
				url: opt['url'],
				type: 'POST',
				dataType: 'text',
				data: {'phoneNumber': str},
				success: function(data) {
					data = parseInt(data, 10);
					if( data == 0 ){
						opt['field'].trigger('Validate', [true, 'suc']);
					} else {
						opt['field'].trigger('Validate', [-1, 'err']);
						if( data > 0 ){
							pop_alert(lang.contact.phone_exist1);
						} else {
							pop_alert(lang.contact.phone_exist);
						}
					}
				}
			});
			return -2;
		} else {
			opt.field.attr('vdAjaxField', 'true');
			return true;
		}
	} else {
		return false;
	}
}

//添加名片联系人验证
function checkAddCardEmail(str, opt){
	var result = opt['tools']['isEmail'](str), msg = opt['parent'].find('[vdErr]');
	if( result == true ){
		$.ajax({
			url: opt['url'],
			type: 'POST',
			dataType: 'text',
			data: {'email': str},
			success: function(data) {
				data = parseInt(data, 10);
				if( data == 3 ){
					opt['field'].trigger('Validate', [true, 'suc']);
				} else if( data == 2 ){
					if( opt['field'].attr('merge') == 'true' ){
						opt['field'].trigger('Validate', [true, 'suc']);
					} else {
						showAddCardConfirm(opt['field'], function(){
							opt['field'].trigger('Validate', [true, 'suc']);
						}, function(){
							opt['field'].trigger('Validate', [-1, 'err']);
						});
					}
				} else {
					msg.find('[js=tips1]').hide();
					msg.find('[js=tips2]').show();
					opt['field'].trigger('Validate', [false, 'err']);
				}
			}
		});
		return -2;
	} else {
		msg.find('[js=tips2]').hide();
		msg.find('[js=tips1]').show();
		return false;
	}
}
function checkAddCardPhone(str, opt){
	var result = opt['tools']['isPhone'](str), msg = opt['parent'].find('[vdErr]');
	if( result == true ){
		if( opt.field.prev('select').val() == '1' ){
			$.ajax({
				url: opt['url'],
				type: 'POST',
				dataType: 'text',
				data: {'phoneNumber': str},
				success: function(data) {
					data = parseInt(data, 10);
					if( data == 3 ){
						opt['field'].trigger('Validate', [true, 'suc']);
					} else if( data == 2 ){
						if( opt['field'].attr('merge') == 'true' ){
							opt['field'].trigger('Validate', [true, 'suc']);
						} else {
							showAddCardConfirm(opt['field'], function(){
								opt['field'].trigger('Validate', [true, 'suc']);
							}, function(){
								opt['field'].trigger('Validate', [-1, 'err']);
							});
						}
					} else {
						msg.find('[js=tips1]').hide();
						msg.find('[js=tips2]').show();
						opt['field'].trigger('Validate', [false, 'err']);
					}
				}
			});
			return -2;
		} else {
			opt.field.attr('vdAjaxField', 'true');
			return true;
		}
	} else {
		msg.find('[js=tips2]').hide();
		msg.find('[js=tips1]').show();
		return false;
	}
}
function showAddCardConfirm(field, callyes, callno){
	var pop = $('#popAddCardConfirm'), form = field.closest('form');
	if( pop.length > 0 ) {
		callyes();
		return;
	}
	pop = $('<div id="popAddCardConfirm" style="padding:10px 15px;">' + $('#tempAddCardConfirm').html() + '</div>');
	pop.popupWin({
		width: 500,
		title: lang.common.prompt,
		closeDestroy: true,
		reserve: false,
		open: function(event, ui){
			ui.find('.fl-title .close').remove();
			pop.find('[js="closePopup"]').click(function(){
				callno();
			});
			pop.find('[js="yes"]').click(function(){
				callyes();
				form.find('input[merge]').attr('merge', 'true');
				if( form.data('validateEnd') == true ){
					setTimeout(function(){
						form.submit();
					}, 500);
				}
				pop.popupWin('close');
			});
		}
	});
}