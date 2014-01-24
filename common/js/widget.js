//popup, popupWin, popupLayer, popupTips 等组件
//popup参考了jQuery UI的dialog
(function($) {
$.widget("ushi.popup", {
	options: {
		popupClass: 'ushi-popup',
		overlayClass: 'fl-back',
		width: 'auto',
		zIndex: 1000,
		uiPopup: null,                  //弹层的外框架
		uiContent: null,                //弹层的内容框架
		uiPopupClose: null,             //默认关闭按钮
		position: ['center', 'center'], //位置参数，默认为老版本的jqueryui的语法，建议传递新的position位置语法
		positionCollision: 'fit',       //位置有关
		positionTop: false,             //位置顶部是否允许出现负值
		hasOverflow: true,              //弹层内容框架是否具有overflow:hidden属性
		modal: true,                    //是否为模式弹层
		overlay: 0.25,                  //模式弹层的背景层的透明系数
		reserve: false,                 //销毁弹层时是否将内容框架保留在body中，否为随外框架一起处理
		detach: false,                  //销毁弹层时是否将外框架保留在jquery的dom缓存中，否为直接remove
		closeDestroy: false,            //触发close事件时，是否执行destroy
		clickClose: false,              //鼠标点击弹层外部，是否触发close
		leaveClose: false,              //鼠标移出弹层区域，是否触发close，可以使用数字值来表示延迟close的时间，默认为200ms
		autoOpen: false,                //是否在创建弹层时自动打开
		stopPropagation: true,          //是否阻止弹层中的事件向上传递
		draggable: false,               //是否允许拖动
		closeEventName: '.popup-close'  //在document上绑定的关闭事件的命名空间
	},

	_create: function() {
		this._createPopup();
	},

	_createPopup: function() {
		var options = this.options, self = this;

		this.cancelLeaveCloseTM = null;
		if( options.leaveClose != false ) options.leaveClose = Math.max(1, parseInt(options.leaveClose) || 200);
		if( options.detach == true ) options.reserve = false;
		options.overlayEvents = options.overlayEvents || (options.modal == false ? $.ushi.popup.events : $.ushi.popup.overlay.events);

		this.uiPopup = (options.uiPopup = options.uiPopup || $('<div/>'))
			.appendTo(document.body)
			.hide()
			.addClass(options.popupClass)
			.css({position: 'absolute', textAlign: 'left'});
		options.uiContent = (options.uiContent || options.uiPopup).append(this.element.show());
		if( options.hasOverflow ) options.uiContent.css('overflow', 'hidden');

		//是否允许拖动弹层
		var overlayEventsUI = options.uiPopup;
		if( options.draggable === true && $.fn.draggable ){
			overlayEventsUI = options.uiContent;
			self._makeDraggable();
		}

		//阻止指定事件在弹层上冒泡
		overlayEventsUI.bind(options.overlayEvents.split(',').join(' '), function(event){
			if( self._trigger(event.type + 'Popup', event) === false ) return;    //触发组件自定义的事件处理函数，如果处理函数返回false将直接将该事件传递给上级处理（不阻止弹层中事件的向上传递）
			if( options.stopPropagation ) event.stopPropagation();
		});
		//自动绑定一些默认关闭按钮
		overlayEventsUI.delegate('[cancel], [js="cancel"], [js="closePopup"]', 'click', function(event){
			setTimeout(function(){ self.close(event); }, 0);
			return false;
		});

		this._isOpen = false;

		if( $.fn.bgiframe ) this.uiPopup.bgiframe();
		
		if( ! this.element.data('popup') ){
			this.element.data('popup', this.element.data(this.widgetName));
		}
	},

	_init: function(){
		if( this.options.autoOpen == true ){
			this.open();
		}
	},

	_close: function(evt, callback){
		if( this._trigger('beforeClose', evt, this.uiPopup) === false ) return;
		if( this.overlay ){
			this.overlay.destroy();
		} else {
			$(document).unbind(this.options.closeEventName);
			this.uiPopup.unbind('.popup-leave');
		}

		var self = this;
		var _callback = function(){
			self._trigger('close', evt);
			if( $.isFunction(callback) ) callback();
		};
		var hide = this.options.hide;
		if( $.effects && ($.isPlainObject(hide) || typeof(hide) == 'string') ){
			if( typeof(hide) == 'string' ){
				var ef = {fade: {duration: 250}, slide: {direction: 'up'}, scale: {origin: ['top', 'left']}};
				this.uiPopup.hide(hide, ef[hide], ef[hide].duration || 500, _callback);
			} else {
				this.uiPopup.hide(hide.effect || 'fade', hide, hide.duration || 500, _callback);
			}
		} else {
			this.uiPopup.hide(0, _callback);
		}
		this._isOpen = false;
	},

	destroy: function(reserve) {
		var self = this;
		this._close($.Event('destroy'), function(){
			$.Widget.prototype.destroy.apply(self, arguments);
			if( self.options.reserve || reserve ){
				self.element.hide().appendTo('body');
			}
			self._trigger('afterDestroy');
			if( self.options.detach == true ){
				self.uiPopup.detach();
			} else {
				self.uiPopup.remove(null, true);
			}
		});
	},

	close: function() {
		if( this.options.closeDestroy ) return this.destroy();
		this._close($.Event('close'));
	},

	isOpen: function(){
		return this._isOpen;
	},

	open: function() {
		if( this._isOpen ) return;

		var options = this.options, self = this;

		this.overlay = options.modal ? new $.ushi.popup.overlay(this) : null;
		if( options.leaveClose ){
			self.uiPopup.bind('mouseenter.popup-leave', function(){
				self.uiPopup.unbind('mousemove.popup-leave mouseleave.popup-leave');
				self.bindLeaveClose();
			});
			this.bindLeaveClose();
		}
		if( options.modal == false && options.clickClose ){
			var overlayEvents = $.map(options.overlayEvents.split(','), function(event){return event + options.closeEventName;}).join(' ');
			setTimeout(function(){
				$(document).unbind(options.closeEventName).bind(overlayEvents, function(event){
					self.close();
				});
			}, 1);
		}

		if( this.uiPopup.next().length ) this.uiPopup.appendTo('body');
		this.uiPopup.css({
			height: 'auto',
			width: options.width
		});
		if( options.minHeight ) this.element.css({minHeight: options.minHeight});
		if( typeof(options.height) == 'number' ) this.element.height(options.height);

		this._position(options.position);   //设置pop的显示位置
		this.moveToTop();                   //将pop的z-index置顶

		var callback = function(){
			if( options.uiPopupClose && options.uiPopupClose.length > 0 ){   //如果有默认关闭按钮，则打开即获取焦点
				options.uiPopupClose.focus();
			}
		}
		if( $.effects && ($.isPlainObject(options.show) || typeof(options.show) == 'string') ){
			if( typeof(options.show) == 'string' ){
				var ef = {fade: {duration: 350}, slide: {direction: 'up'}, scale: {origin: ['top', 'left']}};
				this.uiPopup.show(options.show, ef[options.show], ef[options.show].duration || 500, callback);
			} else {
				this.uiPopup.show(options.show.effect || 'fade', options.show, options.show.duration || 500, callback);
			}
		} else {
			this.uiPopup.show(0, callback);
		}
		this._isOpen = true;
		this._trigger('open', null, this.uiPopup);
	},

	//绑定移出关闭
	bindLeaveClose: function(){
		var options = this.options, self = this;
		self.uiPopup.one('mousemove.popup-leave', function(){
			self.uiPopup.one('mouseleave.popup-leave', function(){
				self.cancelLeaveCloseTM = setTimeout(function(){
					self.close();
				}, options.leaveClose);
			});
		});
	},
	//取消移出关闭动作
	cancelLeaveClose: function(){
		if( this.cancelLeaveCloseTM ){
			clearTimeout(this.cancelLeaveCloseTM);
			this.cancelLeaveCloseTM = null;
		}
	},

	moveToTop: function() {
		if( this.options.zIndex > $.ushi.popup.maxZ ){
			$.ushi.popup.maxZ = this.options.zIndex;
		}
		(this.overlay && this.overlay.$el.css('z-index', $.ushi.popup.overlay.maxZ = ++$.ushi.popup.maxZ));

		this.uiPopup.css('z-index', ++$.ushi.popup.maxZ);
	},

	_makeDraggable: function() {
		var self = this,
			options = self.options,
			doc = $(document),
			heightBeforeDrag;

		function filteredUi(ui) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		self.uiPopup.draggable({
			handle: options.dragHandle,
			containment: 'document',
			start: function(event, ui) {
				heightBeforeDrag = options.height === "auto" ? "auto" : $(this).height();
				$(this).height($(this).height()).addClass("ushi-popup-dragging");
				self._trigger('dragStart', event, filteredUi(ui));
			},
			drag: function(event, ui) {
				self._trigger('drag', event, filteredUi(ui));
			},
			stop: function(event, ui) {
				options.position = [ui.position.left - doc.scrollLeft(), ui.position.top - doc.scrollTop()];
				$(this).removeClass("ushi-popup-dragging").height(heightBeforeDrag);
				self._trigger('dragStop', event, filteredUi(ui));
			}
		});
	},

	_position: function(position) {
		var obj = {
			of: window,
			collision: this.options.positionCollision
		};
		if( $.isPlainObject(position) ){
			position = $.extend(obj, position);
			if( this.options.positionTop == true ){
				position.collision = position.collision.split(' ')[0] + ' none';
			}
		} else if( $.isArray(position) ){
			if( typeof(position[0]) == 'string' && typeof(position[1]) == 'string' ){
				position = position[0] == position[1] ? position[0] : position.join(' ');
				position = $.extend(obj, {my: position, at: position});
			} else if( position[0].constructor == Number && position[1].constructor == Number){
				position = $.extend(obj, {of: document, my: 'left top', at: 'left top', offset: position[0] + ' ' + position[1]});
			} else {
				position = ['center', 'center'];
			}
		} else {
			position = ['center', 'center'];
		}
		if( $.isPlainObject(position) ){
			var isVisible = this.uiPopup.is(':visible');
			if( !isVisible ){
				this.uiPopup.show();
			}
			this.uiPopup.css({top: 0, left: 0}).position(position);
			if( !isVisible ){
				this.uiPopup.hide();
			}
		} else {
			this._position(position);
		}
	},

	_setOption: function(key, value) {
		$.Widget.prototype._setOption.apply(this, arguments);
		switch (key) {
			case "position":
				this._position(value);
			break;
		}
	}
});

$.extend($.ushi.popup, {
	events: 'click',
	maxZ: 1000,
	overlay: function(dialog) {
		this.$el = $.ushi.popup.overlay.create(dialog);
	}
});

$.extend($.ushi.popup.overlay, {
	instances: [],
	events: 'click,mousedown,mouseup,keydown,keypress,focus',
	create: function(dialog, clickClose) {
		var self = this;
		if (this.instances.length === 0) {
			$(window).bind('resize.popup-overlay', function(){self.resize()});
		}

		var $el = $('<div></div>').appendTo('body')
			.addClass(dialog.options.overlayClass)
			.css({
				opacity: dialog.options.overlay,
				width: self.width(),
				height: self.height()
			});

		if( dialog.options.clickClose ){
			var overlayEvents = $.map(dialog.options.overlayEvents.split(','), function(event){ return event + '.popup-overlay'; }).join(' ');
			$el.bind(overlayEvents, function(event){
				dialog.close();
			});
		}

		//加了bgiframe就不触发div的事件了
		if( $.fn.bgiframe && dialog.options.clickClose != true ){
			$el.bgiframe();
		}

		this.instances.push($el);
		return $el;
	},

	destroy: function($el) {
		this.instances.splice($.inArray(this.instances, $el), 1);

		if (this.instances.length === 0) {
			$([document, window]).unbind('.popup-overlay');
		}

		$el.remove();
	},

	height: function() {
		// handle IE 6
		if ($.browser.msie) {
			var scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
			var offsetHeight = Math.max(
				document.documentElement.offsetHeight,
				document.body.offsetHeight
			);
			if (scrollHeight < offsetHeight) {
				return $(window).height() + 'px';
			} else {
				return scrollHeight + 'px';
			}
		} else {
			return $(document).height() + 'px';
		}
	},

	width: function() {
		// handle IE 6
		if ($.browser.msie) {
			var scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
			var offsetWidth = Math.max(
				document.documentElement.offsetWidth,
				document.body.offsetWidth
			);
			if (scrollWidth < offsetWidth) {
				return $(window).width() + 'px';
			} else {
				return scrollWidth + 'px';
			}
		} else {
			return $(document).width() + 'px';
		}
	},

	resize: function() {
		var $overlays = $([]);
		$.each($.ushi.popup.overlay.instances, function() {
			$overlays = $overlays.add(this);
		});

		$overlays.css({
			width: 0,
			height: 0
		}).css({
			width: this.width(),
			height: this.height()
		});
	}
});

$.extend($.ushi.popup.overlay.prototype, {
	destroy: function() {
		$.ushi.popup.overlay.destroy(this.$el);
	}
});


$.widget('ushi.popupLayer', $.ushi.popup, {
	options: {
		popupClass: 'ushi-popupLayer',
		modal: false,
		overlay: 0,
		clickClose: true,
		reserve: true,
		overlayEvents: 'click',
		positionCollision: 'none',
		autoOpen: true,
		draggable: false
	}
});

$.widget("ushi.popupWin", $.ushi.popup, {
	options: {
		popupClass: 'ushi-popupWin',
		closeText: 'close',
		tipsType: '',
		clickClose: false,
		title: null,
		autoOpen: true,
		draggable: true,                   //允许拖动
		dragHandle: '.fl-title'            //拖动的触发区域
	},

	_create: function() {
		var options = this.options, self = this;

		var shadow = '<div class="fl-outer-out"><div class="fl-block-shadow"></div><div class="fl-outer-in">';
		if( typeof(options.arrow) == 'string' ){
			var html = '<div class="fl-outer fl-outer-tips' + (options.tipsType != '' ? ' fl-outer-tips' + options.tipsType : '') + ' fl-outer-a' + options.arrow + '">' + shadow +
				'<div class="fl-block"><span class="arrow-' + options.arrow + ' popupArrow"></span>';
			if( options.arrow != 'right' && options.showTipsClose == true ) html += '<a class="tip-close" href="javascript:;" js="closePopupDefault"><span class="hide">' + options.closeText + '</span></a>';
		} else {
			var html = '<div class="fl-outer">' + shadow + '<div class="fl-block">';
		}
		html += '<div class="fl-title"><h5></h5>';
		if( options.hasTitleClose !== false ) html += '<a class="close" href="javascript:;" js="closePopupDefault"><span class="hide">' + options.closeText + '</span></a>';
		html += '</div><div class="fl-content" style="min-height:20px;"></div><div class="fl-button"></div></div></div></div></div>';
		options.uiPopup = $(html);
		options.uiContent = options.uiPopup.find('.fl-content');

		var hasButtons = false, uiButton = options.uiPopup.find('.fl-button');
		if( typeof(options.buttons) == 'object' && options.buttons !== null ){
			$.each(options.buttons, function(){ return !(hasButtons = true); })
		}
		if( hasButtons ){
			$.each(options.buttons, function(name, fn) {
				$('<input type="button" hidefocus="true" class="common-button" value="' + name + '" />')
					.click(function() { fn.apply(options.uiContent.find('>*')[0], arguments); })
					.appendTo(uiButton);
			});
			uiButton.find(':button')[0].className = 'special-btn';
		} else {
			uiButton.remove();
		}

		if( options.title == null ){
			if( options.arrow != 'right' && options.showTipsClose == true ){
				options.uiPopup.find('.fl-title').remove();
			} else {
				options.uiPopup.find('.fl-title').hide();
			}
		} else {
			options.uiPopup.find('.fl-title h5').html(options.title);
		}
		if( options.arrowPos ){
			options.uiPopup.find('.popupArrow').css(options.arrow == 'top' ? 'left' : 'top', options.arrowPos + 'px');
		}
		options.uiPopupClose = options.uiPopup.find('a[js="closePopupDefault"]');

		$.ushi.popup.prototype._create.apply(this);
	},

	_init: function(){
		var self = this, options = this.options;
		if( options.uiPopupClose.length > 0 ){
			options.uiPopupClose.click(function(event) {
				self.close(event);
				return false;
			});
		}
		$.ushi.popup.prototype._init.apply(this);
	},

	_setOption: function(key, value) {
		$.ushi.popup.prototype._setOption.apply(this, arguments);
		switch (key) {
			case "title":
				var title = this.options.uiPopup.find('.fl-title');
				if( title.length > 0 ){
					if( value === null ){
						title.hide();
					} else {
						title.show().find('h5').html(value);
					}
				}
			break;
		}
	}
});

$.widget("ushi.popupTips", $.ushi.popupWin, {
	options: {
		popupClass: 'ushi-popupTips',
		tipsType: 1,
		modal: false,
		overlay: 0,
		clickClose: true,
		reserve: true,
		arrow: 'left',
		width: 300,
		showTipsClose: false,
		overlayEvents: 'click',
		positionCollision: 'none',
		draggable: false
	}
});
})(jQuery);

