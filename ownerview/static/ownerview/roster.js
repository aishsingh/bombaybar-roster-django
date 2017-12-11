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
    
    // Determine dates of the week
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var today = new Date;
    var firstday = new Date(today.setDate(today.getDate() - today.getDay()+1));
    var lastday = new Date(today.setDate(firstday.getDate()+6))

    var date_cells = document.getElementById("week-dates").children;
    for (var i = 1; i < date_cells.length -1; i++) {
        var day = new Date(today.setDate(firstday.getDate()+i-1))
        $(date_cells[i]).html(day.getDate() + " " + monthNames[day.getMonth()]);
    }

    // Highlight current day column
    today = new Date;
    var day_of_week = today.getDay() === 0 ? 7 : today.getDay();
    if (day_of_week) { //TODO: check if on current week
        var targetIndex, elements;
        targetIndex = $("th, td").index() + 1 + day_of_week;
        elements = $("th, td");
        elements.filter(":nth-child(" + targetIndex + ")").css("background-color", "rgba(255, 255, 255, 0.7)");
        // elements.filter(":nth-child(" + targetIndex + ")").css("background-color", "rgba(0, 123, 255, 0.7)");
        // elements.filter(":nth-child(" + targetIndex + ")").css("background-color", "rgba(220, 53, 69, 0.5)");
        elements.filter(":nth-child(" + targetIndex + ")").css("color", "black");
        // elements.filter(":nth-child(" + targetIndex + ")").css("border", "none");
    }

    // Highlight mouseover row
    $("table td:first-child").mouseover(function()
    {
        var targetIndex, elements;
        targetIndex = $(this).closest("tr").index() + 1;
        elements = $("tr");
        // elements.filter(":nth-child(" + targetIndex + ")").css("background-color", "rgba(220, 53, 69, 1)");
        elements.filter(":nth-child(" + targetIndex + ")").css("background-color", "rgba(0, 123, 255, 1)");


        var cell = $(this).closest("tr").find("td:eq({{ day_of_week }})");
        cell.css("background-color", "rgba(0, 123, 255, 1)");
        cell.css("color", "white");
    });
    // Highlight only when mouseover first row
    $("table td:not(:first-child)").mouseover(function()
    {
        var targetIndex, elements;
        targetIndex = $(this).closest("tr").index() + 1;
        elements = $("tr");
        // elements.filter(":nth-child(" + targetIndex + ")").css("background-color", "rgba(220, 53, 69, 1)");
        elements.filter(":nth-child(" + targetIndex + ")").css("background-color", "rgba(255, 255, 255, 0.1)");


        var cell = $(this).closest("tr").find("td:eq({{ day_of_week }})");
        cell.css("background-color", "rgba(255, 255, 255, 0.8)");
        cell.css("color", "black");
    });
    // Reset styles
    $("table tr").mouseleave(function()
    {
        $("tr").css("background-color", "transparent");

        var cell = $(this).closest("tr").find("td:eq({{ day_of_week }})");
        cell.css("background-color", "rgba(255, 255, 255, 0.7)");
        cell.css("color", "black");
    });
});
