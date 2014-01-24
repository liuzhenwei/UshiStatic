//friendSelect 组件
//窗口版
var _FS_default = {};
$(function(){
	_FS_default.lang = {
		all: lang.friend.fs_all,
		city: lang.friend.fs_city,
		industry: lang.friend.fs_industry,
		selectAll: lang.friend.fs_selectAll,
		deleteAll: lang.friend.fs_deleteAll,
		selected: lang.friend.fs_selected,
		ok: lang.common.confirm,
		cancel: lang.common.cancel,
		filter: lang.friend.fs_filter,
		poptitle: lang.friend.fs_poptitle,
		notfound: lang.friend.fs_notfound,
		filtertitle: lang.friend.fs_filtertitle,
		filternotfound: lang.friend.fs_filternotfound,
		max_info: lang.friend.fs_max_info,
		select_info: lang.friend.fs_select_info,
		naviUshi: lang.friend.navi_ushi,
		naviCard: '名片联系人',
		naviSina: lang.friend.navi_sina,
		naviLocal: lang.friend.navi_local,
		naviGroup: lang.friend.navi_group,
		naviCity: lang.friend.navi_city,
		naviIndustry: lang.friend.navi_industry,
		keyTips: lang.friend.key_tips,
		listEmpty: lang.friend.list_empty
	}
});

