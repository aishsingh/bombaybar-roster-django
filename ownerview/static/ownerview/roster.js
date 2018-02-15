var week_offset;
var day_of_week;
var edit_mode;
var cell_selected;
var roster_instance;
var roster_data_received;
var history_data_received;

function calcStaffHours() {
    $('#roster-table tr:gt(1)').each(function () {
        var hours = 0;

        $(this).find('td').each(function () {
            if ($(this).attr('class') == "hours-cell" ) {
                if (hours == 0) {
                    $(this).css("color", "rgb(110, 110, 110)");
                    $(this).html("-");
                }
                else {
                    $(this).html(Number(Math.round(hours + 'e1')+'e-1') + " h");
                }
            }
            else if ($(this).attr('class') != "staff-cell") {
                if ($(this).html() != "&nbsp;" && !$(this).find('span').hasClass("history-away")) {
                    var times = $(this).find('span');
                    var starttime = moment(times.eq(0).html(), 'HH:mm');
                    var endtime = moment(times.eq(1).html(), 'HH:mm');
                    var lunch_break = 0;  // hours
                    if (starttime.isBefore(moment('14:00', 'HH:mm'))) lunch_break = 0.5;

                    hours += endtime.diff(starttime, 'hours', true) - lunch_break;
                }
            }
        });
    });
}

function calcWeekDates() {
    $("#week-btn").html("W" + (moment().add(week_offset, 'weeks').subtract(6, 'months').isoWeek()));
    if (!week_offset && $("#return-week-btn").length) {
        $("#return-week-btn").remove();
    }
    else  {
        if (week_offset > 0) {
            $("#return-week-btn").remove();
            $("#prev-week-btn").before('<button type="button" class="btn btn-light btn-sm" id="return-week-btn"><span class="ui-icon ui-icon-home"></span></button>');
        }
        else if (week_offset < 0){
            $("#return-week-btn").remove();
            $("#next-week-btn").after('<button type="button" class="btn btn-light btn-sm" id="return-week-btn"><span class="ui-icon ui-icon-home"></span></button>');
        }
    }

    // Keep weekpicker updated
    var day = moment().add(week_offset, 'weeks').startOf('isoWeek')
    $("#week-picker").val(day.format("MM/DD/YYYY"));

    // Determine dates of the week
    var date_cells = document.getElementById("week-dates").children;
    for (var i = 1; i < date_cells.length-1; i++) {
        $(date_cells[i]).html(day.format("DD MMM"));
        $(date_cells[i]).data("fulldate", day.format("YYYY-MM-DD"));
        day.add(1, 'days');
    }


    // Reset table styles
    $(".verified-history-cell").removeClass("verified-history-cell").addClass("roster-cell").find(".history-time").removeClass("history-time");
    $("#roster-table td, #roster-table th").removeAttr('style').removeAttr('data-original-title').removeAttr('title');
    $("#roster-table td").tooltip('dispose');

    styleRoster();
}

function styleRoster() {
    // Highlight current day column
    if (!week_offset) {
        var elements = $("#roster-table th");
        var target_index = elements.index() + 1 + day_of_week;

        elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(255, 255, 255, 0.8)");
        elements.filter(":nth-child(" + target_index + ")").css("color", "black");
        // elements.filter(":nth-child(" + target_index + ")").css("border", "none");

        // Highlight the future
        elements = $("#roster-table td");
        for (var i = target_index+1; i < (elements.index()+2+7); i++) {
            elements.filter(":nth-child(" + i + ")").css("background-color", "rgba(255, 255, 255, 0.5)");
            // elements.filter(":nth-child(" + i + ")").css("color", "rgb(200, 200, 200)");
        }
    } // Highlight the future
    else if (week_offset > 0) {
        $("#roster-table .roster-cell").css("background-color", "rgba(255, 255, 255, 0.5)");
        // $("#roster-table .roster-cell").css("color", "rgb(200, 200, 200)");
        // $("#roster-table .verified-history-cell").css("background-color", "rgba(200, 200, 200, 0.1)");
        // $("#roster-table .verified-history-cell").css("color", "rgb(200, 200, 200)");
    }
}