//html editor组件
(function($) {
$.widget("ushi.editor", {
	options: {
		widgetClass: 'ushi-htmleditor',
		styleClass: 'border-text',
		bodyClass: 'html-editor',
		bodyStyle: 'font-size:13px;',
		bodyColor: '#333',
		quietColor: '#999',
		autoHeight: true,
		encode: function(v){
			v = v.replace(/\n/g, '<br/>').replace(/\r/g, '')
			v = v.replace(/ /g, '&nbsp;');
			return v;
		},
		decode: function(v){
			var str = v.replace(/[\n\r]/g, '');
			str = str.replace(/<\!\-\-.*?\-\->/gi, '');
			str = str.replace(/\<\/div\>/gi, '\n');
			str = str.replace(/\n+/g, '\n');
			str = str.replace(/(<\w+)(.*?>)/gi, function($0,$1,$2){
				var tag = $1.slice(1).toLowerCase();
				return ('p|br|h1|h2|h3|h4|h5|h6|li|dt|dd|tr').indexOf(tag) >= 0 ? '\n' : '';
			});
			str = str.replace(/<\/\w+.*?>/gi, '');
			str = str.replace(/<\w+.*?\/>/gi, '');
			str = str.replace(/<\?xml.*?\/>/gi, '');
			str = str.replace(/(\&nbsp\;)/gi, ' ');
			str = str.replace(/^[\n\r\s]*|[\n\r\s]*$/g, '');
			return str;
		}
	},

	_create: function() {
		var options = this.options,
			self = this;
		if( ! this.element.is('textarea, :text') )
			return false;
		var nm = this.element.attr('name') + '_editor_' + Math.ceil(Math.random() * 9999 + 1);
		options.width = options.width || this.element.width();
		options.height = options.height || this.element.height();
		options.content = options.content || options.encode(this.element.is('textarea') ? this.element.html() : this.element.val());
		options.defaultTips = options.defaultTips || this.element.attr('defaultTips') || '';
		if( $.browser.mozilla && parseInt($.browser.version, 10) < 12 ){
			this.frame = $('<iframe id="' + nm + '" frameborder="0" style="padding:0;width:' + options.width + 'px;height:' + options.height + 'px;"></iframe>');
			this.frame.insertBefore(this.element.hide());
			this.doc = this._initEditor(this.frame[0]);
			this.body = this.doc.find('body');
		} else {
			this.doc = $('<div contentEditable="true" id="' + nm + '" style="padding:3px;width:' + (options.width - 6) + 'px;min-height:' + options.height + 'px;_height:' + options.height + 'px;"></div>');
			this.doc.insertBefore(this.element.hide());
			this.doc.addClass(options.bodyClass);
			this.doc.html(options.content);
			this.frame = this.body = this.doc;
		}
		this.frame.addClass(options.widgetClass + ' ' + options.styleClass);
		this.frame.css({visibility: 'visible'});
		this.body.css('color', ( options.defaultTips && options.content == options.defaultTips ) ? options.quietColor : options.bodyColor);
		if( options.autoHeight ){
			this.frame.css({overflow: 'visible'});
			this.doc.bind('keydown keyup', function(){
				self.frame.height(Math.max($(this).height(), options.height));
				$(this).height('auto');
			}).trigger('keyup');
		} else {
			this.frame.css({
				height: options.height + 'px',
				overflow: 'auto'
			});
		}
		this.doc.bind('focus', function(event){
			if( self._trigger('focus', event, self) !== false ){
				if( options.defaultTips && self.body.text() == options.defaultTips ){
					self.body.html('');
				}
				self.body.css('color', options.bodyColor);
				self.frame.height($(this).height());
			}
		}).bind('blur', function(event){
			if( self._trigger('blur', event, self) !== false ){
				if( options.defaultTips && self.body.text() == '' ){
					self.body.html(options.defaultTips);
					self.body.css('color', options.quietColor);
				}
			}
		});
	},

	resetBody: function(){
		this.body.html(this.options.encode(this.element.val()));
	},

	setFocus: function(){
		this.frame.height(this.doc.height());
	},

	_initEditor: function(frame) {
		var doc = frame.contentWindow.document;
		var options = this.options,	bodyStyle = 'background:#FFFFFF;margin:0;padding:3px;overflow-x:hidden;height:auto;' + options.bodyStyle;
		bodyStyle += ( options.autoHeight ? ';overflow-y:hidden;' : ';overflow-y:auto;' );
		var html = '<html><head></head><body style="' + bodyStyle + '">';
		html += options.content;
		html += '</body></html>';
		doc.open();
		doc.write(html);
		doc.close();
		doc.designMode = 'On';
		return $(doc);
	},

	_setOption: function(key, value) {
		$.Widget.prototype._setOption.apply(this, arguments);
		switch (key) {
			case "content":
				var v = this.options.decode(value);
				value = this.options.encode(value);
				this.element.val(v);
				this.body.html(value);
				this.frame.height(this.doc.height());
				this.options[key] = value;
			break;
			case "color":
				this.body.css(key, value);
			break;
		}
	},
	option: function(key, value) {
		if( value === undefined ){
			switch (key) {
				case "content":
					var v = ( this.options.defaultTips && (this.body.text() == this.options.defaultTips) ) ? '' : this.options.decode(this.body.html());
					this.element.val(v);
					this.options[key] = this.options.encode(v);
					return this.options[key];
				break;
			}
		}
		return $.Widget.prototype.option.apply(this, arguments);
	}
});
})(jQuery);

