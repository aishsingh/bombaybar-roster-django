var week_offset = 0;
var day_of_week = moment().day();

function calcWeekDates() {
    moment.locale('en');

    $("#week-btn").html("W" + (moment().add(week_offset, 'weeks').isoWeek()));

    // Determine dates of the week
    var day = moment().add(week_offset, 'weeks').startOf('isoWeek')
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
}

$(document).ready(function()
{
    // Fetch Staff Rosters
    $.ajax({
            url: '/getweeklyroster',
            type: 'GET',
            success: function(data) {
                var roster = JSON.parse(data);

                for (var i = 0; i < roster.length; i++) {
                    var rowid = $("td[data-sid='" + roster[i].fields.staff +"']").parent().index();
                    $("#roster-table tr:eq(" + rowid + ") td:eq(" + roster[i].fields.rday + ")").html(roster[i].fields.rstarttime + " - " + roster[i].fields.rendtime);
                }
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
    $( "#week-picker" ).datepicker({
            showWeek: true,
            showOtherMonths: true,
            selectOtherMonths: false,
            firstDay: 1,
            showAnim: "slideDown",
            weekHeader: "#",
            onSelect: function(dateText, inst) {
                var week_a = moment(dateText).isoWeek();
                week_offset = week_a - moment().isoWeek();

                calcWeekDates();
            }
    });

    $("#week-btn").click(function(event) {
        $("#week-picker").datepicker("show")
        $(this).mouseout();
    });
    $("#prev-week-btn").click(function(event) {
        week_offset--;
        calcWeekDates();
    });
    $("#next-week-btn").click(function(event) {
        week_offset++;
        calcWeekDates();
    });

    // FIX to remove bootstrap button focus
    $(".btn").click(function(event) {
        $(this).blur(); // Removes focus of the button.
    });
});