function fetchHistory(roster_data) {
    // Fetch Weekly History
    var start_date = moment().add(week_offset, 'weeks').startOf('isoWeek')
    var end_date = start_date.clone().endOf('isoWeek')
    $.ajax({
            url: '/getweeklyhistory/' + start_date.format('YYYY-MM-DD') + '/' + end_date.format('YYYY-MM-DD'),
            type: 'GET',
            success: function(data) {
                var history_data = JSON.parse(data);

                // Display roster before history
                displayRoster(roster_data);
                displayHistory(history_data);

                history_data_received = true;
                checkAllDataReceived();
                $("#roster-table").css("background-image", "none");
                $("#roster-table td:not(:first-child)").css("opacity", "1").css("border-color", "rgb(52, 58, 64)");
            },
            failure: function(data) { 
                alert('Error fetching history data');
            }
    }); 
}

function disableAllButtons() {
    $("#loc-groupdropdown").prop('disabled', true);
    $("#export-groupdropdown").prop('disabled', true);
    $("#edit-btn").prop('disabled', true);
    $("#prev-week-btn").prop('disabled', true);
    $("#next-week-btn").prop('disabled', true);
    $("#return-week-btn").prop('disabled', true);
    $("#week-btn").prop('disabled', true);
}
function enableAllButtons() {
    $("#loc-groupdropdown").prop('disabled', false);
    $("#export-groupdropdown").prop('disabled', false);
    $("#edit-btn").prop('disabled', false);
    $("#prev-week-btn").prop('disabled', false);
    $("#next-week-btn").prop('disabled', false);
    $("#return-week-btn").prop('disabled', false);
    $("#week-btn").prop('disabled', false);
}

function disableButtonsForEditing() {
    $("#loc-groupdropdown").prop('disabled', true);
    $("#export-groupdropdown").css('display', 'none');
    $("#btns-top-left").css('display', 'inline');
    $("#date-btn-group button").prop('disabled', true);
    $("#prev-week-btn").prop('disabled', true);
    $("#next-week-btn").prop('disabled', true);
    $("#return-week-btn").prop('disabled', true);
}
function enableButtonsForEditing() {
    $("#loc-groupdropdown").prop('disabled', false);
    $("#export-groupdropdown").css('display', 'inline');
    $("#btns-top-left").css('display', 'none');
    $("#date-btn-group button").prop('disabled', false);
    $("#prev-week-btn").prop('disabled', false);
    $("#next-week-btn").prop('disabled', false);
    $("#return-week-btn").prop('disabled', false);
}

function reloadRosterTable(roster_data) {
    disableAllButtons();
    $("#roster-table").css("background-image", "url(/static/ownerview/images/loading.gif)");
    $("#roster-table td:not(:first-child)").css("opacity", "0.5").css("border-color", "transparent");

    history_data_received = false;
    fetchHistory(roster_data);
}