//autocomplete ajax组件
(function($) {
$.widget("ushi.autocomplete", {
	options: {
		widgetClass: 'ushi-autocomplete',
		listContClass: '',
		listClass: 'list-bottom',
		hoverClass: 'hover',
		listHighlightClass: 'ac-list-hl',
		loadingClass: 'ac-loading',
		li_template: '<li index="%1">%2</li>', //列表项的模板，需与li_id对应
		li_id: ['id_', 'name_'],               //ajax返回的数据名称
		dataList: null,                        //显示中的下拉列表源数据
		position: null,                        //下拉列表的显示位置，语法同jqueryui的position
		showEmptyList: false,                  //是否允许显示空的列表
		listMax: 15,                           //列表个数，0表示不限
		ajaxKey: 'q',                          //ajax请求时的get参数
		filterLi: '[ac="isExt"], [index^=-]',  //过滤列表中非数据项的ctx
		showSelection: true,                   //是否在输入框里显示当前列表项的内容
		igoneEmptyKey: true,                   //是否忽略空字串的关键字
		clickSelected: false,                  //是否使用点击列表项作为选中，不影响回车键选中
		enterSelectFirst: false,               //是否允许未选中任何项时，在按回车时，尝试选中列表第一项（如果输入框内容和第一项内容相同则选中）
		blurSelectFirst: false,                //是否允许未选中任何项时，在输入框失去焦点时，尝试选中列表第一项
		hasScrollBar: false,                   //列表是否会出现滚动条
		closeEventName: '.popup-close-ac',     //定义直接关闭下拉列表弹层的事件命名空间
		searchFilter: function(value){         //过滤关键字的正则
			return value.replace(/\\/ig, '\\\\');
		},
		getFilterValue: function(value){       //获取列表对象中用于过滤关键字的项
			return value;
		},
		formatValue: function(value){          //格式化关键字
			return $.trim(value);
		}
	},

	_create: function() {
		this.CTRLKEY = [37, 38, 39, 40, 27, 13, 9];

		this.keyPressing = null;    //正在键盘输入的定时器
		this.showing = false;       //下拉列表是否显示
		this.keyCancel = false;     //是否破获keyup事件，根据keydown事件的返回决定
		this.selected = null;       //已选中的列表项
		this.requestIndex = 0;      //第几次ajax请求

		var options = this.options,
			self = this;
		options.source = options.source || options.url;
		options.popupOptions = options.popupOptions || {};
		options.popupOptions.closeEventName = options.closeEventName;

		this.element.attr('autocomplete', 'off')
			.one('focus', function(event){
				if( self.element.data('searchKey') != options.formatValue(self.element.val()) ){
					self.element.val(self.element.data('searchKey'));
				}
				self._trigger('onefocus', event, self.element);
				setTimeout(function(){
					self.element.data('oneFocus', true);
				}, 200);
			})
			.bind('keydown', function(event){
				if( self._trigger('keydown', event, self.element) !== false ){
					self.keyCancel = false;
					self._keydown(event);
				} else {
					self.keyCancel = true;
					return false;
				}
			})
			.bind('keyup', function(event){
				if( self._trigger('keyup', event, self.element) !== false ){
					if( self.keyCancel !== true ) self._keyup(event);
				} else {
					return false;
				}
			})
			.bind('keypress click', function(event){
				event.stopPropagation();
				if( event.keyCode == 13 ){ return false; }
			})
			.bind('focus', function(event){
				$(document).triggerHandler('click' + options.closeEventName);  //输入框获取焦点时，直接关闭其他的ac的下拉列表
				if( self._trigger('focus', event, self.element) !== false ){
					self.source(self._getValue());
				}
				self.element.attr('focusStatus', 'focus');
			})
			.bind('blur', function(event){
				if( self.keyPressing ){
					clearInterval(self.keyPressing);
					self.keyPressing = null;
				}
				self.element.attr('focusStatus', 'blur');
				if( self._trigger('blur', event, self.element) !== false ){
					if( options.clickSelected == true ) return;
					if( self.selected != null ) return;
					if( self.checkPopupIsOpen() == true ){
						//列表打开状态，输入框失去焦点时，执行选中列表中被选的条目
						//事件会发生在点击条目之后
						if( self.getSelected(event).length > 0 ) return;
					}
					self._unselected(event);
				}
			});

		var searchKey = this.element.attr('searchKey');
		if( typeof(searchKey) == 'string' ){
			this.element.data('searchKey', searchKey);
		} else {
			this.element.data('searchKey', options.formatValue(this.element.val()));
		}

		//初始化数据源处理函数
		this._initSource();

		this.pop = $('<div style="min-width:100px;"></div>').addClass(options.listContClass);
		this.list = $('<ul/>').addClass(options.listClass);
		if( options.clickSelected == true ){
			this.list.delegate('li', 'click', function(event){
				self.getSelected(event);
			});
		}
		this.list.delegate('li', 'mouseenter', function(event){
			var li = $(this);
			if( li.is(options.filterLi) ) return;
			self.list.find('li').removeClass(self.options.hoverClass);
			li.addClass(options.hoverClass);
			if( options.showSelection == true ){
				self.element.val(li.find('[litext]').length ? li.find('[litext]').text() : li.text());
			}
		});
		this.list.delegate('li', 'mouseleave', function(event){
			var li = $(this);
			if( li.is(options.filterLi) ) return;
			if( options.clickSelected != true ) $(this).removeClass(options.hoverClass);  //使用点击选中时，不移除hover样式
			if( self.checkPopupIsOpen() == true && options.showSelection == true ){
				self.element.val(self.element.data('searchKey'));
			}
		});
	},

	//过滤要显示的数组中的项目
	_filter: function(array, value){
		var options = this.options, matcher = new RegExp(this.options.searchFilter(value), 'i');
		return $.grep(array, function(v){
			return matcher.test(options.getFilterValue(v));
		});
	},
	//检查关键字是否符合显示列表的条件
	_checkSourceKey: function(value){
		if( value === false ) return false;
		if( this.options.igoneEmptyKey == true && value == '' ){
			this.hide();
			return false;
		}
		return true;
	},
	//获取关键字
	_getValue: function(){
		var value = this.options.formatValue(this.element.val());
		if( this.element.data('searchKey') != value ){
			this.element.data('searchKey', value);
			this.selected = null;
			return value;
		}
		return false;
	},

	_initSource: function(){
		var options = this.options,
			self = this,
			array;
		if( $.isArray(options.source) ){    //数据源是数组
			array = options.source;
			this.source = function(value){
				if( self._checkSourceKey(value) == false ) return;
				if( self._trigger('beforeSendKey', null, value) === false ) return;
				self.show(self._filter(array, value));
			};
		} else if( typeof options.source === "string" ){    //数据源是ajax链接
			options.url = options.source;
			this.source = function(value) {
				if( self._checkSourceKey(value) == false ) return;
				if( self._trigger('beforeSendKey', null, value) === false ) return;
				if( self.xhr ){
					self.xhr.abort();
				}
				self.element.addClass(options.loadingClass);
				var param = {};
				param[options.ajaxKey] = value;
				self.xhr = $.ajax({
					url: options.url,
					type: 'POST',
					data: param,
					dataType: "json",
					autocompleteRequest: ++ self.requestIndex,
					success: function(data, status){
						self.element.removeClass(options.loadingClass);
						if( this.autocompleteRequest === self.requestIndex ){
							options.dataList = data[options.ajax];
							self.show(options.dataList);
						}
					},
					error: function() {
						if( this.autocompleteRequest === self.requestIndex ){
							self.show([]);
						}
					}
				});
			};
		} else {    //自定义的数据源，应该是一个函数
			this.source = options.source;
		}
	},

	_keydown: function(event){
		if( event.isPropagationStopped() ) return;
		var options = this.options,
			self = this,
			keyCode = $.ui.keyCode;
		if( $.inArray(event.keyCode, this.CTRLKEY) > -1 ){
			switch(event.keyCode){
			case keyCode.UP:
				this.move(event, 'up');
				break;
			case keyCode.DOWN:
				this.move(event, 'down');
				break;
			case keyCode.TAB:
				this.getSelected(event);
				break;
			}
		} else {
			if( this.keyPressing == null ){
				this.keyPressing = setInterval(function(){
					self.source(self._getValue());
				}, 500);
			}
		}
	},
	_keyup: function(event){
		if( this.keyPressing ){
			clearInterval(this.keyPressing);
			this.keyPressing = null;
		}
		var key = this._getValue();
		if( event.isPropagationStopped() ) return;
		if( $.inArray(event.keyCode, this.CTRLKEY) == -1 ){
			this.source(key);
		} else {
			var keyCode = $.ui.keyCode;
			switch(event.keyCode){
			case keyCode.ENTER:
				this._trigger('pressEnter', event, this.getSelected(event, this.options.enterSelectFirst));
				if( this.selected != null ) this.element.blur();   //回车选中后，使输入框失去焦点
				break;
			}
		}
	},

	move: function(event, direction){
		if( this.showing != true || this.checkPopupIsOpen() != true ) return false;
		var self = this, options = this.options,
			list = this.list.find('li').not(options.filterLi);
		function getPrev(li){
			li = li.prev('li');
			if( li.length == 0 || (li.length > 0 && li.not(options.filterLi).length > 0) ){
				return li;
			} else {
				return getPrev(li);
			}
		}
		function getNext(li){
			li = li.next('li');
			if( li.length == 0 || (li.length > 0 && li.not(options.filterLi).length > 0) ){
				return li;
			} else {
				return getNext(li);
			}
		}
		if( list.length ){
			var li = list.filter('.' + options.hoverClass), value = this.element.data('searchKey');
			list.removeClass(options.hoverClass);
			switch(direction){
			case 'up':
				if( li.length ){
					li = getPrev(li);
				} else {
					li = list.filter(':last');
				}
				break;
			case 'down':
				if( li.length ){
					li = getNext(li);
				} else {
					li = list.filter(':first');
				}
				break;
			}
			li.addClass(options.hoverClass);
			if( options.showSelection == true ){
				var value = li.length > 0 ? li.find('[litext]').length ? li.find('[litext]').text() : li.text() : this.element.data('searchKey');
				this.element.val(value);
			}
			event.preventDefault();
		}
	},

	getSelected: function(event, selectFirst){
		var list = this.list.find('li').not(this.options.filterLi),
			li = list.filter('.' + this.options.hoverClass);
		if( li.length ){
			this._selected(event, li);
			return li;
		} else {
			if( selectFirst == true ){
				return this._selectFirst(event, list);
			}
			return $();
		}
	},
	_selectFirst: function(event, list){
		if( list.length > 0 ){
			var li = list.filter(':first');
			var litext = li.find('[litext]').length ? li.find('[litext]').text() : li.text();
			if( $.trim(litext).toLowerCase() == $.trim(this.element.val()).toLowerCase() ){
				this._selected(event, li);
				return li;
			}
		}
		return $();
	},

	_selected: function(event, li){
		if( this.keyPressing ){
			clearInterval(this.keyPressing);
			this.keyPressing = null;
		}
		this.element.data('searchKey', li.find('[litext]').length ? li.find('[litext]').text() : li.text());
		this.selected = li;
		this._trigger('selected', event, this.selected);
		this.hide();
	},
	_unselected: function(event){
		if( this.checkPopupIsOpen() && this.options.blurSelectFirst == true ){
			var li = this._selectFirst(event, this.list.find('li').not(this.options.filterLi));
			if( li.length ) return;
		}
		this.selected = $();
		this._trigger('unselected', event, this.selected);
		this.hide();
	},

	_format_li: function(str){
		var args = Array.prototype.slice.call(arguments);
		var re = new RegExp('%([1-' + (args.length - 1) + '])', 'g');
		return str.replace(re, function(match, index){
			return args[index];
		});
	},

	show: function(data, position){
		this.element.removeClass(this.options.loadingClass);
		if( this.element.is(':hidden') ){
			this.hide();
			return;
		}
		if( this.checkPopupIsOpen() ){
			this._trigger('hide', null, this.list);
		}
		this.list.empty();
		var self = this, options = this.options;
		var newData = this._trigger('formatList', null, data);
		if( $.isArray(newData) ) data = newData;
		options.dataList = data;
		if( data.length ){
			var l = options.listMax > 0 ? Math.min(data.length, options.listMax) : data.length;
			for( var i = 0; i < l; i++ ){
				var template = [options.li_template];
				for( var j = 0; j < options.li_id.length; j++ ){
					template.push(data[i][options.li_id[j]]);
				}
				var li = $(this._format_li.apply(this, template)).appendTo(this.list);
				if( i % 2 == 0 ){
					li.addClass(options.listHighlightClass);
				}
			}
		} else {
			if( options.showEmptyList != true ){
				this.hide();
				return;
			}
		}
		this.checkPopupInited() && this.list.popupLayer('close');
		this.showing = false;
		if( this._trigger('beforeShow', null, this.list) !== false ){
			this.selected = null;
			var pos = {of: this.element, my: 'left top', at: 'left bottom', collision: 'none'};
			position = position || options.position;
			if( $.isPlainObject(position) ){
				pos = $.extend(pos, position);
			} else if( $.isArray(position) ){
				if( position[0].constructor == Number && position[1].constructor == Number ){
					pos = position;
				}
			}
			this.list.popupLayer($.extend({
				uiPopup: this.pop.empty(),
				width: options.width || this.element.outerWidth(),
				position: pos,
				closeDestroy: false,
				reserve: true
			}, options.popupOptions));
			this.showing = true;
		}
	},

	hide: function(){
		if( this.showing != true ) return;
		this._trigger('hide', null, this.list);
		var self = this;
		setTimeout(function(){
			self.selected = null;
			self.list.find('li').removeClass(self.options.hoverClass);
			self.list.popupLayer('close');
			self.element.triggerHandler('input.defaultTips');
			self.showing = false;
		}, 100);
	},

	checkPopupInited: function(){
		return !!this.list.data('popupLayer');
	},
	checkPopupIsOpen: function(){
		return this.checkPopupInited() && (this.list.popupLayer('isOpen') == true);
	},

	_setOption: function(key, value) {
		$.Widget.prototype._setOption.apply(this, arguments);
		switch (key) {
		case "source":
			this._initSource();
			break;
		}
	}
});
})(jQuery);


