function customRange(input) { 
    return {minDate: (input.id == "enddate" ? $("#startdate").datepicker("getDate") : null), 
        maxDate: (input.id == "startdate" ? $("#enddate").datepicker("getDate") : null)}; 
} 
function initMenus() {
	var ch = window.location.href;
	var tmphref = '';
	$('.menu li ul').hide();
	
	var a =  $('ul.menu ul li a');
	
	for(var i = 0; i < a.length; i++){
		var h = $(a[i]).attr('href');
		if(ch.toString().indexOf(h) > -1){
			tmphref = h;
			break;
		}
	}

	if( tmphref != '' ){
		a.filter('[href="' + tmphref + '"]').closest('ul').show();
	}
	

	$('ul.menu li a').bind('click',function(){
		$(this).next().show()
		$(this).parent().siblings().find('ul').hide()
	});
}


$.fn.addOption=function(text,value){
	this.get(0).options.add(new Option(text,value));
}

function selectCity(Country,Region,City){
	var nat=Country || $("#selectCountry");
	var area=Region || $("#selectRegion");
	var city=City || $("#selectCity");
	nat.change(function(){
		area.empty();
		city.empty();
		area.addOption("请选择",0);
		city.addOption("请选择",0);
		$.getJSON("/ajax/json!listRegions.jhtml?countryId="+nat.val(),function(data){
			$.each(data.regions,function(i,name){
				area.addOption(name.regionName,name.regionId);
			});
		});
	});
	if(city.size()>0)
	area.change(function(){
		city.empty();
		city.addOption("请选择",0);
		$.getJSON("/ajax/json!listCities.jhtml?regionId="+area.val(),function(data){
			if(data.cities.length == 1) city.empty();
			$.each(data.cities,function(i,name){
				city.addOption(name.cityName,name.cityId);
			});
		});
	});
}

$(document).ready(function() {
	initMenus()

	$.datepicker.setDefaults({
		closeText: '关闭',
		prevText: '&#x3c;上月',
		nextText: '下月&#x3e;',
		currentText: '今天',
		monthNames: ['一月','二月','三月','四月','五月','六月',
		'七月','八月','九月','十月','十一月','十二月'],
		monthNamesShort: ['一','二','三','四','五','六',
		'七','八','九','十','十一','十二'],
		dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
		dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
		dayNamesMin: ['日','一','二','三','四','五','六'],
		weekHeader: '周',
		dateFormat: 'yy-m-d',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: true,
		yearSuffix: '年'});
	$("#startdate, #enddate").datepicker({ 
		mandatory: false,
		closeAtTop: false,
		showOn: "both", 
		buttonImage: "/images/ico_calendar.gif", 
		buttonImageOnly: true
	});	
});
