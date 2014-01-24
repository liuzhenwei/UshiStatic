$(function(){
	initUploadNamelist();
});

function initUploadNamelist(){
	var link = $('a[js="linkUploadNamelist"]');
	if( link.length == 0 ) return false;
	link.bind('click', function(){
		if( $('#popUploadNamelist').length > 0 ){
			showPop();
		} else {
			$.get(link.attr('href'), function(data){
				$('body').append(data);
				if( document.jobWin ){
					$('#locationContainerUpload').remove();
					$('#industryContainerUpload').remove();
				} else {
					$('#locationContainerUpload').attr('id', 'locationContainer');
					$('#industryContainerUpload').attr('id', 'industryContainer');
					document.jobWin = initJobSelectWin({areaUrl:'/ajax/location!fetchWorkAreas.jhtml'});
				}
				showPop();
			});
		}
		return false;
	});

	function showPop(){
		var pop = $($('#popUploadNamelist').html());
		pop.popupWin({
			title: '上传企业名录',
			closeDestroy: true,
			reserve: false,
			open: function(event, ui){
				document.jobWin.bindLocationBtn(pop.find('[js="selectLocation"]'));
				document.jobWin.bindIndustryBtn(pop.find('[js="selectIndustry"]'));
				var companyName = pop.find('input[name="companyName"]');
				companyName.autocomplete({
					url: '/ajax/json!listCompanies.jhtml',
					ajax: 'companies',
					selected: function(event, li){
						companyName.val(li.text());
						pop.find('input[name="companyId"]').val(li.attr('index'));
					},
					keydown: function(event, obj){
						pop.find('input[name="companyId"]').val('0');
					}
				});
				pop.ajaxForm({
					validate: true,
					submiting: function(){
						pop.find('[js="waitingField"]').show();
						pop.find('[js="btnField"]').hide();
					},
					success: function(){
						location.href = '/usc/namelist!home.jhtml';
					}
				});
			}
		});
	}
}