//自定义select ui，参考ui.combobox
(function($) {
$.widget("ushi.uiSelect", {
	options: {
		widgetClass: 'ushi-ui-select',
		widgetUiClass: 'ui-select',
		type: 'select',                //select的类型：select、search（可输入关键字搜索）
		hideSelect: true,              //默认隐藏原Select
		searchTips: '',
		readonly: true
	},

	_create: function(){
		var self = this, options = this.options,
			select = this.element.addClass(options.widgetClass);

		if( options.hideSelect ) select.hide();
		var wrapper = select.attr('uiSelect') ? $(select.attr('uiSelect')) : $();
		if( wrapper.length == 0 ){
			wrapper = $('<span class="' + options.widgetUiClass + '"><input type="text" class="ui-select-input" /><a class="ui-select-toggle"><span class="ui-select-toggle-ico"></span></a></span>');
		}
		if( options.wrapperClass ) wrapper.addClass(options.wrapperClass);

		var input = wrapper.children('input');
		if( options.type == 'search' ){
			options.readonly = false;
			input.attr('defaultTips', options.searchTips).showDefaultTips();
		} else {
			input.val(getSelected().text);
		}
		if( options.readonly == true ){
			input.attr({"readonly": true, "unselectable": 'on'}).addClass('ui-select-readonly');
		} else {
			input.removeAttr('readonly').removeAttr('unselectable').removeClass('ui-select-readonly');
		}

		input.autocomplete($.extend({
			listContClass: 'ui-select-list',
			li_template: '<li index="%1" %3>%2</li>',
			li_id: ['value', 'text', 'hover'],
			listMax: 0,
			hasScrollBar: true,
			showSelection: false,
			clickSelected: true,
			closeEventName: '.popup-close-ui-select',
			popupOptions: {
				hasOverflow: false
			},
			selected: function(event, li){
				setSelected(li.attr('index'), li.text());
				$(this).triggerHandler('input.defaultTips');
			},
			getFilterValue: function(v){
				return v.text;
			}
		}, options.acOptions || {}));
		var ac = input.data('autocomplete');

		if( options.type == 'search' ){
			input.data('searchKey', '');
			input.autocomplete('option', 'enterSelectFirst', true);
			input.autocomplete('option', 'blur', function(){
				var array = ac.options.dataList, v = $.trim(input.val());
				if( v == '' ) return;
				for( var i = 0; i < array.length; i++ ){
					if( array[i].text == v ){
						setSelected(array[i].value, array[i].text);
						return;
					}
				}
				input.data('searchKey', '').val('').triggerHandler('input.defaultTips');
			});
		}

		input.autocomplete('option', 'source', source);
		input.autocomplete('option', 'focus', function(event, input){
			if( ac.checkPopupIsOpen() ){
				input.blur();
			} else {
				ac.source(input.val());
			}
			return false;
		});
		wrapper.children('.ui-select-toggle').click(function(event){
			if( input.attr('disabled') ) return false;
			//点击toggle总是标记要显示出完整列表
			input.data('clickToggle', true).focus();
			setTimeout(function(){
				input.removeData('clickToggle');
			}, 200);
			return false;
		});
		select.change(function(){
			var text = getSelected().text;
			input.val(text).data('searchKey', text);
		});

		function source(value){
			if( options.type != 'search' || input.data('clickToggle') == true ){
				ac.show(getOption(value));    //显示完整列表
			} else {
				value = (value === false ? input.val() : value) || '';
				if( value == '' ){
					ac.hide();
					return;
				}
				ac.show(ac._filter(getOption(null), value));    //显示过滤关键字后的列表
			}
		}
		function getOption(value){
			var array = [];
			select.children('option, optgroup').each(function(){
				var opt = $(this);
				if( opt.is('optgroup') ){
					array.push({value: '-1', text: opt.attr('label'), hover: 'class="ui-select-optgourp"'});
				} else {
					array.push({value: opt.val(), text: opt.text(), hover: (opt.text() == value ? 'class="hover"' : '')});
				}
			});
			return array;
		}
		function getSelected(){
			var selected = select.children(':selected');
			return {value: (selected.val() ? selected.val() : ''), text: selected.text()};
		}
		function setSelected(value, text){
			input.val(text).data('searchKey', text);
			if( value ){
				select.val(value);
				select.trigger('change');
			} else {
				select.children('option').each(function(){
					if( $(this).text() == text ){
						this.selected = true;
						return false;
					}
				});
			}
		}

		this.wrapper = wrapper;
		this.input = input;
		this.select = select;

		if( select.attr('disabled') || input.attr('disabled') ) this.disabled();
	},

	disabled: function(){
		this.wrapper.find('>*').css('opacity', 0.5);
		this.input.attr('disabled', true);
		this.select.attr('disabled', true);
	},
	enabled: function(){
		this.wrapper.find('>*').css('opacity', 1);
		this.input.removeAttr('disabled');
		this.select.removeAttr('disabled');
	},

	close: function(){
		this.input.autocomplete('hide');
	},

	destroy: function() {
		this.wrapper.remove();
		this.element.show();
		$.Widget.prototype.destroy.call(this);
	}
});
})(jQuery);


