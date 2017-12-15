var week_offset;
var day_of_week;
var edit_mode;
var cell_selected;
var roster_instance;
var roster_data_received;
var history_data_received;

function calcStaffHours() {
    $('#roster-table tr:gt(1)').each(function () {
        var sid = null;
        var hours = 0;

        $(this).find('td').each(function () {
            if ($(this).attr('class') == 'staff-cell')
                sid = $(this).data('sid');
            else if ($(this).attr('class') == 'hours-cell') {
                if (hours == 0) {
                    $(this).css("color", "rgb(110, 110, 110)");
                    $(this).html("-");
                }
                else {
                    $(this).html(hours.toFixed(1));
                }
            }
            else {
                if ($(this).html() != '&nbsp;' && $(this).html() != 'x') {
                    var val = $(this).html().split(' - ');
                    var starttime = moment(val[0], 'HH:mm');
                    var endtime = moment(val[1], 'HH:mm');
                    var lunch_break = 0;  // hours
                    if (starttime.isBefore(moment('14:00', 'HH:mm'))) lunch_break = 0.5;

                    hours += endtime.diff(starttime, 'hours', true) - lunch_break;
                }
            }
        });
        // console.log("sid: " + sid + ", hours: " + hours);
    });
}

function calcWeekDates() {
    moment.locale('en');

    $("#week-btn").html("W" + (moment().add(week_offset, 'weeks').isoWeek()));
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
        $(date_cells[i]).html(day.date() + " " + day.format("MMM"));
        day.add(1, 'days');
    }

    // Reset table styles
    $(".verified-history-cell").removeClass("verified-history-cell").addClass("roster-cell");
    $("#roster-table td, #roster-table th").removeAttr('style');

    // Highlight current day column
    if (!week_offset) {
        var elements = $("#roster-table td, #roster-table th");
        var target_index = elements.index() + 1 + day_of_week;

        elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(255, 255, 255, 0.8)");
        // elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(0, 123, 255, 0.7)");
        // elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(220, 53, 69, 0.5)");
        elements.filter(":nth-child(" + target_index + ")").css("color", "black");
        // elements.filter(":nth-child(" + target_index + ")").css("border", "none");
    }
}

function fetchHistory() {
    // Fetch Weekly History
    var start_date = moment().add(week_offset, 'weeks').startOf('isoWeek')
    var end_date = start_date.clone().endOf('isoWeek')
    $.ajax({
            url: '/getweeklyhistory/' + start_date.format('YYYY-MM-DD') + '/' + end_date.format('YYYY-MM-DD'),
            type: 'GET',
            success: function(data) {
                var history = JSON.parse(data);

                for (var i = 0; i < history.length; i++) {
                    var rowid = $("#roster-table td[data-sid='" + history[i].fields.staff +"']").closest('tr').index();
                    var hday = moment(history[i].fields.hdate).isoWeekday();
                    var cell = $("#roster-table tr:eq(" + rowid + ") td:eq(" + hday + ")");
                    if (history[i].fields.htype == 1) {
                        var new_start = history[i].fields.hstarttime;
                        var new_end = history[i].fields.hendtime;
                        if (new_start && new_end) {
                            cell.html(history[i].fields.hstarttime + " - " + history[i].fields.hendtime);
                        }
                        else if (new_start) {
                            var times = cell.html().split(' - ');
                            cell.html(history[i].fields.hstarttime + " - " + times[1]);
                        }
                        else {
                            var times = cell.html().split(' - ');
                            cell.html(times[0] + " - " + history[i].fields.hendtime);
                        }
                    }
                    else {
                        cell.html('x');
                    }

                    // Differentiate from the normal roster
                    cell.removeClass("roster-cell").addClass("verified-history-cell");

                    // Tooltip
                    if (history[i].fields.hnote)
                        cell.tooltip({title: history[i].fields.hnote});
                }

                history_data_received = true;
                checkAllDataReceived();
            },
            failure: function(data) { 
                alert('Error fetching history data');
            }
    }); 
}

function displayRoster(roster) {
    $("#loc-groupdropdown").prop('disabled', true);
    $("#export-groupdropdown").prop('disabled', true);
    $("#edit-btn").prop('disabled', true);

    for (var i = 0; i < roster.length; i++) {
        var rowid = $("#roster-table td[data-sid='" + roster[i].fields.staff +"']").closest('tr').index();
        $("#roster-table tr:eq(" + rowid + ") td:eq(" + roster[i].fields.rday + ")").html(roster[i].fields.rstarttime + " - " + roster[i].fields.rendtime);
    }

    history_data_received = false;
    fetchHistory();
}

