$(function(){
	//设置全局ajax成功事件
	$.ajaxSetup({
		dataType: 'text',
		cache: false
	});

	//$.mobile.ajaxFormsEnabled = false;//表单提交的时候不翻页
	//$.mobile.defaultTransition ='fade';//配置转场方式
	$.mobile.pageLoadErrorMessage = "数据加载失败"
	/*选择分享*/
	$('[js="whatyourshare"]').live('click',function(){
		$(this).blur();
	
		$.ajax({
			url:'/smartphone/newsfeed!checkUser.jhtml?m=mapp',
			type:'post',
			async:false,
			success:function(data){
				if(data==1){
					commonDialogWin("提示",'270','.ushi-have-no-right','ushi-common-btn');
					return false;
				}else{
					/*var dialogBox___com = new Dialog('<ul class="share_weibo_or_event"><li><a class="font14px" href="/smartphone/newsfeed!addMicroBlogInit.jhtml?m=mapp">微博</a></li></ul><p style="padding:0 10px"><a class="cancleShare ushi-common-btn" href="#">取消</a></p>',{
			            "width":"270px",
			            "title":'分享',
			            'modal':true,
			            "closeModal":true,
			            "closeable": true
					});
			
					$('.cancleShare').live('click',function(){
						setTimeout(function(){
							dialogBox___com.hideDialog()
						},100)
					});
					
					$('.share_weibo_or_event').live('click',function(){
						dialogBox___com.hideDialog()
					})*/
					
					$.mobile.changePage('/smartphone/newsfeed!addMicroBlogInit.jhtml?m=mapp', "slide", true, true); 
				}
			},
			error:function(){
				return false;
			}
		});
	})

	/*登录*/
	$('[js="ushi_login"]').live('click',function(event){
		$(this).closest('form').submit();
	});
	
	$('[js="email_pwd"]').live('keydown',function(event){
		var key_code = event.keyCode;
		if((key_code==13) ){
			$(this).closest('form').submit();
		}
	})
	
	/*退出
	$('.loginout').live('click',function(){
		var add = $(this).attr('href');
		setTimeout(function(){
			window.location = add;
		},100)

	})*/
	
	var reflashWin = function(){
		window.location.reload(true);
		//$.mobile.changePage(window.location, "slide", false, false); 
	}
	
	/*刷新按钮*/
	$('.reflash').live('click',function(){
		//var urlStr = $(this).attr('href');
		//window.location.href =urlStr
		reflashWin();
	});
	
	$('[js="publish_weibo"]').live('click',function(){
		$(this).closest('.ui-page').find('form[name="publishForm"]').submit();
	});
	
	$('[js="find_my_login_pwd"]').live('click',function(){
		var p_ = $(this).closest('.ui-page')
		var form_ = p_.find('form[name="findpwdForm"]');
		form_.submit();
		
	});
	
	$('[js="ushi_publish_commend"]').live('click',function(){
		$(this).closest('.ui-page').find('form[name="commendForm"]').submit();
	});
	
	/*查看更多档案*/
	$('a[js="more_job_personal"]').live('click',function(){
		var cot = $(this).attr('title');
		$(this).parent().empty().html(cot);
	
	});
	
	/*人脉预搜索*/
	var currentSearchKey = ''; 
	
	var loadSearchData = function(p_obj, val, left_, top_) {
	
		return function() {
			$.ajax({
				dataType:'json',
				cache: false,
				url:'/search/search!simpleSearch.jhtml',
				//async: false,
				type:"POST",
				data:{'keyword':val},
				success:function(data){
					
					if (currentSearchKey != val) {
						return ;
					}
					
					$('.simple-search-list ul').empty();
					$('.simple-search-list').hide();
					
					var arr = [];
					var lis = data.search_result;
					var len = lis.length;
					if(len>0){
						$.each(lis,function(i,n){
							arr.push('<li data-add="/smartphone/profile!viewOthersProfile.jhtml?domain='+n.id+'&m=mapp" js="simple-search-li"><p><a href="/smartphone/profile!viewOthersProfile.jhtml?domain='+n.id+'&m=mapp">'+n.name+'</a></p><p class="lightcolor">'+n.title+'</p></li>')
						});
						
						if(len>=5){
							arr.push('<li js="simple-search-li" class="ext-link"><p><a href="javascript:void(0);" js="ushi-all-search">查看更多结果</a></p></li>');
						}
						
						$('.simple-search-list ul',p_obj).empty();
						$('.simple-search-list ul',p_obj).append(arr.join(''))
						if(len<5){//小于5条记录删除查看更多
							$('.simple-search-list ul li:last',p_obj).css('border-bottom','none')
						}
						$('.simple-search-list',p_obj).css({'left':left_,'top':top_+36});
						$('.simple-search-list',p_obj).show();
						$('.simple-search-list ul li:last',p_obj).css('border-bottom','none');
	
					}
				},
				error:function(){
					$('.simple-search-list ul',p_obj).empty();
					$('.simple-search-list',p_obj).hide();
				}
			});
		}
	}
	
	var loadSearchTimer = null;
	
	$('.ushi-search-cont :text[name!=queryValue]').live('input click',function(){
			
		if (loadSearchTimer) {
			clearTimeout(loadSearchTimer);
			loadSearchTimer = null;
		}
		
		var this_ = $(this);
		this_ .addClass('loading');
		var p_ = $(this).offset();
		var left_ = p_.left;
		var top_ = p_.top;
		var m = $(this).attr('m')
		var val = $(this).val();
		var p_obj = $(this).closest('.ui-page');
		if(val==''){
			$('.simple-search-list ul',p_obj).empty();
			$('.simple-search-list',p_obj).hide();
			return false;
		}

		$('.simple-search-list ul',p_obj).empty();
		$('.simple-search-list ul',p_obj).append('<li class="lightcolor ushi-loading" style="border-bottom:none">数据加载中...</li>');
		$('.simple-search-list',p_obj).show();
		$('.simple-search-list',p_obj).css({'left':left_,'top':top_+36});
		
		currentSearchKey = val;
	
		loadSearchTimer = setTimeout(loadSearchData(p_obj, val, left_, top_), 10);
		
	});
	
//	var li_link = $('.simple-search-list').find('ul').find('li');
//	
//	li_link.live('click',function(){
//		var add = $(this).attr('add');
//		$.mobile.changePage(add, "slide", true, true); 
//	})

	$('.simple-search-list > ul').live('click', function(_evt) {
		var evt = _evt;
		//target谁触发的  currentTarget谁绑定的事件
		var obj = evt.target;
		var tagName = null;
		
		if (obj && obj.nodeType && /^(1|2|9)$/.test(obj.nodeType)) {
			tagName = obj.tagName.toLowerCase();
			
			while(obj != document && tagName != 'li') {
				obj = obj.parentNode;
				tagName = obj.tagName.toLowerCase();
			}
			var url = obj.getAttribute('data-add');
			if(url){
				$.mobile.changePage(url, "slide", true, true); 
			}
		}
	});
	
	$('.ushi-search-cont :text').live('blur',function(){
		var p_ = $(this).closest('.ui-page');
		setTimeout(function(){
			$('.simple-search-list ul',p_ ).empty();
			$('.simple-search-list',p_ ).hide();
		},1000)

	})
	

	/*其他联系方式*/
	$('a[js="show-contract-method"]').live('click',function(){
		var parent__ = $(this).closest('.ui-page');
		var dialogBox = new Dialog($('.ushicontract-method',parent__).html(),{
            "width":"270px",
            "title":'其他联系方式',
            'modal':true,
            "closeModal":true,
            "closeable": false,
		});
		
		var closeShareWin = function(){
			dialogBox.hideDialog();
		}
		$('.pop-other-contact').find('.ushi-common-btn').live('click',closeShareWin);
		
	});
	
	
	//为文本输入框绑定显示默认提示
	jQuery.fn.showDefaultTips = function(options){
		options = $.extend({
			tipsColor: '#AAA',
			textColor: $.browser.msie ? '#333' : 'inherit'
		}, options || {});
		return this.each(function(){
			var tf = $(this);
			if( ! tf.attr('defaultTips') ){
				return true;
			}
			var form = tf.closest('form');
			if( form.length ){
				form.submit(function(){
					if( tf.val() == tf.attr('defaultTips') ){
						tf.val('');
					}
				});
			}
			if( tf.val() == '' || tf.val() == tf.attr('defaultTips') ){
				tf.css('color', options.tipsColor);
				if (tf.val() == '' )
				{
					tf.val(tf.attr('defaultTips'));
				}
			}
			tf.bind('blur', function(){
				if( tf.val() == '' ){
					tf.val(tf.attr('defaultTips')).css('color', options.tipsColor);
				}
			});
			tf.bind('click', function(){
				if( tf.val() == tf.attr('defaultTips') ){
					tf.val('').css('color', options.textColor);
				}
			});
		});
	};
	
	$('[js="add1u"]').live('click',function(){
		var self_ = $(this);
		var url_ = self_.attr('postaddr');
		var targetUserId = self_.attr('targetUserId');
		var briefmsg = $('textarea[name="briefmsg"]').val();
		var form_ = $(this).closest('.ui-page').find('form[name="add1dusuccessForm"]');
		
		$.post(url_,{'targetUserId':targetUserId,'briefmsg':briefmsg},function(data){
			if(data="success"){
				var dialogBox5 = new Dialog($('[js="popSendOneDu"]').html(),{
		            "width":"270px",
		            //"title":'发送成功',
		            'modal':true,
		            "closeModal":true,
		            "closeable": false
				});
				var closeShareWin = function(){
					dialogBox5.hideDialog();
				}
				$('.pop-other-contact').find('.ushi-special-btn').live('click',function(){
					closeShareWin();
					$.mobile.changePage(form_.attr('action'),"slide", true, true); 
					setTimout(function(){
						window.location = form_.attr('action');
					},10)
					
				});

			}
		});
		
		
	
	});
	
	
	/*人脉搜索*/
	$('a[js="ushi-all-search"]').live('click',function(){
		var p_obj = $(this).closest('.ui-page');
		var form_ = p_obj.find('form[js="formUahiSearch"]');
		form_.submit();
	});
	
	
	
	/*查看更多通用方法*/
	var viewMoreList = function(this_,url,obj){
		$('.morelist a').addClass('ushi-loading');
		$('.morelist a').html('&nbsp;&nbsp');
		var params={};
		var pageNo = parseInt($(this_).attr('pageNo'));
		var targetUserId = $(this_).attr('targetUserId');
		if(targetUserId!=''){
			params = {'pageNo':pageNo+1,'targetUserId':targetUserId}
		}else{
			params = {'pageNo':pageNo+1}
		}
		
		$.post(url,params,function(data){
			$('.morelist a').removeClass('ushi-loading');
			$('.morelist').remove();
			obj.append(data);
		});
	};
	
	/*更多人脉搜索*/
	$('a[js="more_rm_search"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/sns!search.jhtml?m=mapp',$('[js="search-1du-ul"]'))
	});
	
	/*更多自己人脉搜索*/
	$('a[js="more_rm_search_self"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/sns!get1friends.jhtml?m=mapp',$('[js="search-1du-ul"]'))
	});
	
	$('a[js="ushi-1degree-list-a"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/profile!get1stFriends.jhtml?m=mapp',$('[js="ushi-1degree-list"]'))
	});
	
	/**/
	$('a[js="ushi-share-connect-a"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/profile!getSharedConnections.jhtml?m=mapp',$('[js="ushi-share-connect"]'))
	});
	
	/*所有feed*/
	$('[js="mobile-feedall-more-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/newsfeed!newsfeedList.jhtml?m=mapp',$('[js="mobile-feedall-more-link-ul"]'))
	});
	
	/*档案*/
	$('[js="mobile-pfall-more-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/newsfeed!profileNewfeed.jhtml?m=mapp',$('[js="mobile-pfall-more-link-ul"]'))
	});
	/*人脉*/
	$('[js="mobile-rmall-more-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/newsfeed!contactsNewfeed.jhtml?m=mapp',$('[js="mobile-rmall-more-link-ul"]'))
	});
	
	/*微博*/
	$('[js="mobile-weiboall-more-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/newsfeed!microNewfeed.jhtml?m=mapp',$('[js="mobile-weiboall-more-link-ul"]'))
	});
	
	/*1du request*/
	
	$('[js="request-1du-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/inbox!inviterequest.jhtml?m=mapp',$('[js="request-1du-ul"]'))
	});	
	/*消息中心活动*/
	$('[js="request-event-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/govern!listNewRequest.jhtml?m=mapp',$('[js="request-event-ul"]'))
	});	
	
	$('[js="mobile-request-all"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/inbox!systemNotice.jhtml?m=mapp',$('[js="mobile-request-ul"]'))
	});	
	
	$('[js="mobile-my-weibo-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/profile!weibo.jhtml?m=mapp',$('[js="mobile-my-weibo-ul"]'))
	});	
	
	$('[js="mobile-msg-outerbox-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/inbox!outbox.jhtml?m=mapp',$('[js="mobile-msg-outerbox-ul"]'))
	});	
	
	$('[js="mobile-msg-inbox-link"]').live('click',function(){
		var this_ = this;
		viewMoreList(this_,'/smartphone/inbox!inbox.jhtml?m=mapp',$('[js="mobile-msg-inbox-ul"]'))
	});
	
	
	function commonDialogWin(tit,width,obj,objbtn){
	
		var dialogBox = new Dialog($(obj).html(),{
            "width":width+"px",
            "title":tit,
            'modal':true,
            "closeModal":true,
            "closeable": true
		});
		var closeShareWin = function(){
			dialogBox.hideDialog();
		}
		$('.pop-other-contact').find('.'+objbtn).live('click',closeShareWin)
	}
	
	
	/*加一度*/
	$('[js="ushi-add-1du-link"]').live('click',function(){
		var this_ = $(this);
		var selffriendover = $(this).attr('selffriendover');
		var targetfriendover = $(this).attr('targetfriendover');
		var addr = $(this).attr('addr');
		if(selffriendover == "true"){
			commonDialogWin("提示",'270','.ushi-your-add-person-overnum','ushi-common-btn');
		}else if(targetfriendover == "true"){
			commonDialogWin("提示",'270','.ushi-duifang-add-person-overnum','ushi-common-btn');
		}else{
			$.mobile.changePage(addr);
		}
	});
	
	
	$('.add-1d-disable').live('click',function(){
		var this_ = $(this);
		commonDialogWin("提示",'270',$('.ushi-havesend-add-person-overnum'),'ushi-common-btn');
	});
	
	/*加关注*/
	
	$('.add-follow').live('click',function(){
		$(this).removeClass('add-follow color06a');
		$(this).addClass('add-follow-disable lightcolor')
		var this_ = $(this);
		var targetUserId = this_.attr('targetUserId')
		$(this).text("取消关注");
		$.post("/smartphone/profile!addFollower.jhtml?targetUserId="+targetUserId+"&m=mapp",function(data){
			if(data){
				commonDialogWin("提示",'200',('[js="add-follow-popup"]'),'ushi-common-btn');
			}

		});
	});
	
	/*取消关注*/
	$('.add-follow-disable').live('click',function(){
		$(this).removeClass('add-follow-disable lightcolor');
		$(this).addClass('add-follow color06a')
		$(this).text("加为关注");
		var this_ = $(this);
		var targetUserId = this_.attr('targetUserId')
		$.post("/smartphone/profile!removeFollower.jhtml?targetUserId="+targetUserId+"&m=mapp",function(data){
			if(data){
				commonDialogWin("提示",'200',('[js="cancleadd-follow-popup"]'),'ushi-common-btn');
				//this_.closest('.ui-page').find('form[name="returnprofileForma"]').submit();
			}
		});
	});
	


	
	/*消息中心*/
	/*同意一度人脉请求*/
	function operatorRequest(this_){
		var add = this_.attr('add');
		var retAdd = this_.attr('retAdd');
		$.post(add,function(data){
			if((data=="success")||(data==1)||(data==2)){
				this_.closest('li').slideUp('fast',function(){
					this_.closest('li').remove();
					window.location = retAdd;
				})
			}
		})
	};
	
	
	function operatorRequest_(this_){
		var add1 = this_.attr('add1');
		var otherid = this_.attr('otherid');
		$.post(add1,{'otherid':otherid},function(data){
			if(data==0){
				operatorRequest(this_)
			}else if(data==1){
				commonDialogWin("提示",'270','.ushi-your-add-person-overnum','ushi-common-btn');
			}else if(data==2){
				commonDialogWin("提示",'270','.ushi-duifang-add-person-overnum','ushi-common-btn');
			}
		})
	}
	
	
	$('[js="mobile-okrequest"]').live('click',function(){
		var this_ = $(this);
		operatorRequest_(this_)
	});
	
	$('[js="mobile-canclerequest"]').live('click',function(){
		var this_ = $(this);
		operatorRequest(this_)
	});
	
	$('[js="mobile-ushi-event-ok"]').live('click',function(){
		var this_ = $(this);
		operatorRequest(this_)
	});
	
	$('[js="mobile-ushi-event-cancle"]').live('click',function(){
		var this_ = $(this);
		operatorRequest(this_)
	});
	
	/*发直邮*/
	$('[js="mobile-send-message"]').live('click',function(){
		$(this).closest('.ui-page').find('form[name="messageForm"]').submit();
	});
	
	
	/*回复直邮*/
	$('[js="mobile-replay-msg"]').live('click',function(){
		var this_ =$(this);

		this_.closest('.ui-page').find('form[name="formReplayMsg"]').submit();

	});
	
	/*收件箱发件箱直邮列表*/
	$('[js="repaly-box-link"]').live('click',function(){
		var add = $(this).attr('add');
		$.post('/smartphone/newsfeed!checkUser.jhtml?m=mapp',{},function(data){
			if(data==0){
				//this_.closest('.ui-page').find('form[name="formReplayMsg"]').submit();
				$.mobile.changePage(add, "slide", true, true); 
			}else{
				commonDialogWin("提示",'270','.ushi-have-no-right','ushi-common-btn');
			}
		});
		
	})
	
	/*对方档案给对方发直邮*/
	$('[js="send-email-to-others-profilePage"]').live('click',function(){
		var add = $(this).attr('add');
		$.post('/smartphone/newsfeed!checkUser.jhtml?m=mapp',{},function(data){
			if(data==0){
				$.mobile.changePage(add, "slide", true, true); 
			}else{
				commonDialogWin("提示",'270','.ushi-have-no-right','ushi-common-btn');
			}
		});
	});
	
	/*************/
	$('.weibo-commend-titles').live('pageshow',function(event, ui){
		if($('[js="ftips" ]').length<1){
	　		$('textarea[name="commBody"]',this).val("");
		}
	});
	
	$('.write-commend-titles').live('pageshow',function(event, ui){
		if($('[js="ftips" ]').length<1){
			$('textarea[name="freetext"]',this).val("");
		}	
	});



	/*我的一度好友搜索*/
	
	$('[js="ushi-allmyself-search"]').live('click',function(){
		$(this).closest('form').submit();
	});
	
	function mobile_byte_length(str) {
		return (str || "").replace(/[^\x00-\xff]/g, "--").length;
	}
	
	
	$('.ushi-for-name-ellipsis').live('pageshow',function(event, ui){
		var this_ = this; 
		setTimeout(function(){
			var wid_ = $('.iName',this_).width();
			var str = $('.iName',this_).text();
			var len = mobile_byte_length(str)
			var strName = $('.iName',this_).text();
			if(len>10){
				$('.iName',this_).text(strName.substring(0,10)+"...")
			}
		},100)
	});
	
	
	/*首页验证是否受限*/
	$('[js="index_publish"]').live('click',function(){
		var add = $(this).attr('add');
		$.post('/smartphone/newsfeed!checkUser.jhtml?m=mapp',{},function(data){
			if(data==0){
				$.mobile.changePage(add, "slide", true, true); 
			}else{
				commonDialogWin("提示",'270','.ushi-have-no-right','ushi-common-btn');
			}
		});
	});
	
	
	$('.mobile-li-topage').live('click',function(){
		var add = $(this).attr('add');
		$.mobile.changePage(add, "slide", true, true); 
	});
	
	$('.ui-page').live('pagehide',function(event, ui){
		var this_ = $(this);
		this_.find('.ret_top').parent().remove();
		//this_.remove();
	});
	
	var scrolldelay = null;
	function pageScroll() {
		scrolldelay = setTimeout(pageScroll,1);
		if((document.body.scrollTop==0)){
			clearTimeout(scrolldelay);
			return false;
		}
		window.scrollBy(0,-100);
	};
	
	function retbtm() {
		$('.ret_top').css('bottom',0);
	};
	
	$('.ui-page').live('pageshow',function(event, ui){
		var this_ = $(this);
		setTimeout(function(){
			var len = document.body.scrollHeight-document.body.offsetHeight;
			if(len>300){
				this_.append('<div style="text-align:right;"><a class="ret_top" href="javascript:void(0);"></a></div>');
			}
		},200)	
	});
	
	$('.ret_top').live('click',pageScroll)

	
})






