//通用验证组件
(function($) {
$.widget("ushi.validate", {
	options: {
		widgetClass: 'ushi-validate',
		fieldExpr: 'input[Validate], select[Validate], textarea[Validate]',
		validateAjax: false,          //是否验证ajax
		bindBlur: false,              //是否在失去焦点时做验证
		bindSubmit: true,             //是否在提交表单时做验证
		ignoreHidden: false,          //是否忽略被隐藏的表单项
		resetOpt: true,               //验证时是否重新获取验证选项
		submitReset: false,           //提交表单时，是否重新初始化验证组件
		fieldParent: '[vdFld]',
		hide: function(event, field){ field.data('validateOpt')['parent'].find('[vdErr], [js="vdErr"]').hide(); },
		showNormal: function(){},
		showSuc: function(event, field){ field.data('validateOpt')['parent'].find('[vdErr], [js="vdErr"]').hide(); },
		showErr: function(event, field){
			var msg = field.data('validateOpt')['parent'].find('[vdErr], [js="vdErr"]');
			if( msg.length == 0 ) return;
			if( msg.attr('vdErr') == 'alert' ){
				pop_alert(msg.html());
			} else {
				msg.show();
			}
			if( msg.find('> [forTool]').length > 0 ){
				msg.find('> [forTool]').hide().filter('[forTool="' + field.attr('curTool') + '"]').show();
			}
		}
	},

	_create: function() {
		var self = this, options = this.options;
		this.element.addClass(options.widgetClass);

		this.tools = new $.ushi.validate.tools(this.element, options.extTools || {});
		this.tmCheckBlur = null;
		this.blurField = null;    //失去焦点的表单项

		this.init();

		this.element.data('validateResult', 'waiting').bind('ValidateForm', function(event, callback){
			if( options.submitReset == true ) self.init();
			self.validate(callback);
			return false;
		});
		if( options.bindSubmit == true ){
			this.bindSubmit();
		}
	},

	init: function(){
		var self = this, options = this.options;
		this.ajax = 0;
		this.fields = this.element.find(options.fieldExpr)
		this.fields.each(function(){
			var field = $(this), oldOpt = field.data('validateOpt');
			if( oldOpt && oldOpt.ignoreResetOpt == true ){
				return true;
			}
			var opt = $.ushi.validate.getOptions(field.attr('vdOpt'));
			if( opt.url ){
				self.ajax ++;
				field.attr('vdAjaxField', 'suc');
			}
			opt['field'] = field;
			opt['parent'] = field.closest(options.fieldParent);
			opt['tools'] = self.tools;
			field.data('validateOpt', opt);
		});
		this.fields.unbind('Validate').bind('Validate', function(event, result, ajax, evtType){
			if( evtType ){
				event.type = evtType;
			}
			if( ajax ){
				$(this).attr('vdAjaxField', ajax);
			}
			if( result === -1 ){
				self._trigger('hide', event, $(this));
			} else if( result == true ){
				self._trigger('showSuc', event, $(this));
			} else if( result == false ){
				self._trigger('showErr', event, $(this));
			}
			return false;
		});
		if( options.bindBlur == true ){
			this.bindBlur();
		}
	},

	//设置验证结果：在element中设置验证结果，以便其他程序访问结果，同时作为参数调用回调函数
	//            type表示设置结果的验证阶段，一般为：Validate（验证结束并返回true）；afterValidate（验证结束但返回false）；beforeValidate（验证未开始就返回false）
	_setResult: function(result, callback, type){
		type = type || 'Validate';
		var after = this._trigger('afterValidate', $.Event('afterValidate'), {'result': result});
		after = result && ( after !== false );
		this.element.data('validateResult', after);
		type = after == true ? 'Validate' : result == true ? 'afterValidate' : type;
		callback.call(this.element, after, type);
	},

	//验证流程：1、判断是否有ajax验证
	//         2、无ajax验证时，依次验证表单项并设置验证结果（在设置验证结果函数中执行验证回调函数）
	//         3、有ajax验证时，设置ajax验证定时，定时判断所有验证是否结束，如结束则设置验证结果（在设置验证结果函数中执行验证回调函数）
	validate: function(callback){
		var self = this, tmSubmit = null, result;
		if( ! $.isFunction(callback) ) callback = function(){};

		this.element.data('validateResult', 'waiting');
		if( this._trigger('beforeValidate', $.Event('beforeValidate'), callback) === false ){
			this._setResult(false, callback, 'beforeValidate');
			return false;
		}
		if( this.ajax > 0 && this.options.validateAjax ){
			var ajaxField = this.fields.filter('[vdAjaxField]');
			if( ajaxField.length == this.ajax ){
				result = true;
				ajaxField.attr('vdAjaxField', 'waiting');
				if( tmSubmit ) clearInterval(tmSubmit);
				tmSubmit = setInterval(function(){
					if( self.fields.filter('[vdAjaxField="waiting"]').length == 0 ){
						clearInterval(tmSubmit);
						tmSubmit = null;
						result = ( self.fields.filter('[vdAjaxField="err"]').length == 0 && result == true );
						self._setResult(result, callback);
					}
				}, 200);
				result = this.exec();
			}
		} else {
			result = this.exec(true);
			this._setResult(result, callback);
		}
		return this.element.data('validateResult');
	},

	_checkField: function(field, ignoreAjax){
		var str = $.trim(field.val() || ''), opt = field.data('validateOpt'),
			tool = $.trim(field.attr('Validate')),
			result = true;
		if( str == field.attr('defaultTips') ) str = '';
		if( this.options.resetOpt ){
			delete opt.ignore;
			opt = $.extend(opt, $.ushi.validate.getOptions(field.attr('vdOpt')));
		}
		if( opt.ignore ){
			var ignore = '|' + opt.ignore + '|', str1 = (str == '') ? '|empty|' : '|' + str + '|';
			if( ignore.indexOf(str1) > -1 ){
				if( field.attr('vdAjaxField') ) field.attr('vdAjaxField', 'suc');
				return -1;
			}
		}
		if( tool ){
			tool = tool.split(/,|\s/);
			for( var i = 0; i < tool.length; i++ ){
				if( ignoreAjax && tool[i] == 'ajaxValidate' ){
					continue;
				}
				field.attr('curTool', tool[i]);
				if( this.tools[tool[i]] ){
					result = this.tools[tool[i]](str, opt);
					if( result == false ){
						return false;
					}
				}
			}
		}
		return result;
	},

	exec: function(ignoreAjax) {
		var self = this, options = this.options, result = true;
		this.fields.each(function(){
			var field = $(this);
			if( field.attr('vdIgnore') == 'yes' || (field.attr('vdIgnore') != 'no' && options.ignoreHidden && (! field.is('input[type=hidden]')) && field.is(':hidden')) ){
				var b = true;
			} else {
				var b = self._checkField(field, (ignoreAjax === true));
			}
			field.triggerHandler('Validate', [b]);
			result = (b && result);
		});
		if( self._trigger('CBexec', null, {'result': result}) === false ) return false;
		return result;
	},

	bindSubmit: function(){
		var self = this;
		if( this.element.is('form') ){
			//表单提交流程：1、判断表单是否正在提交，是则false跳出。
			//            2、判断是否已经得出验证结果，是则设置提交状态并true跳出。
			//            3、触发验证表单事件并设置一个验证后的回调函数，如验证结果为true则再次触发提交表单事件
			this.element.bind('submit.Validate', function(event){
				if( ! self.element.attr('target') ){
					if( self.element.data('validateSubmiting') == true ) return false;
					if( self.element.data('validateResult') == true ){
						self.element.data('validateSubmiting', true);
						return true;
					}
				} else {
					if( self.element.data('validateResult') == true ) return true;
				}
				if( self._trigger('beforeSubmit', event, self.element) !== false ){
					self.element.triggerHandler('ValidateForm', [function(result){
						if( result == true ){
							setTimeout(function(){
								self.element.submit();
							}, 0);
						}
					}]);
				}
				event.preventDefault();
			});
		}
	},

	bindBlur: function() {
		var self = this, options = this.options;
		var checkBlur = function(field){
			if( field ){
				var b = field.val() == '' ? -1 : self._checkField(field);
				field.triggerHandler('Validate', [b, null, 'blur']);
			}
			self.blurField = null;
		}
		this.fields
		.unbind('focus.Validate').bind('focus.Validate', function(event){
			self.fields.attr('vdFocus', 'out');
			var field = $(this);
			field.attr('vdFocus', 'in');
			if( self.tmCheckBlur ){
				clearTimeout(self.tmCheckBlur);
				self.tmCheckBlur = null;
				checkBlur(self.blurField);
			}
			if( field.val() == '' ){
				self._trigger('showNormal', event, field);
			} else {
				field.triggerHandler('Validate', [self._checkField(field), null, 'focus']);
			}
		})
		.unbind('blur.Validate').bind('blur.Validate', function(event){
			self.blurField = $(this);
			self.blurField.attr('vdFocus', 'out');
			if( options.bindBlurCheck != false ){
				self.tmCheckBlur = setTimeout(function(){
					checkBlur(self.blurField);
				}, 100);  //延迟执行blur
			}
		});
	}
});

$.extend($.ushi.validate, {
	//公用函数
	getOptions: function(str){
		var opt = {};
		if( str && typeof(str) == 'string' ){
			try{
				var sopt = str.slice(0, 1) == '{' ? str : '{' + str + '}';
				opt = (new Function('return ' + sopt))();
			} catch(e){
				// 兼容过去的代码
				var re = /(?:^|;)(.[^\:]*)\:(.[^;]*)/g;
				var g = re.exec(str);
				while( g ){
					opt[g[1]] = g[2];
					g = re.exec(str);
				}
			}
		}
		return opt;
	},
	//验证工具
	tools: function(form, ext){
		this.form = form;
		for( var key in ext ){
			if( $.isFunction(ext[key]) ){
				this[key] = ext[key];
			}
		}
	}
});

$.extend($.ushi.validate.tools.prototype, {
	re: {
		phone: '^[\\s\\d\\.\\*,+-]{5,}$',
		cellphone: '^[\\d]{%min,%max}$',
		zipcode: '^\\d{5,10}$',
		email: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$',
		skype: '^[a-zA-Z][\\w\\.]{5,31}$',
		qq: '^[1-9]{1}\\d{4,12}$',
		wangwang: '^[\\w\\u4E00-\\u9FA5]{5,20}$',
		url: '^http[s]?:\/\/([\\w.]+\/?)\\S*$'
	},

	isRegExp: function(str, opt){
		try {
			var reType = typeof(opt) == 'string' ? opt : opt.reType;
			if( reType ) {
				var re = new RegExp(this.re[reType], 'ig');
			} else {
				var re = new RegExp(opt.reStr || '', opt.reFlag || 'ig');
			}
			return re.test(str);
		} catch(e) {
			return false;
		}
	},
	isnotEmpty: function(str, opt){
		str = $.trim(str);
		if( str != '' ){
			if( opt.len ) return str.length <= parseInt(opt.len);
			return true;
		} else {
			return false;
		}
	},
	isNumber: function(str, opt){
		var num = opt.parse == 'int' ? parseInt(str, 10) : parseFloat(str);
		if( isNaN(num) || num.toString(10) != str ) return false;
		if( opt.min && parseFloat(opt.min) > num ) return false;
		if( opt.max && parseFloat(opt.max) < num ) return false;
		return true;
	},
	isnotValue: function(str, opt){
		return (str != opt.val);
	},
	isnotValueWith: function(str, opt){
		if( opt['with'] ){
			switch( opt['with'] ){
			case 'visible':
				return opt['field'].is(':visible') ? (str != (opt.val || '')) : true;
			}
		} else {
			return (str != opt.val);
		}
	},
	isPassword: function(str){
		return str.length >= 6;
	},
	confirmPassword: function(str, opt){
		if( opt['pw'] ){
			return str == $(opt['pw']).val();
		} else {
			return false;
		}
	},
	isCellphone: function(str, opt){
		opt = opt || {};
		var min = opt['min'] || '5', max = opt['max'] || '11';
		var sre = this.re.cellphone.replace('%min', min).replace('%max', max);
		return (new RegExp(sre, 'ig')).test(str);
	},
	isMultiPhone: function(str, opt){
		var r = 0, parent = opt.parent, tools = opt.tools;
		parent.find('[vdOpt]').each(function(){
			var field = $(this), type = field.attr('vdOpt'), v = field.val();
			if( v != '' && $.isFunction(tools[type]) ){
				if( tools[type](v) == false ){
					r = -1;
					return false;
				} else {
					r++;
				} 
			}
		});
		return r > 0;
	},
	isMultiEmail: function(str, opt){
		var a = str.split(/,|\;|\n|\s/g);
		if( a.length > opt.count ){
			return false;
		}
		for( var i = 0; i < a.length; i++ ){
			if( a[i] != '' && (new RegExp(this.re.email, 'ig')).test(a[i]) == false ){
				return false;
			}
		}
		return true;
	},
	isContact: function(str){
		return this.isRegExp(str, 'email') || this.isRegExp(str, 'phone');
	},
	isQQ: function(str){
		return this.isRegExp(str, 'email') || this.isRegExp(str, 'qq');
	},
	isWangWang: function(str){
		return this.isRegExp(str, 'wangwang') && ( !this.isNumber(str) );
	},
	isURL: function(str){
		return this.isRegExp(str, 'url');
	},
	isEmail: function(str){
		return this.isRegExp(str, 'email');
	},
	isPhone: function(str){
		return this.isRegExp(str, 'phone');
	},
	isZipcode: function(str){
		return this.isRegExp(str, 'zipcode');
	},
	isSkype: function(str){
		return this.isRegExp(str, 'skype');
	},
	isChecked: function(str, opt){
		return opt['field'][0].checked;
	},
	radioChecked: function(str, opt){
		var b = false;
		$(':radio[name="' + opt['field'][0].name + '"]').each(function(){
			b = (this.checked || b);
		});
		return b;
	},
	checkboxChecked: function(str, opt){
		return opt['parent'].find(':checkbox:checked').length > 0;
	},
	checkDatetime: function(vd, opt){
		var i, j = 0;
		for( i = 0; i < vd.length; i++ ){
			if( $(vd[i]).val() == '' || $(vd[i]).val() == '0' )
				j++;
		}
		if( i == j ){
			if( opt.required == 'no' )
				return true;
			return false;
		}
		if( j < i && j > 0 )
			return false
		return -1;
	},
	compareDate: function(str, opt){
		var vd = opt['parent'].find('select[vdDate]:visible, select[vdIgnore=no]');
		var check = this.checkDatetime(vd, opt);
		if( check == -1 ){
			var cur = new Date(), cd = new Date(cur.getFullYear(), cur.getMonth()),
				sd = new Date(vd.filter('[vdDate="sy"]').val(), parseInt(vd.filter('[vdDate="sm"]').val(), 10) - 1);
			if( vd.length == 4 ){
				var ed = new Date(vd.filter('[vdDate="ey"]').val(), parseInt(vd.filter('[vdDate="em"]').val(), 10) - 1);
				var b = (ed >= sd && sd <= cd);
				if( opt['chk'] && opt['chk'] == 'ed' )
					b = b && (ed <= cd);
				return b;
			} else {
				return (sd <= cd);
			}
		} else {
			return check;
		}
	},
	compareYear: function(str, opt){
		var vd = opt['parent'].find('select[vdDate]:visible, select[vdIgnore=no]');
		var check = this.checkDatetime(vd, opt);
		if( check == -1 ){
			var cur = new Date(), cy = new Date(cur.getFullYear(), 0),
				sy = new Date(vd.filter('[vdDate="sy"]').val(), 0),
				ey = new Date(vd.filter('[vdDate="ey"]').val(), 0);
			var b = (ey >= sy && sy <= cy);
			if( opt['chk'] && (opt['chk'] == 'ey' || opt['chk'] == 'ed') )
				b = b && (ey <= cy);
			return b;
		} else {
			return check;
		}
	},
	ajaxValidate: function(str, opt){
		if( opt['url'] ){
			var param = {};
			var key = opt['key'] || opt['field'].attr('name');
			if( key ) param[key] = str;
			$.ajax({
				url: opt['url'],
				cache: false,
				type: 'POST',
				dataType: 'text',
				data: param,
				success: function(data) {
					if( data == '0' ){
						opt['field'].triggerHandler('Validate', [true, 'suc']);
					} else {
						opt['field'].triggerHandler('Validate', [false, 'err']);
					}
				}
			});
		}
		return -1;
	}
});
})(jQuery);