function displayStaff(staff_data) {
    $.each(staff_data, function(i, data) {
        // If new locatio
        // alert($("#loc-head[data-loc='1']").html());
        // if (!$("#loc-head").attr("data-loc='" + data.location + "'")) {
        if (!$("#roster-table tbody #loc-head[data-loc='" + data.location + "']").length) {
            var markup =
            "<tr id='loc-head' data-loc='" + data.location + "'>" +
                "<th><span class='badge badge-pill badge-info'>" + LOC_NAMES[data.location] + "</span></th>" +
                "<th></th>" + 
                "<th></th>" +
                "<th></th>" +
                "<th></th>" +
                "<th></th>" +
                "<th></th>" +
                "<th></th>" +
                "<th></th>" +                   
            "</tr>";

            $("#roster-table tbody").append(markup);
        }

        var markup =
        "<tr>" +
          "<td class='staff-cell' data-sid='" + data.staff + "' data-loc='" + data.location + "'><a href='/staff/" + data.staff + "/'><strong>" + data.staff__sname + "</strong></a></td>" +
          "<td class='roster-cell'>&nbsp;</td>" +
          "<td class='roster-cell'>&nbsp;</td>" +
          "<td class='roster-cell'>&nbsp;</td>" +
          "<td class='roster-cell'>&nbsp;</td>" +
          "<td class='roster-cell'>&nbsp;</td>" +
          "<td class='roster-cell'>&nbsp;</td>" +
          "<td class='roster-cell'>&nbsp;</td>" +
          "<td class='hours-cell'></td>" +
        "</tr>";

        $("#roster-table tbody #loc-head[data-loc='" + data.location + "']").after(markup);
    });
}
function displayRoster(roster_data) {
    $.each(roster_data, function(i, data) {
        var rowid = $("#roster-table td[data-sid='" + data.fields.staff +"']").parent().index()+2;
        var cell = $("#roster-table tr:eq(" + rowid + ") td:eq(" + data.fields.rday + ")");

        cell.html("<span>" + data.fields.starttime + "</span> - <span>" + data.fields.endtime + "</span>");
        cell.data("pk", data.pk);
    });
}
function displayHistory(history_data) {
    $.each(history_data, function(i, data) {
        var rowid = $("#roster-table td[data-sid='" + data.fields.staff +"']").parent().index()+2;
        var hday = moment(data.fields.hdate).isoWeekday();
        var cell = $("#roster-table tr:eq(" + rowid + ") td:eq(" + hday + ")");
        if (data.fields.htype == 1) {
            var new_start = data.fields.starttime;
            var new_end = data.fields.endtime;
            if (new_start && new_end) {
                cell.html("<span>" + data.fields.starttime + "</span> - <span>" + data.fields.endtime + "</span>");

                var times = cell.find('span');
                times.eq(0).addClass('history-time');
                times.eq(1).addClass('history-time');
            }
            else if (new_start) {
                var times = cell.find('span');
                cell.html("<span>" + data.fields.starttime + "</span> - <span>" + times.eq(1).html() + "</span>");

                times = cell.find('span');
                times.eq(0).addClass('history-time');
            }
            else {
                var times = cell.find('span');
                cell.html("<span>" + times.eq(0).html() + "</span> - <span>" + data.fields.endtime + "</span>");

                times = cell.find('span');
                times.eq(1).addClass('history-time');
            }
        }
        else {
            cell.html("<span class='history-away'>x</span>");
        }

        // Differentiate from the normal roster
        cell.removeClass("roster-cell").addClass("verified-history-cell");
        cell.data("pk", data.pk);

        // Tooltip
        if (data.fields.hnote)
            cell.tooltip({title: data.fields.hnote});
    });
}

function prepareExportData() {
    roster_instance = $("#roster-table").tableExport({
            headers: true,                              // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
            footers: true,                              // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
            formats: ['xls', 'csv'],            // (String[]), filetype(s) for the export, (default: ['xls', 'csv', 'txt'])
            filename: 'id',                             // (id, String), filename for the downloaded file, (default: 'id')
            exportButtons: false,                       // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
            ignoreRows: null,                           // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
            ignoreCols: null,                           // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
            trimWhitespace: true
    }); 

    // Setup exports
    $('#export-xls-btn').off('click').on('click', function() {
        var exportData = roster_instance.getExportData()['roster-table']['xls'];
        roster_instance.export2file(exportData.data, exportData.mimeType, exportData.filename, exportData.fileExtension);
    });
    $('#export-csv-btn').off('click').on('click', function() {
        var exportData = roster_instance.getExportData()['roster-table']['csv'];
        roster_instance.export2file(exportData.data, exportData.mimeType, exportData.filename, exportData.fileExtension);
    });
}

function checkAllDataReceived() {
    if (roster_data_received && history_data_received) {
        enableAllButtons();

        calcStaffHours();
        prepareExportData();
    }
}

