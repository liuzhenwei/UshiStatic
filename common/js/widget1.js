/* 瀑布流样式组件 ******************************************/
;(function($) {
$.widget('ushi.waterfall', {
	options: {
		widgetClass: 'ushi-waterfall',
		itemCtx: 'div.item',
		itemWidth: 200,	      //显示块的宽度
		minColumCount: 2,     //最小显示列
		gap: 10,              //行列之间的间隔
		resizeInterval: 250,  //窗口宽度改变的时间间隔
		showInterval: 50,     //每个显示块的显示时间间隔， 0 时将直接显示
		showOvertime: 5,      //下载显示超时秒
		itemSort: false,      //显示块dom对象是否重新排列
		resizeRefresh: true   //是否允许容器宽度改变重刷显示
	},

	_create: function(){
		this.element.addClass(this.options.widgetClass);
		this.curShow = 0;
		this.showedList = [];
		this.showingList = [];
		this.tmShowing = null;
		this.tmOvertime = null;
		this.columsCount = this._getColumsCount();
		if( this.options.resizeRefresh == true ){
			var self = this, tmResize = null;
			$(window).resize(function(){
				if( tmResize != null ){
					clearTimeout(tmResize);
					tmResize == null;
				}
				tmResize = setTimeout(function(){
					var cc = self._getColumsCount();
					if( self.columsCount != cc ){
						self.columsCount = cc;
						self._init();
					}
				}, self.options.resizeInterval);
			});
		}
	},

	_init: function(){
		this.curList = this.element.find(this.options.itemCtx);
		this.curList.css({opacity: 0, top: 0, left: 0});
		this.colums = [];
		for( var i = 0; i < this.columsCount; i++ ){
			this.colums.push({
				left: i * (this.options.itemWidth + this.options.gap),
				height: 0,
				items: []
			});
		}
		if( this.showedList.length == 0 ){
			this.showingList = [];
			this.show();
		} else {
			this.curShow = 0;
			this.showingList = this.showedList;
			this.showedList = [];
			this._showItem();
		}
	},

	show: function(list){
		var self = this;
		if( list ) this.curList = list;
		this.curListLength = this.curList.length;
		var checkOvertime = function(){
			self.showOvertime ++;
			if( self.showOvertime < self.options.showOvertime ){
				self.tmOvertime = setTimeout(checkOvertime, 1000);
			} else {
				self.showOvertime = 0;
				self.curListLength = self.showingList.length;
				self._showItems();
			}
		}
		this.showOvertime = 0;
		this.tmOvertime = setTimeout(checkOvertime, 1000);
		this.curList.each(function(n){
			var item = $(this);
			item.data('loadIndex', n);
			if( item.attr('loaded') == 'true' ){
				self._showItems(item);
			} else {
				item.attr('loaded', 'false');
				self.loadItem(item);
			}
		});
	},

	loadItem: function(item){
		var self = this, img = item.find('img');
		if( img.length && img.height() == 0 ){
			item.data('loading', true);
			img.load(function(){
				item.removeData('loading');
				item.attr('loaded', 'true');
				self._showItems(item);
			});
		} else {
			item.attr('loaded', 'true');
			self._showItems(item);
		}
	},

	append: function(list){
		this._trigger('beforeAppend', $.Event('append'), list);
		this.element.append(list);
		this.showingList = [];
		this.show(list.css({opacity: 0, top: 0, left: 0}));
	},

	removeItem: function(item){
		var info = item.data('colInfo'), items = info.col.items;
		items.splice(info.colIndex, 1);
		item.slideUp(200, function(){
			for( var i = info.colIndex; i < items.length; i++){
				var obj = items[i].data('colInfo');
				obj.top -= info.height;
				obj.colIndex = i;
				obj.colHeight -= info.colHeight;
				items[i].data('colInfo', obj).css('top', obj.top + 'px');
			}
			info.col.height = items.length ? items[items.length - 1].data('colInfo')['colHeight'] : 0;
		});
	},

	setItemHeight: function(item){
		var info = item.data('colInfo'), items = info.col.items, oldHeight = info.height;
		info.height = item.outerHeight() + this.options.gap;
		var h = info.height - oldHeight;
		info.colHeight += h;
		item.data('colInfo', info);
		for( var i = info.colIndex + 1; i < items.length; i++ ){
			var obj = items[i].data('colInfo');
			obj.top += h;
			obj.colHeight += h;
			items[i].data('colInfo', obj).css('top', obj.top + 'px');
		}
		info.col.height = items[items.length - 1].data('colInfo')['colHeight'];
	},

	_showItems: function(item){
		if( item ) this.showingList.push(item);
		if( this.showingList.length >= this.curListLength ){
			clearTimeout(this.tmOvertime);
			this._trigger('beforeShow', $.Event('showItem'), this);
			this._showItem();
		}
	},

	//逐个显示item
	_showItem: function(){
		var self = this;
		if( this.options.showInterval == 0 ){
			this._showx();
		} else {
			var self = this;
			if( this.tmShowing != null ) return;
			this.tmShowing = setTimeout(function(){
				self.tmShowing = null;
				self._showx();
			}, this.options.showInterval);
		}
	},

	//具体的显示代码
	_showx: function(){
		if( this.showingList.length == 0 ){  //最后一个显示结束
			this.element.height(this._getContHeight());
			this._trigger('showEnd', $.Event(), this);
			this.curListLength = 0;
			return;
		}

		var item = $(this.showingList.shift());
		var self = this, options = this.options;
		var minColum = this._getMinHeightColum();
		var pos = {left: minColum.left, top: minColum.height};
		this._trigger('showItem', $.Event('showx'), item);
		if( options.itemSort == true ) this.element.append(item);
		item.removeData('loadIndex').css({
			opacity: 1,
			left: pos.left + 'px',
			top: pos.top + 'px'
		}).attr('showed', ++this.curShow).data('colInfo', {
			left: pos.left,
			top: pos.top,
			height: item.outerHeight() + options.gap,
			col: minColum,
			colIndex: minColum.items.length,
			colHeight: minColum.height + item.outerHeight() + options.gap
		});
		minColum.items.push(item);
		minColum.height = item.data('colInfo')['colHeight'];
		this.showedList.push(item);

		this._showItem();
	},

	_getMinHeightColum: function(){
		var col = this.colums[0];
		for( var i = 1; i < this.columsCount; i++ ){
			if( col.height > this.colums[i].height ){
				col = this.colums[i];
			}
		}
		return col;
	},

	_getContHeight: function(){
		var h = this.colums[0].height;
		for( var i = 1; i < this.columsCount; i++ ){
			if( h < this.colums[i].height ){
				h = this.colums[i].height;
			}
		}
		return h;
	},

	_getColumsCount: function(){
		this.contWidth = this.element.width();
		return Math.max(this.options.minColumCount, parseInt((this.contWidth + this.options.gap) / (this.options.itemWidth + this.options.gap), 10));
	}
});
})(jQuery);