;(function($) {
$.widget('ushi.friendSelect', {
	options: {
		friendSelectClass: 'ushi-friendSelect',
		filterURL: '/sns/contactMgt!getContactGrpCityIndustryListByUserId.jhtml',
		inited: false,
		selectedUsers: null,
		selectedCount: 0,
		cache: true,
		inviteMax: -1,
		enableMin: true,
		width: 826,
		popupWin: true,
		showListMax: 100,
		initMember: ['ushi', 'card', 'sina', 'local'],
		template: '<div class="contact-left">' +
			'<ul class="contact-navi">' +
			'<li fsNavi="ushi" class="ct-navi-type"><a href="#">{naviUshi}<span class="quiet"></span></a></li>' +
			'<li fsNavi="card" class="ct-navi-type" style="display:none;"><a href="#">{naviCard}<span class="quiet"></span></a> </li>' +
			'<li fsNavi="sina" class="ct-navi-type" style="display:none;"><a href="#">{naviSina}<span class="quiet"></span></a> </li>' +
			'<li fsNavi="local" class="ct-navi-type" style="display:none;"><a href="#">{naviLocal}<span class="quiet"></span></a></li>' +
			'<li fsFilter="group" class="ct-navi-line"><a href="#">{naviGroup}</a><ul fs="fsFilterList" class="ct-navi-list" style="display:none;"></ul></li>' +
			'<li fsFilter="city"><a href="#">{naviCity}</a><ul fs="fsFilterList" class="ct-navi-list" style="display:none;"></ul></li>' +
			'<li fsFilter="industry"><a href="#">{naviIndustry}</a><ul fs="fsFilterList" class="ct-navi-list" style="display:none;"></ul></li>' +
			'</ul>' +
			'</div>' +
			'<div class="fsListArea yourmember-box">' +
			'<div class="yourmember-box-content">' +
			'<div class="yourmember-search clearfix"><input name="fsFilter" fs="fsKeyword" type="text" defaultTips="{keyTips}" value="{keyTips}" oldKey="" />' +
			'<a href="javascript:;" class="contact-search-empty" fs="keywordEmpty" style="display:none;"></a></div>' +
			'<div class="ctl-member-ul"><ul fs="fsFriendsList"></ul></div>' +
			'</div>' +
			'</div>' +
			'<div class="fsSelectedArea">' +
			'<h3><span class="fsSelectedCounts"></span><span class="fsPrompt select-shop"></span></h3>' +
			'<div class="selected-box"><div class="fsSelectedList selected-box-content"></div>' +
			'<p class="fsDeleteAll remove"><a href="javascript:void(0)">{deleteAll}</a></p></div>' +
			'<p class="fsButtons"><a href="javascript:void(0);" class="fsBtnOK special-btn"><span>{ok}</span></a>&nbsp;' +
			'<a href="javascript:void(0);" class="fsBtnCancel common-button"><span>{cancel}</span></a></p></div>' +
			'<div class="contact-overlay"><div class="loading_l" style="width:680px;height:360px;"></div></div>'
	},

	_create: function() {
		var options = this.options,
			self = this,
			uiFriend = this.element;

		options.lang = $.extend({}, _FS_default.lang, options.lang || {});
		if( options.ownerId ){
			options.ownerId = options.ownerId.toString();
		} else {
			options.ownerId = '0';
		}
		if( ! $.isPlainObject(window.fsData) ){
			window.fsData = {};
		}
		if( ! window.fsData[options.ownerId] ){
			window.fsData[options.ownerId] = {};
		}
		this.memberData = {length:0, ushi:{}, card:{}, local:{}, sina:{}};        //所有好友
		this.selectedIDs = ',';     //已选ID

		options.currentList = [];       //当前列表
		options.currentShow = [];       //当前显示的列表（过滤后）
		options.currentLetter = null;   //当前列表的首字母

		if( typeof(options.url) == 'string' ){
			options.url = {ushi: options.url, filter: options.filterURL};
		} else {
			options.url.filter = options.filterURL;
		}

		if( options.popupWin == true ){
			if( options.template ){
				for( var key in options.lang ){
					options.template = options.template.replace(new RegExp('\\{' + key + '\\}', 'ig'), options.lang[key]);
				}
				this.element.append(options.template);
			}
			this._refreshState();
			this.element.find('[defaultTips]').showDefaultTips();
		}

		this.uiOverlay = uiFriend.find('.contact-overlay').width(uiFriend.outerWidth()).height(uiFriend.outerHeight());

		//关键字过滤事件
		var keytm = null;
		this.uiKeyword = uiFriend.find('[fs="fsKeyword"]')
			.bind('keydown blur', function(event){
				if( keytm != null ){
					clearTimeout(keytm);
					keytm = null;
				}
			})
			.bind('keyup', function(event){
				if( this.value != '' ) self.uiKeywordEmpty.show();
				keytm = setTimeout(function(){ self._searchKeyword(event); }, self.memberData.length > 1000 ? 500 : 200);
			});
		this.uiKeywordEmpty = uiFriend.find('[fs="keywordEmpty"]')
			.bind('click', function(event){
				self.uiKeywordEmpty.hide();
				self.uiKeyword.val('');
				self._searchKeyword(event, self.uiKeyword);
				setTimeout(function(){
					self.uiKeyword.focus().blur();
				}, 50);
			});

		//过滤组、城市、行业
		this.uiFilter = uiFriend.find('[fsFilter]');
		this.uiFilter.each(function(){
			var li = $(this), type = li.attr('fsFilter');
			li.find('> a').click(function(){
				var a = $(this);
				if( a.hasClass('current') ){
					a.removeClass('current').siblings('ul').hide();
				} else {
					self.uiFilter.find('> a').removeClass('current');
					self.uiFilter.find('> ul').hide();
					a.addClass('current').siblings('ul').show();
				}
				return false;
			});
		});
		$('.ct-navi-list a', this.uiFilter).live('click', function(event){
			if( ! $(event.target).hasClass('ct-group-edit') ){
				if( self.checkLoading() == true ) return false;
				self.uiKeyword.val(self.uiKeyword.attr('defaultTips') || '');
				self._resetNavi();
				self.uiNavi.find('a').removeClass('current');
				self.uiFilter.find('ul a').removeClass('current');
				var a = $(this), type = a.closest('[fsFilter]').attr('fsFilter');
				a.addClass('current');
				var list = self.search(a.attr(type), type.slice(0, 1));
				self.refreshMember(list);
				self._trigger('changeFilter', event, a);
				return false;
			}
		});
		//初始化组、城市、行业
		this._load('filter', function(data){
			self.uiFilter.filter('[fsFilter="group"]').find('>a').trigger('click');
			self._trigger('filterLoaded', null, data);
		});

		//类型导航
		this.uiNavi = uiFriend.find('[fsNavi]');
		$('a', this.uiNavi).bind('click', function(event){
			if( self.checkLoading() == true || $(this).hasClass('ct-loading') ) return false;
			self.uiKeyword.val(self.uiKeyword.attr('defaultTips') || '');
			self._resetNavi();
			var a = $(this), type = a.closest('[fsNavi]').attr('fsNavi');
			a.addClass('current');
			if( self._trigger('changeNavi', event, a) !== false ){
				self.refreshMember(self.memberData[type].list);
			}
			return false;
		});

		//好友列表
		this.uiList = uiFriend.find('[fs="fsFriendsList"]');
		this.uiListCont = this.uiList.parent();
		//列表滚动自动添加后续
		this.uiListCont.bind('scroll', function(event){  
			var cont = $(this), len = options.currentShow.length, cl = self.uiList.data('curLen');
			if( cl >= len ) return;
			var sl = 50, lh = self.uiList.height(), scr = lh * (1 - Math.max(sl / cl, 0.1));
			if( self.uiListCont.scrollTop() > scr ){
				var html = '', list = options.currentShow, nl = Math.min(cl + sl, len);
				for( var i = cl; i < nl; i++ ){
					html += self._member2li(list[i]);
				}
				self.uiList.data('curLen', nl).append(html);
			}
		});
		//好友列表事件
		$('li', this.uiList).live('mouseenter', function(){
			if( $(this).hasClass('ctl-member-empty') ) return false;
			$(this).addClass('hover');
		}).live('mouseleave', function(){
			$(this).removeClass('hover');
		}).live('click', function(event){
			if( options.popupWin == true ){
				self._clickMember($(this), event);
			} else {
				var li = $(this);
				if( self._trigger('onSelect', event, li) !== false ){
					self.uiList.find('li').removeClass('select');
					li.removeClass('hover').addClass('select');
				}
			}
		});
		//初始化好友列表
		if( options.selectedUsers != null ){
			if( $.isArray(options.selectedUsers) ){
				var su = {};
				for( var j = 0; j < options.selectedUsers.length; j++ ){
					su[options.selectedUsers[j]['d'].toString()] = options.selectedUsers[j];
				}
				options.selectedUsers = su;
			}
			self._selectedChange();
		} else {
			options.selectedUsers = {};
		}

		//点击移除所有
		uiFriend.find('.fsDeleteAll a').bind('click', function(event){
			self.clear();
		});
		//点击确定
		uiFriend.find('.fsBtnOK').bind('click', function(event){
			self._trigger('onOK', event, options.selectedUsers);
			self.element.popupWin('close');
		});
		//点击取消
		uiFriend.find('.fsBtnCancel').bind('click', function(event){
			self._trigger('onCancel', event, self.localSelected);
			self.element.popupWin('close');
		});
	},
	
	_init: function(){
		var self = this, options = this.options, arr = [];
		for( var i = 0; i < options.initMember.length; i++ ){
			if( options.url[options.initMember[i]] ) arr.push(options.initMember[i]);
		}
		var loadMember = function(hideOverlay, callback){
			if( arr.length > 0 ){
				var tp = arr.shift();
				self._load(tp, function(json, html){
					var navi = self.element.find('[fsNavi=' + tp + ']').show().find('> a');
					navi.removeClass('ct-loading');
					if( $.isPlainObject(json) ){
						navi.find('span').text('(' + self.memberData[tp].length + ')');
						self.memberData.length += self.memberData[tp].length;
						if( $.isFunction(callback) ) callback(tp, navi);
					} else {
						navi.find('span').text('(0)');
					}
					loadMember(true);
				}, hideOverlay);
			} else {
				self._trigger('memberLoaded', null, self.memberData);
			}
		}
		loadMember(false, function(tp, navi){
			if( self._trigger('init' + tp, null, self.memberData[tp].list) !== false ){
				self.refreshMember(self.memberData[tp].list);
				navi.addClass('current');
			}
		});
	},
	
	//修改好友信息
	changeMember: function(d, tp, action){
		var m = this.memberData[tp]['list'][d.toString()];
		for( var key in action ){
			m[key] = action[key];
		}
		this.memberData[tp]['list'][d.toString()] = m;
		this._trigger('changeMember', null, m);
		var self = this;
		setTimeout(function(){
			for( var i = 0; i < window.fsData[self.options.ownerId][tp]['member'].length; i++ ){
				if( window.fsData[self.options.ownerId][tp]['member'][i].d == m.d ){
					window.fsData[self.options.ownerId][tp]['member'][i] = m;
					break;
				}
			}
		}, 500);
	},
	//添加好友信息
	addMember: function(m, tp){
		tp = tp || 'card';
		this.memberData[tp]['list'][m.d.toString()] = m;
		window.fsData[this.options.ownerId][tp]['member'].push(m);
	},
	//获取好友信息
	getMember: function(d, tp){
		return this.memberData[tp]['list'][d.toString()];
	},
	//删除好友
	deleteMember: function(d, tp){
		tp = tp || 'ushi';
		var m = $.extend({}, this.memberData[tp]['list'][d.toString()]);
		delete this.memberData[tp]['list'][d.toString()];
		this._trigger('deleteMember', null, m);
		var self = this;
		setTimeout(function(){
			for( var i = 0; i < window.fsData[self.options.ownerId][tp]['member'].length; i++ ){
				if( window.fsData[self.options.ownerId][tp]['member'][i].d == m.d ){
					window.fsData[self.options.ownerId][tp]['member'].splice(i, 1);
					break;
				}
			}
		}, 500);
	},
	
	//遮盖层
	showOverlay: function(overlay){
		this.options.dataLoading = true;
		if( overlay != false ) this.element.find('.contact-overlay').show();
	},
	hideOverlay: function(overlay){
		this.options.dataLoading = false;
		if( overlay != false ) this.element.find('.contact-overlay').hide();
	},
	//检测是否loading
	checkLoading: function(){
		return this.options.dataLoading;
	},
	
	_resetNavi: function(){
		this.uiNavi.find('a').removeClass('current');
		this.uiFilter.find('ul a').removeClass('current');
		this._trigger('resetNavi');
	},

	_load: function(type, callback, noOverlay){
		if( window.fsData[this.options.ownerId][type] ){
			this._initData(type, window.fsData[this.options.ownerId][type], callback);
		} else {
			this._loadData(type, callback, noOverlay);
		}
	},
	_loadData: function(type, callback, noOverlay){
		if( noOverlay != true ) this.showOverlay();
		var self = this;
		$.ajax({
			url: this.options.url[type],
			type: 'get',
			dataType: 'text',
			success: function(data){
				var json = {};
				data = $.trim(data);
				try {
					json = (new Function("return " + data))();
					if( $.isPlainObject(json) ){
						window.fsData[self.options.ownerId][type] = json;
					} else {
						window.fsData[self.options.ownerId][type] = {};
					}
				} catch(e) {
					alert('系统数据错误！');
				}
				data = null;
				self._initData(type, json, callback);
			}
		});
	},
	_initData: function(type, json, callback){
		var self = this;
		if( $.isPlainObject(json) ){
			if( type == 'filter' ){
				for( var key in json ){
					var list = json[key], html = '';
					if( key == 'group' ){
						for( var i = 0; i < list.length; i++ ){
							var o = list[i];
							var sli = '<li><a href="javascript:;" ' + key + '="' + o.d + '">';
							if( this.options.popupWin == true ){
								sli += '<span fs="gn">' + o.n + '</span> <span class="quiet"></span>';
							} else {
								if( o.d != 0 ) sli += '<span class="btn-next ct-group-edit"></span>';
								sli += '<span fs="gn">' + o.n + '</span> <span class="quiet">(' + o.c + ')</span>';
							}
							sli += '</a></li>';
							if( o.d == 0 ){
								html = sli + html;
								list.splice(0, 0, list.splice(i, 1)[0]);
							} else {
								html += sli;
							}
						}
					} else {
						for( var i = 0; i < list.length; i++ ){
							var o = list[i];
							html += '<li><a href="#" ' + key + '="' + o.d + '">' + o.n + '<span class="quiet">' + (this.options.popupWin != true ? '(' + o.c + ')' : '') + ' </span></a></li>';
						}
					}
					if( html != '' ){
						self.uiFilter.filter('[fsFilter=' + key + ']').find('[fs="fsFilterList"]').empty().append(html);
					}
				}
			} else {
				var obj = {letter:{}, list:{}};
				for( var i = 0; i < json['member'].length; i++ ){
					var m = json['member'][i];
					m.g = ( m.g == '' ) ? '0' : m.g;
					m.p = m.p || m.n;
					m.lt = m.p.slice(0, 1).toUpperCase();
					m.tp = type;
					m.r = m.r || 0;  //针对老版本添加
					m.t = m.t || 0;  //针对老版本添加
					obj.list[m.d.toString()] = m;
				}
				obj.length = i;
				this.memberData[type] = obj;
			}
		} else {
			this.memberData[type] = {};
		}
		if( $.isFunction(callback) ){
			callback(json);
		}
	},
	
	//弹层初始化组
	_initFilter: function(type){
		var g = {}, i = {}, c = {};
		for( var key in this.memberData[type].list ){
			var o = this.memberData[type].list[key];
			i[o.i.toString()] = i[o.i.toString()] ? i[o.i.toString()] + 1 : 1;
			c[o.c.toString()] = c[o.c.toString()] ? c[o.c.toString()] + 1 : 1;
			var ag = o.g.split(',');
			for( var j = 0; j < ag.length; j++ ){
				g[ag[j]] = g[ag[j]] ? g[ag[j]] + 1 : 1;
			}
		}
		var list = this.uiFilter.filter('[fsFilter=group]').find('[fs="fsFilterList"]');
		for( key in g ){
			list.find('a[group=' + key + '] span.quiet').text('(' + g[key] + ')');
		}
		list = this.uiFilter.filter('[fsFilter=city]').find('[fs="fsFilterList"]');
		for( key in c ){
			list.find('a[city=' + key + '] span.quiet').text('(' + c[key] + ')');
		}
		list = this.uiFilter.filter('[fsFilter=industry]').find('[fs="fsFilterList"]');
		for( key in i ){
			list.find('a[industry=' + key + '] span.quiet').text('(' + i[key] + ')');
		}
	},

	//刷新好友列表
	refreshMember: function(list, sort, overlay){
		if( typeof(sort) != 'string' && sort != false ) sort = 'lt';
		this.showOverlay(overlay);
		var self = this;
		setTimeout(function(){
			var arr = [], letter = {};
			for( var i in list ){
				var lt = list[i].lt;
				letter[lt] = letter[lt] ? letter[lt] + 1 : 1;
				arr.push(list[i]);
			}
			self.options.currentList = arr;
			self.options.currentLetter = letter;
			self.showMember(arr, self.options.showListMax, sort, function(){
				self._trigger('refreshMember', null, letter);
				self.hideOverlay(overlay);
			});
		}, 100);
	},
	showMember: function(list, max, sort, callback, letter){
		max = max || this.options.showListMax;
		if( typeof(sort) == 'string' ){
			this.options.currentShow = $.isArray(list) ? this.sort(sort, list) : this.sort(sort, this.options.currentShow);
		} else {
			this.options.currentShow = $.isArray(list) ? list : this.options.currentShow;
		}
		list = this.options.currentShow;
		letter = letter || this.options.currentLetter;
		var html = '', cl = Math.min(max, list.length);
		for( var i = 0; i < cl; i++ ){
			html += this._member2li(list[i]);
		}
		if( html == '' ){
			html = '<li class="ctl-member-empty">' + this.options.lang.listEmpty + '</li>';
		}
		this.uiListCont.scrollTop(0);
		this.uiList.data('curLen', cl).empty().append(html);
		this._trigger('showMember', null, letter);
		if( $.isFunction(callback) ) callback();
	},
	//将好友对象转为li
	_member2li: function(m){
		var id = m.tp + '_' + m.d, html = '<li class="vcard v-30';
		if( this.selectedIDs != ',' ){
			if( this.selectedIDs.indexOf(',' + id + ',') >= 0 ) html += ' select';
		}
		html += '" id="' + id + '" d="' + m.d + '" lt="' + m.lt + '" r="' + m.r + '" t="' + m.t + '" tp="' + m.tp + '"';
		if( this.options.popupWin != true ){
			html += ' ct="list">';
			if( m.r >= 0 ){
				var grade = m.r > 500 ? 4 : Math.max(1, m.r.toString().length - 1);
				html += '<span class="count"><a class="grade-' + grade + '" href="/sns/sns!get1stFriends.jhtml?targetUserId=' + m.u + '" target="_blank">' + (m.r > 500 ? '500+' : m.r) + '</a></span>';
			}
			html += '<img src="' + m.m + '" width="30" height="30" alt=""><dl><dt class="blue">' + m.n + '</dt><dd class="quiet">' + m.b + '</dd></dl></li>';
		} else {
			html += '><dl><dt><b>' + m.n + '</b></dt><dd class="quiet">' + m.b + '</dd></dl></li>';
		}
		return html;
	},

	//当前列表排序
	sort: function(type, list){
		list = list || this.options.currentList;
		return list.sort(function(v1, v2){
			if( v1[type] < v2[type] ){
				return type == 'r' || type == 't' ? 1 : -1;
			} else if( v1[type] > v2[type] ){
				return type == 'r' || type == 't' ? -1 : 1;
			} else {
				return 0;
			}
		});
	},

	//搜索好友
	search: function(key, type){
		var list = [], anavi = ['ushi', 'card', 'local', 'sina'];
		if( type ){
			for( var i = 0; i < anavi.length; i++ ){
				for( var j in this.memberData[anavi[i]].list ){
					var o = this.memberData[anavi[i]].list[j];
					if( ( type == 'g' && (',' + o[type] + ',').indexOf(',' + key + ',') >= 0 ) || o[type] == parseInt(key, 10) ){
						list.push(o);
					}
				}
			}
		} else {
			var re = new RegExp();
			var keyword = key.replace(/[\\]+/, '\\\\');
			re.compile(key, 'ig');
			for( var i = 0; i < anavi.length; i++ ){
				for( var j in this.memberData[anavi[i]].list ){
					var o = this.memberData[anavi[i]].list[j];
					if( o.p.search(re) > -1 || o.n.search(re) > -1 ){
						list.push(o);
					}
				}
			}
		}
		return list;
	},
	_searchKeyword: function(event, input){
		if( this.checkLoading == true ){
			return;
		}
		input = input || $(event.currentTarget);
		var keyword = $.trim(input.val());
		if( keyword == input.attr('oldKey') ){
			return;
		}
		input.attr('oldKey', keyword);
		if( keyword == '' ){
			this.uiNavi.filter('[fsNavi=ushi]').find('> a').addClass('current');
			this.refreshMember(this.memberData.ushi.list);
		} else {
			this._resetNavi();
			var list = this.search(keyword);
			this.refreshMember(list, false, false);
		}
	},

	//点击列表中的好友
	_clickMember: function(li, event){
		var self = this, options = this.options, mb = li.attr('id').split('_');
			id = mb[1], tp = mb[0];
		li.removeClass('hover');
		if( li.hasClass('select') ){
			li.removeClass('select');
			delete options.selectedUsers[id];
			options.selectedCount--;
		} else {
			//当前选择总数如果超出可选上限
			if( options.inviteMax != -1 && options.selectedCount >= options.inviteMax ){
				this.element.find('.fsPrompt').addClass('tip-err');
				setTimeout(function(){
					self.element.find('.fsPrompt').removeClass('tip-err');
				}, 3000);
				return;
			}
			//如果单选
			if( options.inviteMax == 1 ){
				this.uiList.find('.select').removeClass('select');
				options.selectedUsers = {};
				options.selectedCount = 1;
			} else {
				options.selectedCount++;
			}
			options.selectedUsers[id] = $.extend({}, this.memberData[tp].list[id]);
			li.addClass('select');
		}
		this._selectedChange(event);
	},

	//已选好友列表发生改变时事件
	_selectedChange: function(event, selectedUsers){
		selectedUsers = selectedUsers || this.options.selectedUsers || {};
		var html = '', self = this;
		this.selectedIDs = ',';
		this.options.selectedCount = 0;
		for( var key in selectedUsers ){
			if( $.browser.msie7 == true ){
				html += '<div class="friend-selected friend-selected-ie7">' + selectedUsers[key].n + '<a rel="' + selectedUsers[key].tp + '_' + selectedUsers[key].d + '" class="fsDeleteUser friend-close" href="javascript:void(0);">&nbsp;</a></div>';
			} else {
				html += '<div class="friend-selected">' + selectedUsers[key].n + '<a rel="' + selectedUsers[key].tp + '_' + selectedUsers[key].d + '" class="fsDeleteUser friend-close" href="javascript:void(0);"></a></div>';
			}
			this.selectedIDs += selectedUsers[key].tp + '_' + selectedUsers[key].d + ',';
			this.options.selectedCount++;
		}
		this.element.find('.fsSelectedList').empty().append(html).find('a.fsDeleteUser').bind('click', function(){
			self._removeSelected($(this).attr('rel'));
		});
		this._refreshState();
		this._trigger('selectedChange', (event || null), selectedUsers);
	},

	//移除已选中的好友
	_removeSelected: function(mb){
		var id = mb.split('_')[1];
		this.uiList.find('#' + mb).removeClass('select');
		delete this.options.selectedUsers[id];
		this.options.selectedCount--;
		this._selectedChange();
	},

	//刷新已选状态数字
	_refreshState: function(){
		var options = this.options;
		this.element.find('span.fsSelectedCounts').text(options.lang.selected + '(' + options.selectedCount + ')');
		if( options.inviteMax >= 0 ){
			if( options.selectedCount >= options.inviteMax ){
				this.element.find('.fsPrompt').html(options.lang.max_info(options.inviteMax));
			} else {
				this.element.find('.fsPrompt').removeClass('tip-err').html(options.lang.select_info(options.inviteMax - options.selectedCount));
			}
		}
	},

	//更新好友列表中已选/未选状态
	_redrawList: function(){
		this.uiList.find('li').removeClass('select');
		if( this.options.selectedUsers == null || this.options.selectedUsers == {} ){ return; }
		var filter = '';
		for( var key in this.options.selectedUsers ){
			filter += '#' + this.options.selectedUsers[key].tp + '_' + this.options.selectedUsers[key].d + ',';
		}
		this.uiList.find(filter).addClass('select');
	},

	destroy: function() {
		if (false === this._trigger('beforeDestroy')) { return; }
		this.element.empty();
		$.Widget.prototype.destroy.apply(this, arguments);
	},

	clear: function(){
		this.options.selectedUsers = {};
		this.options.selectedCount = 0;
		this._selectedChange();
		this._redrawList();
	},

	_setOption: function(key, value) {
		$.Widget.prototype._setOption.apply(this, arguments);
		switch (key) {
			case 'selectedUsers':
				var obj = {};
				if( typeof(value) == 'string' ){
					value = value.split(/\s*|,/);
					for( var i = 0; i < value.length; i++ ){
						value[i] = $.trim(value[i]);
						if( value[i] && this.options.users[value[i]] ){
							obj[value[i]] = $.extend({}, this.options.users[value[i]]);
						}
					}
				} else if( $.isPlainObject(value) ){
					for( var k in value ){
						if( this.memberData['ushi'].list[k] ){
							obj[k] = $.extend({}, this.memberData['ushi'].list[k]);
						}
					}
				}
				this.options.selectedCount = 0;
				for( var k in obj ){
					this.options.selectedCount++;
				}
				this.options.selectedUsers = obj;
				this.localSelected = $.extend({}, obj);
				this._selectedChange();
				this._redrawList();
				break;
		}
	}
});

//搜索框版
$.widget('ushi.friendSelectList', {
	options: {
		friendSelectListClass: 'ushi-friendSelectList',
		inviteMax: -1,
		listMax: 15
	},
	
	_create: function(){
		var options = this.options,
			self = this;

		this.element.addClass(options.friendSelectListClass);

		if( options.ownerId ){
			options.ownerId = options.ownerId.toString();
		} else {
			options.ownerId = '0';
		}

		this.fsParam = $.extend({
			url: options.url,
			ownerId: options.ownerId,
			inviteMax: options.inviteMax,
			onOK: function(event, selectedUsers){
				self._selectedChange(selectedUsers);
			}
		}, options.fsParam || {});
		options.inviteMax = options.inviteMax == -1 ? 99999 : options.inviteMax;
		this.idField = $(options.idField || '<input type="hidden" value="" />');
		this.selectedUsers = this._formatSelected();
		this.options.dataLoading = false;
		this.dataLoaded = false;

		this.openFull = this.element.find('.fslOpenfriendSelect > a').bind('click', function(event){
			var param = $.extend({selectedUsers: $.extend({}, self.selectedUsers)}, self.fsParam);
			var pop = $('<div id="friend-selector" class="contact-container" style="display:none;" />').appendTo('body');
			pop.popupWin({
				popupClass: 'ushi-popup-friendselect',
				title: options.title || _FS_default.lang.poptitle,
				reserve: false,
				closeDestroy: true,
				width: 826,
				open: function(){
					$(this).friendSelect(param);
				},
				beforeClose: function(){
					$(this).friendSelect('destroy');
				}
			});
			return false;
		});
		if( this.openFull.length == 0 ){
			this.openFull = $('<a href="#" style="display:block;position:absolute;top:0;right:0;width:1px;height:1px;overflow:hidden;"></a>').appendTo(this.element);
			this.openFull.click(function(){
				return false;
			});
		}
		this.element.click(function(event){
			$(this).find('.fslSelectedList > input:text').focus().click();
		});
		//加入loading
		this.loading = $('<div style="position:absolute;top:3px;right:10px;margin:0;display:none;" class="loading-inline">&nbsp;</div>').appendTo(this.element);
		this.textFilter = this.element.find('.fslSelectedList > input:text').width(lang.lang == 'en_US' ? 175 : 120);
		this.textFilter.attr({title: _FS_default.lang.filtertitle.replace('&#39', '\''), searchKey: '', tip: this.textFilter.val()});
		this.textFilter.autocomplete({
			position: {of: this.element},
			keydown: function(event){
				if( self.dataLoaded == false ) self.loading.css('display', 'inline-block');
			},
			keyup: function(event, obj){
				if( obj.data('searchKey') == '' && event.keyCode == 8 ){
					var d = obj.prev('div[rel]');
					if( d.length ){
						delete self.selectedUsers[d.attr('rel')];
						self._selectedChange();
					}
				};
			},
			blur: function(event, obj){
				var v = obj.val();
				obj.data('searchKey', '').addClass('fontgray').val(obj.attr('tip'));
			},
			onefocus: function(event, obj){
				self._loadlist();
				obj.autocomplete('show', [{d: '-1', n: _FS_default.lang.filtertitle, b: ''}]);
			},
			focus: function(event, obj){
				obj.val(obj.data('searchKey')).removeClass('fontgray red');
			},
			source: function(value){
				if( value === false ) return;
				self._filter(null, value);
			},
			selected: function(event, li){
				var obj = $(this);
				if( self.selectedCount < self.options.inviteMax ){
					var u = self.users[li.attr('index')];
					self.selectedUsers[li.attr('index')] = $.extend({}, u);
					self._selectedChange();
				}
				self.openFull.focus();
				obj.data('searchKey', '').addClass('fontgray').val(obj.attr('tip'));
			},
			listClass: 'ac-dp-list',
			loadingClass: '',
			li_template: '<li index="%1"><span litext="y">%2</span> <span class="spe-left2">%3</span></li>',
			li_id: ['d', 'n', 'b'],
			listMax: options.listMax,
			width: options.width || 480
		});
	},

	_formatSelected: function(){
		var obj = {};
		this.selectedCount = 0;
		if( this.idField.val() != '' ){
			var value = this.idField.val().split(/,\s*/),
				div = this.element.find('.fslSelectedList');
			for( var i = 0; i < value.length; i++ ){
				value[i] = $.trim(value[i]);
				if( value[i] && div.find('[rel="' + value[i] + '"]').length ){
					var el = div.find('[rel="' + value[i] + '"]');
					obj[value[i]] = {};
					obj[value[i]].d = value[i];
					obj[value[i]].n = $.trim(el.text());
					obj[value[i]].tp = el.attr('tp') || 'ushi';
					this.selectedCount++;
				}
			}
		}
		return obj;
	},
	
	_loadlist: function(){
		this.options.dataLoading = true;
		if( window.fsData && window.fsData[this.options.ownerId] && window.fsData[this.options.ownerId].ushi && this.resetUrl == false ){
			this.element.data('usersList', this._formatData(window.fsData[this.options.ownerId].ushi));
			this.options.dataLoading = false;
		} else {
			var self = this;
			$.ajax({
				url: self.options.url,
				type: 'get',
				dataType: 'text',
				success: function(data){
					var json = {};
					data = $.trim(data);
					try {
						json = (new Function("return " + data))();
						if( $.isPlainObject(json) ){
							self.resetUrl = false;
							self.element.data('usersList', self._formatData(json));
							self.options.dataLoading = false;
							self.dataLoaded = true;
							self.loading.css('display', 'none');
						} else {
							return false;
						}
					} catch(e) {
						alert('系统数据错误！');
					}
				}
			});
		}
	},
	_formatData: function(json){
		var usersList = [], users = {};
		for( var i = 0; i < json.member.length; i++ ){
			var u = json.member[i];
			u.p = u.p || u.n;
			u.tp = 'ushi';
			usersList.push(u);
			users[u.d.toString()] = u;
		}
		this.users = users;
		return usersList;
	},

	_filter: function(event, keyword){
		var self = this;
		if( this.options.dataLoading ){
			setTimeout(function(){
				self._filter(event, keyword);
			}, 500);
		} else {
			this.listFirst = null;
			if( keyword == '' ){
				searchList = [{d: '-1', n: _FS_default.lang.filtertitle, b: ''}];
			} else {
				var searchList = this._searchKeyword(keyword, this.element.data('usersList'));
				if( searchList.length == 0 ){
					searchList = [{d: '-1', n: keyword == '' ? _FS_default.lang.filtertitle : _FS_default.lang.filternotfound, b: ''}];
				} else {
					this.listFirst = searchList[0];
				}
			}
			this.textFilter.autocomplete('show', searchList);
		}
	},
	_searchKeyword: function(keyword, searchList){
		var list = [];
		var re = new RegExp();
		keyword = keyword.replace(/[\\]+/, '\\\\');
		re.compile(keyword, 'ig');
		for( var i = 0; i < searchList.length; i++ ){
			if( searchList[i].p.search(re) > -1 || searchList[i].n.search(re) > -1 ){
				list.push(searchList[i]);
			}
		}
		if( list.length > 1 ){
			var l = keyword.length;
			keyword = keyword.toUpperCase();
			return list.sort(function(a, b){
				var a1 = a.p.slice(0, l).toUpperCase(), b1 = b.p.slice(0, l).toUpperCase();
				if( a1 == keyword && b1 != keyword ){
					return -1;
				} else if( a1 != keyword && b1 == keyword ){
					return 1;
				} else {
					return ( a.p > b.p ) ? 1 : -1;
				}
			});
		} else {
			return list;
		}
	},

	_selectedChange: function(selectedUsers){
		var self = this, html = '', input = this.element.find('.fslSelectedList > input:text');
		this.selectedUsers = selectedUsers || this.selectedUsers || {};
		this.selectedCount = 0;
		var su = {};
		for( var key in this.selectedUsers ){
			var nm = (this.selectedUsers[key].n || this.selectedUsers[key].name);
			html += '<div class="friend-selected" rel="' + key + '">' + nm + '<a rel="' + key + '" class="fsDeleteUser friend-close" href="javascript:void(0);"></a></div>';
			su[key] = {n: nm, d: key, tp: this.selectedUsers[key].tp || 'ushi'};
			this.selectedCount++;
		}
		this.selectedUsers = su;
		if( this.selectedCount >= this.options.inviteMax || input.attr('display') == 'none' ){
			input.hide();
		} else {
			input.show();
		}
		var list = this.element.find('.fslSelectedList');
		list.find('>div').remove()
		list.find('input:text').before(html);
		list.find('>div a.fsDeleteUser').bind('click', function(){
			delete self.selectedUsers[$(this).attr('rel')];
			self._selectedChange();
			return false;
		});
		this._refreshIdField();
	},

	_refreshIdField: function(){
		var id = '', name = '';
		for( var key in this.selectedUsers ){
			id += key + ',';
			name += this.selectedUsers[key].n + ',';
		}
		this.idField.val(id.slice(0, id.length - 1));
		this.options.selectedNames = name.slice(0, name.length - 1);
		this.options.selectedUsers = $.extend({}, this.selectedUsers);
		this._trigger('refreshId', null, this.selectedUsers);
	},
	
	clear: function(){
		this.selectedUsers = {};
		this._selectedChange();
	},

	_setOption: function(key, value) {
		switch (key) {
			case 'url':
				this.options[key] = value;
				this.fsParam[key] = value;
				this.resetUrl = true;
				break;
			case 'selectedUsers':
				this._selectedChange(value);
				break;
		}
		$.Widget.prototype._setOption.apply(this, arguments);
	}
});
})(jQuery);

