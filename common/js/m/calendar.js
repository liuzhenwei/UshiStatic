function Calendar(options){
	/* Functions Dealing with Dates */
	function getDaysInMonth(year, month) {
		return 32 - new Date(year, month, 32).getDate();
	}

	function getFirstDayofMonth(year, month) {
		var day;
		day = new Date(year, month, 0).getDay();
		return day;
	}

	this.showMonth = new Date().getMonth(); // 0-11
	this.showYear = new Date().getFullYear(); // 4-digit year
	this.showDay = new Date().getDay();
	this.selectedDay = [];
	this.calendarId = 'calendar';
	this.calendarDivId = 'calendarCont';
	this.popUpShowing = false;
	this.minYear = 2000;
	this.maxYear = 2030;
	this.lang= {
		weekDays: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
		year: ' - ',
		month: ''
	};

	this.init = function(opt){
		if( opt ){
			for( var key in opt ){
				this[key] = opt[key];
			}
		}
		var oCal = $(this.calendarId);
		var oDiv = $(this.calendarDivId);
		if( !oCal  ){
			oCal = document.createElement('div');
			oCal.setAttribute('id', this.calendarId);
			document.body.appendChild(oCal);
			oCal.className = 'dialog';
			cCal.style.display = 'none';
			oDiv = document.createElement('div');
			oDiv.setAttribute('id', this.calendarDivId);
			cCal.appendChild(oDiv);
		}
		if( oCal.getAttribute('CalendarInit') != 'true' ){
			var self = this;
			oCal.addEventListener("click", function(event){
				var div = findParent(event.target, "div");
				if( div.id != self.calendarId ){
					event.preventDefault();
				} else {
					self.hideCalendar();
				}
			}, true);
			oCal.setAttribute('CalendarInit', 'true');
		}
		this.objCale = oCal;
	};
	this.init(options);

	this.hideCalendar = function () {
		if ( this.popUpShowing ) {
			this.objCale.style.display = 'none';
		}
		this.popUpShowing = false;
	};
	this.showCalendar = function (input, callback) {
		if( this.objCale.style.display != 'block'){
			this.objCale.style.display = 'block';
			if( callback ){
				this.selectedDate = callback;
			} else {
				this.selectedDate = null;
			}
			this.setSelected(input);
			this.drawCalendar(input);
			this.setupLinks();
			this.popUpShowing = true;
			var self = this;
			setTimeout(function(){
				self.popUpShowing = true;
			}, 100);
		}
	};

	this.drawCalendar = function (input) {
		var html = '';
		html = '<div id="calendarLinks" class="dialogTitle"><table style="width:100%;" cellpadding="0" cellspacing="0"><tr>';
		html += '<td width="5%"><a id="prevMonth" href="javascript:void(0)">Prev</a></td>';
		html += '<td width="5%"><a id="nextMonth" href="javascript:void(0)">Next</a></td>';
		html += '<td width="80%" align="center">' + this.showYear + this.lang.year + (this.showMonth + 1) + this.lang.month + '</td>';
		html += '<td width="10%"><a id="closeCalendar" class="closeDialogBtn" href="javascript:void(0)">Close</a></td>';
		html += '</tr></table></div>';
		html += '<table id="calendarTable" cellpadding="0" cellspacing="0">';
		html += '<tr class="weekDaysTitleRow">';
		var weekDays = this.lang.weekDays;
		for (var j = 0; j< weekDays.length; j++) {
			html += '<th>'+weekDays[j]+'</th>';
		}
		html += '</tr>';
		var daysInMonth = getDaysInMonth(this.showYear, this.showMonth);
		var startDay = getFirstDayofMonth(this.showYear, this.showMonth);
		var numRows = 0;
		var printDate = 1;
		if (startDay != 7) {
			numRows = Math.ceil(((startDay+1)+(daysInMonth))/7);
		}
		if (startDay != 7) {
			var noPrintDays = startDay + 1;
		} else {
			var noPrintDays = 0;
		}
		var today = new Date().getDate();
		var thisMonth = new Date().getMonth();
		var thisYear = new Date().getFullYear();
		for (var e=0; e<numRows; e++) {
			html += '<tr class="weekDaysRow">';
			for (var f=0; f<7; f++) {
				if ( (printDate == this.selectedDay[1])
					 && (this.showYear == this.selectedDay[2])
					 && (this.showMonth == this.selectedDay[0])
					 && (noPrintDays == 0)) {
					html += '<td id="selectedDay" class="weekDaysCell">';
				} else if ( (printDate == today)
					 && (this.showYear == thisYear)
					 && (this.showMonth == thisMonth)
					 && (noPrintDays == 0)) {
					html += '<td id="calendarToday" class="weekDaysCell">';
				} else {
					html += '<td class="weekDaysCell">';
				}
				if (noPrintDays == 0) {
					if (printDate <= daysInMonth) {
						html += '<span>'+printDate+'</span>';
					}
					printDate++;
				}
				html += '</td>';
				if(noPrintDays > 0) noPrintDays--;
			}
			html += '</tr>';
		}
		html += '</table>';

		$(this.calendarDivId).innerHTML = html;

		var self = this;
		$('prevMonth').onclick = function () {
			self.showMonth--;
			if (self.showMonth < 0) {
				self.showMonth = 11;
				self.showYear--;
			}
			if(self.showYear < self.minYear){
				self.showYear = self.minYear;
			}
			self.drawCalendar(input);
			self.setupLinks(input);
		}
		$('nextMonth').onclick = function () {
			self.showMonth++;
			if (self.showMonth > 11) {
				self.showMonth = 0;
				self.showYear++;
			}
			if(self.showYear > self.maxYear){
				self.showYear = self.maxYear;
			}
			self.drawCalendar(input);
			self.setupLinks(input);
		}
		$('closeCalendar').onclick = function(){
			self.hideCalendar();
		}
	};

	this.setupLinks = function () {
		var oCal = $('calendarTable');
		var span = oCal.getElementsByTagName('span');
		var self = this;
		for (var i = 0; i < span.length; i++) {
			span[i].onmouseover = function () {
				this.parentNode.className = 'weekDaysCellOver';
			}
			span[i].onmouseout = function () {
				this.parentNode.className = 'weekDaysCell';
			}
			span[i].onclick = function () {
				self.showDay = this.innerHTML;
				var selected = self.formatDate(self.showDay, self.showMonth, self.showYear);
				self.hideCalendar();
				if( self.selectedDate ){
					self.selectedDate(selected);
				}
			}
		}
	};

	this.setSelected = function(str) {
		str = str || '';
		if (str == '') {
			this.showMonth = new Date().getMonth();
			this.showYear = new Date().getFullYear();
			this.showDay = new Date().getDay();
			this.selectedDay = [-1, 0, 0];
		} else {
			var arr = str.split('-');
			for (var i = 0; i < arr.length; i++) {
				arr[i] = parseInt(arr[i], 10);
			}
			this.showMonth = this.selectedDay[0] = (arr[1] <= 12 && arr[1] > 0) ? arr[1] - 1 : new Date().getMonth();
			this.showDay = this.selectedDay[1] = (arr[2] && arr[2] <= 31 && arr[2] > 0) ? arr[2] : 0;
			this.showYear = this.selectedDay[2] = (arr[0] && arr[0] <= this.maxYear && arr[0] >= this.minYear) ? arr[0] : new Date().getFullYear();
		}
	};

	this.formatDate = function(Day, Month, Year) {
		Month++;
		if (Month <10) Month = '0' + Month; // add a zero if less than 10
		if (Day < 10) Day = '0' + Day; // add a zero if less than 10
		var dateString = Math.max(this.minYear, Math.min(this.maxYear, Year)) + '-' + Month + '-' + Day;
		return dateString;
	};

}

