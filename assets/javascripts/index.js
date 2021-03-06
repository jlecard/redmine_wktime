var wktimeIndexUrl, wkexpIndexUrl, wkattnIndexUrl,wkReportUrl,clockInOutUrl, payrollUrl, userssettingsUrl, blgaccUrl, blgcontractsUrl, blgaccpjtsUrl, blginvoiceUrl, blgtaxUrl;
var no_user ="";
var grpUrl="";
var userUrl="";
var accountUrl ="";
var userList = new Array();
var rSubEmailUrl = "";
var rAppEmailUrl = "";

$(document).ready(function() {
	$( "#reminder-email-dlg" ).dialog({
		autoOpen: false,
		resizable: false,
		modal: true,
		buttons: [
			{
				text: 'Ok',
				id: 'btnOk',
				click: function() {				
					var email_notes = document.getElementById('email_notes').value;
					var commandEl = document.getElementsByName('reminder');
					var reminder_command = 0;
					for(var i = 0; i < commandEl.length; i++) {
						if(commandEl[i].checked) {
							reminder_command = commandEl[i].value;
						}
					}
					var rUrl = "";
					if(reminder_command == 1) {
						rUrl = rSubEmailUrl;
					} 
					else if(reminder_command == 2) {
						rUrl = rAppEmailUrl;
					}
					var from = document.getElementById('from').value;
					var to = document.getElementById('to').value;
					/*var userOpt = document.getElementById('user_id').options;
					var strUserIds = "";
					var arrUserId = []
					for(var i = 1; i < userOpt.length; i++) {
						//0 -- All User
						arrUserId.push(userOpt[i].value);
					}
					strUserIds = arrUserId.toString();*/
					
					/*var teStatusOpt = document.getElementById('status').options;
					var strStatus = "";
					var arrStatus = []
					for(var i = 0; i < teStatusOpt.length; i++) {
						if (teStatusOpt[i].selected) {
							arrStatus.push(teStatusOpt[i].value);
						}
					}
					strStatus = arrStatus.toString();
					alert("strStatus : " + strStatus);*/
					if(rUrl != "") {
						$.ajax({
							url: rUrl,
							type: 'post',
							data: {/*user_ids: strUserIds,*/ from: from, to: to, /*status: strStatus, */email_notes: email_notes},
							success: function(data){
								resetReminderEmailDlg();
								if(data != "OK") {
									alert(data);
								}							
							},
							error: function(xhr,status,error) {
								resetReminderEmailDlg();
							},
							beforeSend: function(){ $(this).parent().addClass('ajax-loading'); },
							complete: function(){ $(this).parent().removeClass('ajax-loading'); }
						});
					}
					$( this ).dialog( "close" );
				}
			},
			{
				text: 'Cancel',
				id: 'btnCancel',
				click: function() {
					$( this ).dialog( "close" );
					resetReminderEmailDlg();
				}
			}
		]
	});
});

function openReportPopup(){
	var popupUrl, periodType;
	var reportType = document.getElementById('report_type').value;
	var groupId = "", userId = "";
	if(document.getElementById('group_id')) {
		groupId = document.getElementById('group_id').value;
		userId = document.getElementById('user_id').value;
	}
	var period = document.getElementById('period').value;
	var searchlist = document.getElementById('searchlist').value;
	var periodTypes = document.getElementsByName('period_type');
	var fromVal = document.getElementById('from').value;
	var toVal = document.getElementById('to').value;
	for (var i = 0, length = periodTypes.length; i < length; i++) {
		if (periodTypes[i].checked) {
			periodType = periodTypes[i].value
			break;
		}
	}
	popupUrl = wkattnReportUrl + '&report_type=' + reportType + '&group_id=' + groupId + '&user_id=' + userId + '&period_type=' + periodType + '&searchlist=' + searchlist; 
	if(periodType>1){
		popupUrl = popupUrl + '&from=' + fromVal + '&to=' + toVal		
	}else{
		popupUrl = popupUrl + '&period=' + period 
	}
	window.open(popupUrl, '_blank', 'location=yes,scrollbars=yes,status=yes');
}

function showReminderEmailDlg() {
	var teStatusOpt = document.getElementById('status').options;	
	var isSubm = false;
	var isAppr = false;
	for(var i = 0; i < teStatusOpt.length; i++) {
		if (teStatusOpt[i].selected) {
			isSubm = (teStatusOpt[i].value == 'e' || teStatusOpt[i].value == 'n' || teStatusOpt[i].value == 'r');
			if(isSubm) {
				break;
			}
		}
	}
	for(var i = 0; i < teStatusOpt.length; i++) {
		if (teStatusOpt[i].selected) {
			isAppr = (teStatusOpt[i].value == 's');
			if(isAppr) {
				break;
			}
		}
	}
	var reminderEl = document.getElementsByName('reminder');
	if(!isSubm) {
		reminderEl[0].disabled = true;
	}
	if(!isAppr) {
		reminderEl[1].disabled = true;
	}
	if(!isSubm && !isAppr) {
		//disable Ok button if both submission and approval reminders is not applicable
		$("#btnOk").attr('disabled', true).addClass("ui-state-disabled");
	}
	for(var i = 0; i < reminderEl.length; i++) {
		if(!reminderEl[i].disabled) {
			reminderEl[i].checked = true;
			break;
		}
	}
	$( "#reminder-email-dlg" ).dialog( "open" );
}

