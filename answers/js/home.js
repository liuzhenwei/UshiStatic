var __subnav = "wenda";

$(function(){
	$('[closeHomeTopmsg]').click(function(){
		var a = $(this), div = a.closest('div');
		if( a.attr('closeHomeTopmsg') == 'suc' ){
			var next = div.next('div.notice');
			if( next.length ){
				next.show();
				div.remove();
			} else {
				div.css('overflow', 'hidden').animate({height: 0}, 250, function(){
					div.remove();
				});
			}
		} else {
			div.css('overflow', 'hidden').animate({height: 0}, 250, function(){
				div.remove();
			});
			$.get('/wenda/usersetting!promotion.jhtml?indexsyspromotion=1');
		}
	});

	$('#allQuestionTips').each(function(){
		var tip = $(this), pos = $('a[js="menuAllQuestion"]').offset();
		tip.popupLayer({
			closeDestroy: true,
			reserve: false,
			width: 410,
			position: [pos.left - 8, pos.top - 33],
            open: function(){
                tip.find('[js="closePopup"]').click(function(){
                    $.get('/wenda/index!closeToolTip.jhtml');
                });
            }
		});
		$('a[js="menuAllQuestion"]').click(function(){
			tip.popupLayer('close');
		});
	});

	//调用首页广告代码
	var img=$(".imgBox img");
	var num=$(img).length;
	var tm=null, i=0, t=6000,count=0;
	function imgScoll(){
		clearTimeout(tm);
		img.filter(":visible").css("display", "none");
		$("li").removeClass("on");
		i = (i==num-1) ? 0 : i +1;
		$(".icon li").eq(i).addClass("on");
		img.eq(i).css("display", "block");
		if(count!=num-1){
		tm=setTimeout(imgScoll, t);
		count=count+1;
		}

	};
	$(".icon li a").click(function(){
		i=$(this).parent().index()-1;
		imgScoll();
	});
	tm=setTimeout(imgScoll, t);

	//最新问题排序
	$('[js="homeTab"]').children("ul").find("a").click(function(){
		if ($(this).attr("js")=="menuAllQuestion")
		{
			$(".sort-frame").show();
			$('[js="sort-type"]').val(1);
			$('[js="sort-select"]').html('最新的问题');
		}
		else
		{
			$(".sort-frame").hide();
		}
	});
	$('[js="sort-select"], [js="sort-select-ico"]').click(function(){
		sort_menu_show($(this));
	});
});

function sort_menu_show(_this){
	var _offset=_this.parent().offset();
	var _pop=$($('[js="sort-menu"]').html());

	_pop.popupLayer({
		width:155,
		//position:[_offset.left,_offset.top+26],
		position:{of:_this.parent(), my:'left top', at:'left bottom'},
		closeDestroy:true,
		reserve:false,
		open:function(){
			_pop.find("li").click(function(){
				var _sortType=$(this).attr("js");
				$('[js="sort-type"]').val(_sortType);
				$('[js="sort-select"]').html($(this).html());
				_pop.popupLayer("close");
				$.ajax({
					url:"/wenda/question!moreQuestionSort.jhtml?sort="+_sortType,
					type:"GET",
					success:function(r){
						var _div=$('<div ajaxurl="/wenda/question!moreQuestionSort.jhtml?sort='+_sortType+'" class="wd-home-feed" pageno="2">');
						_div.html(r);
						_div.append($('<div js="moreFeedDiv" class="a-center" style="display: block;"><a href="#" class="cnfont large">查看更多问题</a><span class="icon-btn-down middle spe-left" style="display:inline-block;"></span></div>'))
						$(".wd-home-feed").hide();
						$("#homeFeed").append(_div);
					}
				})
			})
		}
	})
}
