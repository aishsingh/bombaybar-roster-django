var week_offset;
var day_of_week;
var edit_mode;
var roster_instance;
var roster_data_received;

function calcStaffHours() {
    $('#roster-table tr:gt(1)').each(function () {
        var sid = null;
        var hours = 0;

        $(this).find('td').each(function () {
            if ($(this).attr('class') == 'staff-cell')
                sid = $(this).data('sid');
            else if ($(this).attr('class') == 'hours-cell')
                $(this).html(hours);
            else {
                if ($(this).html() != 'x') {
                    var val = $(this).html().split(' - ');
                    var starttime = moment(val[0], 'HH:mm');
                    var endtime = moment(val[1], 'HH:mm');
                    hours += endtime.diff(starttime, 'hours', true);
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

    // Highlight current day column
    if (!week_offset) {
        var elements = $("#roster-table td, #roster-table th");
        var target_index = elements.index() + 1 + day_of_week;

        elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(255, 255, 255, 0.7)");
        // elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(0, 123, 255, 0.7)");
        // elements.filter(":nth-child(" + target_index + ")").css("background-color", "rgba(220, 53, 69, 0.5)");
        elements.filter(":nth-child(" + target_index + ")").css("color", "black");
        // elements.filter(":nth-child(" + target_index + ")").css("border", "none");
    }
    else {
        var elements = $("#roster-table th");
        for (var i=2; i<=8; i++) {
            elements.filter(":nth-child(" + i + ")").css("background-color", "rgb(52, 58, 64)");
            elements.filter(":nth-child(" + i + ")").css("color", "white");
        }

        elements = $("#roster-table td");
        for (var i=2; i<=8; i++) {
            elements.filter(":nth-child(" + i + ")").css("background-color", "rgba(255, 255, 255, 0.2)");
            elements.filter(":nth-child(" + i + ")").css("color", "white");
        }
    }

    if (roster_data_received) prepareExportData();
}

function prepareExportData() {
    roster_instance = $("table").tableExport({
            headers: true,                              // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
            footers: true,                              // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
            formats: ['xls', 'csv', 'xlsx'],            // (String[]), filetype(s) for the export, (default: ['xls', 'csv', 'txt'])
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
    $('#export-pdf-btn').off('click').on('click', function() { //TODO
        // var exportData = roster_instance.getExportData()['roster-table']['pdf'];
        // roster_instance.export2file(exportData.data, exportData.mimeType, exportData.filename, exportData.fileExtension);
    });
}

function allDataReceived() {
    roster_data_received = true;
    $("#export-groupdropdown").prop('disabled', false);
    $("#edit-btn").prop('disabled', false);

    calcStaffHours();
    prepareExportData();
}

$(document).ready(function()
{
    week_offset = 0;
    day_of_week = moment().day();
    edit_mode = false;
    roster_instance = null;
    roster_data_recieved = false;

    calcWeekDates();    

    // Fetch Staff Rosters
    $.ajax({
            url: '/getweeklyroster',
            type: 'GET',
            success: function(data) {
                var roster = JSON.parse(data);

                for (var i = 0; i < roster.length; i++) {
                    var rowid = $("#roster-table td[data-sid='" + roster[i].fields.staff +"']").closest('tr').index();
                    $("#roster-table tr:eq(" + rowid + ") td:eq(" + roster[i].fields.rday + ")").html(roster[i].fields.rstarttime + " - " + roster[i].fields.rendtime);
                }

                allDataReceived();
            },
            failure: function(data) { 
                alert('Error fetching roster data');
            }
    }); 

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
            cell.css("background-color", "rgba(255, 255, 255, 0.8)");
            cell.css("color", "black");
        }
    });
    // Reset styles
    $("table tr").mouseleave(function()
    {
        $("tr").css("background-color", "transparent");

        if (!week_offset) {
            var cell = $(this).closest("tr").find("td:eq(" + day_of_week + ")");
            cell.css("background-color", "rgba(255, 255, 255, 0.7)");
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
            $("#edit-btn").removeClass( "btn-danger" ).addClass( "btn-primary" ).html("Edit");
            $("#save-btn").hide();
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-style", "solid");
            $("#roster-table td:not(:first-child):not(:last-child)").css("border-color", "rgb(52, 58, 64)");
            edit_mode = false;
        }
    });
    $(document).on('click', '#week-btn', function(event) {
        $("#week-picker").datepicker("show");
    });
    $(document).on('click', '#return-week-btn', function(event) {
        week_offset = 0;
        calcWeekDates();
    });
    $(document).on('click', '#prev-week-btn', function(event) {
        week_offset--;
        calcWeekDates();
    });
    $(document).on('click', '#next-week-btn', function(event) {
        week_offset++;
        calcWeekDates();
    });

    // FIX to remove bootstrap button focus
    $(".btn").click(function(event) {
        $(this).blur(); // Removes focus of the button.
    });
});