function resetReminderEmailDlg() {
	document.getElementById('email_notes').value = "";
	var reminderEl = document.getElementsByName('reminder');
	for(var i = 0; i < reminderEl.length; i++) {
		reminderEl[i].checked = false;
		reminderEl[i].disabled = false;
	}
	$("#btnOk").attr('disabled', false).removeClass("ui-state-disabled");
	$('textarea').removeData('changed'); //for removing 'leave this page' warning
}

function projChanged(projDropdown, userid, needBlankOption){
	var id = projDropdown.options[projDropdown.selectedIndex].value;
	var fmt = 'text';
	var userDropdown = document.getElementById("user_id");
	var $this = $(this);
	
	$.ajax({
		url: userUrl,
		type: 'get',
		data: {project_id: id, user_id: userid, format:fmt},
		success: function(data){ updateUserDD(data, userDropdown, userid, needBlankOption, false,"All Users"); },
		beforeSend: function(){ $this.addClass('ajax-loading'); },
		complete: function(){ $this.removeClass('ajax-loading'); }
	});
	
}

function updateUserDD(itemStr, dropdown, userid, needBlankOption, skipFirst, blankText)
{
	var items = itemStr.split('\n');
	var i, index, val, text, start;
	dropdown.options.length = 0;
	if(needBlankOption){
		dropdown.options[0] = new Option(blankText, "0", false, false) 
	}
	for(i=0; i < items.length-1; i++){
		index = items[i].indexOf(',');
		if(skipFirst){
			if(index != -1){
				start = index+1;
				index = items[i].indexOf(',', index+1);
			}
		}else{
			start = 0;
		}
		if(index != -1){
			val = items[i].substring(start, index);
			text = items[i].substring(index+1);
			dropdown.options[needBlankOption ? i+1 : i] = new Option( 
				text, val, false, val == userid);
		}
	}
}


$(document).ready(function()
{
	changeProp('tab-wktime',wktimeIndexUrl);
	changeProp('tab-wkexpense',wkexpIndexUrl);
	changeProp('tab-leave',wkattnIndexUrl);
	changeProp('tab-clock',clockInOutUrl);
	changeProp('tab-payroll',payrollUrl);
	changeProp('tab-usersettings',userssettingsUrl);
	changeProp('tab-wkaccount',blgaccUrl);
	changeProp('tab-wkcontract',blgcontractsUrl);
	changeProp('tab-wkaccountproject',blgaccpjtsUrl);
	changeProp('tab-wkinvoice',blginvoiceUrl);
	changeProp('tab-wktax',blgtaxUrl);
});


function changeProp(tab,indexUrl)
{
	var tab_te = document.getElementById(tab);
	var tabName = tab.split('-');
	if(tab_te != null)
	{
		tab_te.href = indexUrl;
		tab_te.onclick = function(){
			var load = false;
			if(prevTab != (this.id).toString())
			{
				load = true;
			}			
			prevTab = this.id;
			return load;
		};
	}
}

function validateMember()
{
	var valid=true;
	var userDropdown = document.getElementById("user_id");
	if (userDropdown.value=="")
	{
		valid=false;
		alert(no_user);
	}
	return valid;
}
function reportChanged(reportDD, userid){
	var id = reportDD.options[reportDD.selectedIndex].value;
	var needBlankOption = ((id == 'attendance_report' || id == 'spent_time_report' || id == 'payroll_report') ? true : false) ;
	grpChanged(document.getElementById("group_id"), userid, needBlankOption)
}

function grpChanged(grpDropdown, userid, needBlankOption){
	var id = grpDropdown.options[grpDropdown.selectedIndex].value;
	var fmt = 'text';
	var userDropdown = document.getElementById("user_id");
	var $this = $(this);
	$.ajax({
		url: grpUrl,
		type: 'get',
		data: {user_id: userid, format:fmt,group_id:id},
		success: function(data){ updateUserDD(data, userDropdown, userid, needBlankOption, false,"All Users"); },
		beforeSend: function(){ $this.addClass('ajax-loading'); },
		complete: function(){ $this.removeClass('ajax-loading'); }
	});
}
function progrpChanged(btnoption, userid, needBlankOption){
	if (btnoption.value==1){
		projChanged(document.getElementById("project_id"), userid, needBlankOption)
	}
	else{
		grpChanged(document.getElementById("group_id"), userid, needBlankOption)
	}
}

function accProjChanged(uid)
{
	var acc_name = document.getElementById("account_id");
	var accId = acc_name.options[acc_name.selectedIndex].value;
	var needBlankOption = true;
	var projDropdown = document.getElementById("project_id");
	userid = uid;
	$.ajax({
	url: accountUrl,
	type: 'get',
	data: {account_id: accId},
	success: function(data){ updateUserDD(data, projDropdown, userid, needBlankOption, false, "");},   
	});
}