var timeSelect = {
	obj: null,
	output: null,
	options: {
		objId: 'selectTime',
		contId: 'selectTimeCont'
	},

	init: function(opt){
		if( opt ){
			for( var key in opt ){
				this.options[key] = opt[key];
			}
		}
		this.obj = $(this.options.objId);
		var self = this, html = '', j;
		for( var i = 0; i < 12; i++ ){
			j = i * 2;
			html += '<tr>';
			html += '<td><span>' + ft(j) + ':00' + '</span></td>';
			html += '<td><span>' + ft(j) + ':30' + '</span></td>';
			html += '<td><span>' + ft(j+1) + ':00' + '</span></td>';
			html += '<td><span>' + ft(j+1) + ':30' + '</span></td>';
			html += '</tr>';
		}
		$(this.options.contId).innerHTML = '<table class="selectTimeTable">' + html + '</table>';
		
		this.obj.addEventListener("click", function(event){
			if( event.target.tagName.toLowerCase() == 'span' ){
				if( self.output ){
					self.output.innerHTML = event.target.innerHTML;
					closeDialog(self.obj);
					if( self.closeCB ){
						self.closeCB(self.output.innerHTML, self.output);
						setTimeout(function(){
							self.closeCB = null;
						}, 1);
					}
				}
			}
			event.preventDefault();
		}, true);
		
		initDialog(this.obj, function(){
			var all = this.getElementsByTagName('span');
			for( var i = 0; i < all.length; i++ ){
				if( all[i].innerHTML == self.output.innerHTML ){
					all[i].className = 'select';
				} else {
					all[i].className = '';
				}
			}
		});
	},
	show: function(t, cb){
		this.output = t;
		if( cb ){
			this.closeCB = cb;
		}
		openDialog(this.obj);
	}
}
function ft(t){
	t = '0' + t;
	return t.slice(t.length - 2);
}
function fd(d){
	return parseInt(d, 10);	
}