//ajax提交一个form
(function($) {
$.widget("ushi.ajaxForm", {
	options: {
		ajaxOptions: {
			type: 'POST',
			dataType: 'text'
		}
	},

	_create: function(){
		if( this.element.is('form') ){
			this.form = this.element;
		} else {
			this.form = this.element.closest('form');
			if( this.form.length == 0 ){
				return false;
			}
			//如果element是普通按钮或链接，则自动绑定submit
			if( ! this.element.is(':submit') ){
				var self = this;
				self.element.click(function(){
					self.form.submit();
					return false;
				});
			}
		}
		if( $.isPlainObject(this.options.validate) || this.options.validate == true ){
			if( this.options.validate == true ){
				var vdOpt = {bindSubmit: false};
			} else {
				var vdOpt = $.extend({}, this.options.validate, {bindSubmit: false});
				this.options.validate = true;
			}
			this.form.validate(vdOpt);
		}
		this.bindSubmit();
	},

	_ajaxSubmit: function(){
		var self = this;
		var ajaxOpt = $.extend({}, this.options.ajaxOptions, {
			url: this.form.attr('action'),
			type: this.form.attr('method'),
			data: this.form.serializeArray()
		});
		if( ajaxOpt.cache === false || this.options.cache === false ){
			ajaxOpt.url += (ajaxOpt.url.indexOf('?') > -1 ? '&' : '?') + '_=' + (new Date()).getTime();
		}
		var success = $.isFunction(ajaxOpt.success) ? ajaxOpt.success : $.isFunction(this.options.success) ? this.options.success : function(){};
		ajaxOpt.success = function(data, ts){
			self.form.removeData('ajaxFoumSubmiting');
			success.call(self.form, data, self.form, ts);
		}
		this.form.data('ajaxFoumSubmiting', true);
		if( this.form.find(':file').length && $.ajaxFileUpload ){
			ajaxOpt['fileElementId'] = this.form.find(':file:first');
			ajaxOpt['secureuri'] = false;
			$.ajaxFileUpload(ajaxOpt);
		} else {
			$.ajax(ajaxOpt);
		}
		this._trigger('submiting', null, this.form);
	},

	bindSubmit: function(){
		var self = this;
		this.form.bind('submit.ajaxForm', function(event){
			if( self.form.data('ajaxFoumSubmiting') != true ){
				if( self._trigger('beforeSubmit', null, self.form) !== false ){
					if( self.options.validate == true ){
						self.form.triggerHandler('ValidateForm', [function(result){
							if( result == true ){
								self._ajaxSubmit();
							}
						}]);
					} else {
						self._ajaxSubmit();
					}
				}
			}
			event.preventDefault();
		});
	}
});
})(jQuery);