function prepareExportData() {
    roster_instance = $("table").tableExport({
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
        $("#loc-groupdropdown").prop('disabled', false);
        $("#export-groupdropdown").prop('disabled', false);
        $("#edit-btn").prop('disabled', false);

        calcStaffHours();
        prepareExportData();
    }
}

$(document).ready(function()
{
    week_offset = 0;
    day_of_week = moment().day();
    edit_mode = false;
    cell_selected = null;
    roster_instance = null;
    roster_data_recieved = false;
    history_data_recieved = false;

    var roster_data = null;

    // Fetch Weekly Roster
    $.ajax({
            url: '/getroster',
            type: 'GET',
            success: function(data) {
                roster_data = JSON.parse(data);
                roster_data_received = true;
                displayRoster(roster_data);
            },
            failure: function(data) { 
                alert('Error fetching roster data');
            }
    }); 

    calcWeekDates();    

    // Highlight only when mouseover first row
    $("table td:first-child").mouseover(function()
    {
        var target_index, elements;
        target_index = $(this).closest("tr").index() + 1;
        elements = $("tr");
        // elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(220, 53, 69, 1)");
        elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(0, 123, 255, 1)");

        if (!week_offset) {
            var cell = $(this).closest("tr").find("td:eq(" + day_of_week + ")");
            cell.css("background-color", "rgba(0, 123, 255, 1)");
            cell.css("color", "white");
        }
    });
    // Highlight mouseover row
    $("table td:not(:first-child)").mouseover(function()
    {
        var target_index, elements;
        target_index = $(this).closest("tr").index() + 1;
        elements = $("tr");
        // elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(220, 53, 69, 1)");
        elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(255, 255, 255, 0.1)");

        if (!week_offset) {
            var cell = $(this).closest("tr").find("td:eq(" + day_of_week + ")");
            cell.css("background-color", "rgba(255, 255, 255, 0.9)");
            cell.css("color", "black");
        }
    });
    // Reset styles
    $("table tr").mouseleave(function()
    {
        $("tr").css("background-color", "transparent");

        if (!week_offset) {
            var cell = $(this).closest("tr").find("td:eq(" + day_of_week + ")");
            cell.css("background-color", "rgba(255, 255, 255, 0.8)");
            cell.css("color", "black");
        }
    });


    //Initialize the jqueryui datepicker
    $("#week-picker").datepicker({
            showWeek: true,
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
    }).datepicker('widget').addClass('ui-weekpicker');;
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
    $(document).on('click', '#edit-btn', function(event) {
        if (!edit_mode) {
            $("#edit-btn").removeClass( "btn-primary" ).addClass( "btn-danger" ).html("Cancel");
            $("#save-btn").show();
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-style", "dashed");
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-color", "white");
            edit_mode = true;
        }
        else {
            if (cell_selected != null) {
                cell_selected.html(cell_selected.find("input").val());
            }

            $("#edit-btn").removeClass( "btn-danger" ).addClass( "btn-primary" ).html("Edit");
            $("#save-btn").hide();
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-style", "solid");
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-color", "rgb(52, 58, 64)");
            edit_mode = false;
        }
    });

    // $('#roster-cell').click(function(event) {
    $(document).on('click', '.roster-cell', function(event) {
        if (edit_mode) {
            if (cell_selected != null) {
                if ($(this).is(cell_selected))
                    return;
                else {
                    var times = cell_selected.find("input");
                    var start = times.first().val().replace(/\s/g, '');
                    var end = times.last().val().replace(/\s/g, '');

                    if (start && end)
                        cell_selected.html(start + " - " + end);
                    else
                        cell_selected.html("&nbsp;");
                }
            }

            var data = $(this).html();
            if (data && data != "&nbsp;" && data != 'x') {
                var times = data.split(' - ');
                $(this).html("<input type='text' value='" + times[0] + "'><input type='text' value='" + times[1] + "'>");
            }
            else {
                $(this).html("<input type='text' value=''><input type='text' value=''>");
            }
            $(this).find("input").first().focus();
            cell_selected = $(this);
        }
    });

    $(document).on('click', '#week-btn', function(event) {
        $("#week-picker").datepicker("show");
    });
    $(document).on('click', '#return-week-btn', function(event) {
        week_offset = 0;
        calcWeekDates();
        displayRoster(roster_data);
    });
    $(document).on('click', '#prev-week-btn', function(event) {
        week_offset--;
        calcWeekDates();
        displayRoster(roster_data);
    });
    $(document).on('click', '#next-week-btn', function(event) {
        week_offset++;
        calcWeekDates();
        displayRoster(roster_data);
    });

    // FIX to remove bootstrap button focus
    $(".btn").click(function(event) {
        $(this).blur(); // Removes focus of the button.
    });
});