$(document).ready(function()
{
    week_offset = 0;
    day_of_week = moment().isoWeekday();
    edit_mode = false;
    cell_selected = null;
    roster_instance = null;
    roster_data_recieved = false;
    history_data_recieved = false;

    var roster_data = null;
    moment.locale('en');


    // Fetch Staff + Location data
    $.ajax({
            url: '/getweeklystaff/' + moment().startOf('isoWeek').format('YYYY-MM-DD') + '/' + moment().endOf('isoWeek').format('YYYY-MM-DD'),
            type: 'GET',
            success: function(data) {
                displayStaff(JSON.parse(data));
                calcWeekDates();    

                // Fetch all Roster data
                $.ajax({
                        url: '/getroster',
                        type: 'GET',
                        success: function(data) {
                            roster_data = JSON.parse(data);
                            roster_data_received = true;
                            reloadRosterTable(roster_data);
                        },
                        failure: function(data) { 
                            alert('Error fetching roster data');
                        }
                }); 
            },
            failure: function(data) { 
                alert('Error fetching history data');
            }
    }); 


    // Highlight only when mouse enters first row
    $("#roster-table").on('mouseenter', 'td:first-child', function() {
        var row = $(this).closest("tr")
        row.filter(":nth-child(" + (row.index()+1) + ")").css("background-color", "rgba(23, 162, 184, 0.6)");

        if (!week_offset && !edit_mode) {  // Hightlight day
            var cell = row.find("td:eq(" + day_of_week + ")");
            // cell.css("background-color", "rgba(23, 162, 184, 1)");
            // cell.css("color", "white");
        }
    });
    // // Highlight mouse enters row
    $("#roster-table").on('mouseenter', 'td:not(:first-child)', function() {
        var row = $(this).closest("tr")
        row.filter(":nth-child(" + (row.index()+1) + ")").css("background-color", "rgba(255, 255, 255, 0.3)");

        if (!week_offset && !edit_mode) {  // Highlight day
            var cell = row.find("td:eq(" + day_of_week + ")");
            // cell.css("background-color", "rgba(255, 255, 255, 0.7)");
            // cell.css("color", "black");
        }
    });
    // Reset styles
    $("#roster-table").on('mouseleave', 'tr', function() {
        $("tr").css("background-color", "");

        if (!week_offset && !edit_mode) {
            var cell = $(this).closest("tr").find("td:eq(" + day_of_week + ")");
            cell.css("background-color", "");
            cell.css("color", "");
        }
    });


    //Initialize the jqueryui datepicker
    $("#week-picker").datepicker({
            showWeek: false,
            showOtherMonths: true,
            showButtonPanel: false,
            selectOtherMonths: false,
            firstDay: 1,
            showAnim: "slideDown",
            weekHeader: "#",
            onSelect: function(dateText, inst) {
                var week_a = moment(dateText).isoWeek();
                week_offset = week_a - moment().isoWeek();

                calcWeekDates();
                reloadRosterTable(roster_data);
                selectCurrentWeek();
            },
            beforeShow: function() {
                selectCurrentWeek();
            },
            beforeShowDay: function(date) {
                var cssClass = '';
                var day = moment().add(week_offset, 'weeks')
                if(date >= day.startOf('isoWeek') && date <= day.endOf('isoWeek'))
                    cssClass = 'ui-datepicker-current-day';
                return [true, cssClass];
            },
            onChangeMonthYear: function(year, month, inst) {
                selectCurrentWeek();
            }
    }).datepicker('widget').addClass('ui-weekpicker');
    var selectCurrentWeek = function() {
        window.setTimeout(function () {
            $('#week-picker').datepicker('widget').find('.ui-datepicker-current-day a').addClass('ui-state-active')
        }, 1);
    }
    $('.ui-weekpicker').on('mousemove', 'tr', function () {
        $(this).find('td a').addClass('ui-state-hover');
    });
    $('.ui-weekpicker').on('mouseleave', 'tr', function () {
        $(this).find('td a').removeClass('ui-state-hover');
    });

    // Button events
    $(document).on('click', '#save-btn', function(event) {
        // Remove selected inputs
        var start = cell_selected.find("input").first().val().replace(/\s/g, '');
        var end = cell_selected.find("input").last().val().replace(/\s/g, '');

        if (start && end)
            cell_selected.html("<span>" + start + "</span> - <span>" + end + "</span>");
        else // TODO
            cell_selected.html("&nbsp;");

        cell_selected = null;

        // Find what times were edited
        $("[data-starttime][data-endtime]").each(function() {
            var sid = $('td:first-child', $(this).parents('tr')).data('sid');
            var date = $('th:eq(' + $(this).index() + ')', $(this).parents('table')).data('fulldate');
            var times = $(this).find('span');

            if ($(this).is('[data-edited-start]') || $(this).is('[data-edited-end]')) {
                // alert("New history [start+end] [sid:" + sid + "] [date:" + date + "] [start:" + times.eq(0).html() + "] [end:" + times.eq(1).html() + "]");
                // Post History
                $.ajax({
                        url: "/createhistory/",
                        method: "POST",
                        data: { 
                            date: date, 
                            type: 1, 
                            start: times.eq(0).html(), 
                            end: times.eq(1).html(),
                            sid: sid, 
                            csrfmiddlewaretoken: CSRF_TOKEN
                        },
                        success: function(response) {
                            console.log("Edit successful");

                            $("[data-starttime][data-endtime]").each(function() {
                                if ($(this).is('[data-edited-start]') && $(this).is('[data-edited-end]')) {
                                    $(this).children().eq(0).addClass('history-time');
                                    $(this).children().eq(1).addClass('history-time');
                                    $(this).removeAttr('data-edited-start').removeAttr('data-edited-end');
                                }
                                else if ($(this).is('[data-edited-start]')) {
                                    $(this).children().eq(0).addClass('history-time');
                                    $(this).removeAttr('data-edited-start');
                                }
                                else if ($(this).is('[data-edited-end]')) {
                                    $(this).children().eq(1).addClass('history-time');
                                    $(this).removeAttr('data-edited-end');
                                }

                                $(this).removeAttr('data-starttime').removeAttr('data-endtime');
                                $(this).removeClass("roster-cell").addClass("verified-history-cell");
                                // $(this).data("pk", data.pk);  TODO: response return new pk
                            });

                            // Stop loading style
                            enableAllButtons();
                            calcStaffHours();
                            prepareExportData();
                            $("#roster-table").css("background-image", "none");
                            $("#roster-table td:not(:first-child)").css("opacity", "1").css("border-color", "rgb(52, 58, 64)");
                        },
                        error: function(response) {
                            console.log("Edit failure: " + response.responseText);

                            $("[data-starttime][data-endtime]").each(function() {
                                if ($(this).is('[data-edited-start]') && $(this).is('[data-edited-end]')) 
                                    $(this).removeAttr('data-edited-start').removeAttr('data-edited-end');
                                else if ($(this).is('[data-edited-start]'))
                                    $(this).removeAttr('data-edited-start');
                                else if ($(this).is('[data-edited-end]'))
                                    $(this).removeAttr('data-edited-end');

                                $(this).removeAttr('data-starttime').removeAttr('data-endtime');
                            });

                            // Stop loading style
                            enableAllButtons();
                            calcStaffHours();
                            prepareExportData();
                            $("#roster-table").css("background-image", "none");
                            $("#roster-table td:not(:first-child)").css("opacity", "1").css("border-color", "rgb(52, 58, 64)");
                        }
                });

            }

        });

        // Loading style
        disableAllButtons();
        $("#roster-table").css("background-image", "url(/static/ownerview/images/loading.gif)");
        $("#roster-table td:not(:first-child)").css("opacity", "0.5").css("border-color", "transparent");

        // Revert default style
        $("#edit-btn").removeClass( "btn-danger" ).addClass( "btn-primary" ).html("Edit");
        $("#save-btn").hide();

        $("#roster-table .roster-cell").css("background-color", "");
        $("#roster-table .roster-cell").css("color", "");
        $("#roster-table .verified-history-cell").css("background-color", "");
        $("#roster-table .verified-history-cell").css("color", "");

        $("#roster-table td:not(:first-child):not(:last-child)").css("border-style", "");
        $("#roster-table td:not(:first-child):not(:last-child)").css("border-color", "");

        styleRoster();

        edit_mode = false;
        enableButtonsForEditing();
    });

    $(document).on('click', '#edit-btn', function(event) {
        if (!edit_mode) {
            $("#edit-btn").removeClass( "btn-primary" ).addClass( "btn-danger" ).html("Cancel");
            $("#save-btn").show();

            // Style for edit mode
            $("#roster-table .roster-cell").css("background-color", "rgba(100, 100, 100, 0.1)");
            $("#roster-table .roster-cell").css("color", "white");
            $("#roster-table .verified-history-cell").css("background-color", "rgba(100, 100, 100, 0.1)");
            $("#roster-table .verified-history-cell").css("color", "white");
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-style", "dashed");
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-color", "rgb(170, 170, 170)");

            edit_mode = true;
            disableButtonsForEditing();
        }
        else {  // Cancel
            // Reset selected cell changes
            if (cell_selected != null) {
                if (cell_selected.attr('data-starttime') && cell_selected.attr('data-endtime'))
                    cell_selected.html("<span>" + cell_selected.attr('data-starttime') + "</span> - <span>" + cell_selected.attr('data-endtime') + "</span>");
                else
                    cell_selected.html("&nbsp;");

                // Reset all other changes
                $("[data-starttime][data-endtime]").each(function() { 
                    if ($(this).attr('data-starttime').length == 0 || $(this).attr('data-endtime').length == 0)
                        $(this).html("&nbsp;");
                    else
                        $(this).html("<span>" + $(this).attr('data-starttime') + "</span> - <span>" + $(this).attr('data-endtime') + "</span>");

                    $(this).removeAttr('data-starttime').removeAttr('data-endtime');
                    $(this).removeAttr('data-edited-start').removeAttr('data-edited-end');
                });

                cell_selected = null;
            }

            $("#edit-btn").removeClass( "btn-danger" ).addClass( "btn-primary" ).html("Edit");
            $("#save-btn").hide();

            // Revert default style
            $("#roster-table .roster-cell").css("background-color", "");
            $("#roster-table .roster-cell").css("color", "");
            $("#roster-table .verified-history-cell").css("background-color", "");
            $("#roster-table .verified-history-cell").css("color", "");
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-style", "");
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-color", "");

            styleRoster();

            edit_mode = false;
            enableButtonsForEditing();
        }
    });

    $(document).on('click', '.roster-cell', function(event) {
        if (edit_mode) {
            if (cell_selected != null) {
                if ($(this).is(cell_selected)) 
                    return;  // Dont need to interpret already selected cell
                else {
                    // Remove prev selected inputs
                    var times = cell_selected.find("input");
                    var start = times.first().val().replace(/\s/g, '');
                    var end = times.last().val().replace(/\s/g, '');

                    // Validate time input
                    if (moment(start,"HH:mm", true).isValid() && moment(end,"HH:mm", true).isValid())
                        cell_selected.html("<span>" + start + "</span> - <span>" + end + "</span>");
                    else {
                        cell_selected.html("&nbsp;");

                        cell_selected.css("background-color", "rgba(100, 100, 100, 0.1)");
                        cell_selected.removeAttr("data-edited-start");
                    }
                }
            }
            else {
                $("#date-btn-group button").prop('disabled', false);
            }

            if ($(this).html() && $(this).html() != "&nbsp;" && !$(this).find('span').hasClass("history-away")) {  // TODO: Make sick rosters editable
                var times = $(this).find('span');
                if (!$(this).is("[data-starttime]") && !$(this).is("[data-endtime]")) {
                    $(this).attr('data-starttime', times.eq(0).html());
                    $(this).attr('data-endtime', times.eq(1).html());
                }

                $(this).html("<input id='start-input' type='text' value='" + times.eq(0).html() + "'><input id='end-input' type='text' value='" + times.eq(1).html() + "'>");
            }
            else { // Empty roster
                if (!$(this).is("[data-starttime]") && !$(this).is("[data-endtime]")) {
                    $(this).attr('data-starttime', '');
                    $(this).attr('data-endtime', '');
                }

                $(this).html("<input id='start-input' type='text' value=''><input id='end-input' type='text' value=''>");
            }
            $(this).find("input").first().focus();
            cell_selected = $(this);


            // Highlight on time change
            $('#start-input').on('input', function() { 
                if ($(this).parent().attr('data-starttime') !== $(this).val()) {
                    $(this).parent().css("background-color", "rgba(66, 139, 202, 1.0)");
                    $(this).parent().attr("data-edited-start", true);
                }
                else if ($(this).parent().attr('data-endtime') === $(this).next().val()) {
                    $(this).parent().css("background-color", "rgba(100, 100, 100, 0.1)");
                    $(this).parent().removeAttr("data-edited-start");
                }
            });
            $('#end-input').on('input', function() { 
                if ($(this).parent().attr('data-endtime') !== $(this).val()) {
                    $(this).parent().css("background-color", "rgba(66, 139, 202, 1.0)");
                    $(this).parent().attr("data-edited-end", true);
                }
                else if ($(this).parent().attr('data-starttime') === $(this).prev().val()) {
                    $(this).parent().css("background-color", "rgba(100, 100, 100, 0.1)");
                    $(this).parent().removeAttr("data-edited-end");
                }
            });
        }
    });


    $(document).on('click', '#week-btn', function(event) {
        if (!edit_mode)
            $("#week-picker").datepicker("show");
    });
    $(document).on('click', '#return-week-btn', function(event) {
        week_offset = 0;
        calcWeekDates();
        reloadRosterTable(roster_data);
    });
    $(document).on('click', '#prev-week-btn', function(event) {
        week_offset--;
        calcWeekDates();
        reloadRosterTable(roster_data);
    });
    $(document).on('click', '#next-week-btn', function(event) {
        week_offset++;
        calcWeekDates();
        reloadRosterTable(roster_data);
    });

    // FIX to remove bootstrap button focus
    $(".btn").click(function(event) {
        $(this).blur(); // Removes focus of the button.
    });
});