//自动验证输入字符表单的长度
jQuery.fn.checkFieldLength = function( options ){
	options = $.extend({
		cnWord: false
	}, options || {});
	return this.each(function(){
		var field = $(this);
		if( field.data('bindCheckFieldLength') == true ){
			return true;
		}
		var maxlen = options.maxlength || parseInt(field.attr('maxlength'), 10) || 200;
		maxlen = maxlen > 0 ? maxlen : 200;
		var tm = null;
		var checkLength = function(){
			var text = field.val();
			if( field.data('oldtext') == text ){
				clearInterval(tm);
				tm = null;
			} else {
				field.data('oldtext', text);
			}
			if( $.isFunction(options.check) ){
				text = options.check(text);
			}
			if( $.isFunction(options.cutWord) ){
				text = options.cutWord(text, maxlen, '');
			} else {
				text = text.slice(0, maxlen);
			}
			if( text != field.val() ){
				field.val(text).scrollTop(999);
			}
			var l = Math.max(0, maxlen - ( options.cnWord == true ? text.length : text.replace(/[^\x00-\xff]/g, 'AA').length ));
			( options.wordCount && $(options.wordCount).html(lang.feed.char_tip(l)) );
		};
		if( parseInt(maxlen, 10) > 0 ){
			maxlen = parseInt(maxlen, 10);
			field.data('bindCheckFieldLength', true)
				.bind('focus paste', function(){
					setTimeout(function(){
						checkLength();
					}, 50);
				})
				.bind('keydown mousedown', function(){
					if( tm != null ){ return true; }
					tm = setInterval(checkLength, 100);
				})
				.bind('keyup mouseup blur', function(){
					clearInterval(tm);
					tm = setTimeout(function(){
						checkLength();
					}, 50);
				});
		}
	});
};

//为文本输入框绑定显示默认提示
jQuery.fn.showPlaceholder = function(options){
	options = $.extend({
		bindSubmit: true,
		tipsColor: '#999',
		textColor: $.browser.msie ? '#333' : 'inherit'
	}, options || {});
	return this.each(function(){
		var tf = $(this);
		var isIE = jQuery.support.htmlSerialize == false || !('placeholder' in this);
		if( ! tf.attr('placeholder') ) return true;
		if( tf.data('showPlaceholder') ){
			var opt = $.extend(tf.data('showPlaceholder'), options);
			if( tf.val() == '' || tf.val() == tf.attr('placeholder') ){
				tf.css('color', opt.tipsColor);
				if (tf.val() == '' && isIE ){
					tf.val(tf.attr('placeholder'));
				}
			}
			tf.data('showPlaceholder', opt);
			return true;
		}
		if( tf.val() == '' ) tf.css('color', options.tipsColor);
		if( isIE ){
			var form = tf.closest('form');
			if( form.length ){
				if( options.bindSubmit ){
					form.submit(function(){
						if( tf.val() == tf.attr('placeholder') ){
							tf.val('');
						}
					});
				}
			}
			tf.bind('blur.showPlaceholder', function(){
				var opt = tf.data('showPlaceholder') || options;
				if( tf.val() == '' ){
					tf.val(tf.attr('placeholder')).css('color', opt.tipsColor);
				}
			});
			tf.bind('focus.showPlaceholder click.showPlaceholder', function(){
				var opt = tf.data('showPlaceholder') || options;
				if( tf.val() == tf.attr('placeholder') ) tf.val('');
				tf.css('color', opt.textColor);
			});
			tf.triggerHandler('blur.showPlaceholder');
		} else {
			if( tf.val() == tf.attr('placeholder') ) tf.val('');
			tf.bind('input.showPlaceholder', function(){
				var opt = tf.data('showPlaceholder') || options;
				tf.css('color', (tf.val() == '') ? opt.tipsColor : opt.textColor);
			});
		}
		tf.data('showPlaceholder', options);
	});
};
jQuery.fn.showDefaultTips = function(options){
	return this.each(function(){
		var tf = $(this);
		if( tf.attr('placeholder') ){
			tf.showPlaceholder(options);
		} else if( tf.attr('defaultTips') ){
			try{tf.attr('placeholder', tf.attr('defaultTips')).showPlaceholder(options);} catch(e){}
		}
	});
};