//自定义滚动条
;(function($){
$.widget('ushi.scrollbar', {
	options: {
		widgetClass: 'ushi-scrollbar',
		opacity: 1,
		width: 20,
		height: 200,
		position: 'relative',
		horizontal: false,             //是否为水平滚动
		hasArrow: false,               //是否显示上下箭头
		arrowHeight: 0,                //箭头的高度
		blockHeight: 0,                //滚动块的高度
		dgOptions: null,               //滚动块的拖动参数
		aniSpeed: 200,                 //动画的时间
		container: null,               //包含滚动条的容器，如果非null，则自动append
		scrollTopX: 0                  //滚动条的滚动位置（百分比）
	},

	_create: function(){
		var options = this.options, self = this;
		options.blockHeight = Math.min(options.height, Math.round(options.blockHeight || options.height / 2));

		//创建滚动条的参数
		self.barOpt = options.horizontal == true ? {
			width: options.height,
			height: options.width,
			Height: 'width',
			OuterHeight: 'outerWidth',
			Width: 'height',
			OuterWidth: 'outerHeight',
			top: 'left',
			bottom: 'right',
			left: 'top',
			axis: 'x'
		} : {
			width: options.width,
			height: options.height,
			Height: 'height',
			OuterHeight: 'outerHeight',
			Width: 'width',
			OuterWidth: 'outerWidth',
			top: 'top',
			bottom: 'bottom',
			left: 'left',
			axis: 'y'
		}

		//滚动条
		self.bar = self.element.addClass(options.widgetClass)
			.css({
				display: 'block',
				position: options.position,
				width: self.barOpt.width,
				height: self.barOpt.height,
				opacity: options.opacity
			})
			.data({
				draging: false,
				mouseleave: true
			});

		self.block = self.bar.find('[scroll=block]');   //滚动块
		self.blockCont = $();                           //滚动块的容器
		self.topArrow = $();                            //向上箭头
		self.bottomArrow = $();                         //向下箭头

		if( self.block.length == 0 ){
			self._createBar();
		} else {
			self._initBar();
		}

		var dgOpt = {
			axis: self.barOpt.axis,
			containment: self.blockCont,
			scroll: false,
			start: function(event){
				self.bar.data('draging', true);
				self._dragAction('start', event);
			},
			drag: function(event){
				self._dragAction('drag', event);
			},
			stop: function(event){
				self.bar.data('draging', false);
				if( self.bar.data('mouseleave') == true ){
					self.bar.animate({opacity: options.opacity}, 200);
				}
				self._dragAction('stop', event);
			}
		}
		if( $.isPlainObject(options.dgOptions) ) dgOpt = $.extend(dgOpt, options.dgOptions);
		self.block.draggable(dgOpt);

		self._setOpacity(options.opacity);

		if( options.container != null ){
			$(options.container).append(self.bar);
		}

		self.bar.bind('up', function(event){
			self._moveBlock('up', 'up', 0);
		});
		self.bar.bind('down', function(event){
			self._moveBlock('down', 'down', 0);
		});

		self.blockCont.bind('click', function(event){
			if( event.target == self.block[0] ) return false;
			if( event['page' + self.barOpt.axis.toUpperCase()] < self.block.offset()[self.barOpt.top] ){
				self._moveBlock('up', 'up', 0);
			} else {
				self._moveBlock('down', 'down', 0);
			}
		});

		if( options.hasArrow == true ){
			self.topArrow.bind('click.scrollbar-arrow', function(){
				self._moveBlock('up', 'topClick');
			});
			self.bottomArrow.bind('click.scrollbar-arrow', function(){
				self._moveBlock('down', 'bottomClick');
			});
		}

		self._trigger('create', null, self.blockCont);
		
		setTimeout(function(){
			options.scrollHeight = self.blockCont[self.barOpt.Height]() - self.block[self.barOpt.OuterHeight]();
			options.scrollTop = 0;
		}, 0);
	},

	_moveBlock: function(direction, eventType, speed){
		var options = this.options, step = Math.floor(5 / (this.block[this.barOpt.Height]() / this.blockCont[this.barOpt.Height]()) - 4);
		var distance = Math.max(5, Math.round(options.scrollHeight / step));
		if( direction == 'up' ){
			if( options.scrollTop <= 0 ) return;
			options.scrollTop = Math.max(0, options.scrollTop - distance);
		} else {
			if( options.scrollTop >= options.scrollHeight ) return;
			options.scrollTop = Math.min(options.scrollHeight, options.scrollTop + distance);
		}
		var aniParam = {};
		aniParam[this.barOpt.top] = options.scrollTop;
		speed = $.isNumeric(speed) ? speed : options.aniSpeed;
		this.block.animate(aniParam, speed);
		this._dragAction('drag', $.Event(eventType || direction || 'down'), options.scrollTop.toString());
	},

	_createBar: function(){
		var options = this.options, self = this;
		if( options.hasArrow == true ){
			options.arrowHeight = options.arrowHeight || options.width;
			var height = options.height - options.arrowHeight * 2;
			if( options.blockHeight > height ) options.blockHeight = height;
			self.bar.css('padding-' + self.barOpt.top, options.arrowHeight + 'px').css('padding-' + self.barOpt.bottom, options.arrowHeight + 'px')[self.barOpt.Height](height);
			self.blockCont = $('<div />').css({
				display: 'block',
				position: 'relative'
			}).appendTo(self.bar)[self.barOpt.Height](height)[self.barOpt.Width](options.width);
			var arrowCss = {
				display: 'block',
				position: 'absolute'
			}
			self.topArrow = $('<a href="javascript:;" class="scrollbar-arrow scrollbar-top" scroll="top" />').appendTo(self.bar).css(self.barOpt.top, 0);
			self.bottomArrow = $('<a href="javascript:;" class="scrollbar-arrow scrollbar-bottom" scroll="bottom" />').appendTo(self.bar).css(self.barOpt.bottom, 0);
			var arrow = $().add(self.topArrow).add(self.bottomArrow).css(arrowCss).css(self.barOpt.left, 0);
			setTimeout(function(){
				arrow[self.barOpt.OuterWidth](options.width)[self.barOpt.OuterHeight](options.arrowHeight);
			}, 0);
		} else {
			self.blockCont = self.bar;
		}
		self.block = $('<div class="scrollbar-block" scroll="block" />').css({
			display: 'block',
			position: 'absolute',
			left: 0,
			top: 0
		}).appendTo(self.blockCont)[self.barOpt.OuterHeight](options.blockHeight);
		setTimeout(function(){
			self.block[self.barOpt.OuterWidth](options.width);
		}, 0);
	},

	_initBar: function(){
		if( this.options.hasArrow == true ){
			this.topArrow = this.bar.find('[scroll=top]');
			this.bottomArrow = this.bar.find('[scroll=bottom]');
		}
		this.blockCont = this.block.parent();
	},

	_dragAction: function(type, event, scrollTop){
		this.options.scrollTop = parseInt(scrollTop || this.block.css(this.barOpt.top));
		this._trigger(type, event, this.options.scrollTop / this.options.scrollHeight || -1);  //如果比率为0，则传回-1 （jqueryui的_trigger不支持传递空参数）
	},

	_setOpacity: function(opacity){
		if( opacity < 1 ){
			this.bar.css('opacity', opacity).unbind('.scrollbar-opa')
				.bind('mouseenter.scrollbar-opa', function(){
					$(this).data('mouseleave', false).animate({opacity: 1}, 200);
				})
				.bind('mouseleave.scrollbar-opa', function(){
					var bar = $(this);
					bar.data('mouseleave', true);
					if( bar.data('draging') != true ) bar.animate({opacity: opacity}, 200);
				});
		} else {
			this.bar.css('opacity', 1).unbind('.scrollbar-opa');
		}
	},

	_setHeight: function(value){
		var bch = this.blockCont[this.barOpt.Height]() + (value - this.options.height);
		this.bar[this.barOpt.OuterHeight](value);
		this.blockCont[this.barOpt.Height](bch);
		if( value < this.options.height ){
			this.block.css(this.barOpt.top, 0);
			if( this.block[this.barOpt.OuterHeight]() > bch ){
				this.block[this.barOpt.OuterHeight](bch);
			}
			this._dragAction('drag', $.Event('setHeight'), '0');
		}
		this.options.scrollHeight = bch - this.block[this.barOpt.OuterHeight]();
	},

	_setBlockHeight: function(value){
		var bch = this.blockCont[this.barOpt.Height]();
		if( value > this.block[this.barOpt.OuterHeight]() ){
			this.block.css(this.barOpt.top, 0);
			this._dragAction('drag', $.Event('setBlockHeight'), '0');
			if( value > bch ) value = bch;
		}
		this.block[this.barOpt.OuterHeight](value)
		this.options.scrollHeight = bch - value;
	},

	scrollX: function(topX, heightX, height){
		if( $.isNumeric(height) ) this._setOption('height', height);
		if( $.isNumeric(topX) ) this._setOption('scrollTop', this.options.scrollHeight * topX);
		if( $.isNumeric(heightX) ) this._setOption('blockHeight', this.blockCont[this.barOpt.Height]() * heightX);
	},

	_setOption: function(key, value){
		if( key == 'scrollHeight' ) return;    // 不允许对scrollHeight属性赋值

		switch (key) {
		case 'opacity':
			value = parseFloat(value);
			this._setOpacity(value);
			break;
		case 'height':
			value = parseInt(value, 10);
			this._setHeight(value);
			break;
		case 'blockHeight':
			value = parseInt(value, 10);
			this._setBlockHeight(value);
			break;
		case 'scrollTop':
			value = Math.min(parseInt(value, 10), this.options.scrollHeight);
			this.block.css(this.barOpt.top, value)
			this._dragAction('drag', $.Event('scrollTop'));
			return;   //跳过对scrollTop属性赋值
		}
		$.Widget.prototype._setOption.apply(this, arguments);
	}
});
})(jQuery);

