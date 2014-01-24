//通用验证组件
(function($) {
$.widget("ushi.validate", {
	options: {
		widgetClass: 'ushi-validate',
		fieldExpr: 'input[Validate], select[Validate], textarea[Validate]',
		validateAjax: false,          //是否验证ajax
		bindBlur: false,              //是否在失去焦点时做验证
		bindSubmit: true,             //是否在提交表单时做验证
		ignoreHidden: false,          //是否忽略被隐藏的表单
		resetOpt: true,               //验证时是否重新获取验证选项
		submitReset: false,           //提交表单时，是否重新初始化验证组件
		fieldParent: '[vdFld]',
		hide: function(event, field){ field.data('validateOpt')['parent'].find('[vdErr], [js="vdErr"]').hide(); },
		showNormal: function(){},
		showSuc: function(event, field){ field.data('validateOpt')['parent'].find('[vdErr], [js="vdErr"]').hide(); },
		showErr: function(event, field){
			var em = field.data('validateOpt')['parent'].find('[vdErr], [js="vdErr"]');
			if( em.length == 0 ) return;
			if( em.attr('vdErr') == 'alert' ){ pop_alert(em.html()); } else { em.show(); }
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
			var field = $(this);
			if( field.data('validateOpt') ){
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
		var after = this._trigger('afterValidate', null, result);
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
		if( this._trigger('beforeValidate', null, callback) === false ){
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
			self.tmCheckBlur = setTimeout(function(){
				checkBlur(self.blurField);
			}, 100);  //延迟执行blur
		});
	}
});

$.extend($.ushi.validate, {
	//公用函数
	getOptions: function(str){
		var opt = {};
		if( str && typeof(str) == 'string' ){
			var re = /(?:^|;)(.[^\:]*)\:(.[^;]*)/g;
			var g = re.exec(str);
			while( g ){
				opt[g[1]] = g[2];
				g = re.exec(str);
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
		var num = parseFloat(str);
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
	isCellphone: function(str, opt){
		opt = opt || {};
		var min = opt['min'] || '5', max = opt['max'] || '11';
		var sre = this.re.cellphone.replace('%min', min).replace('%max', max);
		return (new RegExp(sre, 'ig')).test(str);
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
			if( opt['key'] ){ param[opt['key']] = str; }
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