//通过一个链接或按钮选择文件上传
jQuery.fn.uploadFile = function(options){
	options = $.extend({
		type: 'submit',
		dataType: 'json'
	}, options || {});
	return this.each(function(i){
		var btn = $(this), fID = options.name + (new Date()).getTime(), btnBox = {width: btn.outerWidth(), height: btn.outerHeight()};
		var form = null, fileBase = $('<input type="file" id="' + fID + '" name="' + options.name + '" />').css($.extend({display:'block', padding:0, width:'220px', height:'30px', cursor:'pointer'}, options.style || {}));
		if( options.type != 'form' ){
			if( options.type == 'ajax' && ! jQuery.ajaxFileUpload ) throw 'uploadFile missing argument: ajaxFileUpload';
			form = $('<form action="' + options.action + '" method="post" enctype="multipart/form-data"></form>').append(fileBase.clone());
			$('body').append(form.css({display: 'none', opacity: 0}));
		} else {
			form = $(options.form).css({display: 'none', opacity: 0});
		}
		var evt = 'mousemove.uf_' + options.name + '_' + i;
		var changeSubmit = function(){
			var f = $(this);
			if( $.isFunction(options.onChange) ){
				options.onChange.call(f, btn);
			}
			if( options.type == 'ajax' ){
				$.ajaxFileUpload({
					fileElementId: fID,
					secureuri: false,
					dataType: options.dataType,
					url: options.action,
					success: function(data){
						f.removeAttr('disabled');
						if( $.isFunction(options.success) ) options.success(data);
						form.empty().append(fileBase.clone());
					}
				});
			} else {
				f.closest('form').trigger('submit');
			}
			hideFile();
			setTimeout(function(){
				f.attr('disabled', true);
			}, 50);
		}
		var hideFile = function(){
			form.css({
				display: 'none',
				position: 'static',
				zIndex: 0
			});
			$(document).unbind(evt);
		}
		var fileMove = function(event){
			if( event.pageX < btnBox.left || event.pageY < btnBox.top || event.pageX > btnBox.right || event.pageY > btnBox.bottom ){
				hideFile();
			} else {
				form.css({
					left: (event.pageX - 200) + 'px',
					top: (event.pageY - 10) + 'px'
				});
			}
		}
		form.delegate(':file', 'change', changeSubmit);
		btn.bind('mouseenter', function(event){
			var os = btn.offset();
			btnBox.top = os.top; btnBox.left = os.left;
			btnBox.bottom = os.top + btn.outerHeight(); btnBox.right = os.left + btn.outerWidth();
			form.css({
				display: 'block',
				position: 'absolute',
				zIndex: 2147483583,
				left: 0,
				top: 0
			}).appendTo('body');
			fileMove(event);
			$(document).bind(evt, fileMove);
		});
	});
}

// 简单的tabs
jQuery.fn.simpleTabs = function(options){
	options = $.extend({
		selectedClass: 'select',
		tabs: '>ul>li>a',
		content: '>div'
	}, options || {});
	return this.each(function(){
		var obj = $(this), tab = obj.find(options.tabs), cont = obj.find(options.content);
		tab.each(function(i){
			$(this).click(function(){
				tab.removeClass(options.selectedClass);
				$(this).addClass(options.selectedClass);
				cont.hide();
				cont.filter(':eq(' + i + ')').show();
				return false;
			});
		});
	});
};

//字数超长时截字
jQuery.fn.ellipsis = function(options){
	options = $.extend({
		updating: false,
		instr: '...'
	}, options || {});
	var s = document.documentElement.style;
	if(!('textOverflow' in s || 'oTextOverflow' in s )){
		return this.each(function(){
			var el = $(this);
			if(el.css('overflow') == "hidden"){
				el.css({
					'wordBreak': 'keep-all',
					'wordWrap': 'normal',
					'whiteSpace': 'nowrap'
				});
				var originalText = el.html();
				var w = parseInt(el.attr('textOverflow')) || el.width();
				var t = $(this.cloneNode(true)).hide().css({
					'position':'absolute',
					'overflow':'visiable',
					'width':'auto',
					'max-width':'inherit'
				});
				el.after(t);

				var text = originalText;
				while(text.length > 0 && t.width() > w){
					text = text.substr(0, text.length-1)
					t.html(text + options.instr);
				}
				el.html(t.html());
				t.remove();

				if(options.updating == true){
					var oldW = w;
					setInterval(function(){
						if(el.width() != oldW){
							oldW = el.width();
							el.html(originalText);
							el.ellipsis();
						}
					},200);
				}
			}
		})
	} else {
		return this.each(function(){
			$(this).css({
				'wordBreak': 'keep-all',
				'wordWrap': 'normal',
				'whiteSpace': 'nowrap'
			});
		});
	}
}

//上下滚动
jQuery.fn.UscrollTop = function(options){
	options = $.extend({
		from: null,
		steps: 10,
		ease: function (x, t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		}
	}, options || {});
	return this.each(function(){
		var block = $(this), from = block.scrollTop(), to = options.to;
		if( options.from != null ){
			from = options.from;
			block.scrollTop(from);
		}
		if( ! to ) return;
		var t = 0, l = to - from;
		function scroll(){
			if( t > options.steps ) return;
			t ++;
			block.scrollTop(from + l * options.ease(t * 50 / 500, t * 50, 0, 1, 500));
			setTimeout(scroll, 50);
		}
		scroll();
	});
}


//预览本地图片（ie无效）
jQuery.fn.previewImage = function(options){
	options = $.extend({
			events: 'change',
			previewCont: '#previewImageCont',
			maxWidth: 200,
			maxHeight: 150,
			emptyCont: false,
			exts: 'jpg|gif|png|bmp'
		}, options || {});
	function getFilePath(file){
		try{
			file.select();
			var path = document.selection.createRange().text, re = new RegExp('[\)\'\"\%]', 'g');
			//path = path.replace(re, function(s){ return escape(escape(s)); });
			document.selection.empty();
		} catch(e) {
			var path = '';
		}
		return path;
	};
	function checkFileExt(file){
		if( file == '' )
			return 1;
		var re = new RegExp('\.(?:' + options.exts + ')$', 'ig');
		return re.test(file) ? 0 : 2;
	};
	function displayImage(dataURL, n){
		var img = document.createElement('img');
		$(img).load(function(){
			resetScale($(this));
		});
		img.src = dataURL;
		var cont = $.isArray(options.previewCont) ? options.previewCont[n] : options.previewCont;
		cont = $(cont);
		if( options.emptyCont == true ) cont.empty();
		cont.append(img);
	};
	function resetScale(img, w, h){
		var reset = function(width, height){
			var ratio = Math.max( 0, options.ratio ) || Math.min( 1,
				Math.max( 0, options.maxWidth ) / width  || 1,
				Math.max( 0, options.maxHeight ) / height || 1 );
			img.css({
				width: Math.round(ratio * width) + 'px',
				height: Math.round(ratio * height) + 'px'
			});
		}
		w = w || img.width(); h = h || img.height();
		if( w && h ){
			reset(w, h);
		} else {
			setTimeout(function(){
				reset(img.width(), img.height());
			}, 50);
		}
	}
	return this.each(function(n){
		$(this).bind(options.events, function(){
			var path = ( this.files ) ? this.value : getFilePath(this);
			var checkCode = checkFileExt(path);
			if( $.isFunction(options.checkFile) )
				if( options.checkFile(checkCode) === false )
					return;
			if( checkCode != 0 )
				return;
			if (this.files){
				var fs = this.files;
				for (var i = 0, j = fs.length; i < j; i++){
					var file = fs[i];
					if (!/image.*/.test(file.type)){
						continue;
					}
					try {
						displayImage(file.getAsDataURL(), n);
					} catch (e){
						var reader = new FileReader();
						reader.onload = function(e){
							displayImage(e.target.result, n);
						}
						reader.readAsDataURL(file);
					}
				}
			} else {
				if( $.browser.msie ){
					if( $.browser.version == '6.0'){
						displayImage(path, n);
					} else {
						var TRANSPARENT = $.browser.version == '7.0' ? 'http://static.ushi.cn/s/bns/images/ico_blank.gif' :
							'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
						var preload = $('<div/>').appendTo('body');
						preload.css({
							width: "1px",
							height: "1px",
							visibility: "hidden",
							position: "absolute",
							left: "-9999px",
							top: "-9999px",
							filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image')"
						});
						try{
							preload[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = path;
						}catch(e){
							return;
						}
						var img = document.createElement('img');
						img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + path + "\")";
						img.src = TRANSPARENT;
						var cont = $.isArray(options.previewCont) ? options.previewCont[n] : options.previewCont;
						cont = $(cont);
						if( options.emptyCont == true ) cont.empty();
						cont.append(img);
						resetScale($(img), preload.width(), preload.height());
						preload.remove();
					}
				}
			}
		});
	});
};