//带自定义滚动条的div
;(function($){
$.widget('ushi.uiScrollBar', {
	options: {
		widgetClass: 'ushi-uiScrollBar',
		sbOptions: {
			width: 20,
			aniSpeed: 200
		},
		direction: null,                    //轮动条方向，可选 horizontal、vertical、both，如果为null则取overflow属性
		fixed: false,                       //滚动条是否固定显示
		opacity: 0,                         //滚动条浮动时的透明值
		offset: '0',
		fixMaginTop: true
	},

	_create: function(){
		var options = this.options, self = this;
		var cont = this.element.addClass(options.widgetClass), direction = options.direction;
		this.oy = cont.css('overflow-y');
		this.ox = cont.css('overflow-x');
		if( direction == null ){
			if( this.oy == 'scroll' || this.oy == 'auto' ) direction = 'vertical';
			direction = ( this.ox == 'scroll' || this.ox == 'auto' ) ? direction == 'vertical' ? 'both' : 'horizontal' : direction;
		}
		this.direction = direction;
		cont.css('overflow', 'hidden');
		var wrap = this._createWrap(cont);
		cont.css('position', 'relative');
		this.fixed = options.fixed == true || (this.oy == 'scroll' && (direction == 'vertical' || direction == 'both')) || (this.ox == 'scroll' && (direction == 'horizontal' || direction == 'both'));
		if( this.fixed ){
			$('<div />').css({overflow: 'hidden', height: '100%'}).appendTo(cont).append(wrap);
		}
		this.sbOpt = $.extend({
			position: 'absolute',
			container: cont
		}, options.sbOptions);
		this.cont = cont;
		this.wrap = wrap;
		this.vBar = $();
		this.hBar = $();

		if( $.isFunction(options.resize) ){
			wrap.bind('resize', function(){
				self._trigger('resize', $.Event('resize'), wrap);
			});
		}

		if( this.direction == 'vertical' || this.direction == 'both' ){
			this._initVBar();
		}
		if( this.direction == 'horizontal' || this.direction == 'both' ){
			this._initHBar();
		}

		options.width = this.cont.width();
		options.height = this.cont.height();

		//绑定滚轮事件
		var sbar = this.vBar.length ? this.vBar : this.hBar.length ? this.hBar : $();
		if( $.event.special.mousewheel && sbar.length ){
			cont.mousewheel(function(event, delta, deltaX, deltaY) {
				if( delta > 0 ){
					sbar.trigger('up');
				} else if( delta < 0 ){
					sbar.trigger('down');
				}
				event.stopPropagation();
				event.preventDefault();
			});
		}
	},

	_createWrap: function(cont){
		var wrap = $('<div />').appendTo(cont);
		if( this.options.fixMaginTop == true ){    //添加padding值，可以使margin值有效
			wrap.css('padding-top', '1px');
		}
		if( this.direction != 'vertical' ){
			wrap.css('position', 'absolute');
		}
		cont.find('>*').not(wrap).appendTo(wrap);
		if( this.direction != 'vertical' ){
			var ww = 0;
			wrap.find('>*').each(function(){
				var w = $(this).outerWidth();
				if( w > ww ) ww = w;
			});
			wrap.css({
				"position": 'static',
				"min-width": ww + 'px',
				"_height": ww + 'px'
			});
		}
		return wrap;
	},

	_initVBar: function(){
		var options = this.options, self = this;
		var conth = self.cont.height(), direction = 'vertical';
		if( this.direction == 'horizontal' || this.direction == 'both' ) conth -= options.sbOptions.width;
		var drag = $.isFunction(options.sbOptions.drag) ? options.sbOptions.drag : function(){};
		var sbOpt = $.extend({
			height: conth,
			horizontal: false,
			blockHeight: Math.min(conth, conth / self.wrap.outerHeight() * conth),
			drag: function(event, rate){
				self._dragAction(event, rate, direction);
				drag.call(self.element, event, rate, direction, self);
			}
		}, self.sbOpt);
		self.vBar = $('<div />').css({top: 0, right: 0}).scrollbar(sbOpt);
		if( self.fixed ){
			self.cont.width(self.cont.width() - options.sbOptions.width);
			self.cont.css('padding-right', options.sbOptions.width);
		} else {
			if( options.sbOptions.gap ){  // 如果参数包含长度差距
				self.vBar.height(self.vBar.height() - options.sbOptions.gap);
			}
			self._setFloat(self.vBar, direction);
		}
	},

	_initHBar: function(){
		var options = this.options, self = this;
		var conth = self.cont.width(), direction = 'horizontal';
		var drag = $.isFunction(options.sbOptions.drag) ? options.sbOptions.drag : function(){};
		var sbOpt = $.extend({
			height: conth,
			horizontal: true,
			blockHeight: Math.min(conth, conth / self.wrap.outerWidth() * conth),
			drag: function(event, rate){
				self._dragAction(event, rate, direction);
				drag.call(self.element, event, rate, direction, self);
			}
		}, self.sbOpt);
		self.hBar = $('<div />').css({bottom: 0, left: 0}).scrollbar(sbOpt);
		if( self.fixed ){
			self.cont.height(self.cont.height() - options.sbOptions.width);
			self.cont.css('padding-bottom', options.sbOptions.width);
		} else {
			self._setFloat(self.hBar, direction);
		}
	},
	
	_setFloat: function(bar, direction){
		bar.scrollbar('option', 'opacity', this.options.opacity);
		var self = this;
		bar.bind('mouseenter', function(){
			self.cont.append(bar);
		});
		if( direction == 'horizontal' ){
			if( self.cont.width() > self.wrap.outerWidth() ) self.hide(direction);
		} else {
			if( self.cont.height() > self.wrap.outerHeight() ) self.hide(direction);
		}
	},
	
	show: function(direction){
		if( direction ){
			if( this.vBar.length ) this.vBar.show();
			if( this.hBar.length ) this.hBar.show();
		} else {
			direction == 'horizontal' ? this.hBar.show() : this.vBar.show();
		}
	},
	hide: function(direction){
		if( direction ){
			if( this.vBar.length ) this.vBar.hide();
			if( this.hBar.length ) this.hBar.hide();
		} else {
			direction == 'horizontal' ? this.hBar.hide() : this.vBar.hide();
		}
	},

	wrapper: function(){
		return this.wrap;
	},

	append: function(content){
		this._append('append', content);
	},
	prepend: function(content){
		this._append('prepend', content);
	},
	_append: function(type, content){
		this.wrap[type](content);
		var self = this;
		setTimeout(function(){
			self.vBar.scrollbar('scrollX', Math.abs(parseInt(self.wrap.css('margin-top'), 10) / (self.wrap.outerHeight() - self.options.height)), self.options.height / self.wrap.outerHeight());
		}, 0);
	},

	_dragAction: function(event, rate, direction){
		rate = Math.max(0, rate);
		var p = {}, d = 0, css = '';
		if( direction == 'horizontal' ){
			d = this.wrap.outerWidth() - this.cont.width();
			if( d <= 0 ) return;
			css = 'margin-left';
		} else {
			d = this.wrap.outerHeight() - this.cont.height();
			if( d <= 0 ) return;
			css = 'margin-top';
		}
		p[css] = '-' + Math.floor(d * rate) + 'px';
		var delta = 0, eventType = event.originalEvent.type;
		if( eventType == 'topClick' || eventType == 'up' ) delta = 1;
		else if( eventType == 'bottomClick' || eventType == 'down' ) delta = -1;
		else {
			var st = parseInt(this.wrap.css(css), 10), st1 = parseInt(p[css], 10);
			delta = st < st1 ? 1 : st == st1 ? 0 : -1;
		}
		if( eventType == 'topClick' || eventType == 'bottomClick' ){
			this.wrap.animate(p, this.options.sbOptions.aniSpeed);
		} else {
			this.wrap.css(p);
		}
		this.options.scrollTop = Math.abs(parseInt(p[css], 10));
		this._trigger('scroll', $.Event(event.originalEvent.type), {dir: direction, delta: delta, top: this.options.scrollTop});
	},

	_setOption: function(key, value){
		switch (key) {
		case 'width':
			value = parseInt(value, 10);
			this.cont.width(value);
			this.wrap.css('margin-left', 0);
			if( this.hBar.length ){
				this.hBar.scrollbar('option', 'height', value);
				this.hBar.scrollbar('option', 'blockHeight', Math.min(value, value / this.wrap.outerWidth() * value));
			}
			break;
		case 'height':
			value = parseInt(value, 10);
			this.cont.height(value);
			this.wrap.css('margin-top', 0);
			if( this.vBar.length ){
				this.vBar.scrollbar('option', 'height', ( this.direction == 'horizontal' || this.direction == 'both' ) ? value - this.options.sbOptions.width : value);
				this.vBar.scrollbar('option', 'blockHeight', Math.min(value, value / this.wrap.outerHeight() * value));
			}
			break;
		case 'scrollTop':
			value = Math.min(parseInt(value, 10), Math.abs(Math.max(0, this.wrap.outerHeight() - this.cont.height())));
			this.vBar.scrollbar('scrollX', value / (this.wrap.outerHeight() - this.cont.height()));
			break;
		}
		$.Widget.prototype._setOption.apply(this, arguments);
	}
});
})(jQuery);
